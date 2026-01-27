'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Session extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Session.belongsTo(models.Patient, {
        foreignKey: 'patient_id',
        as: 'patient'
      });
      Session.hasMany(models.Recording, {
    foreignKey: 'session_id',
    as: 'recordings'
    });
    }
  }
  Session.init({
    patient_id: DataTypes.INTEGER,
    session_type: DataTypes.STRING,
    final_session_diagnosis: DataTypes.STRING,
    final_session_notes: DataTypes.TEXT,
    audio_file_url: DataTypes.TEXT,
    upload_status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Session',
  });
  return Session;
};