"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class AnimalSpecies extends sequelize_1.Model {
}
AnimalSpecies.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
        unique: true,
    },
    scientificName: {
        type: sequelize_1.DataTypes.STRING(150),
        allowNull: true,
        field: 'scientific_name',
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    category: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: true,
    },
    isActive: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_active',
    },
}, {
    sequelize: database_1.sequelize,
    modelName: 'AnimalSpecies',
    tableName: 'animal_species',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});
exports.default = AnimalSpecies;
//# sourceMappingURL=AnimalSpecies.js.map