import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Navbar.css';
import '../styles/Logo.css';

const Navbar = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isHomePage = location.pathname === '/';

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  // Check if we should center the logo (on homepage when not logged in)
  const shouldCenterLogo = isHomePage && !currentUser;

  return (
    <nav className="navbar">
      <div className={`navbar-container ${shouldCenterLogo ? 'navbar-centered' : ''}`}>
        <div className="navbar-logo-container">
          <Link to="/" className="navbar-logo" onClick={closeMenu}>
            <div className="logo-container">
              <img src="/images/ducksters-logo.png" alt="Duck Logo" className="logo-image" />
              <span>School Appointment Portal</span>
            </div>
          </Link>
          <a href="https://www.paterostechnologicalcollege.edu.ph/" target="_blank" rel="noopener noreferrer" className="ptc-logo-link">
            <img src="/images/ptc-logo.png" alt="College Logo" className="logo-image" />
          </a>
        </div>
        {/* Only show menu icon if there are menu items */}
        {!shouldCenterLogo && (
          <div className="menu-icon" onClick={toggleMenu}>
            <i className={menuOpen ? 'fas fa-times' : 'fas fa-bars'}>
              {menuOpen ? '✕' : '☰'}
            </i>
          </div>
        )}
        <ul className={menuOpen ? 'nav-menu active' : 'nav-menu'}>
          {/* Only show Home link if user is logged in or not on homepage */}
          {(currentUser || !isHomePage) && (
            <li className="nav-item">
              <Link to="/" className="nav-link" onClick={closeMenu}>
                Home
              </Link>
            </li>
          )}

          {currentUser ? (
            // Links for authenticated users
            <>
              {currentUser.role === 'admin' ? (
                // Admin links
                <li className="nav-item">
                  <Link to="/admin-dashboard" className="nav-link" onClick={closeMenu}>
                    Dashboard
                  </Link>
                </li>
              ) : (
                // Student links
                <>
                  <li className="nav-item">
                    <Link to="/student-dashboard" className="nav-link" onClick={closeMenu}>
                      Dashboard
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/book" className="nav-link" onClick={closeMenu}>
                      Book Appointment
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/my-appointments" className="nav-link" onClick={closeMenu}>
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
              {!isHomePage && (
                <>
                  <li className="nav-item">
                    <Link to="/login" className="nav-link" onClick={closeMenu}>
                      Login
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/register" className="nav-link" onClick={closeMenu}>
                      Register
                    </Link>
                  </li>
                </>
              )}
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
