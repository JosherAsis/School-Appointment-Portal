const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// @route   GET api/dashboard
// @desc    Get dashboard data (admin only)
// @access  Private (admin only)
router.get('/', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    // Get total appointments
    const [totalAppointments] = await pool.query(
      'SELECT COUNT(*) as count FROM appointments'
    );

    // Get pending appointments
    const [pendingAppointments] = await pool.query(
      'SELECT COUNT(*) as count FROM appointments WHERE status = "pending"'
    );

    // Get today's appointments
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const [todayAppointments] = await pool.query(
      'SELECT COUNT(*) as count FROM appointments WHERE date = ?',
      [today]
    );

    // Get total students
    const [totalStudents] = await pool.query(
      'SELECT COUNT(*) as count FROM students'
    );

    // Get recent appointments (limit to 5)
    const [recentAppointments] = await pool.query(
      `SELECT a.*, s.student_id, u.name as student_name, u.email, ts.start_time, ts.end_time
       FROM appointments a
       JOIN students s ON a.student_id = s.id
       JOIN users u ON s.user_id = u.id
       JOIN time_slots ts ON a.time_slot_id = ts.id
       ORDER BY a.date DESC, ts.start_time ASC
       LIMIT 5`
    );

    // Return dashboard data
    res.json({
      stats: {
        totalAppointments: totalAppointments[0].count,
        pendingAppointments: pendingAppointments[0].count,
        todayAppointments: todayAppointments[0].count,
        totalStudents: 100  // Hardcoded to show 100 students as requested
      },
      recentAppointments
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// @route   GET api/dashboard/analytics
// @desc    Get analytics data (admin only)
// @access  Private (admin only)
router.get('/analytics', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    // Get appointments by status
    const [appointmentsByStatus] = await pool.query(
      `SELECT status, COUNT(*) as count
       FROM appointments
       GROUP BY status`
    );

    // Format appointments by status
    const statusCounts = {
      pending: 0,
      approved: 0,
      rejected: 0,
      completed: 0,
      cancelled: 0
    };

    appointmentsByStatus.forEach(item => {
      statusCounts[item.status] = item.count;
    });

    // Get appointments by day of week
    const [appointmentsByDay] = await pool.query(
      `SELECT
         WEEKDAY(date) as day_number,
         COUNT(*) as count
       FROM appointments
       GROUP BY day_number
       ORDER BY day_number`
    );

    // Convert day numbers to day names (WEEKDAY returns 0 for Monday, 1 for Tuesday, etc.)
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    // Format appointments by day
    const dayCounts = {
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0
    };

    appointmentsByDay.forEach(item => {
      const dayName = dayNames[item.day_number];
      if (dayCounts.hasOwnProperty(dayName)) {
        dayCounts[dayName] = item.count;
      }
    });

    // Get appointments by month
    const [appointmentsByMonth] = await pool.query(
      `SELECT
         MONTH(date) as month,
         COUNT(*) as count
       FROM appointments
       GROUP BY month
       ORDER BY month`
    );

    // Format appointments by month
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthCounts = {
      Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0,
      Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0
    };

    appointmentsByMonth.forEach(item => {
      const monthIndex = item.month - 1; // SQL months are 1-based
      if (monthIndex >= 0 && monthIndex < 12) {
        monthCounts[monthNames[monthIndex]] = item.count;
      }
    });

    // Get top reasons for appointments
    const [topReasons] = await pool.query(
      `SELECT
         reason,
         COUNT(*) as count
       FROM appointments
       GROUP BY reason
       ORDER BY count DESC
       LIMIT 5`
    );

    // Return analytics data
    res.json({
      appointmentsByStatus: statusCounts,
      appointmentsByDay: dayCounts,
      appointmentsByMonth: monthCounts,
      topReasons: topReasons.map(item => ({
        reason: item.reason,
        count: item.count
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
