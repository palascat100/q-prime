'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TA extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
	  TA.hasOne(models.Users, {foreignKey: 'id'});
	  TA.belongsTo(models.Questions, {foreignKey: 'ta_id'});
    }
  }
  TA.init({
    ta_id:{
		type: DataTypes.INTEGER,
		primaryKey: true,
		references:{
			model: Users,
			key: 'id'
		}
	},
    is_admin: DataTypes.INTEGER,
    zoom_url: DataTypes.STRING,
    num_helped: DataTypes.BIGINT,
    time_helped: DataTypes.BIGINT
  }, {
    sequelize,
    modelName: 'ta',
  });
  return TA;
};