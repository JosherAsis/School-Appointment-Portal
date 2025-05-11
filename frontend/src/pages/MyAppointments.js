import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import NotificationService from '../services/NotificationService';
import api from '../services/api';

const MyAppointments = () => {
  const { currentUser } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [modalAction, setModalAction] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        // The backend will filter appointments based on the user's token
        const response = await api.get('/appointments');
        setAppointments(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        setError('Failed to load appointments. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchAppointments();
    }
  }, [currentUser]);

  const handleCancelAppointment = (id) => {
    setSelectedAppointmentId(id);
    setModalAction('cancel');
    setShowConfirmModal(true);
  };

  const handleRescheduleAppointment = (id) => {
    // In a real app, this would navigate to a reschedule page
    // For now, we'll just show an alert
    alert('Reschedule functionality will be implemented soon!');
  };

  const confirmCancelAppointment = async () => {
    if (!selectedAppointmentId) return;

    setCancelLoading(true);
    try {
      // Find the appointment to be cancelled
      const appointmentToCancel = appointments.find(app => app.id === selectedAppointmentId);

      // Call the backend API to delete the appointment
      await api.delete(`/appointments/${selectedAppointmentId}`);

      // Send cancellation email
      try {
        if (appointmentToCancel) {
          await NotificationService.sendAppointmentCancellation({
            ...appointmentToCancel,
            email: currentUser.email,
            name: currentUser.name,
            date: new Date(appointmentToCancel.date).toLocaleDateString()
          });
        }
      } catch (emailError) {
        console.error('Failed to send cancellation email:', emailError);
        // Don't fail the whole operation if email fails
      }

      // Update the appointments list
      setAppointments(appointments.filter(app => app.id !== selectedAppointmentId));

      // Close the modal
      setShowConfirmModal(false);
      setSelectedAppointmentId(null);
    } catch (err) {
      setError('Failed to cancel appointment: ' + (err.response?.data?.msg || err.message));
    } finally {
      setCancelLoading(false);
    }
  };

  const closeModal = () => {
    setShowConfirmModal(false);
    setSelectedAppointmentId(null);
  };

  if (loading) return <div className="loading">Loading appointments...</div>;

  return (
    <div className="my-appointments">
      <h2>My Appointments</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {appointments.length === 0 ? (
        <p>No appointments found.</p>
      ) : (
        <div className="appointments-list">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="appointment-card">
              <h3>Appointment on {new Date(appointment.date).toLocaleDateString()}</h3>
              <p><strong>Time:</strong> {appointment.start_time} - {appointment.end_time}</p>
              <p><strong>Reason:</strong> {appointment.reason}</p>
              <p><strong>Status:</strong> <span className={`status-badge status-${appointment.status}`}>{appointment.status}</span></p>

              <div className="appointment-actions">
                {appointment.status === 'pending' && (
                  <>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleCancelAppointment(appointment.id)}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleRescheduleAppointment(appointment.id)}
                    >
                      Reschedule
                    </button>
                  </>
                )}
              </div>
            </div>
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