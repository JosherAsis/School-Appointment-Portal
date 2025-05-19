import api from './api';

// Service for handling notifications (email, in-app, etc.)
class NotificationService {
  // Send email notification
  static async sendEmail(data) {
    try {
      const response = await api.post('/notifications/email', data);
      return response.data;
    } catch (error) {
      console.error('Error sending email notification:', error);
      throw error;
    }
  }

  // Send appointment confirmation email
  static async sendAppointmentConfirmation(appointmentData) {
    try {
      const data = {
        type: 'appointment_confirmation',
        recipient: appointmentData.email,
        subject: 'Appointment Confirmation',
        appointmentData
      };

      return await this.sendEmail(data);
    } catch (error) {
      console.error('Error sending appointment confirmation:', error);
      throw error;
    }
  }

  // Send appointment cancellation email
  static async sendAppointmentCancellation(appointmentData) {
    try {
      const data = {
        type: 'appointment_cancellation',
        recipient: appointmentData.email,
        subject: 'Appointment Cancellation',
        appointmentData
      };

      return await this.sendEmail(data);
    } catch (error) {
      console.error('Error sending appointment cancellation:', error);
      throw error;
    }
  }

  // Send appointment reminder email
  static async sendAppointmentReminder(appointmentData) {
    try {
      const data = {
        type: 'appointment_reminder',
        recipient: appointmentData.email,
        subject: 'Appointment Reminder',
        appointmentData
      };

      return await this.sendEmail(data);
    } catch (error) {
      console.error('Error sending appointment reminder:', error);
      throw error;
    }
  }

  // Send appointment reschedule notification
  static async sendAppointmentReschedule(appointmentData) {
    try {
      const data = {
        type: 'appointment_reschedule',
        recipient: appointmentData.email,
        subject: 'Appointment Rescheduled',
        appointmentData
      };

      return await this.sendEmail(data);
    } catch (error) {
      console.error('Error sending appointment reschedule notification:', error);
      throw error;
    }
  }

  // Send password reset email
  static async sendPasswordResetEmail(email, resetToken) {
    try {
      const data = {
        type: 'password_reset',
        recipient: email,
        subject: 'Password Reset Request',
        resetToken
      };

      return await this.sendEmail(data);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }
}

export default NotificationService;
