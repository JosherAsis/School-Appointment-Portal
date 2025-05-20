import React, { memo } from 'react';

// Memoized version of a status badge component
export const StatusBadge = memo(({ status }) => {
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

  return (
    <span className={`status-badge ${getStatusClass(status)}`}>
      {status}
    </span>
  );
});

// Memoized version of an appointment card component
export const AppointmentCard = memo(({ appointment, onCancel, onReschedule }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    date.setHours(12, 0, 0, 0); // Set hours to noon to avoid timezone issues
    return date.toLocaleDateString();
  };

  return (
    <div className="appointment-card">
      <h3>Appointment on {formatDate(appointment.date)}</h3>
      <p><strong>Time:</strong> {appointment.start_time} - {appointment.end_time}</p>
      <p><strong>Reason:</strong> {appointment.reason}</p>
      <p><strong>Status:</strong> <StatusBadge status={appointment.status} /></p>
      
      {appointment.admin_notes && (
        <p><strong>Admin Notes:</strong> {appointment.admin_notes}</p>
      )}
      
      <div className="appointment-actions">
        {['pending', 'approved'].includes(appointment.status) && (
          <>
            <button 
              className="btn btn-secondary"
              onClick={() => onReschedule(appointment.id)}
            >
              Reschedule
            </button>
            <button 
              className="btn btn-danger"
              onClick={() => onCancel(appointment.id)}
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
});

// Memoized version of a loading spinner
export const LoadingSpinner = memo(() => (
  <div className="loading-container">
    <div className="loading-spinner"></div>
    <p>Loading...</p>
  </div>
));

// Memoized pagination component
export const Pagination = memo(({ 
  currentPage, 
  totalPages, 
  onPageChange 
}) => {
  // Generate page numbers array
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="pagination">
      <button 
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="pagination-button"
      >
        &laquo; Prev
      </button>
      
      {pageNumbers.map(number => (
        <button
          key={number}
          onClick={() => onPageChange(number)}
          className={`pagination-button ${currentPage === number ? 'active' : ''}`}
        >
          {number}
        </button>
      ))}
      
      <button 
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="pagination-button"
      >
        Next &raquo;
      </button>
    </div>
  );
});
