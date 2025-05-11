import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import BookAppointment from './pages/BookAppointment';
import MyAppointments from './pages/MyAppointments';
import RescheduleAppointment from './pages/RescheduleAppointment';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ManageAppointments from './pages/ManageAppointments';
import ManageTimeSlots from './pages/ManageTimeSlots';
import StudentDirectory from './pages/StudentDirectory';
import ExportReports from './pages/ExportReports';
import AppointmentDetails from './pages/AppointmentDetails';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, AdminRoute, StudentRoute, PublicRoute } from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <div className="container">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />

              {/* Auth routes - only for non-authenticated users */}
              <Route element={<PublicRoute />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
              </Route>

              {/* Protected routes - for any authenticated user */}
              <Route element={<ProtectedRoute />}>
                <Route path="/book" element={<BookAppointment />} />
                <Route path="/my-appointments" element={<MyAppointments />} />
                <Route path="/reschedule-appointment/:appointmentId" element={<RescheduleAppointment />} />
              </Route>

              {/* Student-only routes */}
              <Route element={<StudentRoute />}>
                <Route path="/student-dashboard" element={<StudentDashboard />} />
              </Route>

              {/* Admin-only routes */}
              <Route element={<AdminRoute />}>
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="/manage-appointments" element={<ManageAppointments />} />
                <Route path="/manage-time-slots" element={<ManageTimeSlots />} />
                <Route path="/student-directory" element={<StudentDirectory />} />
                <Route path="/export-reports" element={<ExportReports />} />
                <Route path="/appointment/:appointmentId" element={<AppointmentDetails />} />
              </Route>
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;