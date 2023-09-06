import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../utils/connectToDb';
import Lawyer from './lawyerModel'; // Import the Lawyer model
import Job from './jobModel'; // Import the Job model

class RejectedOffer extends Model {
  public rejected_offer_id!: number;
  public from_lawyer_id!: number;
  public to_lawyer_id!: number;
  public job_id!: number;
  public rejected_at!: Date;
}

RejectedOffer.init(
  {
    rejected_offer_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
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
    job_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Job,
        key: 'job_id',
      },
      onDelete: 'CASCADE',
    },
    rejected_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    timestamps: false,
    modelName: 'RejectedOffer', // Model name should match your table name
  }
);

export default RejectedOffer;
