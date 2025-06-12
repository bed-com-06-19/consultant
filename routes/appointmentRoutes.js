const express = require('express');
const { auth } = require('../middleware/authMiddleware');
const Appointment = require('../models/Appointment');
const User = require('../models/User'); // Assuming you have a User model

const router = express.Router();

// Create appointment (client)
router.post('/', auth, async (req, res) => {
  const { service, date, time } = req.body;

  if (!service || !date || !time) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const appointment = new Appointment({
      userId: req.user.userId,
      service,
      date,
      time,
      status: 'pending',
    });

    await appointment.save();
    res.status(201).json({ message: 'Appointment created', appointment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all appointments for the logged-in client
router.get('/', auth, async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------------- ADMIN ROUTES ------------------

// Middleware to check admin role
function isAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Admins only' });
  }
  next();
}

// Get all appointments (admin) with client info
router.get('/all', auth, isAdmin, async (req, res) => {
  try {
    // Populate user info (email, name)
    const appointments = await Appointment.find()
      .populate('userId', 'email name') // Adjust fields as per your User model
      .sort({ createdAt: -1 });

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update appointment status (admin)
// Accept or reject appointment with optional reason
router.patch('/:id/status', auth, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { status, reason } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Status must be approved or rejected' });
  }

  try {
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    appointment.status = status;
    if (status === 'rejected' && reason) {
      appointment.reason = reason; // Save reason for rejection
    } else {
      appointment.reason = undefined; // Clear reason if approved
    }

    await appointment.save();

    res.json({ message: `Appointment ${status}`, appointment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
