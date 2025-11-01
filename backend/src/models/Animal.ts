import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import AnimalSpecies from './AnimalSpecies';
import { User } from './User';

export interface AnimalAttributes {
  id: number;
  name: string;
  speciesId: number;
  ownerId: number;
  birthDate?: Date;
  gender?: string;
  description?: string;
  seoUrl?: string;
  isActive: boolean;
  createdBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AnimalCreationAttributes extends Optional<AnimalAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Animal extends Model<AnimalAttributes, AnimalCreationAttributes> 
  implements AnimalAttributes {
  public id!: number;
  public name!: string;
  public speciesId!: number;
  public ownerId!: number;
  public birthDate?: Date;
  public gender?: string;
  public description?: string;
  public seoUrl?: string;
  public isActive!: boolean;
  public createdBy?: number;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // associations
  public readonly species?: AnimalSpecies;
  public readonly owner?: User;
  public readonly creator?: User;
}

Animal.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    speciesId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: AnimalSpecies,
        key: 'id',
      },
      field: 'species_id',
    },
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
      field: 'owner_id',
    },
    birthDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'birth_date',
    },
    gender: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    seoUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
      field: 'seo_url',
      validate: {
        notEmpty: true,
        isSlug: function(value: string) {
          if (value && !/^[a-z0-9-]+$/.test(value)) {
            throw new Error('SEO URL must contain only lowercase letters, numbers, and hyphens');
          }
        },
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: User,
        key: 'id',
      },
      field: 'created_by',
    },
  },
  {
    sequelize,
    modelName: 'Animal',
    tableName: 'animals',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Animal;