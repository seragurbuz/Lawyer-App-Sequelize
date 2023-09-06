import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../utils/connectToDb';
import City from './cityModel'; 

class Bar extends Model {
  public bar_id!: number;
  public bar_name!: string;
  public city_id!: number;
}

Bar.init(
  {
    bar_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    bar_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    city_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: City,
        key: 'city_id',
      },
      onDelete: 'CASCADE',
    },
  },
  {
    sequelize,
    timestamps: false,
    modelName: 'Bar', // Model name should match your table name
  }
);

export default Bar;
