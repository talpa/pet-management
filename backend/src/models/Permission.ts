import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface PermissionAttributes {
  id: number;
  name: string;
  code: string;
  description?: string;
  category: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PermissionCreationAttributes extends Optional<PermissionAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Permission extends Model<PermissionAttributes, PermissionCreationAttributes> implements PermissionAttributes {
  public id!: number;
  public name!: string;
  public code!: string;
  public description?: string;
  public category!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Permission.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Human readable permission name',
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: 'Unique permission code (e.g., "users.create")',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Detailed description of what this permission allows',
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Permission category (e.g., "users", "data", "admin")',
    },
  },
  {
    sequelize,
    modelName: 'Permission',
    tableName: 'permissions',
    timestamps: true,
  }
);

export { Permission, PermissionAttributes, PermissionCreationAttributes };