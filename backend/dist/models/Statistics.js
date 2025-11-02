"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Statistics = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Statistics extends sequelize_1.Model {
}
exports.Statistics = Statistics;
Statistics.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    date: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
    },
    metric: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
    category: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
    value: {
        type: sequelize_1.DataTypes.DECIMAL(15, 2),
        allowNull: false,
    },
    metadata: {
        type: sequelize_1.DataTypes.JSONB,
        allowNull: true,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'statistics',
    modelName: 'Statistics',
    timestamps: true,
    indexes: [
        {
            fields: ['date'],
        },
        {
            fields: ['metric'],
        },
        {
            fields: ['category'],
        },
        {
            unique: true,
            fields: ['date', 'metric', 'category'],
        },
    ],
});
