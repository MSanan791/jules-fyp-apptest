// controllers/patientController.js
const { Patient, Session } = require('../models');

// Get all patients for the logged-in therapist
const getPatients = async (req, res) => {
  try {
    const therapistId = req.user.id;
    
    const patients = await Patient.findAll({
      where: { therapist_id: therapistId },
      order: [['createdAt', 'DESC']]
    });

    res.json(patients);
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ message: 'Failed to fetch patients', error: error.message });
  }
};

// Get a single patient by ID
const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const therapistId = req.user.id;

    const patient = await Patient.findOne({
      where: { 
        id,
        therapist_id: therapistId 
      }
    });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json(patient);
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({ message: 'Failed to fetch patient', error: error.message });
  }
};

// Create a new patient
const createPatient = async (req, res) => {
  try {
    const therapistId = req.user.id;
    const { name, age, gender, primary_language, initial_ssd_type, initial_notes } = req.body;

    if (!name || !age || !gender) {
      return res.status(400).json({ message: 'Name, age, and gender are required' });
    }

    const patient = await Patient.create({
      therapist_id: therapistId,
      name,
      age,
      gender,
      primary_language: primary_language || 'English',
      initial_ssd_type: initial_ssd_type || null,
      initial_notes: initial_notes || null
    });

    res.status(201).json({
      message: 'Patient created successfully',
      patient
    });
  } catch (error) {
    console.error('Create patient error:', error);
    res.status(500).json({ message: 'Failed to create patient', error: error.message });
  }
};

// Get sessions for a patient
const getPatientSessions = async (req, res) => {
  try {
    const { id } = req.params;
    const therapistId = req.user.id;

    // Verify patient belongs to therapist
    const patient = await Patient.findOne({
      where: { 
        id,
        therapist_id: therapistId 
      }
    });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const sessions = await Session.findAll({
      where: { patient_id: id },
      order: [['createdAt', 'DESC']]
    });

    res.json(sessions);
  } catch (error) {
    console.error('Get patient sessions error:', error);
    res.status(500).json({ message: 'Failed to fetch sessions', error: error.message });
  }
};

// Delete a patient
const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const therapistId = req.user.id;

    // Verify patient belongs to therapist
    const patient = await Patient.findOne({
      where: { 
        id,
        therapist_id: therapistId 
      }
    });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Delete associated sessions first (if any)
    await Session.destroy({
      where: { patient_id: id }
    });

    // Delete the patient
    await patient.destroy();

    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Delete patient error:', error);
    res.status(500).json({ message: 'Failed to delete patient', error: error.message });
  }
};

// Update a patient
const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const therapistId = req.user.id;
    const { name, age, gender, primary_language, initial_ssd_type, initial_notes } = req.body;

    // Verify patient belongs to therapist
    const patient = await Patient.findOne({
      where: { 
        id,
        therapist_id: therapistId 
      }
    });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Update the patient
    await patient.update({
      name: name || patient.name,
      age: age || patient.age,
      gender: gender || patient.gender,
      primary_language: primary_language || patient.primary_language,
      initial_ssd_type: initial_ssd_type !== undefined ? initial_ssd_type : patient.initial_ssd_type,
      initial_notes: initial_notes !== undefined ? initial_notes : patient.initial_notes
    });

    res.json({
      message: 'Patient updated successfully',
      patient
    });
  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({ message: 'Failed to update patient', error: error.message });
  }
};

module.exports = {
  getPatients,
  getPatientById,
  createPatient,
  getPatientSessions,
  deletePatient,
  updatePatient
};
