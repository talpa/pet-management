"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Permission = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Permission extends sequelize_1.Model {
}
exports.Permission = Permission;
Permission.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        comment: 'Human readable permission name',
    },
    code: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
        comment: 'Unique permission code (e.g., "users.create")',
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        comment: 'Detailed description of what this permission allows',
    },
    category: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        comment: 'Permission category (e.g., "users", "data", "admin")',
    },
}, {
    sequelize: database_1.sequelize,
    modelName: 'Permission',
    tableName: 'permissions',
    timestamps: true,
});
