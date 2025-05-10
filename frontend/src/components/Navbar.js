import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
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
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
