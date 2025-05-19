import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import '../styles/Profile.css';

const Profile = () => {
  const { currentUser, refreshUserData } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    student_id: '',
    department: '',
    year_level: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [studentData, setStudentData] = useState(null);

  // Account deletion states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletionReason, setDeletionReason] = useState('');
  const [deletionLoading, setDeletionLoading] = useState(false);
  const [deletionStatus, setDeletionStatus] = useState({ hasRequest: false, request: null });

  // Fetch student profile data and deletion status
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch student data
        const studentResponse = await api.get('/students');
        setStudentData(studentResponse.data);

        // Pre-fill form with current user data
        setFormData({
          name: currentUser?.name || '',
          email: currentUser?.email || '',
          student_id: studentResponse.data.student_id || '',
          department: studentResponse.data.department || '',
          year_level: studentResponse.data.year_level || ''
        });

        try {
          // Fetch deletion request status in a separate try/catch block
          const deletionResponse = await api.get('/account-deletion/status');
          setDeletionStatus(deletionResponse.data);
        } catch (deletionError) {
          console.error('Error fetching deletion status:', deletionError);
          // Don't show an error message for this - just set default status
          setDeletionStatus({ hasRequest: false });
        }

        // Clear any error messages since we got the profile data
        setMessage({ type: '', text: '' });
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setMessage({
          type: 'error',
          text: 'Failed to load profile data. Please try again later.'
        });
      }
    };

    if (currentUser) {
      fetchData();
    }

    // Set page title
    document.title = 'My Profile | School Appointment Portal';
  }, [currentUser]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Update user profile (name, email, student_id)
      await api.put('/auth/update-profile', {
        name: formData.name,
        email: formData.email,
        student_id: formData.student_id
      });

      // Update student profile (department and year_level)
      await api.put('/students', {
        department: formData.department,
        year_level: parseInt(formData.year_level, 10) || 0
      });

      // Show success message
      setMessage({
        type: 'success',
        text: 'Profile updated successfully!'
      });

      // Refresh user data in context
      await refreshUserData();

      // Reset loading state
      setLoading(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.msg || error.response?.data?.message || 'Failed to update profile. Please try again.'
      });
      setLoading(false);
    }
  };

  // Handle account deletion request
  const handleDeleteRequest = async (e) => {
    e.preventDefault();
    setDeletionLoading(true);

    try {
      await api.post('/account-deletion/request', { reason: deletionReason });

      try {
        // Update deletion status in a separate try/catch
        const response = await api.get('/account-deletion/status');
        setDeletionStatus(response.data);
      } catch (statusError) {
        console.error('Error fetching updated deletion status:', statusError);
        // Set a default status if we can't fetch the updated one
        setDeletionStatus({ hasRequest: true, request: { status: 'pending', reason: deletionReason } });
      }

      // Close modal and show success message
      setShowDeleteModal(false);
      setMessage({
        type: 'success',
        text: 'Account deletion request submitted successfully. An administrator will review your request.'
      });
    } catch (error) {
      console.error('Error requesting account deletion:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.msg || 'Failed to submit deletion request. Please try again.'
      });
    } finally {
      setDeletionLoading(false);
    }
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'badge-warning';
      case 'approved': return 'badge-success';
      case 'rejected': return 'badge-danger';
      default: return 'badge-secondary';
    }
  };

  return (
    <div className="profile-container">
      <h2>My Profile</h2>

      {message.text && message.type === 'success' && (
        <div className="alert alert-success">
          {message.text}
        </div>
      )}

      {/* Only show error messages that are not about loading profile data */}
      {message.text && message.type === 'error' && !message.text.includes('Failed to load profile data') && (
        <div className="alert alert-danger">
          {message.text}
        </div>
      )}

      {/* Account Deletion Status */}
      {deletionStatus.hasRequest && (
        <div className={`alert ${
          deletionStatus.request.status === 'approved' ? 'alert-danger' :
          deletionStatus.request.status === 'rejected' ? 'alert-warning' :
          'alert-info'
        }`}>
          <strong>Account Deletion Request: </strong>
          <span className={`status-badge ${getStatusBadgeClass(deletionStatus.request.status)}`}>
            {deletionStatus.request.status.charAt(0).toUpperCase() + deletionStatus.request.status.slice(1)}
          </span>
          {deletionStatus.request.status === 'approved' && (
            <p>Your account will be deleted soon. You will receive an email confirmation.</p>
          )}
          {deletionStatus.request.status === 'rejected' && deletionStatus.request.admin_notes && (
            <p><strong>Admin Notes:</strong> {deletionStatus.request.admin_notes}</p>
          )}
          {deletionStatus.request.status === 'pending' && (
            <p>Your request is being reviewed by an administrator.</p>
          )}
        </div>
      )}

      <div className="profile-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-control"
              required
            />
            <small className="form-text text-muted">
              This email will be used for all communications.
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="student_id">Student ID</label>
            <input
              type="text"
              id="student_id"
              name="student_id"
              value={formData.student_id}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="department">Department</label>
            <input
              type="text"
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="year_level">Year Level</label>
            <select
              id="year_level"
              name="year_level"
              value={formData.year_level}
              onChange={handleChange}
              className="form-control"
              required
            >
              <option value="">Select Year Level</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
              <option value="5">5th Year</option>
              <option value="6">Graduate Student</option>
            </select>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/student-dashboard')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Account Deletion Section */}
      <div className="danger-zone">
        <h3>Danger Zone</h3>
        <div className="danger-card">
          <div className="danger-content">
            <h4>Delete Account</h4>
            <p>
              Once you delete your account, there is no going back. Please be certain.
            </p>
          </div>
          <button
            className="btn btn-danger delete-btn"
            onClick={() => setShowDeleteModal(true)}
            disabled={deletionStatus.hasRequest}
          >
            {deletionStatus.hasRequest ? 'Request Pending' : 'Delete Account'}
          </button>
        </div>
      </div>

      {/* Account Deletion Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Request Account Deletion</h3>
              <button
                className="modal-close"
                onClick={() => setShowDeleteModal(false)}
                disabled={deletionLoading}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to request deletion of your account? This action cannot be undone.
              </p>
              <p>
                Your request will be reviewed by an administrator. You will receive an email notification
                once your request has been processed.
              </p>
              <form onSubmit={handleDeleteRequest}>
                <div className="form-group">
                  <label htmlFor="deletion-reason">Reason for deletion (required)</label>
                  <textarea
                    id="deletion-reason"
                    value={deletionReason}
                    onChange={(e) => setDeletionReason(e.target.value)}
                    className="form-control"
                    rows="4"
                    required
                    placeholder="Please explain why you want to delete your account"
                  ></textarea>
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowDeleteModal(false)}
                    disabled={deletionLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-danger"
                    disabled={!deletionReason.trim() || deletionLoading}
                  >
                    {deletionLoading ? 'Submitting...' : 'Submit Deletion Request'}
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

export default Profile;
