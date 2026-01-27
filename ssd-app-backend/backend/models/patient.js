'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Patient extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Patient.belongsTo(models.Therapist, {
          foreignKey: 'therapist_id',
          as: 'therapist'
        });
        // A Patient can have many Sessions
        Patient.hasMany(models.Session, {
          foreignKey: 'patient_id',
          as: 'sessions'
        });
    }
  }
  Patient.init({
    therapist_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    age: DataTypes.INTEGER,
    gender: DataTypes.STRING,
    primary_language: DataTypes.STRING,
    initial_ssd_type: DataTypes.STRING,
    initial_notes: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Patient',
  });
  return Patient;
};