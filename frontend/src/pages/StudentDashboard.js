import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/StudentDashboard.css';

const StudentDashboard = () => {
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    // Set page title
    document.title = 'Student Dashboard | School Appointment Portal';
  }, []);

  return (
    <div className="dashboard">
      <h2>Student Dashboard</h2>
      <div className="welcome-container">
        <div className="welcome-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <div className="welcome-text">
          <h3>Welcome, {currentUser?.name || 'Student'}!</h3>
          {currentUser?.student_id && <p>Student ID: {currentUser.student_id}</p>}
        </div>
      </div>

      <div className="dashboard-actions">
        <div className="action-card">
          <div className="card-content">
            <div className="card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
                <path d="M8 14h.01"></path>
                <path d="M12 14h.01"></path>
                <path d="M16 14h.01"></path>
                <path d="M8 18h.01"></path>
                <path d="M12 18h.01"></path>
                <path d="M16 18h.01"></path>
              </svg>
            </div>
            <h4>Book an Appointment</h4>
            <p>Schedule a new appointment with school administrators for academic advising, career counseling, or other services.</p>
          </div>
          <Link to="/book" className="btn btn-primary">Book Now</Link>
        </div>

        <div className="action-card">
          <div className="card-content">
            <div className="card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
            </div>
            <h4>My Appointments</h4>
            <p>View and manage your existing appointments. Check status, reschedule, or cancel as needed.</p>
          </div>
          <Link to="/my-appointments" className="btn btn-secondary">View Appointments</Link>
        </div>

        <div className="action-card">
          <div className="card-content">
            <div className="card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <h4>My Profile</h4>
            <p>Update your personal information, contact details, and notification preferences.</p>
          </div>
          <Link to="/profile" className="btn btn-secondary">Edit Profile</Link>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
