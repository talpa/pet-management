"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserGroupMember = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class UserGroupMember extends sequelize_1.Model {
}
exports.UserGroupMember = UserGroupMember;
UserGroupMember.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id',
        references: {
            model: 'users',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    userGroupId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        field: 'user_group_id',
        references: {
            model: 'user_groups',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    addedBy: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        field: 'added_by',
        references: {
            model: 'users',
            key: 'id',
        },
        comment: 'ID of user who added this member to group',
    },
    addedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        field: 'added_at',
        comment: 'When user was added to group',
    },
}, {
    sequelize: database_1.sequelize,
    modelName: 'UserGroupMember',
    tableName: 'user_group_members',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'user_group_id'],
            name: 'unique_user_group_member',
        },
    ],
});
