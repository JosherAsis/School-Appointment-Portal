const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const pool = require('../db');
const auth = require('../middleware/auth');
const {
  sendAccountDeletionRequestEmail,
  sendAccountDeletionStatusEmail,
  sendAdminDeletionRequestNotification
} = require('../utils/emailService');

// @route   POST api/account-deletion/request
// @desc    Request account deletion (student only)
// @access  Private
router.post(
  '/request',
  [
    auth,
    check('reason', 'Reason is required').not().isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Only students can request account deletion
    if (req.user.role !== 'student') {
      return res.status(403).json({ msg: 'Only students can request account deletion' });
    }

    const { reason } = req.body;

    try {
      // Check if user already has a pending deletion request
      const [existingRequests] = await pool.query(
        'SELECT * FROM deletion_requests WHERE user_id = ? AND status = "pending"',
        [req.user.id]
      );

      if (existingRequests.length > 0) {
        return res.status(400).json({ msg: 'You already have a pending deletion request' });
      }

      // Create deletion request
      const [result] = await pool.query(
        'INSERT INTO deletion_requests (user_id, reason) VALUES (?, ?)',
        [req.user.id, reason]
      );

      // Get user data for email notification
      const [users] = await pool.query(
        'SELECT u.name, u.email, s.student_id FROM users u LEFT JOIN students s ON u.id = s.user_id WHERE u.id = ?',
        [req.user.id]
      );

      if (users.length === 0) {
        return res.status(404).json({ msg: 'User not found' });
      }

      const userData = users[0];

      // Send email notification to user
      await sendAccountDeletionRequestEmail(userData.email, userData);

      // Get admin emails to notify them
      const [admins] = await pool.query(
        'SELECT email FROM users WHERE role = "admin"'
      );

      // Send notification to all admins
      for (const admin of admins) {
        await sendAdminDeletionRequestNotification(
          admin.email,
          userData,
          { reason, request_date: new Date() }
        );
      }

      res.json({
        msg: 'Account deletion request submitted successfully',
        requestId: result.insertId
      });
    } catch (error) {
      console.error('Error submitting deletion request:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

// @route   GET api/account-deletion/requests
// @desc    Get all deletion requests (admin only)
// @access  Private (admin only)
router.get('/requests', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    // Get all deletion requests with user details
    const [requests] = await pool.query(
      `SELECT dr.*, u.name, u.email, s.student_id
       FROM deletion_requests dr
       JOIN users u ON dr.user_id = u.id
       LEFT JOIN students s ON u.id = s.user_id
       ORDER BY dr.request_date DESC`
    );

    res.json(requests);
  } catch (error) {
    console.error('Error fetching deletion requests:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   GET api/account-deletion/status
// @desc    Get current user's deletion request status
// @access  Private
router.get('/status', auth, async (req, res) => {
  try {
    // Get user's deletion request
    const [requests] = await pool.query(
      'SELECT * FROM deletion_requests WHERE user_id = ? ORDER BY request_date DESC LIMIT 1',
      [req.user.id]
    );

    if (requests.length === 0) {
      return res.json({ hasRequest: false });
    }

    res.json({
      hasRequest: true,
      request: requests[0]
    });
  } catch (error) {
    console.error('Error fetching deletion request status:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT api/account-deletion/process/:id
// @desc    Process (approve/reject) a deletion request (admin only)
// @access  Private (admin only)
router.put(
  '/process/:id',
  [
    auth,
    check('status', 'Status must be either approved or rejected').isIn(['approved', 'rejected']),
    check('adminNotes', 'Admin notes are required').not().isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const { id } = req.params;
    const { status, adminNotes } = req.body;

    try {
      // Get the deletion request
      const [requests] = await pool.query(
        'SELECT * FROM deletion_requests WHERE id = ?',
        [id]
      );

      if (requests.length === 0) {
        return res.status(404).json({ msg: 'Deletion request not found' });
      }

      const request = requests[0];

      // Check if request is already processed
      if (request.status !== 'pending') {
        return res.status(400).json({ msg: 'This request has already been processed' });
      }

      // Update the request status
      await pool.query(
        'UPDATE deletion_requests SET status = ?, admin_notes = ?, processed_date = NOW(), processed_by = ? WHERE id = ?',
        [status, adminNotes, req.user.id, id]
      );

      // Get user data for email notification
      const [users] = await pool.query(
        'SELECT name, email FROM users WHERE id = ?',
        [request.user_id]
      );

      if (users.length > 0) {
        // Send email notification to user
        await sendAccountDeletionStatusEmail(users[0].email, status, adminNotes);
      }

      // If approved, delete the user account
      if (status === 'approved') {
        // Note: We don't actually delete the user here to allow for a grace period
        // The actual deletion will be handled by a separate endpoint or a scheduled job
      }

      res.json({ msg: `Deletion request ${status}` });
    } catch (error) {
      console.error('Error processing deletion request:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

// @route   DELETE api/account-deletion/execute/:userId
// @desc    Execute account deletion (admin only)
// @access  Private (admin only)
router.delete('/execute/:userId', auth, async (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Not authorized' });
  }

  const { userId } = req.params;

  try {
    // Check if there's an approved deletion request
    const [requests] = await pool.query(
      'SELECT * FROM deletion_requests WHERE user_id = ? AND status = "approved"',
      [userId]
    );

    if (requests.length === 0) {
      return res.status(400).json({ msg: 'No approved deletion request found for this user' });
    }

    // Delete the user (cascading delete will handle related records)
    await pool.query('DELETE FROM users WHERE id = ?', [userId]);

    res.json({ msg: 'User account deleted successfully' });
  } catch (error) {
    console.error('Error deleting user account:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
