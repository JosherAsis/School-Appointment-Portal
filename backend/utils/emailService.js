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

module.exports = {
  sendAppointmentConfirmation,
  sendStatusUpdate
};