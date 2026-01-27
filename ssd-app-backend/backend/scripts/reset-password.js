// scripts/reset-password.js
// Helper script to reset a therapist's password
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Therapist } = require('../models');

async function resetPassword() {
  try {
    const email = process.argv[2];
    const newPassword = process.argv[3];

    if (!email || !newPassword) {
      console.log('Usage: node scripts/reset-password.js <email> <new_password>');
      console.log('Example: node scripts/reset-password.js therapist@example.com newpassword123');
      process.exit(1);
    }

    // Find therapist
    const therapist = await Therapist.findOne({ where: { email } });
    
    if (!therapist) {
      console.log(`Therapist with email ${email} not found.`);
      process.exit(1);
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await therapist.update({ password_hash: passwordHash });

    console.log('Password updated successfully.');
    console.log(`   Email: ${email}`);
    console.log(`   New Password: ${newPassword}`);
    console.log(`   ID: ${therapist.id}`);
    
  } catch (error) {
    console.error('Error resetting password:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  resetPassword()
    .then(() => {
      process.exit(0);
    })
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = resetPassword;
