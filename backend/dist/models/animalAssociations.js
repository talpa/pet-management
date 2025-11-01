"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnimalImage = exports.AnimalProperty = exports.Animal = exports.SpeciesProperty = exports.AnimalSpecies = void 0;
const AnimalSpecies_1 = __importDefault(require("./AnimalSpecies"));
exports.AnimalSpecies = AnimalSpecies_1.default;
const SpeciesProperty_1 = __importDefault(require("./SpeciesProperty"));
exports.SpeciesProperty = SpeciesProperty_1.default;
const Animal_1 = __importDefault(require("./Animal"));
exports.Animal = Animal_1.default;
const AnimalProperty_1 = __importDefault(require("./AnimalProperty"));
exports.AnimalProperty = AnimalProperty_1.default;
const AnimalImage_1 = __importDefault(require("./AnimalImage"));
exports.AnimalImage = AnimalImage_1.default;
const User_1 = require("./User");
AnimalSpecies_1.default.hasMany(SpeciesProperty_1.default, {
    foreignKey: 'speciesId',
    as: 'properties',
    onDelete: 'CASCADE',
});
AnimalSpecies_1.default.hasMany(Animal_1.default, {
    foreignKey: 'speciesId',
    as: 'animals',
    onDelete: 'RESTRICT',
});
SpeciesProperty_1.default.belongsTo(AnimalSpecies_1.default, {
    foreignKey: 'speciesId',
    as: 'species',
});
Animal_1.default.belongsTo(AnimalSpecies_1.default, {
    foreignKey: 'speciesId',
    as: 'species',
});
Animal_1.default.belongsTo(User_1.User, {
    foreignKey: 'ownerId',
    as: 'owner',
});
Animal_1.default.belongsTo(User_1.User, {
    foreignKey: 'createdBy',
    as: 'creator',
});
Animal_1.default.hasMany(AnimalProperty_1.default, {
    foreignKey: 'animalId',
    as: 'properties',
    onDelete: 'CASCADE',
});
Animal_1.default.hasMany(AnimalImage_1.default, {
    foreignKey: 'animalId',
    as: 'images',
    onDelete: 'CASCADE',
});
AnimalProperty_1.default.belongsTo(Animal_1.default, {
    foreignKey: 'animalId',
    as: 'animal',
});
AnimalImage_1.default.belongsTo(Animal_1.default, {
    foreignKey: 'animalId',
    as: 'animal',
});
AnimalImage_1.default.belongsTo(User_1.User, {
    foreignKey: 'uploadedBy',
    as: 'uploader',
});
User_1.User.hasMany(Animal_1.default, {
    foreignKey: 'ownerId',
    as: 'ownedAnimals',
});
User_1.User.hasMany(Animal_1.default, {
    foreignKey: 'createdBy',
    as: 'createdAnimals',
});
User_1.User.hasMany(AnimalImage_1.default, {
    foreignKey: 'uploadedBy',
    as: 'uploadedImages',
});
//# sourceMappingURL=animalAssociations.js.map