'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Recordings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      session_id: {
        type: Sequelize.INTEGER
      },
      word_target: {
        type: Sequelize.STRING
      },
      audio_s3_key: {
        type: Sequelize.TEXT
      },
      phonemic_target: {
        type: Sequelize.STRING
      },
      phonetic_transcription: {
        type: Sequelize.STRING
      },
      error_type: {
        type: Sequelize.STRING
      },
      sound_target: {
        type: Sequelize.STRING
      },
      other_errors: {
        type: Sequelize.TEXT
      },
      is_skipped: {
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Recordings');
  }
};