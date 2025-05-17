import React, { useState, useContext, useEffect } from 'react';
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
  const [validation, setValidation] = useState({
    email: { valid: true, message: '' },
    password: { valid: true, message: '' }
  });
  const [rememberMe, setRememberMe] = useState(false);

  const { login, loading, error } = useContext(AuthContext);
  const navigate = useNavigate();

  // Check if there's a saved email in localStorage
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Validate on change
    if (name === 'email') {
      if (value && !validateEmail(value)) {
        setValidation(prev => ({
          ...prev,
          email: { valid: false, message: 'Please enter a valid email address' }
        }));
      } else {
        setValidation(prev => ({
          ...prev,
          email: { valid: true, message: '' }
        }));
      }
    }

    if (name === 'password') {
      if (value && !validatePassword(value)) {
        setValidation(prev => ({
          ...prev,
          password: { valid: false, message: 'Password must be at least 6 characters' }
        }));
      } else {
        setValidation(prev => ({
          ...prev,
          password: { valid: true, message: '' }
        }));
      }
    }
  };

  const handleRememberMe = (e) => {
    setRememberMe(e.target.checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Final validation before submission
    const isEmailValid = validateEmail(formData.email);
    const isPasswordValid = validatePassword(formData.password);

    setValidation({
      email: {
        valid: isEmailValid,
        message: isEmailValid ? '' : 'Please enter a valid email address'
      },
      password: {
        valid: isPasswordValid,
        message: isPasswordValid ? '' : 'Password must be at least 6 characters'
      }
    });

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    try {
      const user = await login(formData.email, formData.password);
      console.log('Login successful, user data:', user);

      // Save email to localStorage if remember me is checked
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

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
        <div className="welcome-section">
          <div className="welcome-message">Welcome Back!</div>
          <p className="welcome-subtitle">Log in to manage your appointments and schedule meetings with ease.</p>
        </div>
      </div>

      {/* Right side with login form */}
      <div className="login-right">
        <div className="login-form-container">
          <h2 className="login-header">Log in</h2>
          {formError && <div className="alert alert-danger">{formError}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <div className={`form-group ${!validation.email.valid ? 'has-error' : formData.email ? 'has-success' : ''}`}>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                aria-invalid={!validation.email.valid}
                aria-describedby="email-error"
                autoComplete="email"
              />
              {!validation.email.valid && (
                <div className="validation-message" id="email-error">{validation.email.message}</div>
              )}
            </div>

            <div className={`form-group ${!validation.password.valid ? 'has-error' : formData.password ? 'has-success' : ''}`}>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                aria-invalid={!validation.password.valid}
                aria-describedby="password-error"
                autoComplete="current-password"
              />
              {!validation.password.valid && (
                <div className="validation-message" id="password-error">{validation.password.message}</div>
              )}
            </div>

            <div className="form-options">
              <div className="remember-me">
                <input
                  type="checkbox"
                  id="remember-me"
                  checked={rememberMe}
                  onChange={handleRememberMe}
                />
                <label htmlFor="remember-me">Remember Me</label>
              </div>
              <Link to="/forgot-password" className="forgot-password">Forgot Password?</Link>
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? (
                <span className="button-loader">
                  <span className="loader-dot"></span>
                  <span className="loader-dot"></span>
                  <span className="loader-dot"></span>
                </span>
              ) : 'Log in'}
            </button>

            <div className="login-divider">
              <span>Or</span>
            </div>

            <Link to="/register" className="signup-link">
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
