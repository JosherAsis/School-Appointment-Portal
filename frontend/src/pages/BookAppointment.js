import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import NotificationService from '../services/NotificationService';
import api from '../services/api';
import { formatTime, getDayOfWeek } from '../utils/timeFormatter';
import '../styles/BookAppointment.css';

const BookAppointment = () => {
  const { currentUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    date: '',
    time_slot_id: '',
    reason: ''
  });
  const [timeSlots, setTimeSlots] = useState([]);
  const [filteredTimeSlots, setFilteredTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(true);
  const [error, setError] = useState('');
  const [studentData, setStudentData] = useState(null);
  const navigate = useNavigate();

  // Debug: Log the current user object structure
  useEffect(() => {
    console.log('Current user object in BookAppointment:', currentUser);

    // Fetch student data
    const fetchStudentData = async () => {
      try {
        const response = await api.get('/students');
        setStudentData(response.data);
        console.log('Fetched student data:', response.data);
      } catch (error) {
        console.error('Error fetching student data:', error);
      }
    };

    if (currentUser) {
      fetchStudentData();
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchTimeSlots = async () => {
      try {
        // Fetch time slots from the backend
        const response = await api.get('/time-slots');
        setTimeSlots(response.data);
      } catch (error) {
        console.error('Error fetching time slots:', error);
        // Fallback to dummy data if API call fails
        const dummyTimeSlots = [
          { id: 1, day_of_week: 1, start_time: '09:00:00', end_time: '10:00:00' },
          { id: 2, day_of_week: 1, start_time: '10:00:00', end_time: '11:00:00' },
          { id: 3, day_of_week: 2, start_time: '13:00:00', end_time: '14:00:00' },
          { id: 4, day_of_week: 3, start_time: '14:00:00', end_time: '15:00:00' },
          { id: 5, day_of_week: 4, start_time: '11:00:00', end_time: '12:00:00' },
          { id: 6, day_of_week: 5, start_time: '15:00:00', end_time: '16:00:00' },
        ];
        setTimeSlots(dummyTimeSlots);
      } finally {
        setLoadingTimeSlots(false);
      }
    };

    fetchTimeSlots();
  }, []);

  // Filter time slots when date changes
  useEffect(() => {
    if (formData.date && timeSlots.length > 0) {
      // Get the day of week for the selected date (0 = Sunday, 1 = Monday, etc.)
      const selectedDate = new Date(formData.date);
      const dayOfWeek = selectedDate.getDay();

      console.log('Selected date:', formData.date);
      console.log('Day of week:', dayOfWeek);

      // Check if the selected date is today
      const today = new Date();
      const isToday = selectedDate.toDateString() === today.toDateString();

      // Filter time slots for this day of week
      let slotsForDay = timeSlots.filter(slot => slot.day_of_week === dayOfWeek);

      // If the selected date is today, filter out time slots that have already passed
      if (isToday) {
        const currentHour = today.getHours();
        const currentMinute = today.getMinutes();

        slotsForDay = slotsForDay.filter(slot => {
          // Parse the start time (format: HH:MM:SS)
          const [hours, minutes] = slot.start_time.split(':').map(Number);

          // Check if the time slot has already passed
          return (hours > currentHour) || (hours === currentHour && minutes > currentMinute);
        });

        console.log('Current time:', `${currentHour}:${currentMinute}`);
        console.log('Filtered time slots for today:', slotsForDay);
      }

      console.log('Available time slots for this day:', slotsForDay);
      setFilteredTimeSlots(slotsForDay);

      // If there are no time slots for this day, show an error
      if (slotsForDay.length === 0) {
        setError(`No time slots available for ${selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}`);
      } else {
        setError('');
      }

      // Reset time slot selection if the current selection is not valid for this day
      if (formData.time_slot_id) {
        const isValidSlot = slotsForDay.some(slot => slot.id === parseInt(formData.time_slot_id));
        if (!isValidSlot) {
          setFormData(prev => ({ ...prev, time_slot_id: '' }));
        }
      }
    } else {
      setFilteredTimeSlots([]);
    }
  }, [formData.date, timeSlots]);

  // Use the imported getDayOfWeek and formatTime functions from timeFormatter.js

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!currentUser) {
        throw new Error('You must be logged in to book an appointment');
      }

      // Add the student_id from the current user
      const appointmentData = {
        ...formData,
        // The backend expects the student ID from the database (the student record ID, not the student_id string)
        student_id: studentData?.id || currentUser.student?.id,
        email: currentUser.email,
        name: currentUser.name,
        // Include the display student_id for reference
        display_student_id: studentData?.student_id || currentUser.student?.student_id
      };

      console.log('Current user:', currentUser);
      console.log('Sending appointment data:', appointmentData);

      // Get the token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      // Book the appointment
      const response = await api.post('/appointments', appointmentData);

      // Send confirmation email
      try {
        await NotificationService.sendAppointmentConfirmation({
          ...appointmentData,
          id: response.data.id,
          date: new Date(appointmentData.date).toLocaleDateString()
        });
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Don't fail the whole operation if email fails
      }

      alert('Appointment booked successfully! A confirmation email has been sent.');
      navigate('/my-appointments');
    } catch (error) {
      console.error('Error booking appointment:', error);

      let errorMessage = 'Error booking appointment: ';

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage += error.response.data?.msg || `Server error (${error.response.status})`;
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage += 'No response from server. Please check your connection.';
        console.error('Request:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage += error.message || 'Unknown error';
      }

      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="book-appointment-container">
      <div className="book-appointment">
        <div className="book-appointment-header">
          <h2>Book an Appointment</h2>
          <p>Schedule a meeting</p>
        </div>

        {loadingTimeSlots ? (
          <div className="loading-indicator">Loading available time slots...</div>
        ) : (
          <div className="book-appointment-form">
            <form onSubmit={handleSubmit}>
              <div className="form-group student-id">
                <label>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="form-icon">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Student ID
                </label>
                <div className="student-id-display">
                  {studentData?.student_id || currentUser?.student?.student_id || 'N/A'}
                </div>
                <small>Your Student ID</small>
              </div>

              <div className="form-group">
                <label>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="form-icon">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  Select Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]} // Prevent selecting past dates
                  required
                />
                {error && <div className="error-message">{error}</div>}
              </div>

              <div className="form-group">
                <label>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="form-icon">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  Select Time Slot
                </label>
                <select
                  name="time_slot_id"
                  value={formData.time_slot_id}
                  onChange={handleChange}
                  required
                  disabled={!formData.date || filteredTimeSlots.length === 0}
                >
                  <option value="">Select a time slot</option>
                  {formData.date ? (
                    filteredTimeSlots.length > 0 ? (
                      filteredTimeSlots.map(slot => (
                        <option key={slot.id} value={slot.id}>
                          {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No time slots available for selected date</option>
                    )
                  ) : (
                    <option value="" disabled>Please select a date first</option>
                  )}
                </select>
                <small>Time slots are filtered based on the selected date</small>
              </div>

              <div className="form-group">
                <label>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="form-icon">
                    <line x1="17" y1="10" x2="3" y2="10"></line>
                    <line x1="21" y1="6" x2="3" y2="6"></line>
                    <line x1="21" y1="14" x2="3" y2="14"></line>
                    <line x1="17" y1="18" x2="3" y2="18"></line>
                  </svg>
                  Reason for Appointment
                </label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="Please describe the reason for your appointment..."
                  required
                />
              </div>

              <div className="form-actions">
                <button
                  className="submit-button"
                  type="submit"
                  disabled={loading || !formData.date || !formData.time_slot_id || filteredTimeSlots.length === 0}
                >
                  {loading ? (
                    <span className="loading-text">Booking...</span>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="button-icon">
                        <path d="M12 20h9"></path>
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                      </svg>
                      Book Appointment
                    </>
                  )}
                </button>
              </div>

              {filteredTimeSlots.length === 0 && formData.date && (
                <div className="info-message" style={{ marginTop: '1.5rem' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="info-icon">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                  No time slots available for the selected date. Please choose a different date.
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookAppointment;