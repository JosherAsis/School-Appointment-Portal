import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import '../styles/AppointmentDetails.css';
import { formatTime, formatDate, getDayOfWeek } from '../utils/timeFormatter';

const AppointmentDetails = () => {
  const { appointmentId } = useParams();
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusUpdateData, setStatusUpdateData] = useState({
    status: '',
    admin_notes: ''
  });
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      try {
        const response = await api.get(`/appointments/${appointmentId}`);
        setAppointment(response.data);
        setStatusUpdateData({
          status: response.data.status,
          admin_notes: response.data.admin_notes || ''
        });
        setError(null);
      } catch (error) {
        console.error('Error fetching appointment details:', error);
        setError('Failed to load appointment details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (appointmentId) {
      fetchAppointmentDetails();
    }
  }, [appointmentId]);

  // Handle status update form changes
  const handleStatusFormChange = (e) => {
    const { name, value } = e.target;
    setStatusUpdateData(prev => ({ ...prev, [name]: value }));
  };

  // Submit status update
  const handleStatusUpdate = async (e) => {
    e.preventDefault();

    setUpdateLoading(true);
    try {
      await api.put(`/appointments/${appointmentId}`, statusUpdateData);

      // Update the appointment in the local state
      setAppointment(prev => ({ ...prev, ...statusUpdateData }));
      setShowStatusModal(false);
    } catch (error) {
      console.error('Error updating appointment status:', error);
      setError('Failed to update appointment status. Please try again.');
    } finally {
      setUpdateLoading(false);
    }
  };

  // Get status badge class
  const getStatusClass = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  // Using imported utility functions for date and time formatting

  if (loading) {
    return <div className="loading">Loading appointment details...</div>;
  }

  if (error) {
    return (
      <div className="appointment-details">
        <div className="alert alert-danger">{error}</div>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="appointment-details">
        <div className="alert alert-warning">Appointment not found</div>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="appointment-details">
      <div className="details-header">
        <h2>Appointment Details</h2>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>

      <div className="details-container">
        <div className="details-section">
          <h3>Appointment Information</h3>

          <div className="detail-row">
            <div className="detail-label">Status:</div>
            <div className="detail-value">
              <span className={`status-badge ${getStatusClass(appointment.status)}`}>
                {appointment.status}
              </span>
            </div>
          </div>

          <div className="detail-row">
            <div className="detail-label">Date:</div>
            <div className="detail-value">
              {formatDate(appointment.date)} ({getDayOfWeek(appointment.date)})
            </div>
          </div>

          <div className="detail-row">
            <div className="detail-label">Time:</div>
            <div className="detail-value">
              {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
            </div>
          </div>

          <div className="detail-row">
            <div className="detail-label">Reason:</div>
            <div className="detail-value reason-text">
              {appointment.reason}
            </div>
          </div>

          {appointment.admin_notes && (
            <div className="detail-row">
              <div className="detail-label">Admin Notes:</div>
              <div className="detail-value admin-notes">
                {appointment.admin_notes}
              </div>
            </div>
          )}

          <div className="detail-row">
            <div className="detail-label">Created:</div>
            <div className="detail-value">
              {new Date(appointment.created_at).toLocaleString()}
            </div>
          </div>

          {appointment.cancelled_at && (
            <div className="detail-row">
              <div className="detail-label">Cancelled:</div>
              <div className="detail-value">
                {new Date(appointment.cancelled_at).toLocaleString()}
              </div>
            </div>
          )}
        </div>

        <div className="details-section">
          <h3>Student Information</h3>

          <div className="detail-row">
            <div className="detail-label">Name:</div>
            <div className="detail-value">
              {appointment.name || appointment.student_name}
            </div>
          </div>

          <div className="detail-row">
            <div className="detail-label">Student ID:</div>
            <div className="detail-value">
              {appointment.student_id}
            </div>
          </div>

          <div className="detail-row">
            <div className="detail-label">Email:</div>
            <div className="detail-value">
              {appointment.email}
            </div>
          </div>

          {currentUser && currentUser.role === 'admin' && (
            <div className="student-actions">
              <Link
                to={`/student-directory?student=${appointment.student_id}`}
                className="btn btn-secondary"
              >
                View Student Profile
              </Link>
            </div>
          )}
        </div>
      </div>

      {currentUser && currentUser.role === 'admin' && (
        <div className="admin-actions">
          <button
            className="btn btn-primary"
            onClick={() => setShowStatusModal(true)}
            disabled={appointment.status === 'cancelled'}
          >
            Update Status
          </button>

          <Link
            to={`/manage-appointments`}
            className="btn btn-secondary"
          >
            View All Appointments
          </Link>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Update Appointment Status</h3>
              <button
                className="close-btn"
                onClick={() => setShowStatusModal(false)}
              >
                &times;
              </button>
            </div>

            <div className="modal-body">
              <form onSubmit={handleStatusUpdate}>
                <div className="form-group">
                  <label>Status:</label>
                  <select
                    name="status"
                    value={statusUpdateData.status}
                    onChange={handleStatusFormChange}
                    required
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Admin Notes:</label>
                  <textarea
                    name="admin_notes"
                    value={statusUpdateData.admin_notes}
                    onChange={handleStatusFormChange}
                    rows="3"
                  ></textarea>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowStatusModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={updateLoading}
                  >
                    {updateLoading ? 'Updating...' : 'Update Status'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentDetails;
