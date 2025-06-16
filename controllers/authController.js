const { db, admin } = require('../firebase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user exists
    const existingSnapshot = await db.collection('users').where('email', '==', email).get();
    if (!existingSnapshot.empty) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Add user
    const userRef = await db.collection('users').add({
      name,
      email,
      password: hashedPassword,
      role,
      loginHistory: []
    });

    res.status(201).json({ message: 'Registered successfully', id: userRef.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Get user from Firestore
    const snapshot = await db.collection('users').where('email', '==', email).get();
    if (snapshot.empty) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userDoc = snapshot.docs[0];
    const user = userDoc.data();
    const userId = userDoc.id;

    // Compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Push new login timestamp
    await db.collection('users').doc(userId).update({
      loginHistory: admin.firestore.FieldValue.arrayUnion({
        timestamp: new Date()
      })
    });

    const token = jwt.sign(
      { userId, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
