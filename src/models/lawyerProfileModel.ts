import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../utils/connectToDb';
import Lawyer from './lawyerModel';

class LawyerProfile extends Model {
  public lawyer_id!: number;
  public linkedin_url!: string | null;
  public description!: string | null;
  public star_rating!: number;
  public rating_num!: number;
}

LawyerProfile.init(
  {
    lawyer_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: Lawyer,
        key: 'lawyer_id',
      },
      onDelete: 'CASCADE',
    },
    linkedin_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    star_rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0,
    },
    rating_num: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    timestamps: false,
    modelName: 'LawyerProfile', // Model name should match your table name
  }
);

export default LawyerProfile;
