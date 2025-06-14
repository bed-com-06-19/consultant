const mongoose = require('mongoose');

// Schema for both Clients, Consultants, and Admins
const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    unique: true, 
    required: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  role: {
    type: String,
    enum: ['client', 'consultant', 'admin'],
    default: 'client',
  },
  specialization: String,           // Only used if role is 'consultant'
  availability: [String],           // Array of time slots (consultants)
  
  // ✅ Login History for tracking user logins (for admin logs)
  loginHistory: [
    {
      timestamp: {
        type: Date,
        default: Date.now,
      }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
