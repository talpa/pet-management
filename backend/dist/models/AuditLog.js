"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLog = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class AuditLog extends sequelize_1.Model {
}
exports.AuditLog = AuditLog;
AuditLog.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    sessionId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    action: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
    resource: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
    resourceId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    ipAddress: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    userAgent: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    method: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    url: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    statusCode: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    responseTime: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    metadata: {
        type: sequelize_1.DataTypes.JSONB,
        allowNull: true,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'audit_logs',
    modelName: 'AuditLog',
    timestamps: true,
    updatedAt: false,
    indexes: [
        {
            fields: ['userId'],
        },
        {
            fields: ['action'],
        },
        {
            fields: ['resource'],
        },
        {
            fields: ['createdAt'],
        },
        {
            fields: ['ipAddress'],
        },
    ],
});
