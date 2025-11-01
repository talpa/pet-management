import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface GroupPermissionAttributes {
  id: number;
  userGroupId: number;
  permissionId: number;
  grantedBy?: number;
  grantedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface GroupPermissionCreationAttributes extends Optional<GroupPermissionAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class GroupPermission extends Model<GroupPermissionAttributes, GroupPermissionCreationAttributes> implements GroupPermissionAttributes {
  public id!: number;
  public userGroupId!: number;
  public permissionId!: number;
  public grantedBy?: number;
  public grantedAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

GroupPermission.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userGroupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_group_id', // Map to snake_case column
      references: {
        model: 'user_groups',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    permissionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'permission_id', // Map to snake_case column
      references: {
        model: 'permissions',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    grantedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'granted_by', // Map to snake_case column
      references: {
        model: 'users',
        key: 'id',
      },
      comment: 'ID of user who granted this permission to group',
    },
    grantedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'granted_at', // Map to snake_case column
      comment: 'When permission was granted to group',
    },
  },
  {
    sequelize,
    modelName: 'GroupPermission',
    tableName: 'group_permissions',
    timestamps: true,
    underscored: true, // Use snake_case for all column names
    indexes: [
      {
        unique: true,
        fields: ['user_group_id', 'permission_id'],
        name: 'unique_group_permission',
      },
    ],
  }
);

export { GroupPermission, GroupPermissionAttributes, GroupPermissionCreationAttributes };