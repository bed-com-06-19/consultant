const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');

// Create Appointment
router.post('/appointments', async (req, res) => {
  try {
    const { clientId, consultantId, date, time } = req.body;
    const appointment = new Appointment({ clientId, consultantId, date, time });
    await appointment.save();
    res.status(201).json({ message: 'Appointment created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// View Appointments
router.get('/appointments/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const appointments = await Appointment.find({ $or: [{ clientId: userId }, { consultantId: userId }] })
      .populate('clientId consultantId', 'name email');
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;