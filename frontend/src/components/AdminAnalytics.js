import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/AdminAnalytics.css';

const AdminAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    appointmentsByStatus: {
      pending: 0,
      approved: 0,
      rejected: 0,
      completed: 0,
      cancelled: 0
    },
    appointmentsByDay: {
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0
    },
    appointmentsByMonth: {
      Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0,
      Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0
    },
    topReasons: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        // Fetch analytics data from the backend
        const response = await api.get('/dashboard/analytics');

        // Set analytics data from API response
        setAnalyticsData(response.data);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Failed to load analytics data. Please try again later.');
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  if (loading) {
    return (
      <div className="admin-analytics">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-analytics">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  // Helper function to get the highest value in an object
  const getMaxValue = (obj) => Math.max(...Object.values(obj));

  return (
    <div className="admin-analytics">
      <h3>Appointment Analytics</h3>

      <div className="analytics-section">
        <h4>Appointments by Status</h4>
        <div className="chart status-chart">
          {Object.entries(analyticsData.appointmentsByStatus).map(([status, count]) => (
            <div className="chart-bar-container" key={status}>
              <div
                className={`chart-bar status-${status}`}
                style={{
                  height: `${(count / getMaxValue(analyticsData.appointmentsByStatus)) * 100}%`
                }}
              >
                <span className="chart-value">{count}</span>
              </div>
              <div className="chart-label">{status}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="analytics-section">
        <h4>Appointments by Day of Week</h4>
        <div className="chart day-chart">
          {Object.entries(analyticsData.appointmentsByDay).map(([day, count]) => (
            <div className="chart-bar-container" key={day}>
              <div
                className="chart-bar"
                style={{
                  height: `${(count / getMaxValue(analyticsData.appointmentsByDay)) * 100}%`
                }}
              >
                <span className="chart-value">{count}</span>
              </div>
              <div className="chart-label">{day.substring(0, 3)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="analytics-section">
        <h4>Top Appointment Reasons</h4>
        <div className="chart reason-chart">
          {analyticsData.topReasons.map((item, index) => (
            <div className="reason-item" key={index}>
              <div className="reason-label">{item.reason}</div>
              <div className="reason-bar-container">
                <div
                  className="reason-bar"
                  style={{
                    width: `${(item.count / analyticsData.topReasons[0].count) * 100}%`
                  }}
                ></div>
                <span className="reason-value">{item.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
