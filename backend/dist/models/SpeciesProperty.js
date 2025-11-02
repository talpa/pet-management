"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const AnimalSpecies_1 = __importDefault(require("./AnimalSpecies"));
class SpeciesProperty extends sequelize_1.Model {
}
SpeciesProperty.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    speciesId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: AnimalSpecies_1.default,
            key: 'id',
        },
        field: 'species_id',
    },
    propertyName: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
        field: 'property_name',
    },
    propertyType: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
        field: 'property_type',
    },
    propertyUnit: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: true,
        field: 'property_unit',
    },
    isRequired: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_required',
    },
    defaultValue: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        field: 'default_value',
    },
    validationRules: {
        type: sequelize_1.DataTypes.JSONB,
        allowNull: true,
        field: 'validation_rules',
    },
    displayOrder: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'display_order',
    },
}, {
    sequelize: database_1.sequelize,
    modelName: 'SpeciesProperty',
    tableName: 'species_properties',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
});
exports.default = SpeciesProperty;
