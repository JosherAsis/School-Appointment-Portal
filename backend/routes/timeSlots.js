const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const pool = require('../db');
const auth = require('../middleware/auth');

// @route   GET api/time-slots
// @desc    Get all time slots
// @access  Public
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM time_slots ORDER BY day_of_week, start_time'
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// @route   GET api/time-slots/available
// @desc    Get available time slots for a specific date
// @access  Public
router.get('/available', async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ msg: 'Date parameter is required' });
  }

  try {
    // Get the day of week for the selected date (0 = Sunday, 1 = Monday, etc.)
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();

    // Get all time slots for this day of week
    const [timeSlots] = await pool.query(
      'SELECT * FROM time_slots WHERE day_of_week = ? AND is_available = TRUE ORDER BY start_time',
      [dayOfWeek]
    );

    // For each time slot, check how many appointments are already booked
    const availableTimeSlots = await Promise.all(
      timeSlots.map(async (slot) => {
        const [appointments] = await pool.query(
          'SELECT COUNT(*) as count FROM appointments WHERE date = ? AND time_slot_id = ? AND status NOT IN ("rejected", "cancelled")',
          [date, slot.id]
        );

        const bookedCount = appointments[0].count;
        const availableCount = slot.max_appointments - bookedCount;

        return {
          ...slot,
          available_count: availableCount,
          is_fully_booked: availableCount <= 0
        };
      })
    );

    res.json(availableTimeSlots);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// @route   POST api/time-slots
// @desc    Create a new time slot
// @access  Private (admin only)
router.post(
  '/',
  [
    auth,
    check('day_of_week', 'Day of week is required (0-6)').isInt({ min: 0, max: 6 }),
    check('start_time', 'Start time is required (HH:MM:SS)').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/),
    check('end_time', 'End time is required (HH:MM:SS)').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/),
    check('max_appointments', 'Max appointments must be a positive number').isInt({ min: 1 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Only admins can create time slots
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const { day_of_week, start_time, end_time, max_appointments, is_available } = req.body;

    // Check if the day is a weekend (0 = Sunday, 6 = Saturday)
    if (day_of_week === 0 || day_of_week === 6) {
      return res.status(400).json({ msg: 'Cannot create time slots on weekends (Saturday or Sunday)' });
    }

    // Check if the time slot starts after 5 PM (17:00:00)
    if (start_time >= '17:00:00') {
      return res.status(400).json({ msg: 'Cannot create time slots after 5 PM' });
    }

    try {
      // Check if the time slot overlaps with existing time slots
      const [existingSlots] = await pool.query(
        `SELECT * FROM time_slots
         WHERE day_of_week = ?
         AND ((start_time <= ? AND end_time > ?) OR (start_time < ? AND end_time >= ?) OR (start_time >= ? AND end_time <= ?))`,
        [day_of_week, start_time, start_time, end_time, end_time, start_time, end_time]
      );

      if (existingSlots.length > 0) {
        return res.status(400).json({ msg: 'Time slot overlaps with existing time slots' });
      }

      // Create time slot
      const [result] = await pool.query(
        'INSERT INTO time_slots (day_of_week, start_time, end_time, max_appointments, is_available) VALUES (?, ?, ?, ?, ?)',
        [day_of_week, start_time, end_time, max_appointments, is_available !== undefined ? is_available : true]
      );

      res.status(201).json({
        id: result.insertId,
        day_of_week,
        start_time,
        end_time,
        max_appointments,
        is_available: is_available !== undefined ? is_available : true
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  }
);

// @route   PUT api/time-slots/:id
// @desc    Update a time slot
// @access  Private (admin only)
router.put(
  '/:id',
  [
    auth,
    check('day_of_week', 'Day of week is required (0-6)').optional().isInt({ min: 0, max: 6 }),
    check('start_time', 'Start time is required (HH:MM:SS)').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/),
    check('end_time', 'End time is required (HH:MM:SS)').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/),
    check('max_appointments', 'Max appointments must be a positive number').optional().isInt({ min: 1 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Only admins can update time slots
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const { day_of_week, start_time, end_time, max_appointments, is_available } = req.body;

    // Check if the day is being updated to a weekend (0 = Sunday, 6 = Saturday)
    if (day_of_week !== undefined && (day_of_week === 0 || day_of_week === 6)) {
      return res.status(400).json({ msg: 'Cannot create time slots on weekends (Saturday or Sunday)' });
    }

    // Check if the time slot is being updated to start after 5 PM (17:00:00)
    if (start_time !== undefined && start_time >= '17:00:00') {
      return res.status(400).json({ msg: 'Cannot create time slots after 5 PM' });
    }

    try {
      // Check if the time slot exists
      const [timeSlots] = await pool.query(
        'SELECT * FROM time_slots WHERE id = ?',
        [req.params.id]
      );

      if (timeSlots.length === 0) {
        return res.status(404).json({ msg: 'Time slot not found' });
      }

      const currentSlot = timeSlots[0];
      const updatedDayOfWeek = day_of_week !== undefined ? day_of_week : currentSlot.day_of_week;
      const updatedStartTime = start_time !== undefined ? start_time : currentSlot.start_time;
      const updatedEndTime = end_time !== undefined ? end_time : currentSlot.end_time;

      // Check if the updated time slot overlaps with existing time slots
      if (day_of_week !== undefined || start_time !== undefined || end_time !== undefined) {
        const [existingSlots] = await pool.query(
          `SELECT * FROM time_slots
           WHERE id != ? AND day_of_week = ?
           AND ((start_time <= ? AND end_time > ?) OR (start_time < ? AND end_time >= ?) OR (start_time >= ? AND end_time <= ?))`,
          [req.params.id, updatedDayOfWeek, updatedStartTime, updatedStartTime, updatedEndTime, updatedEndTime, updatedStartTime, updatedEndTime]
        );

        if (existingSlots.length > 0) {
          return res.status(400).json({ msg: 'Time slot overlaps with existing time slots' });
        }
      }

      // Update time slot
      const updateFields = [];
      const updateValues = [];

      if (day_of_week !== undefined) {
        updateFields.push('day_of_week = ?');
        updateValues.push(day_of_week);
      }

      if (start_time !== undefined) {
        updateFields.push('start_time = ?');
        updateValues.push(start_time);
      }

      if (end_time !== undefined) {
        updateFields.push('end_time = ?');
        updateValues.push(end_time);
      }

      if (max_appointments !== undefined) {
        updateFields.push('max_appointments = ?');
        updateValues.push(max_appointments);
      }

      if (is_available !== undefined) {
        updateFields.push('is_available = ?');
        updateValues.push(is_available);
      }

      if (updateFields.length === 0) {
        return res.status(400).json({ msg: 'No fields to update' });
      }

      await pool.query(
        `UPDATE time_slots SET ${updateFields.join(', ')} WHERE id = ?`,
        [...updateValues, req.params.id]
      );

      res.json({ msg: 'Time slot updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  }
);

// @route   DELETE api/time-slots/:id
// @desc    Delete a time slot
// @access  Private (admin only)
router.delete('/:id', auth, async (req, res) => {
  // Only admins can delete time slots
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Not authorized' });
  }

  try {
    // Check if there are any appointments using this time slot
    const [appointments] = await pool.query(
      'SELECT COUNT(*) as count FROM appointments WHERE time_slot_id = ?',
      [req.params.id]
    );

    if (appointments[0].count > 0) {
      return res.status(400).json({ msg: 'Cannot delete time slot with existing appointments' });
    }

    // Delete time slot
    const [result] = await pool.query(
      'DELETE FROM time_slots WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ msg: 'Time slot not found' });
    }

    res.json({ msg: 'Time slot deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
