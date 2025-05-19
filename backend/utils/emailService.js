const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT === '465',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendAppointmentConfirmation = async (email, appointmentDetails) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Appointment Confirmation',
    html: `
      <h1>Your appointment has been booked</h1>
      <p>Date: ${appointmentDetails.date}</p>
      <p>Time: ${appointmentDetails.time}</p>
      <p>Reason: ${appointmentDetails.reason}</p>
      <p>Status: ${appointmentDetails.status}</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};

const sendStatusUpdate = async (email, appointmentDetails) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Appointment Status Update',
    html: `
      <h1>Your appointment status has been updated</h1>
      <p>Date: ${appointmentDetails.date}</p>
      <p>Time: ${appointmentDetails.time}</p>
      <p>New Status: ${appointmentDetails.status}</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};

const sendPasswordResetEmail = async (email, resetUrl) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <h1>Password Reset</h1>
      <p>You requested a password reset for your School Appointment Portal account.</p>
      <p>Please click the link below to reset your password:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not request this reset, please ignore this email and your password will remain unchanged.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Password reset email sending failed:', error);
    return false;
  }
};

const sendAppointmentCancellationEmail = async (email, appointmentDetails) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Appointment Cancellation Confirmation',
    html: `
      <h1>Your appointment has been cancelled</h1>
      <p>Date: ${appointmentDetails.date}</p>
      <p>Time: ${appointmentDetails.time || `${appointmentDetails.start_time} - ${appointmentDetails.end_time}`}</p>
      <p>Reason: ${appointmentDetails.reason}</p>
      <p>If you did not cancel this appointment, please contact us immediately.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};

module.exports = {
  transporter,
  sendAppointmentConfirmation,
  sendStatusUpdate,
  sendPasswordResetEmail,
  sendAppointmentCancellationEmail
};