import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import '../styles/ManageAppointments.css';

const ManageAppointments = () => {
  const { currentUser } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    date: '',
    searchTerm: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({
    key: 'date',
    direction: 'desc'
  });
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [statusUpdateData, setStatusUpdateData] = useState({
    status: '',
    admin_notes: ''
  });
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await api.get('/appointments');
        setAppointments(response.data);
        setFilteredAppointments(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        setError('Failed to load appointments. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser && currentUser.role === 'admin') {
      fetchAppointments();
    }
  }, [currentUser]);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...appointments];

    // Apply status filter
    if (filters.status !== 'all') {
      result = result.filter(appointment => appointment.status === filters.status);
    }

    // Apply date filter
    if (filters.date) {
      // Create a date object from the filter date string
      const filterDate = new Date(filters.date);

      // Set hours to noon to avoid timezone issues
      filterDate.setHours(12, 0, 0, 0);

      result = result.filter(appointment => {
        // Create a date object from the appointment date
        const appointmentDate = new Date(appointment.date);

        // Set hours to noon to avoid timezone issues
        appointmentDate.setHours(12, 0, 0, 0);

        // Compare the date strings (day, month, year)
        return appointmentDate.toDateString() === filterDate.toDateString();
      });
    }

    // Apply search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      result = result.filter(appointment =>
        appointment.student_name?.toLowerCase().includes(searchLower) ||
        appointment.student_id?.toLowerCase().includes(searchLower) ||
        appointment.reason?.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredAppointments(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [filters, appointments, sortConfig]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Get current appointments for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAppointments = filteredAppointments.slice(indexOfFirstItem, indexOfLastItem);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Open status update modal
  const openStatusModal = (appointment) => {
    setSelectedAppointment(appointment);
    setStatusUpdateData({
      status: appointment.status,
      admin_notes: appointment.admin_notes || ''
    });
    setShowStatusModal(true);
  };

  // Handle status update form changes
  const handleStatusFormChange = (e) => {
    const { name, value } = e.target;
    setStatusUpdateData(prev => ({ ...prev, [name]: value }));
  };

  // Submit status update
  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    setUpdateLoading(true);
    try {
      await api.put(`/appointments/${selectedAppointment.id}`, statusUpdateData);

      // Update the appointment in the local state
      const updatedAppointments = appointments.map(app =>
        app.id === selectedAppointment.id
          ? { ...app, ...statusUpdateData }
          : app
      );

      setAppointments(updatedAppointments);
      setShowStatusModal(false);
      setSelectedAppointment(null);
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

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    // Set hours to noon to avoid timezone issues
    date.setHours(12, 0, 0, 0);
    return date.toLocaleDateString();
  };

  if (loading) {
    return <div className="loading">Loading appointments...</div>;
  }

  return (
    <div className="manage-appointments">
      <h2>Manage Appointments</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="filters-container">
        <div className="filter-group">
          <label>Status:</label>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Date:</label>
          <input
            type="date"
            name="date"
            value={filters.date}
            onChange={handleFilterChange}
          />
        </div>

        <div className="filter-group">
          <label>Search:</label>
          <input
            type="text"
            name="searchTerm"
            value={filters.searchTerm}
            onChange={handleFilterChange}
            placeholder="Search by name, ID, or reason"
          />
        </div>

        <button
          className="btn btn-secondary"
          onClick={() => setFilters({ status: 'all', date: '', searchTerm: '' })}
        >
          Clear Filters
        </button>
      </div>

      {filteredAppointments.length === 0 ? (
        <p>No appointments found matching the current filters.</p>
      ) : (
        <>
          <div className="table-responsive">
            <table className="appointments-table">
              <thead>
                <tr>
                  <th onClick={() => requestSort('student_name')}>
                    Student {sortConfig.key === 'student_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => requestSort('date')}>
                    Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th>Time</th>
                  <th>Reason</th>
                  <th onClick={() => requestSort('status')}>
                    Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentAppointments.map(appointment => (
                  <tr key={appointment.id}>
                    <td>
                      {appointment.name || appointment.student_name}<br />
                      <small>{appointment.student_id}</small>
                    </td>
                    <td>{formatDate(appointment.date)}</td>
                    <td>{appointment.start_time} - {appointment.end_time}</td>
                    <td>{appointment.reason}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <Link to={`/appointment/${appointment.id}`} className="btn btn-sm">
                          View
                        </Link>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => openStatusModal(appointment)}
                        >
                          Update
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="btn btn-sm"
            >
              Previous
            </button>

            {Array.from({ length: Math.ceil(filteredAppointments.length / itemsPerPage) }).map((_, index) => (
              <button
                key={index}
                onClick={() => paginate(index + 1)}
                className={`btn btn-sm ${currentPage === index + 1 ? 'btn-active' : ''}`}
              >
                {index + 1}
              </button>
            ))}

            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === Math.ceil(filteredAppointments.length / itemsPerPage)}
              className="btn btn-sm"
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedAppointment && (
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
              <p>
                <strong>Student:</strong> {selectedAppointment.name || selectedAppointment.student_name} ({selectedAppointment.student_id})
              </p>
              <p>
                <strong>Date:</strong> {formatDate(selectedAppointment.date)}
              </p>
              <p>
                <strong>Time:</strong> {selectedAppointment.start_time} - {selectedAppointment.end_time}
              </p>
              <p>
                <strong>Reason:</strong> {selectedAppointment.reason}
              </p>

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

export default ManageAppointments;
