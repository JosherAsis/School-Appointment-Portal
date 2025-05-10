import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home">
      <h1>Welcome to School Appointment Portal</h1>
      <p>
        This portal allows students to book appointments with school administrators.
      </p>
      <div className="action-buttons">
        <Link to="/book" className="btn btn-primary">
          Book an Appointment
        </Link>
        <Link to="/my-appointments" className="btn btn-secondary">
          View My Appointments
        </Link>
      </div>
    </div>
  );
};

export default Home;
