import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import AnimalSpecies from './AnimalSpecies';

export interface SpeciesPropertyAttributes {
  id: number;
  speciesId: number;
  propertyName: string;
  propertyType: string;
  propertyUnit?: string;
  isRequired: boolean;
  defaultValue?: string;
  validationRules?: object;
  displayOrder: number;
  createdAt?: Date;
}

interface SpeciesPropertyCreationAttributes extends Optional<SpeciesPropertyAttributes, 'id' | 'createdAt'> {}

class SpeciesProperty extends Model<SpeciesPropertyAttributes, SpeciesPropertyCreationAttributes> 
  implements SpeciesPropertyAttributes {
  public id!: number;
  public speciesId!: number;
  public propertyName!: string;
  public propertyType!: string;
  public propertyUnit?: string;
  public isRequired!: boolean;
  public defaultValue?: string;
  public validationRules?: object;
  public displayOrder!: number;

  // timestamps!
  public readonly createdAt!: Date;
}

SpeciesProperty.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
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
    propertyName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'property_name',
    },
    propertyType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'property_type',
    },
    propertyUnit: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'property_unit',
    },
    isRequired: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_required',
    },
    defaultValue: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'default_value',
    },
    validationRules: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'validation_rules',
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'display_order',
    },
  },
  {
    sequelize,
    modelName: 'SpeciesProperty',
    tableName: 'species_properties',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

export default SpeciesProperty;