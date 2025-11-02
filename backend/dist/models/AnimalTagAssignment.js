"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const Animal_1 = __importDefault(require("./Animal"));
const AnimalTag_1 = __importDefault(require("./AnimalTag"));
class AnimalTagAssignment extends sequelize_1.Model {
}
AnimalTagAssignment.init({
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
    tagId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: AnimalTag_1.default,
            key: 'id',
        },
        field: 'tag_id',
    },
}, {
    sequelize: database_1.sequelize,
    modelName: 'AnimalTagAssignment',
    tableName: 'animal_tag_assignments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            unique: true,
            fields: ['animal_id', 'tag_id']
        },
        {
            fields: ['animal_id']
        },
        {
            fields: ['tag_id']
        }
    ]
});
exports.default = AnimalTagAssignment;
