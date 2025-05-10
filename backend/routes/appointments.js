const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const pool = require('../db');
const auth = require('../middleware/auth');
const {
  sendAppointmentConfirmation,
  sendStatusUpdate,
  sendAppointmentCancellationEmail
} = require('../utils/emailService');

// @route   GET api/appointments
// @desc    Get all appointments (admin) or user's appointments (student)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let query;
    let params = [];

    if (req.user.role === 'admin') {
      // Admins can see all appointments
      query = `
        SELECT a.*, s.student_id, u.name, u.email, ts.start_time, ts.end_time
        FROM appointments a
        JOIN students s ON a.student_id = s.id
        JOIN users u ON s.user_id = u.id
        JOIN time_slots ts ON a.time_slot_id = ts.id
        ORDER BY a.date DESC, ts.start_time ASC
      `;
    } else {
      // Students can only see their own appointments
      query = `
        SELECT a.*, ts.start_time, ts.end_time
        FROM appointments a
        JOIN students s ON a.student_id = s.id
        JOIN time_slots ts ON a.time_slot_id = ts.id
        WHERE s.user_id = ?
        ORDER BY a.date DESC, ts.start_time ASC
      `;
      params = [req.user.id];
    }

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// @route   POST api/appointments
// @desc    Create a new appointment
// @access  Private (student only)
router.post(
  '/',
  [
    auth,
    check('date', 'Date is required').not().isEmpty(),
    check('time_slot_id', 'Time slot is required').isInt(),
    check('reason', 'Reason is required').not().isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Only students can book appointments
    if (req.user.role !== 'student') {
      return res.status(403).json({ msg: 'Only students can book appointments' });
    }

    const { date, time_slot_id, reason } = req.body;

    try {
      // Get student ID
      const [students] = await pool.query(
        'SELECT id FROM students WHERE user_id = ?',
        [req.user.id]
      );

      if (students.length === 0) {
        return res.status(404).json({ msg: 'Student profile not found' });
      }

      const studentId = students[0].id;

      // Check if time slot exists and is available
      const [timeSlots] = await pool.query(
        'SELECT * FROM time_slots WHERE id = ? AND is_available = TRUE',
        [time_slot_id]
      );

      if (timeSlots.length === 0) {
        return res.status(400).json({ msg: 'Time slot not available' });
      }

      // Check if the selected date is in the future
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        return res.status(400).json({ msg: 'Cannot book appointments in the past' });
      }

      // Check if the day of week matches the time slot
      const dayOfWeek = selectedDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
      if (dayOfWeek !== timeSlots[0].day_of_week) {
        return res.status(400).json({ msg: 'Time slot not available on selected day' });
      }

      // Check if the time slot is already booked for the selected date
      const [existingAppointments] = await pool.query(
        'SELECT COUNT(*) as count FROM appointments WHERE date = ? AND time_slot_id = ?',
        [date, time_slot_id]
      );

      if (existingAppointments[0].count >= timeSlots[0].max_appointments) {
        return res.status(400).json({ msg: 'Time slot already fully booked for this date' });
      }

      // Create appointment
      const [result] = await pool.query(
        'INSERT INTO appointments (student_id, date, time_slot_id, reason) VALUES (?, ?, ?, ?)',
        [studentId, date, time_slot_id, reason]
      );

      // Get user email for notification
      const [users] = await pool.query(
        'SELECT email FROM users WHERE id = ?',
        [req.user.id]
      );

      // Send confirmation email
      const appointmentDetails = {
        date,
        time: `${timeSlots[0].start_time} - ${timeSlots[0].end_time}`,
        reason,
        status: 'pending'
      };

      await sendAppointmentConfirmation(users[0].email, appointmentDetails);

      res.status(201).json({
        id: result.insertId,
        student_id: studentId,
        date,
        time_slot_id,
        reason,
        status: 'pending'
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  }
);

// @route   PUT api/appointments/:id
// @desc    Update appointment status (admin only)
// @access  Private (admin only)
router.put(
  '/:id',
  [
    auth,
    check('status', 'Status is required').isIn(['pending', 'approved', 'rejected', 'completed']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Only admins can update appointment status
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Only admins can update appointment status' });
    }

    const { status, admin_notes } = req.body;

    try {
      // Update appointment
      await pool.query(
        'UPDATE appointments SET status = ?, admin_notes = ? WHERE id = ?',
        [status, admin_notes || null, req.params.id]
      );

      // Get appointment details for email notification
      const [appointments] = await pool.query(
        `SELECT a.*, ts.start_time, ts.end_time, u.email
         FROM appointments a
         JOIN students s ON a.student_id = s.id
         JOIN users u ON s.user_id = u.id
         JOIN time_slots ts ON a.time_slot_id = ts.id
         WHERE a.id = ?`,
        [req.params.id]
      );

      if (appointments.length === 0) {
        return res.status(404).json({ msg: 'Appointment not found' });
      }

      const appointment = appointments[0];

      // Send status update email
      const appointmentDetails = {
        date: appointment.date,
        time: `${appointment.start_time} - ${appointment.end_time}`,
        status
      };

      await sendStatusUpdate(appointment.email, appointmentDetails);

      res.json({ msg: 'Appointment updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  }
);

// @route   DELETE api/appointments/:id
// @desc    Cancel an appointment
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    // First, get the appointment details for the email notification
    const [appointments] = await pool.query(
      `SELECT a.*, ts.start_time, ts.end_time, u.email, u.name
       FROM appointments a
       JOIN students s ON a.student_id = s.id
       JOIN users u ON s.user_id = u.id
       JOIN time_slots ts ON a.time_slot_id = ts.id
       WHERE a.id = ?`,
      [req.params.id]
    );

    if (appointments.length === 0) {
      return res.status(404).json({ msg: 'Appointment not found' });
    }

    const appointment = appointments[0];

    // Check if the user is authorized to cancel this appointment
    if (req.user.role !== 'admin' && appointment.user_id !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to cancel this appointment' });
    }

    // Instead of deleting, update the status to 'cancelled'
    const [result] = await pool.query(
      'UPDATE appointments SET status = ?, cancelled_at = NOW() WHERE id = ?',
      ['cancelled', req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ msg: 'Appointment not found' });
    }

    // Send cancellation email
    const appointmentDetails = {
      date: new Date(appointment.date).toLocaleDateString(),
      start_time: appointment.start_time,
      end_time: appointment.end_time,
      reason: appointment.reason
    };

    await sendAppointmentCancellationEmail(appointment.email, appointmentDetails);

    res.json({ msg: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
