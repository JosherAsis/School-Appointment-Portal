import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
  const { currentUser } = useContext(AuthContext);

  return (
    <div className="home">
      <h1>Welcome to School Appointment Portal</h1>
      <p>
        This portal allows students to book appointments with school administrators.
      </p>

      <div className="action-buttons">
        {currentUser ? (
          // Buttons for authenticated users
          currentUser.role === 'admin' ? (
            // Admin buttons
            <Link to="/admin-dashboard" className="btn btn-primary">
              Go to Admin Dashboard
            </Link>
          ) : (
            // Student buttons
            <>
              <Link to="/book" className="btn btn-primary">
                Book an Appointment
              </Link>
              <Link to="/my-appointments" className="btn btn-secondary">
                View My Appointments
              </Link>
            </>
          )
        ) : (
          // Buttons for non-authenticated users
          <>
            <Link to="/login" className="btn btn-primary">
              Login
            </Link>
            <Link to="/register" className="btn btn-secondary">
              Register
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
