import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import '../styles/ManageDeletionRequests.css';

const ManageDeletionRequests = () => {
  const { currentUser } = useContext(AuthContext);
  const [deletionRequests, setDeletionRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [processForm, setProcessForm] = useState({
    status: 'approved',
    adminNotes: ''
  });
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    // Set page title
    document.title = 'Manage Deletion Requests | School Appointment Portal';
    
    // Fetch deletion requests
    fetchDeletionRequests();
  }, []);

  const fetchDeletionRequests = async () => {
    setLoading(true);
    try {
      const response = await api.get('/account-deletion/requests');
      setDeletionRequests(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching deletion requests:', error);
      setError('Failed to load deletion requests. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessClick = (request) => {
    setSelectedRequest(request);
    setProcessForm({
      status: 'approved',
      adminNotes: ''
    });
    setShowProcessModal(true);
  };

  const handleDeleteClick = (request) => {
    setUserToDelete({
      id: request.user_id,
      name: request.name,
      email: request.email,
      student_id: request.student_id
    });
    setShowDeleteModal(true);
  };

  const handleProcessChange = (e) => {
    setProcessForm({
      ...processForm,
      [e.target.name]: e.target.value
    });
  };

  const handleProcessSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      await api.put(`/account-deletion/process/${selectedRequest.id}`, processForm);
      
      // Update the local state
      setDeletionRequests(prevRequests => 
        prevRequests.map(req => 
          req.id === selectedRequest.id 
            ? { 
                ...req, 
                status: processForm.status, 
                admin_notes: processForm.adminNotes,
                processed_date: new Date().toISOString(),
                processed_by: currentUser.id
              } 
            : req
        )
      );

      // Close modal and show success message
      setShowProcessModal(false);
      setMessage({
        type: 'success',
        text: `Deletion request ${processForm.status === 'approved' ? 'approved' : 'rejected'} successfully.`
      });
    } catch (error) {
      console.error('Error processing deletion request:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.msg || 'Failed to process deletion request. Please try again.'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);

    try {
      await api.delete(`/account-deletion/execute/${userToDelete.id}`);
      
      // Update the local state to remove the deleted user's requests
      setDeletionRequests(prevRequests => 
        prevRequests.filter(req => req.user_id !== userToDelete.id)
      );

      // Close modal and show success message
      setShowDeleteModal(false);
      setMessage({
        type: 'success',
        text: `Account for ${userToDelete.name} (${userToDelete.email}) has been permanently deleted.`
      });
    } catch (error) {
      console.error('Error deleting account:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.msg || 'Failed to delete account. Please try again.'
      });
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'badge-warning';
      case 'approved': return 'badge-success';
      case 'rejected': return 'badge-danger';
      default: return 'badge-secondary';
    }
  };

  return (
    <div className="deletion-requests-container">
      <h2>Manage Account Deletion Requests</h2>

      {message.text && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="loading">Loading deletion requests...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : deletionRequests.length === 0 ? (
        <div className="no-requests">No account deletion requests found.</div>
      ) : (
        <div className="table-responsive">
          <table className="deletion-requests-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Request Date</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Processed Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {deletionRequests.map(request => (
                <tr key={request.id}>
                  <td>
                    <div className="student-info">
                      <div className="student-name">{request.name}</div>
                      <div className="student-email">{request.email}</div>
                      <div className="student-id">ID: {request.student_id}</div>
                    </div>
                  </td>
                  <td>{formatDate(request.request_date)}</td>
                  <td className="reason-cell">
                    <div className="reason-text">{request.reason}</div>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(request.status)}`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </td>
                  <td>{formatDate(request.processed_date)}</td>
                  <td>
                    {request.status === 'pending' ? (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleProcessClick(request)}
                      >
                        Process
                      </button>
                    ) : request.status === 'approved' ? (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteClick(request)}
                      >
                        Delete Account
                      </button>
                    ) : (
                      <span className="no-action">No action needed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Process Request Modal */}
      {showProcessModal && selectedRequest && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Process Deletion Request</h3>
              <button
                className="modal-close"
                onClick={() => setShowProcessModal(false)}
                disabled={processing}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="request-details">
                <p><strong>Student:</strong> {selectedRequest.name}</p>
                <p><strong>Email:</strong> {selectedRequest.email}</p>
                <p><strong>Student ID:</strong> {selectedRequest.student_id}</p>
                <p><strong>Request Date:</strong> {formatDate(selectedRequest.request_date)}</p>
                <p><strong>Reason:</strong> {selectedRequest.reason}</p>
              </div>

              <form onSubmit={handleProcessSubmit}>
                <div className="form-group">
                  <label htmlFor="status">Decision</label>
                  <select
                    id="status"
                    name="status"
                    value={processForm.status}
                    onChange={handleProcessChange}
                    className="form-control"
                    required
                  >
                    <option value="approved">Approve</option>
                    <option value="rejected">Reject</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="adminNotes">Admin Notes (required)</label>
                  <textarea
                    id="adminNotes"
                    name="adminNotes"
                    value={processForm.adminNotes}
                    onChange={handleProcessChange}
                    className="form-control"
                    rows="4"
                    required
                    placeholder="Provide a reason for your decision"
                  ></textarea>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowProcessModal(false)}
                    disabled={processing}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`btn ${processForm.status === 'approved' ? 'btn-success' : 'btn-danger'}`}
                    disabled={!processForm.adminNotes.trim() || processing}
                  >
                    {processing ? 'Processing...' : processForm.status === 'approved' ? 'Approve Request' : 'Reject Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && userToDelete && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Delete Account</h3>
              <button
                className="modal-close"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="warning-message">
                <p>
                  <strong>Warning:</strong> You are about to permanently delete the following account:
                </p>
                <ul>
                  <li><strong>Name:</strong> {userToDelete.name}</li>
                  <li><strong>Email:</strong> {userToDelete.email}</li>
                  <li><strong>Student ID:</strong> {userToDelete.student_id}</li>
                </ul>
                <p>
                  This action cannot be undone. All data associated with this account will be permanently removed.
                </p>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Permanently Delete Account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDeletionRequests;
