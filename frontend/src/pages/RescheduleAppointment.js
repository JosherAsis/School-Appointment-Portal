import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import NotificationService from '../services/NotificationService';
import api from '../services/api';

const RescheduleAppointment = () => {
  const { appointmentId } = useParams();
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [appointment, setAppointment] = useState(null);
  const [formData, setFormData] = useState({
    date: '',
    time_slot_id: '',
  });
  const [timeSlots, setTimeSlots] = useState([]);
  const [filteredTimeSlots, setFilteredTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAppointment, setLoadingAppointment] = useState(true);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(true);
  const [error, setError] = useState('');

  // Fetch the appointment details
  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const response = await api.get(`/appointments/${appointmentId}`);
        setAppointment(response.data);
        
        // Set the current date and time slot as default values
        setFormData({
          date: response.data.date,
          time_slot_id: response.data.time_slot_id,
        });
        
        setError('');
      } catch (error) {
        console.error('Error fetching appointment:', error);
        setError('Failed to load appointment details. Please try again later.');
      } finally {
        setLoadingAppointment(false);
      }
    };

    if (appointmentId && currentUser) {
      fetchAppointment();
    }
  }, [appointmentId, currentUser]);

  // Fetch time slots
  useEffect(() => {
    const fetchTimeSlots = async () => {
      try {
        const response = await api.get('/time-slots');
        setTimeSlots(response.data);
      } catch (error) {
        console.error('Error fetching time slots:', error);
        setError('Failed to load available time slots. Please try again later.');
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!currentUser) {
        throw new Error('You must be logged in to reschedule an appointment');
      }

      if (!appointment) {
        throw new Error('Appointment details not found');
      }

      // Prepare the data for rescheduling
      const rescheduleData = {
        date: formData.date,
        time_slot_id: formData.time_slot_id,
      };

      console.log('Rescheduling appointment:', appointmentId);
      console.log('New schedule data:', rescheduleData);

      // Call the API to reschedule the appointment
      const response = await api.put(`/appointments/${appointmentId}/reschedule`, rescheduleData);

      // Send notification email
      try {
        await NotificationService.sendAppointmentReschedule({
          ...appointment,
          ...rescheduleData,
          email: currentUser.email,
          name: currentUser.name,
          date: new Date(rescheduleData.date).toLocaleDateString(),
          old_date: new Date(appointment.date).toLocaleDateString(),
          old_time: `${appointment.start_time} - ${appointment.end_time}`
        });
      } catch (emailError) {
        console.error('Failed to send reschedule notification email:', emailError);
        // Don't fail the whole operation if email fails
      }

      alert('Appointment rescheduled successfully!');
      navigate('/my-appointments');
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      
      let errorMessage = 'Error rescheduling appointment: ';
      
      if (error.response) {
        errorMessage += error.response.data?.msg || `Server error (${error.response.status})`;
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      } else if (error.request) {
        errorMessage += 'No response from server. Please check your connection.';
        console.error('Request:', error.request);
      } else {
        errorMessage += error.message || 'Unknown error';
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loadingAppointment || loadingTimeSlots) {
    return <div className="loading">Loading...</div>;
  }

  if (!appointment) {
    return <div className="error-message">Appointment not found or you don't have permission to view it.</div>;
  }

  return (
    <div className="reschedule-appointment">
      <h2>Reschedule Appointment</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="current-appointment-details">
        <h3>Current Appointment Details</h3>
        <p><strong>Date:</strong> {new Date(appointment.date).toLocaleDateString()}</p>
        <p><strong>Time:</strong> {appointment.start_time} - {appointment.end_time}</p>
        <p><strong>Reason:</strong> {appointment.reason}</p>
        <p><strong>Status:</strong> <span className={`status-badge status-${appointment.status}`}>{appointment.status}</span></p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>New Date</label>
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
          <label>New Time Slot</label>
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

        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => navigate('/my-appointments')}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading || !formData.date || !formData.time_slot_id || filteredTimeSlots.length === 0}
          >
            {loading ? 'Rescheduling...' : 'Reschedule Appointment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RescheduleAppointment;
