import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BookAppointment = () => {
  const [formData, setFormData] = useState({
    student_id: '',
    date: '',
    time_slot_id: '',
    reason: ''
  });
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTimeSlots = async () => {
      try {
        // In a real app, you'd fetch time slots from the backend
        // For now, we'll create some dummy time slots
        const dummyTimeSlots = [
          { id: 1, day_of_week: 1, start_time: '09:00:00', end_time: '10:00:00' },
          { id: 2, day_of_week: 1, start_time: '10:00:00', end_time: '11:00:00' },
          { id: 3, day_of_week: 2, start_time: '13:00:00', end_time: '14:00:00' },
          { id: 4, day_of_week: 3, start_time: '14:00:00', end_time: '15:00:00' },
          { id: 5, day_of_week: 4, start_time: '11:00:00', end_time: '12:00:00' },
          { id: 6, day_of_week: 5, start_time: '15:00:00', end_time: '16:00:00' },
        ];
        setTimeSlots(dummyTimeSlots);
      } catch (error) {
        console.error('Error fetching time slots:', error);
      } finally {
        setLoadingTimeSlots(false);
      }
    };

    fetchTimeSlots();
  }, []);

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
      await axios.post('http://localhost:5001/api/appointments', formData);
      alert('Appointment booked successfully!');
      navigate('/my-appointments');
    } catch (error) {
      alert('Error booking appointment');
      console.error(error);
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
            value={formData.student_id}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Time Slot</label>
          <select
            name="time_slot_id"
            value={formData.time_slot_id}
            onChange={handleChange}
            required
          >
            <option value="">Select a time slot</option>
            {timeSlots.map(slot => (
              <option key={slot.id} value={slot.id}>
                {getDayName(slot.day_of_week)}: {slot.start_time} - {slot.end_time}
              </option>
            ))}
          </select>
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

        <button type="submit" disabled={loading}>
          {loading ? 'Booking...' : 'Book Appointment'}
        </button>
      </form>
      )}
    </div>
  );
};

export default BookAppointment;