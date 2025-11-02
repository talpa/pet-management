"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const Animal_1 = __importDefault(require("./Animal"));
const User_1 = require("./User");
class AnimalImage extends sequelize_1.Model {
}
AnimalImage.init({
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
    filename: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    originalName: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
        field: 'original_name',
    },
    processedFilename: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
        field: 'processed_filename',
    },
    thumbnailFilename: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
        field: 'thumbnail_filename',
    },
    filePath: {
        type: sequelize_1.DataTypes.STRING(500),
        allowNull: true,
        field: 'file_path',
    },
    size: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        field: 'file_size',
    },
    mimeType: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
        field: 'mime_type',
    },
    isPrimary: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_primary',
    },
    uploadedBy: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: User_1.User,
            key: 'id',
        },
        field: 'uploaded_by',
    },
}, {
    sequelize: database_1.sequelize,
    modelName: 'AnimalImage',
    tableName: 'animal_images',
    timestamps: true,
    createdAt: 'uploaded_at',
    updatedAt: false,
});
exports.default = AnimalImage;
