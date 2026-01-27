// routes/patients.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getPatients,
  getPatientById,
  createPatient,
  getPatientSessions,
  deletePatient,
  updatePatient
} = require('../controllers/patientController');

// All routes require authentication
router.use(authenticateToken);

// GET /api/patients
router.get('/', getPatients);

// POST /api/patients
router.post('/', createPatient);

// GET /api/patients/:id
router.get('/:id', getPatientById);

// PUT /api/patients/:id
router.put('/:id', updatePatient);

// DELETE /api/patients/:id
router.delete('/:id', deletePatient);

// GET /api/patients/:id/sessions
router.get('/:id/sessions', getPatientSessions);

module.exports = router;
