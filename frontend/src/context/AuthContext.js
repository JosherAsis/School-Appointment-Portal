import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        setCurrentUser(JSON.parse(userData));
      } catch (e) {
        // If JSON parsing fails, clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        console.error('Failed to parse user data from localStorage:', e);
      }
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);

      console.log('Attempting login with email:', email);
      const response = await api.post('/auth/login', {
        email,
        password
      });

      console.log('Login response:', response.data);
      const { token, user } = response.data;

      if (!token) {
        console.error('No token received in login response');
        setLoading(false);
        setError('Authentication failed: No token received');
        throw new Error('No token received');
      }

      if (!user) {
        console.error('No user data received in login response');
        setLoading(false);
        setError('Authentication failed: No user data received');
        throw new Error('No user data received');
      }

      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      console.log('User data saved to localStorage:', user);

      setCurrentUser(user);
      setLoading(false);
      return user;
    } catch (err) {
      console.error('Login error:', err);
      setLoading(false);
      const errorMessage = err.response?.data?.msg || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      console.error('Login error message:', errorMessage);
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);

      const response = await api.post('/auth/register', userData);

      const { token, user } = response.data;

      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      setCurrentUser(user);
      setLoading(false);
      return user;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.msg || 'Registration failed. Please try again.');
      throw err;
    }
  };

  const logout = () => {
    // Remove from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    setCurrentUser(null);
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
