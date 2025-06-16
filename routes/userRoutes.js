const express = require('express');
const bcrypt = require('bcryptjs');
const { db, admin } = require('../firebase');
const { auth } = require('../middleware/authMiddleware');

const router = express.Router();

// POST: Create new user (register)
router.post('/users', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    // Check if user with email exists
    const snapshot = await db.collection('users').where('email', '==', email).get();
    if (!snapshot.empty) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Add user to Firestore
    const userDoc = await db.collection('users').add({
      name,
      email,
      password: hashedPassword,
      role: role || 'client', // default role if not provided
      loginHistory: []
    });

    res.status(201).json({ id: userDoc.id, name, email, role: role || 'client' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT: Update logged-in user profile
router.put('/update', auth, async (req, res) => {
  const { name, email, password } = req.body;
  const userId = req.user.userId;

  if (!name && !email && !password) {
    return res.status(400).json({ message: 'At least one field (name, email, or password) must be provided for update.' });
  }

  try {
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await db.collection('users').doc(userId).update(updateData);

    // Fetch updated user data to return
    const updatedUserDoc = await db.collection('users').doc(userId).get();
    if (!updatedUserDoc.exists) {
      return res.status(404).json({ message: 'User not found after update.' });
    }
    const updatedUser = updatedUserDoc.data();

    res.json({ name: updatedUser.name, email: updatedUser.email });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user.', error: err.message });
  }
});

module.exports = router;
