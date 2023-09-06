import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../utils/connectToDb';
import Lawyer from './lawyerModel'; 
import Job from './jobModel';

class Offer extends Model {
  public offer_id!: number;
  public from_lawyer_id!: number;
  public to_lawyer_id!: number;
  public job_id!: number;
  public state!: string;
}

Offer.init(
  {
    offer_id: {
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
    state: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'waiting',
      validate: {
        isIn: [['accepted', 'waiting', 'rejected']],
      },
    },
  },
  {
    sequelize,
    timestamps: false,
    modelName: 'Offer', // Model name should match your table name
  }
);

Offer.belongsTo(Job, { foreignKey: 'job_id' });

export default Offer;
