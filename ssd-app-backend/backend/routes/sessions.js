// routes/sessions.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { finalizeSession, uploadMultiple } = require('../controllers/sessionController');

// All routes require authentication
router.use(authenticateToken);

// POST /api/sessions/finalize
// This route handles multipart/form-data with file uploads
router.post('/finalize', (req, res, next) => {
  uploadMultiple(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: 'File upload error', message: err.message });
    }
    next();
  });
}, finalizeSession);

module.exports = router;
