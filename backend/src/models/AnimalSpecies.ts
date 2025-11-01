import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface AnimalSpeciesAttributes {
  id: number;
  name: string;
  scientificName?: string;
  description?: string;
  category?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AnimalSpeciesCreationAttributes extends Optional<AnimalSpeciesAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class AnimalSpecies extends Model<AnimalSpeciesAttributes, AnimalSpeciesCreationAttributes> 
  implements AnimalSpeciesAttributes {
  public id!: number;
  public name!: string;
  public scientificName?: string;
  public description?: string;
  public category?: string;
  public isActive!: boolean;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AnimalSpecies.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    scientificName: {
      type: DataTypes.STRING(150),
      allowNull: true,
      field: 'scientific_name',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: true,
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
    modelName: 'AnimalSpecies',
    tableName: 'animal_species',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default AnimalSpecies;