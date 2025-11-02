"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const Animal_1 = __importDefault(require("./Animal"));
class AnimalProperty extends sequelize_1.Model {
}
AnimalProperty.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    animalId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Animal_1.default,
            key: 'id',
        },
        field: 'animal_id',
    },
    propertyName: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
        field: 'property_name',
    },
    propertyValue: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        field: 'property_value',
    },
    measuredAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize_1.DataTypes.NOW,
        field: 'measured_at',
    },
    notes: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
}, {
    sequelize: database_1.sequelize,
    modelName: 'AnimalProperty',
    tableName: 'animal_properties',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});
exports.default = AnimalProperty;
