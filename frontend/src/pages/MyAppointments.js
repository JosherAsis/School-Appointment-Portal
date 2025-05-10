import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        // In a real app, you'd filter by the logged-in student
        const response = await axios.get('http://localhost:5001/api/appointments');
        setAppointments(response.data);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  if (loading) return <div>Loading appointments...</div>;

  return (
    <div className="my-appointments">
      <h2>My Appointments</h2>
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