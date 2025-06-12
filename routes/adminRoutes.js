const express = require('express');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Message = require('../models/messages'); // Optional: create this model if needed
const { auth, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// 1. 🧑‍💼 Get All Users
router.get('/users', auth, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. 🆕 Create a User or Admin
router.post('/users', auth, adminOnly, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ error: 'User already exists' });

    const newUser = new User({ name, email, password, role });
    await newUser.save();
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. ✏️ Update a User or Admin
router.put('/users/:id', auth, adminOnly, async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    await user.save();

    res.json({ message: 'User updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. ❌ Delete a User
router.delete('/users/:id', auth, adminOnly, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. 📅 Get All Appointments (with User Info)
router.get('/appointments', auth, adminOnly, async (req, res) => {
  try {
    const appointments = await Appointment.find().populate('userId', 'name email');
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. ✅ Approve or ❌ Reject an Appointment
router.put('/appointments/:id', auth, adminOnly, async (req, res) => {
  try {
    const { status, reason } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    appointment.status = status;
    appointment.reason = reason || '';
    await appointment.save();

    res.json({ message: `Appointment ${status}`, appointment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. 📊 Admin Dashboard Summary (users, appointments, messages, reports, graph)
router.get('/dashboard', auth, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAppointments = await Appointment.countDocuments();
    const totalMessages = await Message?.countDocuments?.() || 0;
    const totalReports = 12; // Replace with real logic if needed

    const appointments = await Appointment.find();
    const chartData = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0 };

    appointments.forEach(a => {
      const day = new Date(a.date).toLocaleDateString('en-US', { weekday: 'short' });
      if (chartData[day] !== undefined) chartData[day]++;
    });

    res.json({
      totalUsers,
      totalAppointments,
      totalMessages,
      totalReports,
      chartData
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
