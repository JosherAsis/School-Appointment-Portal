import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import AdminAnalytics from '../components/AdminAnalytics';

const AdminDashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    todayAppointments: 0,
    totalStudents: 0
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // In a real app, you'd fetch this data from the backend
        // For now, we'll use dummy data

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Dummy stats
        setStats({
          totalAppointments: 45,
          pendingAppointments: 12,
          todayAppointments: 5,
          totalStudents: 120
        });

        // Dummy recent appointments
        setRecentAppointments([
          {
            id: 1,
            student_name: 'John Doe',
            student_id: 'S12345',
            date: '2023-05-15',
            start_time: '10:00:00',
            end_time: '11:00:00',
            reason: 'Academic advising',
            status: 'pending'
          },
          {
            id: 2,
            student_name: 'Jane Smith',
            student_id: 'S12346',
            date: '2023-05-15',
            start_time: '13:00:00',
            end_time: '14:00:00',
            reason: 'Course registration',
            status: 'approved'
          },
          {
            id: 3,
            student_name: 'Bob Johnson',
            student_id: 'S12347',
            date: '2023-05-16',
            start_time: '09:00:00',
            end_time: '10:00:00',
            reason: 'Scholarship application',
            status: 'pending'
          }
        ]);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      case 'completed':
        return 'status-completed';
      default:
        return 'status-pending';
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard data...</div>;
  }

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      <div className="welcome-message">
        <h3>Welcome, {currentUser?.name || 'Admin'}!</h3>
      </div>

      <div className="stats-container">
        <div className="stat-card">
          <h4>Total Appointments</h4>
          <p className="stat-value">{stats.totalAppointments}</p>
        </div>

        <div className="stat-card">
          <h4>Pending Appointments</h4>
          <p className="stat-value">{stats.pendingAppointments}</p>
        </div>

        <div className="stat-card">
          <h4>Today's Appointments</h4>
          <p className="stat-value">{stats.todayAppointments}</p>
        </div>

        <div className="stat-card">
          <h4>Total Students</h4>
          <p className="stat-value">{stats.totalStudents}</p>
        </div>
      </div>

      <div className="recent-appointments">
        <div className="section-header">
          <h3>Recent Appointments</h3>
          <Link to="/manage-appointments" className="btn btn-sm">View All</Link>
        </div>

        <table className="appointments-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Date</th>
              <th>Time</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {recentAppointments.map(appointment => (
              <tr key={appointment.id}>
                <td>
                  {appointment.student_name}<br />
                  <small>{appointment.student_id}</small>
                </td>
                <td>{new Date(appointment.date).toLocaleDateString()}</td>
                <td>{appointment.start_time} - {appointment.end_time}</td>
                <td>{appointment.reason}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(appointment.status)}`}>
                    {appointment.status}
                  </span>
                </td>
                <td>
                  <Link to={`/appointment/${appointment.id}`} className="btn btn-sm">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Analytics Section */}
      <AdminAnalytics />

      <div className="dashboard-actions">
        <div className="action-card">
          <h4>Manage Appointments</h4>
          <p>View and update all appointment requests.</p>
          <Link to="/manage-appointments" className="btn btn-primary">Manage</Link>
        </div>

        <div className="action-card">
          <h4>Manage Time Slots</h4>
          <p>Configure available appointment time slots.</p>
          <Link to="/manage-time-slots" className="btn btn-secondary">Configure</Link>
        </div>

        <div className="action-card">
          <h4>Student Directory</h4>
          <p>View and manage student information.</p>
          <Link to="/student-directory" className="btn btn-secondary">View Directory</Link>
        </div>

        <div className="action-card">
          <h4>Export Reports</h4>
          <p>Generate and download appointment reports.</p>
          <Link to="/export-reports" className="btn btn-secondary">Export</Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
