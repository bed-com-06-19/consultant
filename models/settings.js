const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  siteName: String,
  contactEmail: String,
  contactPhone: String,
  address: String,
  theme: { type: String, default: 'light' },
  maintenanceMode: { type: Boolean, default: false },
  enable2FA: { type: Boolean, default: false },
  sessionTimeout: { type: Number, default: 30 },
  passwordPolicy: String
}, { timestamps: true });

module.exports = mongoose.model('Settings', SettingsSchema);
