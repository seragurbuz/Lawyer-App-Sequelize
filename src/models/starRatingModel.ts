import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../utils/connectToDb';
import Lawyer from './lawyerModel'; // Import the Lawyer model

class StarRating extends Model {
  public rating_id!: number;
  public rating!: number;
  public from_lawyer_id!: number;
  public to_lawyer_id!: number;
}

StarRating.init(
  {
    rating_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    from_lawyer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Lawyer,
        key: 'lawyer_id',
      },
      onDelete: 'CASCADE',
    },
    to_lawyer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Lawyer,
        key: 'lawyer_id',
      },
      onDelete: 'CASCADE',
    },
  },
  {
    sequelize,
    timestamps: false,
    modelName: 'StarRating', // Model name should match your table name
  }
);

export default StarRating;
