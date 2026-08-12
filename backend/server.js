require('dotenv').config({ override: true }); // Loads variables from .env, overriding any stale system env vars

const express = require('express');
const connectDB = require('./config/db');
const employeeRoutes = require('./routes/employees');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Database Connection
connectDB();

// Routes
app.get('/', (req, res) => {
  res.send('Server is running and connected to MongoDB!');
});
app.use('/api/employees', employeeRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid id format' });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({ message: `Duplicate value for ${field}` });
  }
  console.error(err);
  res.status(500).json({ message: 'Server error' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
