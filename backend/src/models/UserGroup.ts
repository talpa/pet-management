import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface UserGroupAttributes {
  id: number;
  name: string;
  description?: string;
  color?: string;
  isActive: boolean;
  createdBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserGroupCreationAttributes extends Optional<UserGroupAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class UserGroup extends Model<UserGroupAttributes, UserGroupCreationAttributes> implements UserGroupAttributes {
  public id!: number;
  public name!: string;
  public description?: string;
  public color?: string;
  public isActive!: boolean;
  public createdBy?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserGroup.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: 'Unique group name',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Group description and purpose',
    },
    color: {
      type: DataTypes.STRING(7),
      allowNull: true,
      defaultValue: '#1976d2',
      comment: 'Hex color code for UI display',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active', // Map to snake_case column
      comment: 'Whether the group is active',
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'created_by', // Map to snake_case column
      references: {
        model: 'users',
        key: 'id',
      },
      comment: 'ID of user who created this group',
    },
  },
  {
    sequelize,
    modelName: 'UserGroup',
    tableName: 'user_groups',
    timestamps: true,
    underscored: true, // Use snake_case for all column names
    indexes: [
      {
        unique: true,
        fields: ['name'],
        name: 'unique_group_name',
      },
    ],
  }
);

export { UserGroup, UserGroupAttributes, UserGroupCreationAttributes };