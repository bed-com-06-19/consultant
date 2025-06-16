const express = require('express');
const { db, admin } = require('../firebase');
const { auth, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Utility to get day name
const getDayName = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });

// 1. Get All Users (excluding passwords)
router.get('/users', auth, adminOnly, async (req, res) => {
  try {
    const usersSnapshot = await db.collection('users').get();
    const users = usersSnapshot.docs.map(doc => {
      const user = doc.data();
      delete user.password;
      return { id: doc.id, ...user };
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Create a New User/Admin
router.post('/users', auth, adminOnly, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await db.collection('users').where('email', '==', email).get();
    if (!existing.empty) return res.status(400).json({ error: 'User already exists' });

    const hashed = await require('bcryptjs').hash(password, 10);
    await db.collection('users').add({ name, email, password: hashed, role, loginHistory: [] });
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Update a User
router.put('/users/:id', auth, adminOnly, async (req, res) => {
  try {
    const { name, email, role } = req.body;
    await db.collection('users').doc(req.params.id).update({ name, email, role });
    res.json({ message: 'User updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Delete a User
router.delete('/users/:id', auth, adminOnly, async (req, res) => {
  try {
    await db.collection('users').doc(req.params.id).delete();
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Get All Appointments with user info
router.get('/appointments', auth, adminOnly, async (req, res) => {
  try {
    const appointmentsSnapshot = await db.collection('appointments').get();
    const appointments = await Promise.all(
      appointmentsSnapshot.docs.map(async doc => {
        const data = doc.data();
        let userInfo = {};
        if (data.userId) {
          const userDoc = await db.collection('users').doc(data.userId).get();
          if (userDoc.exists) {
            const u = userDoc.data();
            userInfo = { name: u.name, email: u.email };
          }
        }
        return { id: doc.id, ...data, user: userInfo };
      })
    );
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Approve or Reject Appointment
router.put('/appointments/:id', auth, adminOnly, async (req, res) => {
  try {
    const { status, reason } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const docRef = db.collection('appointments').doc(req.params.id);
    const appointmentDoc = await docRef.get();
    if (!appointmentDoc.exists) return res.status(404).json({ error: 'Appointment not found' });

    await docRef.update({ status, reason: reason || '' });
    res.json({ message: `Appointment ${status}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Get Login Logs for All Users (last 10)
router.get('/login-logs', auth, adminOnly, async (req, res) => {
  try {
    const snapshot = await db.collection('users').get();
    const logs = [];

    snapshot.forEach(doc => {
      const { name, loginHistory = [] } = doc.data();
      loginHistory.forEach(log =>
        logs.push({ username: name, timestamp: log.timestamp })
      );
    });

    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json(logs.slice(0, 10));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Get Login History for One User
router.get('/login-logs/:userId', auth, adminOnly, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.params.userId).get();
    if (!userDoc.exists) return res.status(404).json({ message: 'User not found' });

    const { loginHistory = [] } = userDoc.data();
    res.json(loginHistory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Admin Dashboard Summary
router.get('/dashboard', auth, adminOnly, async (req, res) => {
  try {
    const usersSnap = await db.collection('users').get();
    const appointmentsSnap = await db.collection('appointments').get();

    let chartData = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0 };

    appointmentsSnap.forEach(doc => {
      const { date } = doc.data();
      const day = getDayName(date);
      if (chartData[day] !== undefined) chartData[day]++;
    });

    res.json({
      totalUsers: usersSnap.size,
      totalAppointments: appointmentsSnap.size,
      totalMessages: 0, // You can implement messages if needed
      totalReports: 12, // Hardcoded
      chartData
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
