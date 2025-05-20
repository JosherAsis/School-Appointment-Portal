const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const {
  sendAppointmentConfirmation,
  sendStatusUpdate,
  sendPasswordResetEmail,
  sendAppointmentCancellationEmail
} = require('../utils/emailService');

// @route   POST api/notifications/email
// @desc    Send email notification
// @access  Private
router.post(
  '/email',
  [
    auth,
    check('type', 'Notification type is required').not().isEmpty(),
    check('recipient', 'Recipient email is required').isEmail(),
    check('subject', 'Subject is required').not().isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, recipient, subject, appointmentData, resetToken } = req.body;

    try {
      let success = false;

      switch (type) {
        case 'appointment_confirmation':
          success = await sendAppointmentConfirmation(recipient, appointmentData);
          break;
        case 'appointment_status_update':
          success = await sendStatusUpdate(recipient, appointmentData);
          break;
        case 'appointment_cancellation':
          success = await sendAppointmentCancellationEmail(recipient, appointmentData);
          break;
        case 'password_reset':
          success = await sendPasswordResetEmail(recipient, resetToken);
          break;
        default:
          return res.status(400).json({ msg: 'Invalid notification type' });
      }

      if (success) {
        res.json({ msg: 'Notification sent successfully' });
      } else {
        res.status(500).json({ msg: 'Failed to send notification' });
      }
    } catch (error) {
      console.error('Notification error:', error);
      res.status(500).json({ message: error.message });
    }
  }
);



module.exports = router;
