import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          School Appointment Portal
        </Link>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-link">
              Home
            </Link>
          </li>

          {currentUser ? (
            // Links for authenticated users
            <>
              {currentUser.role === 'admin' ? (
                // Admin links
                <li className="nav-item">
                  <Link to="/admin-dashboard" className="nav-link">
                    Dashboard
                  </Link>
                </li>
              ) : (
                // Student links
                <>
                  <li className="nav-item">
                    <Link to="/student-dashboard" className="nav-link">
                      Dashboard
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/book" className="nav-link">
                      Book Appointment
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/my-appointments" className="nav-link">
                      My Appointments
                    </Link>
                  </li>
                </>
              )}

              <li className="nav-item">
                <button onClick={handleLogout} className="nav-link logout-btn">
                  Logout
                </button>
              </li>
            </>
          ) : (
            // Links for non-authenticated users
            <>
              <li className="nav-item">
                <Link to="/login" className="nav-link">
                  Login
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/register" className="nav-link">
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
