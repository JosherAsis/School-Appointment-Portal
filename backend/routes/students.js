const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const pool = require('../db');
const auth = require('../middleware/auth');

// @route   GET api/students
// @desc    Get all students (admin) or current student profile (student)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let query;
    let params = [];
    
    if (req.user.role === 'admin') {
      // Admins can see all students
      query = `
        SELECT s.*, u.name, u.email
        FROM students s
        JOIN users u ON s.user_id = u.id
        ORDER BY s.student_id
      `;
    } else {
      // Students can only see their own profile
      query = `
        SELECT s.*, u.name, u.email
        FROM students s
        JOIN users u ON s.user_id = u.id
        WHERE s.user_id = ?
      `;
      params = [req.user.id];
    }
    
    const [rows] = await pool.query(query, params);
    
    if (req.user.role === 'student' && rows.length === 0) {
      return res.status(404).json({ msg: 'Student profile not found' });
    }
    
    res.json(req.user.role === 'student' ? rows[0] : rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT api/students
// @desc    Update student profile
// @access  Private (student only)
router.put(
  '/',
  [
    auth,
    check('department', 'Department is required').not().isEmpty(),
    check('year_level', 'Year level must be a number').isInt()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Only students can update their profile
    if (req.user.role !== 'student') {
      return res.status(403).json({ msg: 'Only students can update their profile' });
    }

    const { department, year_level } = req.body;

    try {
      // Update student profile
      const [result] = await pool.query(
        'UPDATE students SET department = ?, year_level = ? WHERE user_id = ?',
        [department, year_level, req.user.id]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ msg: 'Student profile not found' });
      }
      
      res.json({ msg: 'Student profile updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
