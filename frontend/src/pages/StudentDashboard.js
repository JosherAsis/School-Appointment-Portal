import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const StudentDashboard = () => {
  const { currentUser } = useContext(AuthContext);

  return (
    <div className="dashboard">
      <h2>Student Dashboard</h2>
      <div className="welcome-message">
        <h3>Welcome, {currentUser?.name || 'Student'}!</h3>
        <p>Student ID: {currentUser?.student_id || 'N/A'}</p>
      </div>
      
      <div className="dashboard-actions">
        <div className="action-card">
          <h4>Book an Appointment</h4>
          <p>Schedule a new appointment with school administrators.</p>
          <Link to="/book" className="btn btn-primary">Book Now</Link>
        </div>
        
        <div className="action-card">
          <h4>My Appointments</h4>
          <p>View and manage your existing appointments.</p>
          <Link to="/my-appointments" className="btn btn-secondary">View Appointments</Link>
        </div>
        
        <div className="action-card">
          <h4>My Profile</h4>
          <p>Update your personal information and preferences.</p>
          <Link to="/profile" className="btn btn-secondary">Edit Profile</Link>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
