"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnimalSpeciesController = void 0;
const animalAssociations_1 = require("../models/animalAssociations");
const sequelize_1 = require("sequelize");
class AnimalSpeciesController {
    static async getAll(req, res) {
        try {
            const { page = 1, limit = 20, search, category, active } = req.query;
            const offset = (Number(page) - 1) * Number(limit);
            let whereClause = {};
            if (search) {
                whereClause[sequelize_1.Op.or] = [
                    { name: { [sequelize_1.Op.iLike]: `%${search}%` } },
                    { scientificName: { [sequelize_1.Op.iLike]: `%${search}%` } },
                    { description: { [sequelize_1.Op.iLike]: `%${search}%` } }
                ];
            }
            if (category) {
                whereClause.category = category;
            }
            if (active !== undefined) {
                whereClause.isActive = active === 'true';
            }
            const { count, rows: species } = await animalAssociations_1.AnimalSpecies.findAndCountAll({
                where: whereClause,
                include: [{
                        model: animalAssociations_1.SpeciesProperty,
                        as: 'properties',
                        order: [['displayOrder', 'ASC']],
                    }],
                order: [['name', 'ASC']],
                limit: Number(limit),
                offset,
            });
            res.json({
                success: true,
                data: species,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total: count,
                    pages: Math.ceil(count / Number(limit)),
                },
            });
        }
        catch (error) {
            console.error('Error fetching animal species:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching animal species',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const species = await animalAssociations_1.AnimalSpecies.findByPk(id, {
                include: [{
                        model: animalAssociations_1.SpeciesProperty,
                        as: 'properties',
                        order: [['displayOrder', 'ASC']],
                    }],
            });
            if (!species) {
                return res.status(404).json({
                    success: false,
                    message: 'Animal species not found',
                });
            }
            return res.json({
                success: true,
                data: species,
            });
        }
        catch (error) {
            console.error('Error fetching animal species:', error);
            return res.status(500).json({
                success: false,
                message: 'Error fetching animal species',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    static async create(req, res) {
        try {
            const { name, scientificName, description, category, isActive = true, properties = [] } = req.body;
            const species = await animalAssociations_1.AnimalSpecies.create({
                name,
                scientificName,
                description,
                category,
                isActive,
            });
            if (properties.length > 0) {
                const speciesProperties = properties.map((prop, index) => ({
                    ...prop,
                    speciesId: species.id,
                    displayOrder: prop.displayOrder !== undefined ? prop.displayOrder : index,
                }));
                await animalAssociations_1.SpeciesProperty.bulkCreate(speciesProperties);
            }
            const createdSpecies = await animalAssociations_1.AnimalSpecies.findByPk(species.id, {
                include: [{
                        model: animalAssociations_1.SpeciesProperty,
                        as: 'properties',
                        order: [['displayOrder', 'ASC']],
                    }],
            });
            res.status(201).json({
                success: true,
                message: 'Animal species created successfully',
                data: createdSpecies,
            });
        }
        catch (error) {
            console.error('Error creating animal species:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating animal species',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    static async update(req, res) {
        try {
            const { id } = req.params;
            const { name, scientificName, description, category, isActive, properties } = req.body;
            const species = await animalAssociations_1.AnimalSpecies.findByPk(id);
            if (!species) {
                return res.status(404).json({
                    success: false,
                    message: 'Animal species not found',
                });
            }
            await species.update({
                name,
                scientificName,
                description,
                category,
                isActive,
            });
            if (properties) {
                await animalAssociations_1.SpeciesProperty.destroy({
                    where: { speciesId: id }
                });
                if (properties.length > 0) {
                    const speciesProperties = properties.map((prop, index) => ({
                        ...prop,
                        speciesId: id,
                        displayOrder: prop.displayOrder !== undefined ? prop.displayOrder : index,
                    }));
                    await animalAssociations_1.SpeciesProperty.bulkCreate(speciesProperties);
                }
            }
            const updatedSpecies = await animalAssociations_1.AnimalSpecies.findByPk(id, {
                include: [{
                        model: animalAssociations_1.SpeciesProperty,
                        as: 'properties',
                        order: [['displayOrder', 'ASC']],
                    }],
            });
            return res.json({
                success: true,
                message: 'Animal species updated successfully',
                data: updatedSpecies,
            });
        }
        catch (error) {
            console.error('Error updating animal species:', error);
            return res.status(500).json({
                success: false,
                message: 'Error updating animal species',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    static async delete(req, res) {
        try {
            const { id } = req.params;
            const species = await animalAssociations_1.AnimalSpecies.findByPk(id);
            if (!species) {
                return res.status(404).json({
                    success: false,
                    message: 'Animal species not found',
                });
            }
            await species.destroy();
            return res.json({
                success: true,
                message: 'Animal species deleted successfully',
            });
        }
        catch (error) {
            console.error('Error deleting animal species:', error);
            return res.status(500).json({
                success: false,
                message: 'Error deleting animal species',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    static async getCategories(req, res) {
        try {
            const categories = await animalAssociations_1.AnimalSpecies.findAll({
                attributes: ['category'],
                where: {
                    category: { [sequelize_1.Op.ne]: null },
                    isActive: true,
                },
                group: ['category'],
                order: [['category', 'ASC']],
            });
            const categoryList = categories.map(s => s.category).filter(Boolean);
            return res.json({
                success: true,
                data: categoryList,
            });
        }
        catch (error) {
            console.error('Error fetching categories:', error);
            return res.status(500).json({
                success: false,
                message: 'Error fetching categories',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
}
exports.AnimalSpeciesController = AnimalSpeciesController;
