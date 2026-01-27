// server.js
require('dotenv').config(); // Load environment variables
const express = require('express');
const cors = require('cors');
const db = require('./models'); // Imports all models and the connection setup

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for frontend
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing form data

// API Routes
const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const sessionRoutes = require('./routes/sessions');

app.get('/', (req, res) => {
  res.send('SSD Backend Service is running!');
});

// API endpoints
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/sessions', sessionRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Sync database and start server
db.sequelize.sync()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
      console.log(`Database connected and synchronized`);
      console.log(`API available at http://localhost:${PORT}/api`);
    });
  })
  .catch(err => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });