const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const pool = require('../db');
const auth = require('../middleware/auth');
const crypto = require('crypto');
const emailService = require('../utils/emailService');

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    check('student_id', 'Student ID is required').not().isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, student_id, department, year_level } = req.body;

    try {
      // Check if user exists
      const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
      if (existingUsers.length > 0) {
        return res.status(400).json({ msg: 'User already exists' });
      }

      // Check if student_id exists
      const [existingStudents] = await pool.query('SELECT * FROM students WHERE student_id = ?', [student_id]);
      if (existingStudents.length > 0) {
        return res.status(400).json({ msg: 'Student ID already registered' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const [userResult] = await pool.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, 'student']
      );

      // Create student profile
      await pool.query(
        'INSERT INTO students (user_id, student_id, department, year_level) VALUES (?, ?, ?, ?)',
        [userResult.insertId, student_id, department || null, year_level || null]
      );

      // Create JWT
      const payload = {
        user: {
          id: userResult.insertId,
          role: 'student'
        }
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '1d' },
        (err, token) => {
          if (err) throw err;
          // Return user data along with token (similar to login route)
          const userData = {
            id: userResult.insertId,
            name: name,
            email: email,
            role: 'student'
          };
          res.json({ token, user: userData });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Check if user exists
      const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
      if (users.length === 0) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }

      const user = users[0];

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }

      // Create JWT
      const payload = {
        user: {
          id: user.id,
          role: user.role
        }
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '1d' },
        (err, token) => {
          if (err) throw err;
          // Return user data along with token (excluding password)
          const userData = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          };
          res.json({ token, user: userData });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   GET api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, name, email, role FROM users WHERE id = ?', [req.user.id]);

    if (users.length === 0) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const user = users[0];

    if (user.role === 'student') {
      const [students] = await pool.query('SELECT * FROM students WHERE user_id = ?', [user.id]);
      if (students.length > 0) {
        user.student = students[0];
      }
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/auth/update-profile
// @desc    Update user profile (name, email, student_id)
// @access  Private
router.put(
  '/update-profile',
  [
    auth,
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('student_id', 'Student ID is required').not().isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, student_id } = req.body;

    try {
      // Check if email is already in use by another user
      const [existingUsers] = await pool.query(
        'SELECT * FROM users WHERE email = ? AND id != ?',
        [email, req.user.id]
      );

      if (existingUsers.length > 0) {
        return res.status(400).json({ msg: 'Email is already in use' });
      }

      // Check if student_id is already in use by another student
      const [existingStudents] = await pool.query(
        'SELECT s.* FROM students s JOIN users u ON s.user_id = u.id WHERE s.student_id = ? AND u.id != ?',
        [student_id, req.user.id]
      );

      if (existingStudents.length > 0) {
        return res.status(400).json({ msg: 'Student ID is already in use' });
      }

      // Start a transaction
      await pool.query('START TRANSACTION');

      // Update user name and email
      await pool.query(
        'UPDATE users SET name = ?, email = ? WHERE id = ?',
        [name, email, req.user.id]
      );

      // Update student_id if user is a student
      if (req.user.role === 'student') {
        await pool.query(
          'UPDATE students SET student_id = ? WHERE user_id = ?',
          [student_id, req.user.id]
        );
      }

      // Commit the transaction
      await pool.query('COMMIT');

      res.json({ msg: 'Profile updated successfully' });
    } catch (error) {
      // Rollback in case of error
      await pool.query('ROLLBACK');
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  }
);

// @route   POST api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post(
  '/forgot-password',
  [
    check('email', 'Please include a valid email').isEmail()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    try {
      // Check if user exists
      const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

      if (users.length === 0) {
        return res.status(404).json({ msg: 'User not found' });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(20).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

      // Save reset token to database
      await pool.query(
        'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?',
        [resetToken, resetTokenExpiry, email]
      );

      // Send reset email
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

      await emailService.sendPasswordResetEmail(email, resetUrl);

      res.json({ msg: 'Password reset email sent', resetToken });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   GET api/auth/reset-password/:token
// @desc    Verify reset token
// @access  Public
router.get('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // Find user with this token and check if it's expired
    const [users] = await pool.query(
      'SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > ?',
      [token, new Date()]
    );

    if (users.length === 0) {
      return res.status(400).json({ msg: 'Invalid or expired reset token' });
    }

    res.json({ msg: 'Token is valid' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/reset-password/:token
// @desc    Reset password
// @access  Public
router.post(
  '/reset-password/:token',
  [
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { token } = req.params;
      const { password } = req.body;

      // Find user with this token and check if it's expired
      const [users] = await pool.query(
        'SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > ?',
        [token, new Date()]
      );

      if (users.length === 0) {
        return res.status(400).json({ msg: 'Invalid or expired reset token' });
      }

      const user = users[0];

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Update password and clear reset token
      await pool.query(
        'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
        [hashedPassword, user.id]
      );

      res.json({ msg: 'Password has been reset successfully' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;