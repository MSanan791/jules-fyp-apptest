// [timestamp]-add-is-correct-to-recordings.js

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add the new is_correct column to the recordings table
    await queryInterface.addColumn('Recordings', 'is_correct', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false, // Defaulting to false is safer
    });
  },

  async down (queryInterface, Sequelize) {
    // Remove the is_correct column if rolling back
    await queryInterface.removeColumn('Recordings', 'is_correct');
  }
};