// server.js
const express = require('express');
const path = require('path');
require('dotenv').config();

// Firebase setup
const { db } = require('./firebase');

// Routes
const authRoutes = require('./routes/authRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { auth } = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Serve static files (login.html, register.html, style.css, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Root route – serves index.html (homepage/login page)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Routes
app.use('/api/auth', authRoutes);                 // Auth (login/register)
app.use('/api/appointments', appointmentRoutes); // Appointment actions
app.use('/api/admin', adminRoutes);              // Admin actions

// Protected route to test JWT and role access
app.get('/api/protected', auth, (req, res) => {
  res.json({ message: `Hello ${req.user.role}, you are authenticated.` });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
