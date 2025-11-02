"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupPermission = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class GroupPermission extends sequelize_1.Model {
}
exports.GroupPermission = GroupPermission;
GroupPermission.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
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
    permissionId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        field: 'permission_id',
        references: {
            model: 'permissions',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    grantedBy: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        field: 'granted_by',
        references: {
            model: 'users',
            key: 'id',
        },
        comment: 'ID of user who granted this permission to group',
    },
    grantedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        field: 'granted_at',
        comment: 'When permission was granted to group',
    },
}, {
    sequelize: database_1.sequelize,
    modelName: 'GroupPermission',
    tableName: 'group_permissions',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['user_group_id', 'permission_id'],
            name: 'unique_group_permission',
        },
    ],
});
