const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register
exports.registerUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ username, email, password: hashedPassword, role });
    await user.save();

    res.status(201).json({ message: 'Registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    res.json({ token, role: user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
