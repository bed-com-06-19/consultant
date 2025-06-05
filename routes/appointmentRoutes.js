const express = require('express');
const { auth } = require('../middleware/authMiddleware');
const Appointment = require('../models/Appointment');

const router = express.Router();

// Create appointment (user)
router.post('/appointments', auth, async (req, res) => {
  try {
    const appointment = new Appointment({
      userId: req.user.userId,
      date: req.body.date,
      description: req.body.description,
    });
    await appointment.save();
    res.status(201).json({ message: 'Appointment created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get appointments for logged-in user
router.get('/appointments', auth, async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.user.userId });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
