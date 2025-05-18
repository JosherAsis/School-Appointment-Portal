import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// Component for routes that require authentication
export const ProtectedRoute = ({ redirectPath = '/login' }) => {
  const { currentUser, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
        <small>Please wait while we prepare your experience</small>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

// Component for routes that require admin role
export const AdminRoute = ({ redirectPath = '/student-dashboard' }) => {
  const { currentUser, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your admin dashboard...</p>
        <small>Please wait while we prepare your experience</small>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser.role !== 'admin') {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

// Component for routes that require student role
export const StudentRoute = ({ redirectPath = '/admin-dashboard' }) => {
  const { currentUser, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your student dashboard...</p>
        <small>Please wait while we prepare your experience</small>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser.role !== 'student') {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

// Component for routes that should only be accessible to non-authenticated users
export const PublicRoute = ({ redirectPath = '/student-dashboard' }) => {
  const { currentUser, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Preparing School Appointment Portal</p>
        <small>Please wait a moment...</small>
      </div>
    );
  }

  if (currentUser) {
    // Redirect based on role
    if (currentUser.role === 'admin') {
      return <Navigate to="/admin-dashboard" replace />;
    }
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};
