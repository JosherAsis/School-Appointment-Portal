import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const MyAppointments = () => {
  const { currentUser } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        // The backend will filter appointments based on the user's token
        const response = await axios.get('http://localhost:5001/api/appointments');
        setAppointments(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        setError('Failed to load appointments. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchAppointments();
    }
  }, [currentUser]);

  if (loading) return <div className="loading">Loading appointments...</div>;

  return (
    <div className="my-appointments">
      <h2>My Appointments</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {appointments.length === 0 ? (
        <p>No appointments found.</p>
      ) : (
        <div className="appointments-list">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="appointment-card">
              <h3>Appointment on {new Date(appointment.date).toLocaleDateString()}</h3>
              <p><strong>Time:</strong> {appointment.start_time} - {appointment.end_time}</p>
              <p><strong>Reason:</strong> {appointment.reason}</p>
              <p><strong>Status:</strong> {appointment.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAppointments;