import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface UserPermissionAttributes {
  id: number;
  userId: number;
  permissionId: number;
  granted: boolean;
  grantedBy?: number;
  grantedAt?: Date;
  expiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserPermissionCreationAttributes extends Optional<UserPermissionAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class UserPermission extends Model<UserPermissionAttributes, UserPermissionCreationAttributes> implements UserPermissionAttributes {
  public id!: number;
  public userId!: number;
  public permissionId!: number;
  public granted!: boolean;
  public grantedBy?: number;
  public grantedAt?: Date;
  public expiresAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserPermission.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    permissionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'permissions',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    granted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Whether permission is granted (true) or denied (false)',
    },
    grantedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      comment: 'ID of user who granted this permission',
    },
    grantedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When permission was granted',
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When permission expires (null = never expires)',
    },
  },
  {
    sequelize,
    modelName: 'UserPermission',
    tableName: 'user_permissions',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'permissionId'],
        name: 'unique_user_permission',
      },
    ],
  }
);

export { UserPermission, UserPermissionAttributes, UserPermissionCreationAttributes };