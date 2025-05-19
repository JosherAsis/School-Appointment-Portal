import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch complete user data from the server
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      const response = await api.get('/auth/me');
      console.log('Fetched user data from server:', response.data);

      // Update localStorage with the latest user data
      localStorage.setItem('user', JSON.stringify(response.data));

      return response.data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    const initializeUser = async () => {
      setLoading(true);

      if (token && userData) {
        try {
          // Set the user from localStorage for immediate UI response
          const parsedUser = JSON.parse(userData);
          setCurrentUser(parsedUser);
          setLoading(false);

          // Fetch fresh data in the background without blocking the UI
          fetchUserData().then(freshUserData => {
            if (freshUserData) {
              setCurrentUser(freshUserData);
            }
          }).catch(e => {
            console.error('Background user data fetch failed:', e);
          });
        } catch (e) {
          // If JSON parsing fails, clear localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          console.error('Failed to parse user data from localStorage:', e);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    initializeUser();
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

      // Set the user from the login response
      setCurrentUser(user);

      // Set loading to false immediately to allow UI to render
      setLoading(false);

      // Fetch complete user data in the background without blocking the UI
      fetchUserData().then(completeUserData => {
        if (completeUserData) {
          setCurrentUser(completeUserData);
          console.log('Complete user data fetched after login:', completeUserData);
        }
      }).catch(fetchError => {
        console.error('Error fetching complete user data after login:', fetchError);
      });

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

      // Set the user from the registration response
      setCurrentUser(user);

      // Set loading to false immediately to allow UI to render
      setLoading(false);

      // Fetch complete user data in the background without blocking the UI
      fetchUserData().then(completeUserData => {
        if (completeUserData) {
          setCurrentUser(completeUserData);
          console.log('Complete user data fetched after registration:', completeUserData);
        }
      }).catch(fetchError => {
        console.error('Error fetching complete user data after registration:', fetchError);
      });

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

  // Function to refresh user data
  const refreshUserData = async () => {
    try {
      const freshUserData = await fetchUserData();
      if (freshUserData) {
        setCurrentUser(freshUserData);
      }
      return freshUserData;
    } catch (error) {
      console.error('Error refreshing user data:', error);
      return null;
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    refreshUserData
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
