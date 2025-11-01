"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserPermission = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class UserPermission extends sequelize_1.Model {
}
exports.UserPermission = UserPermission;
UserPermission.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    permissionId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'permissions',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    granted: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Whether permission is granted (true) or denied (false)',
    },
    grantedBy: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id',
        },
        comment: 'ID of user who granted this permission',
    },
    grantedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        comment: 'When permission was granted',
    },
    expiresAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        comment: 'When permission expires (null = never expires)',
    },
}, {
    sequelize: database_1.sequelize,
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
});
//# sourceMappingURL=UserPermission.js.map