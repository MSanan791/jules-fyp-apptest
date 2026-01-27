// scripts/create-test-therapist.js
// Helper script to create a test therapist account
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Therapist } = require('../models');

async function createTestTherapist() {
  try {
    const email = process.env.TEST_THERAPIST_EMAIL || 'therapist@example.com';
    const password = process.env.TEST_THERAPIST_PASSWORD || 'password123';
    const firstName = process.env.TEST_THERAPIST_FIRST_NAME || 'John';
    const lastName = process.env.TEST_THERAPIST_LAST_NAME || 'Doe';

    // Check if therapist already exists
    const existing = await Therapist.findOne({ where: { email } });
    if (existing) {
      console.log(`Therapist with email ${email} already exists.`);
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create therapist
    const therapist = await Therapist.create({
      first_name: firstName,
      last_name: lastName,
      email: email,
      password_hash: passwordHash,
      license_number: 'TEST-LICENSE-001'
    });

    console.log('Test therapist created successfully.');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   ID: ${therapist.id}`);
  } catch (error) {
    console.error('Error creating test therapist:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  createTestTherapist()
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = createTestTherapist;
