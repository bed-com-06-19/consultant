const express = require('express');
const { db } = require('../firebase');
const { auth } = require('../middleware/authMiddleware');

const router = express.Router();

// Middleware to check admin role
function isAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Admins only' });
  }
  next();
}

// Create appointment (client)
router.post('/', auth, async (req, res) => {
  const { service, date, time } = req.body;

  if (!service || !date || !time) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const newAppointment = {
      userId: req.user.userId,
      service,
      date,
      time,
      status: 'pending',
      createdAt: new Date()
    };

    const docRef = await db.collection('appointments').add(newAppointment);

    res.status(201).json({ message: 'Appointment created', id: docRef.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all appointments for the logged-in client
router.get('/', auth, async (req, res) => {
  try {
    const snapshot = await db.collection('appointments')
      .where('userId', '==', req.user.userId)
      .orderBy('createdAt', 'desc')
      .get();

    const appointments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- ADMIN ROUTES ---------------- //

// Get all appointments (admin) with client info
router.get('/all', auth, isAdmin, async (req, res) => {
  try {
    const snapshot = await db.collection('appointments')
      .orderBy('createdAt', 'desc')
      .get();

    const appointments = await Promise.all(snapshot.docs.map(async doc => {
      const data = doc.data();
      let user = {};
      if (data.userId) {
        const userDoc = await db.collection('users').doc(data.userId).get();
        if (userDoc.exists) {
          const u = userDoc.data();
          user = { name: u.name, email: u.email };
        }
      }
      return { id: doc.id, ...data, user };
    }));

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update appointment status (admin)
router.patch('/:id/status', auth, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { status, reason } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Status must be approved or rejected' });
  }

  try {
    const appointmentRef = db.collection('appointments').doc(id);
    const appointmentDoc = await appointmentRef.get();

    if (!appointmentDoc.exists) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const updateData = { status };
    if (status === 'rejected') {
      updateData.reason = reason || 'No reason provided';
    } else {
      updateData.reason = admin.firestore.FieldValue.delete(); // Clear reason
    }

    await appointmentRef.update(updateData);

    res.json({ message: `Appointment ${status}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
