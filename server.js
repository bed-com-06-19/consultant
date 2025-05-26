const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Connect routes
const authRoutes = require('./routes/authRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');

app.use('/api', authRoutes);
app.use('/api', appointmentRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

