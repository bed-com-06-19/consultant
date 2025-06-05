const express = require('express');
const Appointment = require('../models/Appointment');
const { auth, adminOnly } = require('../middleware/authMiddleware');
const User = require('../models/User');

const router = express.Router();

// Get all users (admin only)
router.get('/users', auth, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/appointments', auth, adminOnly, async (req, res) => {
    try {
      const appointments = await Appointment.find().populate('userId', 'name email');
      res.json(appointments);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

module.exports = router;
