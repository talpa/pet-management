import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import Animal from './Animal';

export interface AnimalPropertyAttributes {
  id: number;
  animalId: number;
  propertyName: string;
  propertyValue?: string;
  measuredAt?: Date;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AnimalPropertyCreationAttributes extends Optional<AnimalPropertyAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class AnimalProperty extends Model<AnimalPropertyAttributes, AnimalPropertyCreationAttributes> 
  implements AnimalPropertyAttributes {
  public id!: number;
  public animalId!: number;
  public propertyName!: string;
  public propertyValue?: string;
  public measuredAt?: Date;
  public notes?: string;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AnimalProperty.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    animalId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Animal,
        key: 'id',
      },
      field: 'animal_id',
    },
    propertyName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'property_name',
    },
    propertyValue: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'property_value',
    },
    measuredAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
      field: 'measured_at',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'AnimalProperty',
    tableName: 'animal_properties',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default AnimalProperty;