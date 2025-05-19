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

const sendAccountDeletionRequestEmail = async (email, userData) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Account Deletion Request Received',
    html: `
      <h1>Account Deletion Request Received</h1>
      <p>We have received your request to delete your School Appointment Portal account.</p>
      <p>Your request will be reviewed by an administrator. You will be notified once a decision has been made.</p>
      <p>If you did not request this action, please contact us immediately.</p>
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

const sendAccountDeletionStatusEmail = async (email, status, adminNotes) => {
  const subject = status === 'approved'
    ? 'Account Deletion Request Approved'
    : 'Account Deletion Request Rejected';

  const heading = status === 'approved'
    ? 'Your Account Deletion Request Has Been Approved'
    : 'Your Account Deletion Request Has Been Rejected';

  const message = status === 'approved'
    ? 'Your account will be permanently deleted from our system. This process may take up to 24 hours to complete.'
    : 'Your account will remain active in our system.';

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: subject,
    html: `
      <h1>${heading}</h1>
      <p>${message}</p>
      ${adminNotes ? `<p>Administrator notes: ${adminNotes}</p>` : ''}
      <p>If you have any questions, please contact our support team.</p>
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

const sendAdminDeletionRequestNotification = async (adminEmail, userData, requestDetails) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: adminEmail,
    subject: 'New Account Deletion Request',
    html: `
      <h1>New Account Deletion Request</h1>
      <p>A user has requested to delete their account:</p>
      <ul>
        <li><strong>Name:</strong> ${userData.name}</li>
        <li><strong>Email:</strong> ${userData.email}</li>
        <li><strong>Student ID:</strong> ${userData.student_id || 'N/A'}</li>
        <li><strong>Reason:</strong> ${requestDetails.reason || 'No reason provided'}</li>
        <li><strong>Request Date:</strong> ${new Date(requestDetails.request_date).toLocaleString()}</li>
      </ul>
      <p>Please log in to the admin dashboard to review this request.</p>
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
  sendAppointmentCancellationEmail,
  sendAccountDeletionRequestEmail,
  sendAccountDeletionStatusEmail,
  sendAdminDeletionRequestNotification
};