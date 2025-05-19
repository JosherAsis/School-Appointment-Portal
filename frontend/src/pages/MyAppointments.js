import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import NotificationService from '../services/NotificationService';
import api from '../services/api';

const MyAppointments = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
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
    // Navigate to the reschedule page with the appointment ID
    navigate(`/reschedule-appointment/${id}`);
  };

  const confirmCancelAppointment = async () => {
    if (!selectedAppointmentId) return;

    setCancelLoading(true);
    try {
      // Find the appointment to be cancelled
      const appointmentToCancel = appointments.find(app => app.id === selectedAppointmentId);

      if (!appointmentToCancel) {
        throw new Error('Appointment not found');
      }

      console.log('Cancelling appointment:', selectedAppointmentId);

      // Call the backend API to cancel the appointment
      const response = await api.delete(`/appointments/${selectedAppointmentId}`);
      console.log('Cancel response:', response.data);

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

      // Update the appointments list - either remove it or update its status
      setAppointments(appointments.map(app =>
        app.id === selectedAppointmentId
          ? { ...app, status: 'cancelled' }
          : app
      ));

      // Show success message
      alert('Appointment cancelled successfully!');

      // Close the modal
      setShowConfirmModal(false);
      setSelectedAppointmentId(null);
    } catch (err) {
      console.error('Error cancelling appointment:', err);

      let errorMessage = 'Failed to cancel appointment: ';

      if (err.response) {
        errorMessage += err.response.data?.msg || `Server error (${err.response.status})`;
        console.error('Response data:', err.response.data);
      } else {
        errorMessage += err.message || 'Unknown error';
      }

      setError(errorMessage);
      alert(errorMessage);
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