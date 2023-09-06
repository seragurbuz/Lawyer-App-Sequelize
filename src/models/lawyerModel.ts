import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../utils/connectToDb';
import Bar from './barModel';
import LawyerProfile from './lawyerProfileModel';

class Lawyer extends Model {
  public lawyer_id!: number;
  public first_name!: string;
  public last_name!: string;
  public email!: string;
  public password!: string;
  public bar_id!: number;
  public status!: string;
  public verified!: boolean;
  public verification_code?: string;
  public password_reset_code?: string;
}

Lawyer.init(
  {
    lawyer_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    bar_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Bar,
        key: 'bar_id',
      },
      onDelete: 'CASCADE',
    },
    status: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'available',
      validate: {
        isIn: [['reserved', 'available']],
      },
    },
    verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    verification_code: {
      type: DataTypes.STRING(255),
    },
    password_reset_code: {
      type: DataTypes.STRING(255),
    },
  },
  {
    sequelize,
    timestamps: false,
    modelName: 'Lawyer', // Model name should match your table name
  }
);

Lawyer.hasOne(LawyerProfile, { foreignKey: 'lawyer_id' }); 

export default Lawyer;
