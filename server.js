const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// Routes
const authRoutes = require('./routes/authRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { auth } = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Serve static files from "public" folder (e.g., login.html, register.html, style.css)
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Root route – serve index.html (e.g., your login page)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Routes
app.use('/api/auth', authRoutes);           // For login and register
app.use('/api/appointments', appointmentRoutes); // For appointment-related actions
app.use('/api/admin', adminRoutes);         // For admin actions

// Protected test route
app.get('/api/protected', auth, (req, res) => {
  res.json({ message: `Hello ${req.user.role}, you are authenticated.` });
});


// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
