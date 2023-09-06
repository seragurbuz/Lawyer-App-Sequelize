import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../utils/connectToDb';
import Lawyer from './lawyerModel'; 

class Job extends Model {
  public job_id!: number;
  public description!: string;
  public start_date!: Date | null;
  public end_date!: Date;
  public job_state!: string;
  public creator_lawyer_id!: number;
  public lawyer_id!: number;
  public created_at!: Date;
}

Job.init(
  {
    job_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    job_state: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'not_started',
      validate: {
        isIn: [['not_started', 'started', 'ended']],
      },
    },
    creator_lawyer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Lawyer,
        key: 'lawyer_id',
      },
      onDelete: 'CASCADE',
    },
    lawyer_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Lawyer,
        key: 'lawyer_id',
      },
      onDelete: 'CASCADE',
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    timestamps: false,
    modelName: 'Job', // Model name should match your table name
  }
);

export default Job;
