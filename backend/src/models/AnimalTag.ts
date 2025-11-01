import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface AnimalTagAttributes {
  id: number;
  name: string;
  description?: string;
  color?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AnimalTagCreationAttributes extends Optional<AnimalTagAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class AnimalTag extends Model<AnimalTagAttributes, AnimalTagCreationAttributes> 
  implements AnimalTagAttributes {
  public id!: number;
  public name!: string;
  public description?: string;
  public color?: string;
  public isActive!: boolean;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AnimalTag.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [1, 50],
        // Allow letters, numbers, spaces, and common symbols for hashtags
        is: /^[a-zA-Z0-9\s\u00C0-\u017F._-]+$/,
      },
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    color: {
      type: DataTypes.STRING(7),
      allowNull: true,
      defaultValue: '#1976d2', // Default Material-UI primary color
      validate: {
        is: /^#[0-9A-F]{6}$/i, // Hex color validation
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
  },
  {
    sequelize,
    modelName: 'AnimalTag',
    tableName: 'animal_tags',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['name']
      }
    ]
  }
);

export default AnimalTag;