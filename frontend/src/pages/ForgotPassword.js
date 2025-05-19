import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import NotificationService from '../services/NotificationService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      // In a real implementation, this would call your backend API
      const response = await axios.post('http://localhost:5001/api/auth/forgot-password', { email });

      // Send password reset email
      try {
        await NotificationService.sendPasswordResetEmail(email, response.data.resetToken);
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
        // Continue with the operation even if email fails
      }

      setMessage('Password reset link sent to your email address');
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to send password reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <h2>Forgot Password</h2>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <p className="auth-description">
        Enter your email address and we'll send you a link to reset your password.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      <p className="auth-redirect">
        Remember your password? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default ForgotPassword;
