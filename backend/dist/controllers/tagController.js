"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnimalTags = exports.assignTagsToAnimal = exports.deleteTag = exports.updateTag = exports.createTag = exports.getTags = void 0;
const sequelize_1 = require("sequelize");
const AnimalTag_1 = __importDefault(require("../models/AnimalTag"));
const AnimalTagAssignment_1 = __importDefault(require("../models/AnimalTagAssignment"));
const Animal_1 = __importDefault(require("../models/Animal"));
const getTags = async (req, res) => {
    try {
        const { search, active = 'true' } = req.query;
        const whereClause = {};
        if (active === 'true') {
            whereClause.isActive = true;
        }
        if (search) {
            whereClause.name = {
                [sequelize_1.Op.iLike]: `%${search}%`
            };
        }
        const tags = await AnimalTag_1.default.findAll({
            where: whereClause,
            order: [['name', 'ASC']],
            include: [
                {
                    model: AnimalTagAssignment_1.default,
                    as: 'animalAssignments',
                    attributes: ['id'],
                    required: false,
                }
            ]
        });
        const tagsWithCount = tags.map(tag => {
            const assignments = tag.get('animalAssignments');
            return {
                ...tag.toJSON(),
                usageCount: assignments?.length || 0
            };
        });
        res.json({
            success: true,
            data: tagsWithCount,
        });
    }
    catch (error) {
        console.error('Error fetching tags:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch tags',
        });
    }
};
exports.getTags = getTags;
const createTag = async (req, res) => {
    try {
        const { name, description, color = '#1976d2' } = req.body;
        if (!name) {
            res.status(400).json({
                success: false,
                message: 'Tag name is required',
            });
            return;
        }
        const existingTag = await AnimalTag_1.default.findOne({
            where: { name: name.trim() }
        });
        if (existingTag) {
            res.status(409).json({
                success: false,
                message: 'Tag with this name already exists',
            });
            return;
        }
        const tag = await AnimalTag_1.default.create({
            name: name.trim(),
            description: description?.trim(),
            color: color,
            isActive: true,
        });
        res.status(201).json({
            success: true,
            data: tag,
            message: 'Tag created successfully',
        });
    }
    catch (error) {
        console.error('Error creating tag:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create tag',
        });
    }
};
exports.createTag = createTag;
const updateTag = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, color, isActive } = req.body;
        const tag = await AnimalTag_1.default.findByPk(id);
        if (!tag) {
            res.status(404).json({
                success: false,
                message: 'Tag not found',
            });
            return;
        }
        if (name && name.trim() !== tag.name) {
            const existingTag = await AnimalTag_1.default.findOne({
                where: {
                    name: name.trim(),
                    id: { [sequelize_1.Op.ne]: id }
                }
            });
            if (existingTag) {
                res.status(409).json({
                    success: false,
                    message: 'Tag name already exists',
                });
                return;
            }
        }
        await tag.update({
            ...(name && { name: name.trim() }),
            ...(description !== undefined && { description: description?.trim() }),
            ...(color && { color }),
            ...(isActive !== undefined && { isActive }),
        });
        res.json({
            success: true,
            data: tag,
            message: 'Tag updated successfully',
        });
    }
    catch (error) {
        console.error('Error updating tag:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update tag',
        });
    }
};
exports.updateTag = updateTag;
const deleteTag = async (req, res) => {
    try {
        const { id } = req.params;
        const tag = await AnimalTag_1.default.findByPk(id);
        if (!tag) {
            res.status(404).json({
                success: false,
                message: 'Tag not found',
            });
            return;
        }
        const usageCount = await AnimalTagAssignment_1.default.count({
            where: { tagId: id }
        });
        if (usageCount > 0) {
            res.status(409).json({
                success: false,
                message: `Cannot delete tag. It is currently used by ${usageCount} animal(s). Please remove the tag from all animals first or deactivate it instead.`,
            });
            return;
        }
        await tag.destroy();
        res.json({
            success: true,
            message: 'Tag deleted successfully',
        });
    }
    catch (error) {
        console.error('Error deleting tag:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete tag',
        });
    }
};
exports.deleteTag = deleteTag;
const assignTagsToAnimal = async (req, res) => {
    try {
        const { animalId } = req.params;
        const { tagIds } = req.body;
        if (!Array.isArray(tagIds)) {
            res.status(400).json({
                success: false,
                message: 'tagIds must be an array',
            });
            return;
        }
        const animal = await Animal_1.default.findByPk(animalId);
        if (!animal) {
            res.status(404).json({
                success: false,
                message: 'Animal not found',
            });
            return;
        }
        const tags = await AnimalTag_1.default.findAll({
            where: {
                id: tagIds,
                isActive: true
            }
        });
        if (tags.length !== tagIds.length) {
            res.status(400).json({
                success: false,
                message: 'One or more tags not found or inactive',
            });
            return;
        }
        await AnimalTagAssignment_1.default.destroy({
            where: { animalId }
        });
        if (tagIds.length > 0) {
            const assignments = tagIds.map((tagId) => ({
                animalId: parseInt(animalId),
                tagId
            }));
            await AnimalTagAssignment_1.default.bulkCreate(assignments);
        }
        res.json({
            success: true,
            message: 'Tags assigned successfully',
        });
    }
    catch (error) {
        console.error('Error assigning tags:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to assign tags',
        });
    }
};
exports.assignTagsToAnimal = assignTagsToAnimal;
const getAnimalTags = async (req, res) => {
    try {
        const { animalId } = req.params;
        const assignments = await AnimalTagAssignment_1.default.findAll({
            where: { animalId },
            include: [
                {
                    model: AnimalTag_1.default,
                    as: 'tag',
                    where: { isActive: true }
                }
            ]
        });
        const tags = assignments.map(assignment => assignment.get('tag'));
        res.json({
            success: true,
            data: tags,
        });
    }
    catch (error) {
        console.error('Error fetching animal tags:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch animal tags',
        });
    }
};
exports.getAnimalTags = getAnimalTags;
