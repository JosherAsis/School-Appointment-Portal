import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

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
    <div className="auth-form">
      <h2>Login</h2>
      {formError && <div className="alert alert-danger">{formError}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <div className="forgot-password">
            <Link to="/forgot-password">Forgot password?</Link>
          </div>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p className="auth-redirect">
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
};

export default Login;
