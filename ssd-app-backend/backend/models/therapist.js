'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Therapist extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Therapist.hasMany(models.Patient, {
    foreignKey: 'therapist_id',
    as: 'patients'
  });
    }
  }
  
  Therapist.init({
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    email: DataTypes.STRING,
    password_hash: DataTypes.STRING,
    license_number: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Therapist',
  });
  return Therapist;
};