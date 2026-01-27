// controllers/sessionController.js
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { Patient, Session, Recording } = require('../models');
const db = require('../models');

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// Configure multer for S3 uploads
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    acl: 'private',
    key: function (req, file, cb) {
      const patientId = req.body.patientId;
      const sessionId = req.sessionId || 'temp';
      const timestamp = Date.now();
      const index = req.fileIndex || 0;
      const extension = file.originalname.split('.').pop() || 'wav';
      cb(null, `sessions/${patientId}/${sessionId}/recording_${index}.${extension}`);
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit per file
  }
});

// Middleware to handle multiple files
const uploadMultiple = upload.array('audio_files', 52);

// Finalize session and upload recordings (Atomic Transaction)
const finalizeSession = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const therapistId = req.user.id;
    const { patientId, annotations, notes, sessionDate, finalDiagnosis } = req.body;

    if (!patientId) {
      return res.status(400).json({ error: 'Patient ID is required' });
    }

    // Verify patient belongs to therapist
    const patient = await Patient.findOne({
      where: { 
        id: patientId,
        therapist_id: therapistId 
      },
      transaction
    });

    if (!patient) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Parse annotations
    let annotationsArray = [];
    try {
      annotationsArray = typeof annotations === 'string' 
        ? JSON.parse(annotations) 
        : annotations;
    } catch (e) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Invalid annotations format' });
    }

    // Check if files match annotations count
    if (!req.files || req.files.length !== annotationsArray.length) {
      await transaction.rollback();
      return res.status(400).json({ 
        error: `File count (${req.files?.length || 0}) does not match annotations count (${annotationsArray.length})` 
      });
    }

    // Create session record
    const session = await Session.create({
      patient_id: patientId,
      session_type: 'Recording Session',
      final_session_diagnosis: finalDiagnosis || 'Pending Analysis',
      final_session_notes: notes || null,
      upload_status: 'COMPLETED'
    }, { transaction });

    // Upload files and create recording records
    const recordingPromises = req.files.map(async (file, index) => {
      const annotation = annotationsArray[index];
      
      // Create recording record with S3 key
      return Recording.create({
        session_id: session.id,
        word_target: annotation.targetWord || annotation.word || '',
        phonemic_target: annotation.targetWord || annotation.word || '',
        phonetic_transcription: annotation.transcription || '',
        error_type: annotation.errorType || 'None',
        audio_s3_key: file.key,
        is_correct: annotation.isCorrect !== undefined ? annotation.isCorrect : false,
        is_skipped: false
      }, { transaction });
    });

    await Promise.all(recordingPromises);

    // Commit transaction
    await transaction.commit();

    res.json({
      message: 'Session uploaded successfully',
      sessionId: session.id,
      recordingsSaved: req.files.length
    });

  } catch (error) {
    // Rollback transaction on any error
    await transaction.rollback();
    console.error('Session finalize error:', error);
    
    // If S3 uploads happened, we should clean them up (optional - can be done via lifecycle policy)
    res.status(500).json({ 
      error: 'Transaction failed', 
      message: error.message 
    });
  }
};

module.exports = {
  finalizeSession,
  uploadMultiple
};
