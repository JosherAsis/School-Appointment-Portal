import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Home.css';
import '../styles/Logo.css';

const Home = () => {
  const { currentUser } = useContext(AuthContext);
  const [typedText, setTypedText] = useState('');
  const fullText = 'Streamline your school appointments with our easy-to-use platform. Book, manage, and track appointments with school administrators in one place.';

  useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setTypedText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 30);

    return () => clearInterval(typingInterval);
  }, []);

  return (
    <div className="home-container">
      {/* Left side with dark background */}
      <div className="home-left">
        <div className="dual-logo-container">
          <Link to="/about" className="duck-logo-link">
            <img src="/images/ducksters-logo.png" alt="Duck Logo" className="logo-image-large" />
          </Link>
          <a href="https://www.paterostechnologicalcollege.edu.ph/" target="_blank" rel="noopener noreferrer">
            <img src="/images/ptc-logo.png" alt="College Logo" className="logo-image-large" />
          </a>
        </div>
        <h1 className="home-title">Welcome to School Appointment Portal</h1>
        <p className="home-subtitle">
          {typedText}<span className="typing-cursor"></span>
        </p>

        <div className="home-buttons">
          {currentUser ? (
            // Buttons for authenticated users
            currentUser.role === 'admin' ? (
              // Admin buttons
              <Link to="/admin-dashboard" className="home-button home-button-primary">
                Go to Admin Dashboard
              </Link>
            ) : (
              // Student buttons
              <>
                <Link to="/book" className="home-button home-button-primary">
                  Book an Appointment
                </Link>
                <Link to="/my-appointments" className="home-button home-button-secondary">
                  View My Appointments
                </Link>
              </>
            )
          ) : (
            // Buttons for non-authenticated users
            <>
              <Link to="/login" className="home-button home-button-primary">
                Login
              </Link>
              <Link to="/register" className="home-button home-button-secondary">
                Register
              </Link>
            </>
          )}
        </div>

        {/* Scroll indicator for mobile */}
        <div className="scroll-indicator">
          <div className="scroll-arrow"></div>
          <div className="scroll-text">Scroll to explore</div>
        </div>
      </div>

      {/* Right side with features */}
      <div className="home-right">
        <div className="features-container">
          <h2 className="features-title">Key Features</h2>

          <div className="feature-card">
            <div className="feature-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
              </svg>
              Easy Scheduling
            </div>
            <p className="feature-description">
              Book appointments with school administrators in just a few clicks. Choose your preferred date and time.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0z"/>
                <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
              </svg>
              Appointment Management
            </div>
            <p className="feature-description">
              View, reschedule, or cancel your appointments anytime. Get email notifications for appointment updates.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zm.995-14.901a1 1 0 1 0-1.99 0A5.002 5.002 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7 0-2.42-1.72-4.44-4.005-4.901z"/>
              </svg>
              Reminders & Notifications
            </div>
            <p className="feature-description">
              Never miss an appointment with timely reminders. Get notified about appointment confirmations and changes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
