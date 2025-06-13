const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST: Create new user
router.post('/users', async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/update', authenticateToken, async (req, res) => {
  const { name, email, password } = req.body;
  const userId = req.user.id; // from token

  const updateData = { name, email };
  if (password) {
    updateData.password = await bcrypt.hash(password, 10);
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
    res.json({ name: updatedUser.name, email: updatedUser.email });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user.' });
  }
});

module.exports = router;
