import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

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
      setCurrentUser(JSON.parse(userData));
      // Set default authorization header for all requests
      axios.defaults.headers.common['x-auth-token'] = token;
    }
    
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await axios.post('http://localhost:5001/api/auth/login', {
        email,
        password
      });
      
      const { token, user } = response.data;
      
      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set default authorization header
      axios.defaults.headers.common['x-auth-token'] = token;
      
      setCurrentUser(user);
      setLoading(false);
      return user;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.msg || 'Login failed. Please check your credentials.');
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await axios.post('http://localhost:5001/api/auth/register', userData);
      
      const { token, user } = response.data;
      
      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set default authorization header
      axios.defaults.headers.common['x-auth-token'] = token;
      
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
    
    // Remove authorization header
    delete axios.defaults.headers.common['x-auth-token'];
    
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
