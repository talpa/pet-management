"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class User extends sequelize_1.Model {
}
exports.User = User;
User.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [2, 100],
        },
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    phone: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    company: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    address: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    viber: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    whatsapp: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    signal: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    facebook: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    instagram: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    twitter: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    linkedin: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    role: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active',
    },
    provider: {
        type: sequelize_1.DataTypes.ENUM('local', 'google', 'facebook'),
        allowNull: false,
        defaultValue: 'local',
    },
    providerId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        field: 'provider_id',
    },
    avatar: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    refreshToken: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        field: 'refresh_token',
    },
    lastLoginAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        field: 'last_login_at',
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'users',
    modelName: 'User',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['email'],
        },
        {
            unique: true,
            fields: ['provider', 'provider_id'],
            where: {
                provider: {
                    [sequelize_1.Op.ne]: 'local'
                }
            }
        },
    ],
});
