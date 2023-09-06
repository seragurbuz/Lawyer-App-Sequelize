import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../utils/connectToDb';

class City extends Model {
  public city_id!: number;
  public city_name!: string;
}

City.init(
  {
    city_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    city_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    sequelize,
    timestamps: false,
    modelName: 'City', // Model name should match your table name
  }
);

export default City;
