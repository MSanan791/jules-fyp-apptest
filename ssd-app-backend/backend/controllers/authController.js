// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Therapist } = require('../models');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find therapist by email
    const therapist = await Therapist.findOne({ where: { email } });

    if (!therapist) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, therapist.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: therapist.id, 
        email: therapist.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return token and user info (without password)
    res.json({
      token,
      user: {
        id: therapist.id,
        name: `${therapist.first_name} ${therapist.last_name}`,
        email: therapist.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, licenseNumber } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'First name, last name, email, and password are required' });
    }

    // Check if email already exists
    const existing = await Therapist.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create therapist
    const therapist = await Therapist.create({
      first_name: firstName,
      last_name: lastName,
      email,
      password_hash: passwordHash,
      license_number: licenseNumber || null,
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        id: therapist.id,
        email: therapist.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(201).json({
      token,
      user: {
        id: therapist.id,
        name: `${therapist.first_name} ${therapist.last_name}`,
        email: therapist.email,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

module.exports = { login, register };
