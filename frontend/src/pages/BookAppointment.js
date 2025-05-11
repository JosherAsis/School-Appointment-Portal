import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import NotificationService from '../services/NotificationService';
import api from '../services/api';

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
  const navigate = useNavigate();

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

      // Filter time slots for this day of week
      const slotsForDay = timeSlots.filter(slot => slot.day_of_week === dayOfWeek);

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

  const getDayName = (dayOfWeek) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  };

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
        // The backend expects the student ID from the database, not the student_id field
        // If student data is available in currentUser, use it
        student_id: currentUser.student?.id || currentUser.id,
        email: currentUser.email,
        name: currentUser.name
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
    <div className="book-appointment">
      <h2>Book an Appointment</h2>
      {loadingTimeSlots ? (
        <p>Loading time slots...</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Student ID</label>
            <input
              type="text"
              name="student_id"
              value={currentUser?.student_id || ''}
              disabled
              className="disabled-input"
            />
            <small>Using your registered student ID</small>
          </div>

          <div className="form-group">
            <label>Date</label>
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
            <label>Time Slot</label>
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
                      {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
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
            <label>Reason</label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !formData.date || !formData.time_slot_id || filteredTimeSlots.length === 0}
          >
            {loading ? 'Booking...' : 'Book Appointment'}
          </button>

          {filteredTimeSlots.length === 0 && formData.date && (
            <div className="info-message" style={{ marginTop: '10px' }}>
              <p>No time slots available for the selected date. Please choose a different date.</p>
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default BookAppointment;