import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface UserGroupMemberAttributes {
  id: number;
  userId: number;
  userGroupId: number;
  addedBy?: number;
  addedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserGroupMemberCreationAttributes extends Optional<UserGroupMemberAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class UserGroupMember extends Model<UserGroupMemberAttributes, UserGroupMemberCreationAttributes> implements UserGroupMemberAttributes {
  public id!: number;
  public userId!: number;
  public userGroupId!: number;
  public addedBy?: number;
  public addedAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserGroupMember.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id', // Map to snake_case column
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
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
    addedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'added_by', // Map to snake_case column
      references: {
        model: 'users',
        key: 'id',
      },
      comment: 'ID of user who added this member to group',
    },
    addedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'added_at', // Map to snake_case column
      comment: 'When user was added to group',
    },
  },
  {
    sequelize,
    modelName: 'UserGroupMember',
    tableName: 'user_group_members',
    timestamps: true,
    underscored: true, // Use snake_case for all column names
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'user_group_id'],
        name: 'unique_user_group_member',
      },
    ],
  }
);

export { UserGroupMember, UserGroupMemberAttributes, UserGroupMemberCreationAttributes };