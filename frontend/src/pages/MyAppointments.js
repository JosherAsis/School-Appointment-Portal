import React, { useState, useContext, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import NotificationService from '../services/NotificationService';
import api from '../services/api';
import { useDataFetching } from '../hooks/useDataFetching';
import { AppointmentCard, LoadingSpinner } from '../components/MemoizedComponents';

const MyAppointments = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [modalAction, setModalAction] = useState('');

  // Use the custom hook for data fetching with caching
  const {
    data: appointments = [],
    loading,
    error,
    refetch
  } = useDataFetching('/appointments', {
    enabled: !!currentUser,
    dependencies: [currentUser?.id],
    cacheTime: 2 * 60 * 1000 // 2 minutes cache
  });

  // Memoize handlers to prevent unnecessary re-renders
  const handleCancelAppointment = useCallback((id) => {
    setSelectedAppointmentId(id);
    setModalAction('cancel');
    setShowConfirmModal(true);
  }, []);

  const handleRescheduleAppointment = useCallback((id) => {
    // Navigate to the reschedule page with the appointment ID
    navigate(`/reschedule-appointment/${id}`);
  }, [navigate]);

  // Memoize the cancel confirmation handler
  const confirmCancelAppointment = useCallback(async () => {
    if (!selectedAppointmentId) return;

    setCancelLoading(true);
    try {
      // Find the appointment to be cancelled
      const appointmentToCancel = appointments.find(app => app.id === selectedAppointmentId);

      if (!appointmentToCancel) {
        throw new Error('Appointment not found');
      }

      // Call the backend API to cancel the appointment
      await api.delete(`/appointments/${selectedAppointmentId}`);

      // Send cancellation email
      try {
        await NotificationService.sendAppointmentCancellation({
          ...appointmentToCancel,
          email: currentUser.email,
          name: currentUser.name,
          date: new Date(appointmentToCancel.date).toLocaleDateString()
        });
      } catch (emailError) {
        console.error('Failed to send cancellation email:', emailError);
        // Don't fail the whole operation if email fails
      }

      // Refresh the appointments data
      refetch();

      // Show success message (consider using a toast notification instead)
      alert('Appointment cancelled successfully!');

      // Close the modal
      setShowConfirmModal(false);
      setSelectedAppointmentId(null);
    } catch (err) {
      console.error('Error cancelling appointment:', err);

      let errorMessage = 'Failed to cancel appointment: ';

      if (err.response) {
        errorMessage += err.response.data?.msg || `Server error (${err.response.status})`;
      } else {
        errorMessage += err.message || 'Unknown error';
      }

      alert(errorMessage);
    } finally {
      setCancelLoading(false);
    }
  }, [selectedAppointmentId, appointments, currentUser, refetch]);

  // Memoize the modal close handler
  const closeModal = useCallback(() => {
    setShowConfirmModal(false);
    setSelectedAppointmentId(null);
  }, []);

  // Show loading spinner while data is being fetched
  if (loading) return <LoadingSpinner />;

  return (
    <div className="my-appointments">
      <h2>My Appointments</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {appointments.length === 0 ? (
        <p>No appointments found.</p>
      ) : (
        <div className="appointments-list">
          {appointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onCancel={handleCancelAppointment}
              onReschedule={handleRescheduleAppointment}
            />
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>{modalAction === 'cancel' ? 'Cancel Appointment' : 'Confirm Action'}</h3>
              <button className="modal-close" onClick={closeModal}>&times;</button>
            </div>
            <div className="modal-body">
              <p>
                {modalAction === 'cancel'
                  ? 'Are you sure you want to cancel this appointment? This action cannot be undone.'
                  : 'Please confirm this action.'}
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={closeModal}
              >
                No, Keep It
              </button>
              <button
                className="btn btn-danger"
                onClick={confirmCancelAppointment}
                disabled={cancelLoading}
              >
                {cancelLoading ? 'Cancelling...' : 'Yes, Cancel It'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;