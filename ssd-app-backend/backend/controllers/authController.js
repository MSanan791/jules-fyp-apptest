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

module.exports = { login };
