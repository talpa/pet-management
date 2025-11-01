import AnimalSpecies from './AnimalSpecies';
import SpeciesProperty from './SpeciesProperty';
import Animal from './Animal';
import AnimalProperty from './AnimalProperty';
import AnimalImage from './AnimalImage';
import AnimalTag from './AnimalTag';
import AnimalTagAssignment from './AnimalTagAssignment';
import { User } from './User';

// Animal Species associations
AnimalSpecies.hasMany(SpeciesProperty, {
  foreignKey: 'speciesId',
  as: 'properties',
  onDelete: 'CASCADE',
});

AnimalSpecies.hasMany(Animal, {
  foreignKey: 'speciesId',
  as: 'animals',
  onDelete: 'RESTRICT',
});

// Species Property associations
SpeciesProperty.belongsTo(AnimalSpecies, {
  foreignKey: 'speciesId',
  as: 'species',
});

// Animal associations
Animal.belongsTo(AnimalSpecies, {
  foreignKey: 'speciesId',
  as: 'species',
});

Animal.belongsTo(User, {
  foreignKey: 'ownerId',
  as: 'owner',
});

Animal.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator',
});

Animal.hasMany(AnimalProperty, {
  foreignKey: 'animalId',
  as: 'properties',
  onDelete: 'CASCADE',
});

Animal.hasMany(AnimalImage, {
  foreignKey: 'animalId',
  as: 'images',
  onDelete: 'CASCADE',
});

// Animal Tag associations (Many-to-Many through AnimalTagAssignment)
Animal.belongsToMany(AnimalTag, {
  through: AnimalTagAssignment,
  foreignKey: 'animalId',
  otherKey: 'tagId',
  as: 'tags',
});

AnimalTag.belongsToMany(Animal, {
  through: AnimalTagAssignment,
  foreignKey: 'tagId',
  otherKey: 'animalId',
  as: 'animals',
});

// Direct associations for AnimalTagAssignment
AnimalTagAssignment.belongsTo(Animal, {
  foreignKey: 'animalId',
  as: 'animal',
});

AnimalTagAssignment.belongsTo(AnimalTag, {
  foreignKey: 'tagId',
  as: 'tag',
});

Animal.hasMany(AnimalTagAssignment, {
  foreignKey: 'animalId',
  as: 'tagAssignments',
  onDelete: 'CASCADE',
});

AnimalTag.hasMany(AnimalTagAssignment, {
  foreignKey: 'tagId',
  as: 'animalAssignments',
  onDelete: 'CASCADE',
});

// Animal Property associations
AnimalProperty.belongsTo(Animal, {
  foreignKey: 'animalId',
  as: 'animal',
});

// Animal Image associations
AnimalImage.belongsTo(Animal, {
  foreignKey: 'animalId',
  as: 'animal',
});

AnimalImage.belongsTo(User, {
  foreignKey: 'uploadedBy',
  as: 'uploader',
});

// User associations (reverse)
User.hasMany(Animal, {
  foreignKey: 'ownerId',
  as: 'ownedAnimals',
});

User.hasMany(Animal, {
  foreignKey: 'createdBy',
  as: 'createdAnimals',
});

User.hasMany(AnimalImage, {
  foreignKey: 'uploadedBy',
  as: 'uploadedImages',
});

export {
  AnimalSpecies,
  SpeciesProperty,
  Animal,
  AnimalProperty,
  AnimalImage,
  AnimalTag,
  AnimalTagAssignment,
};