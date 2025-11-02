"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const AnimalSpecies_1 = __importDefault(require("./AnimalSpecies"));
const User_1 = require("./User");
class Animal extends sequelize_1.Model {
}
Animal.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
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
    ownerId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User_1.User,
            key: 'id',
        },
        field: 'owner_id',
    },
    birthDate: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: true,
        field: 'birth_date',
    },
    gender: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: true,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    seoUrl: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
        unique: true,
        field: 'seo_url',
        validate: {
            notEmpty: true,
            isSlug: function (value) {
                if (value && !/^[a-z0-9-]+$/.test(value)) {
                    throw new Error('SEO URL must contain only lowercase letters, numbers, and hyphens');
                }
            },
        },
    },
    isActive: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_active',
    },
    createdBy: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: User_1.User,
            key: 'id',
        },
        field: 'created_by',
    },
}, {
    sequelize: database_1.sequelize,
    modelName: 'Animal',
    tableName: 'animals',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});
exports.default = Animal;
