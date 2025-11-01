import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import Animal from './Animal';
import AnimalTag from './AnimalTag';

export interface AnimalTagAssignmentAttributes {
  id: number;
  animalId: number;
  tagId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AnimalTagAssignmentCreationAttributes extends Optional<AnimalTagAssignmentAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class AnimalTagAssignment extends Model<AnimalTagAssignmentAttributes, AnimalTagAssignmentCreationAttributes> 
  implements AnimalTagAssignmentAttributes {
  public id!: number;
  public animalId!: number;
  public tagId!: number;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // associations
  public readonly animal?: Animal;
  public readonly tag?: AnimalTag;
}

AnimalTagAssignment.init(
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
    tagId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: AnimalTag,
        key: 'id',
      },
      field: 'tag_id',
    },
  },
  {
    sequelize,
    modelName: 'AnimalTagAssignment',
    tableName: 'animal_tag_assignments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['animal_id', 'tag_id']
      },
      {
        fields: ['animal_id']
      },
      {
        fields: ['tag_id']
      }
    ]
  }
);

export default AnimalTagAssignment;