import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Login.css';
import '../styles/Logo.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formError, setFormError] = useState('');

  const { login, loading, error } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    try {
      const user = await login(formData.email, formData.password);
      console.log('Login successful, user data:', user);

      // Redirect based on role
      if (user && user.role === 'admin') {
        navigate('/admin-dashboard');
      } else if (user) {
        navigate('/student-dashboard');
      } else {
        // This shouldn't happen if login is successful, but just in case
        console.error('Login successful but no user data returned');
        setFormError('Login successful but user data is missing. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setFormError(error || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="login-container">
      {/* Left side with background image */}
      <div className="login-left">
        <div className="dual-logo-container">
          <img src="/images/ducksters-logo.png" alt="Duck Logo" className="logo-image-large" />
          <div className="brand-logo">School Appointment Portal</div>
          <img src="/images/ptc-logo.png" alt="College Logo" className="logo-image-large" />
        </div>
        <div className="nav-links">
          <Link to="/" className="nav-link">HOME</Link>
          <Link to="/about" className="nav-link">ABOUT US</Link>
          <Link to="/contact" className="nav-link">CONTACT</Link>
          <Link to="/login" className="nav-link">LOG IN</Link>
        </div>
        <div className="welcome-message">Welcome Back!</div>
      </div>

      {/* Right side with login form */}
      <div className="login-right">
        <div className="login-form-container">
          <h2 className="login-header">Log in</h2>
          {formError && <div className="alert alert-danger">{formError}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
              </svg>
              <input
                type="text"
                name="email"
                placeholder="Username"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
              </svg>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-options">
              <div className="remember-me">
                <input type="checkbox" id="remember-me" />
                <label htmlFor="remember-me">Remember Me</label>
              </div>
              <Link to="/forgot-password" className="forgot-password">Forgot Password?</Link>
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Logging in...' : 'Log in'}
            </button>

            <div className="login-divider">
              <span>Or</span>
            </div>

            <Link to="/register">
              <button type="button" className="signup-button">
                Sign up
              </button>
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
