"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnimalController = void 0;
const animalAssociations_1 = require("../models/animalAssociations");
const SpeciesProperty_1 = __importDefault(require("../models/SpeciesProperty"));
const User_1 = require("../models/User");
const sequelize_1 = require("sequelize");
const upload_1 = require("../middleware/upload");
const qrCodeService_1 = __importDefault(require("../services/qrCodeService"));
const path_1 = __importDefault(require("path"));
const transformImageData = (images) => {
    return images.map((image) => {
        const imageData = image.toJSON ? image.toJSON() : image;
        return {
            ...imageData,
            url: imageData.filePath ?
                `${process.env.API_URL || 'http://localhost:4444'}${imageData.filePath}` :
                `${process.env.API_URL || 'http://localhost:4444'}/uploads/animals/${imageData.filename}`,
            thumbnailUrl: imageData.thumbnailFilename ?
                `${process.env.API_URL || 'http://localhost:4444'}/uploads/animals/${imageData.thumbnailFilename}` :
                `${process.env.API_URL || 'http://localhost:4444'}/uploads/animals/thumb_${imageData.filename}`,
        };
    });
};
const transformAnimalData = (animal) => {
    const animalJson = animal.toJSON();
    if (animalJson.owner) {
        animalJson.ownerName = animalJson.owner.name;
        animalJson.ownerId = animalJson.owner.id;
    }
    if (animalJson.images && animalJson.images.length > 0) {
        animalJson.images = transformImageData(animal.images);
    }
    return animalJson;
};
class AnimalController {
    static async getAll(req, res) {
        try {
            const { page = 1, limit = 20, search, speciesId, ownerId, gender, tags, sortBy = 'created_at', sortOrder = 'DESC' } = req.query;
            const user = req.user;
            const offset = (Number(page) - 1) * Number(limit);
            let whereClause = { isActive: true };
            let includeClause = [
                {
                    model: animalAssociations_1.AnimalSpecies,
                    as: 'species',
                    attributes: ['id', 'name', 'scientificName', 'category'],
                },
                {
                    model: User_1.User,
                    as: 'owner',
                    attributes: ['id', 'name', 'email'],
                },
                {
                    model: animalAssociations_1.AnimalProperty,
                    as: 'properties',
                },
                {
                    model: animalAssociations_1.AnimalImage,
                    as: 'images',
                    required: false,
                },
                {
                    model: animalAssociations_1.AnimalTag,
                    as: 'tags',
                    through: { attributes: [] },
                    required: false,
                },
            ];
            if (search) {
                whereClause[sequelize_1.Op.or] = [
                    { name: { [sequelize_1.Op.iLike]: `%${search}%` } },
                    { description: { [sequelize_1.Op.iLike]: `%${search}%` } }
                ];
            }
            if (speciesId) {
                whereClause.speciesId = speciesId;
            }
            if (ownerId) {
                whereClause.ownerId = ownerId;
            }
            if (gender) {
                whereClause.gender = gender;
            }
            if (tags) {
                let tagArray;
                if (Array.isArray(tags)) {
                    tagArray = tags;
                }
                else {
                    tagArray = tags.split(',').map(tag => tag.trim());
                }
                if (tagArray.length > 0) {
                    const tagRecords = await animalAssociations_1.AnimalTag.findAll({
                        where: { name: { [sequelize_1.Op.in]: tagArray } },
                        attributes: ['id']
                    });
                    if (tagRecords.length > 0) {
                        const tagIds = tagRecords.map(tag => tag.id);
                        const animalTagAssignments = await animalAssociations_1.AnimalTagAssignment.findAll({
                            where: { tagId: { [sequelize_1.Op.in]: tagIds } },
                            attributes: ['animalId']
                        });
                        const animalIds = [...new Set(animalTagAssignments.map(ata => ata.animalId))];
                        if (animalIds.length > 0) {
                            whereClause.id = { [sequelize_1.Op.in]: animalIds };
                        }
                        else {
                            whereClause.id = { [sequelize_1.Op.in]: [] };
                        }
                    }
                    else {
                        whereClause.id = { [sequelize_1.Op.in]: [] };
                    }
                }
            }
            const validSortFields = ['created_at', 'updated_at', 'name', 'birthDate'];
            const validSortOrders = ['ASC', 'DESC'];
            const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'created_at';
            const finalSortOrder = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';
            const { count, rows: animals } = await animalAssociations_1.Animal.findAndCountAll({
                where: whereClause,
                include: includeClause,
                order: [[finalSortBy, finalSortOrder]],
                limit: Number(limit),
                offset,
                distinct: true,
            });
            res.json({
                success: true,
                data: animals.map(transformAnimalData),
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total: count,
                    pages: Math.ceil(count / Number(limit)),
                },
            });
        }
        catch (error) {
            console.error('Error fetching animals:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching animals',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    static async getMyAnimals(req, res) {
        try {
            const { page = 1, limit = 20, search, speciesId, gender, tags, sortBy = 'created_at', sortOrder = 'DESC' } = req.query;
            const user = req.user;
            const offset = (Number(page) - 1) * Number(limit);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required',
                });
            }
            let whereClause = {
                isActive: true,
                ownerId: user.id
            };
            let includeClause = [
                {
                    model: animalAssociations_1.AnimalSpecies,
                    as: 'species',
                    attributes: ['id', 'name', 'scientificName', 'category'],
                },
                {
                    model: User_1.User,
                    as: 'owner',
                    attributes: ['id', 'name', 'email'],
                },
                {
                    model: animalAssociations_1.AnimalProperty,
                    as: 'properties',
                },
                {
                    model: animalAssociations_1.AnimalImage,
                    as: 'images',
                    required: false,
                },
                {
                    model: animalAssociations_1.AnimalTag,
                    as: 'tags',
                    through: { attributes: [] },
                    required: false,
                },
            ];
            if (search) {
                whereClause[sequelize_1.Op.or] = [
                    { name: { [sequelize_1.Op.iLike]: `%${search}%` } },
                    { description: { [sequelize_1.Op.iLike]: `%${search}%` } }
                ];
            }
            if (speciesId) {
                whereClause.speciesId = speciesId;
            }
            if (gender) {
                whereClause.gender = gender;
            }
            if (tags) {
                let tagArray;
                if (Array.isArray(tags)) {
                    tagArray = tags;
                }
                else {
                    tagArray = tags.split(',').map(tag => tag.trim());
                }
                if (tagArray.length > 0) {
                    const tagRecords = await animalAssociations_1.AnimalTag.findAll({
                        where: { name: { [sequelize_1.Op.in]: tagArray } },
                        attributes: ['id']
                    });
                    if (tagRecords.length > 0) {
                        const tagIds = tagRecords.map(tag => tag.id);
                        const animalTagAssignments = await animalAssociations_1.AnimalTagAssignment.findAll({
                            where: { tagId: { [sequelize_1.Op.in]: tagIds } },
                            attributes: ['animalId']
                        });
                        const animalIds = [...new Set(animalTagAssignments.map(ata => ata.animalId))];
                        if (animalIds.length > 0) {
                            whereClause.id = { [sequelize_1.Op.in]: animalIds };
                        }
                        else {
                            whereClause.id = { [sequelize_1.Op.in]: [] };
                        }
                    }
                    else {
                        whereClause.id = { [sequelize_1.Op.in]: [] };
                    }
                }
            }
            const validSortFields = ['created_at', 'updated_at', 'name', 'birthDate'];
            const validSortOrders = ['ASC', 'DESC'];
            const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'created_at';
            const finalSortOrder = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';
            const { count, rows: animals } = await animalAssociations_1.Animal.findAndCountAll({
                where: whereClause,
                include: includeClause,
                order: [[finalSortBy, finalSortOrder]],
                limit: Number(limit),
                offset,
                distinct: true,
            });
            console.log(`User ${user.id} (${user.name}) requested their animals: found ${count} animals`);
            res.json({
                success: true,
                data: animals.map(transformAnimalData),
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total: count,
                    pages: Math.ceil(count / Number(limit)),
                },
            });
        }
        catch (error) {
            console.error('Error fetching user animals:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching your animals',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const userId = req.headers['x-user-id'];
            let whereClause = { id, isActive: true };
            const hasAdminAccess = true;
            if (!hasAdminAccess && userId) {
                whereClause.ownerId = userId;
            }
            const animal = await animalAssociations_1.Animal.findOne({
                where: whereClause,
                include: [
                    {
                        model: animalAssociations_1.AnimalSpecies,
                        as: 'species',
                        include: [{
                                model: require('../models/SpeciesProperty').default,
                                as: 'properties',
                                order: [['displayOrder', 'ASC']],
                            }],
                    },
                    {
                        model: User_1.User,
                        as: 'owner',
                        attributes: ['id', 'name', 'email'],
                    },
                    {
                        model: User_1.User,
                        as: 'creator',
                        attributes: ['id', 'name', 'email'],
                    },
                    {
                        model: animalAssociations_1.AnimalProperty,
                        as: 'properties',
                    },
                    {
                        model: animalAssociations_1.AnimalImage,
                        as: 'images',
                        order: [['isPrimary', 'DESC'], ['uploadedAt', 'DESC']],
                    },
                ],
            });
            if (!animal) {
                return res.status(404).json({
                    success: false,
                    message: 'Animal not found',
                });
            }
            return res.json({
                success: true,
                data: transformAnimalData(animal),
            });
        }
        catch (error) {
            console.error('Error fetching animal:', error);
            return res.status(500).json({
                success: false,
                message: 'Error fetching animal',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    static async getBySeoUrl(req, res) {
        try {
            const { seoUrl } = req.params;
            const whereClause = { seoUrl, isActive: true };
            const animal = await animalAssociations_1.Animal.findOne({
                where: whereClause,
                include: [
                    {
                        model: animalAssociations_1.AnimalSpecies,
                        as: 'species',
                        include: [{
                                model: require('../models/SpeciesProperty').default,
                                as: 'properties',
                                order: [['displayOrder', 'ASC']],
                            }],
                    },
                    {
                        model: User_1.User,
                        as: 'owner',
                        attributes: ['id', 'name', 'email'],
                    },
                    {
                        model: User_1.User,
                        as: 'creator',
                        attributes: ['id', 'name', 'email'],
                    },
                    {
                        model: animalAssociations_1.AnimalProperty,
                        as: 'properties',
                    },
                    {
                        model: animalAssociations_1.AnimalImage,
                        as: 'images',
                        order: [['isPrimary', 'DESC'], ['createdAt', 'ASC']],
                    },
                ],
            });
            if (!animal) {
                return res.status(404).json({
                    success: false,
                    message: 'Animal not found',
                });
            }
            return res.json({
                success: true,
                data: transformAnimalData(animal),
            });
        }
        catch (error) {
            console.error('Error fetching animal by SEO URL:', error);
            return res.status(500).json({
                success: false,
                message: 'Error fetching animal',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    static async create(req, res) {
        try {
            const { name, speciesId, ownerId, birthDate, gender, description, seoUrl, properties = [], tags = [] } = req.body;
            const userId = req.headers['x-user-id'];
            const animal = await animalAssociations_1.Animal.create({
                name,
                speciesId,
                ownerId: ownerId || Number(userId),
                birthDate,
                gender,
                description,
                seoUrl,
                isActive: true,
                createdBy: Number(userId),
            });
            if (properties.length > 0) {
                console.log('Properties received:', JSON.stringify(properties, null, 2));
                const speciesPropertyIds = properties.map((p) => p.speciesPropertyId);
                console.log('SpeciesPropertyIds:', speciesPropertyIds);
                const speciesProperties = await SpeciesProperty_1.default.findAll({
                    where: { id: speciesPropertyIds }
                });
                console.log('SpeciesProperties found:', JSON.stringify(speciesProperties.map(sp => ({ id: sp.id, propertyName: sp.propertyName })), null, 2));
                const animalProperties = properties.map((prop) => {
                    const speciesProperty = speciesProperties.find((sp) => sp.id === prop.speciesPropertyId);
                    return {
                        animalId: animal.id,
                        propertyName: speciesProperty?.propertyName || `Property ${prop.speciesPropertyId}`,
                        propertyValue: prop.value,
                        notes: prop.notes || null,
                    };
                });
                console.log('AnimalProperties to create:', JSON.stringify(animalProperties, null, 2));
                await animalAssociations_1.AnimalProperty.bulkCreate(animalProperties);
            }
            if (tags.length > 0) {
                console.log('Tags to assign:', tags);
                const tagAssignments = tags.map((tagId) => ({
                    animalId: animal.id,
                    tagId: tagId,
                }));
                await animalAssociations_1.AnimalTagAssignment.bulkCreate(tagAssignments);
            }
            const createdAnimal = await animalAssociations_1.Animal.findByPk(animal.id, {
                include: [
                    {
                        model: animalAssociations_1.AnimalSpecies,
                        as: 'species',
                    },
                    {
                        model: User_1.User,
                        as: 'owner',
                        attributes: ['id', 'name', 'email'],
                    },
                    {
                        model: animalAssociations_1.AnimalProperty,
                        as: 'properties',
                    },
                    {
                        model: animalAssociations_1.AnimalTag,
                        as: 'tags',
                        through: { attributes: [] },
                    },
                ],
            });
            if (seoUrl) {
                try {
                    await qrCodeService_1.default.generateAnimalQRCode(animal.id, seoUrl);
                    console.log(`QR code generated for animal ${animal.id} with SEO URL: ${seoUrl}`);
                }
                catch (qrError) {
                    console.error('Failed to generate QR code:', qrError);
                }
            }
            res.status(201).json({
                success: true,
                message: 'Animal created successfully',
                data: createdAnimal,
            });
        }
        catch (error) {
            console.error('Error creating animal:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating animal',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    static async update(req, res) {
        try {
            const { id } = req.params;
            const { name, speciesId, ownerId, birthDate, gender, description, seoUrl, properties, tags } = req.body;
            const userId = req.headers['x-user-id'];
            let whereClause = { id, isActive: true };
            const hasAdminAccess = true;
            if (!hasAdminAccess && userId) {
                whereClause.ownerId = userId;
            }
            const animal = await animalAssociations_1.Animal.findOne({ where: whereClause });
            if (!animal) {
                return res.status(404).json({
                    success: false,
                    message: 'Animal not found',
                });
            }
            await animal.update({
                name,
                speciesId,
                ownerId: ownerId || animal.ownerId,
                birthDate,
                gender,
                description,
                seoUrl,
            });
            if (properties && Array.isArray(properties)) {
                await animalAssociations_1.AnimalProperty.destroy({
                    where: { animalId: id }
                });
                if (properties.length > 0) {
                    console.log('Updating properties:', JSON.stringify(properties, null, 2));
                    const speciesPropertyIds = properties.map((prop) => prop.speciesPropertyId);
                    const speciesProperties = await SpeciesProperty_1.default.findAll({
                        where: { id: speciesPropertyIds }
                    });
                    console.log('SpeciesProperties found for update:', JSON.stringify(speciesProperties.map(sp => ({ id: sp.id, propertyName: sp.propertyName })), null, 2));
                    const animalProperties = properties.map((prop) => {
                        const speciesProperty = speciesProperties.find((sp) => sp.id === prop.speciesPropertyId);
                        return {
                            animalId: parseInt(id),
                            propertyName: speciesProperty?.propertyName || `Property ${prop.speciesPropertyId}`,
                            propertyValue: prop.value,
                            notes: prop.notes || null,
                        };
                    });
                    console.log('AnimalProperties to update:', JSON.stringify(animalProperties, null, 2));
                    await animalAssociations_1.AnimalProperty.bulkCreate(animalProperties);
                }
            }
            if (tags !== undefined && Array.isArray(tags)) {
                await animalAssociations_1.AnimalTagAssignment.destroy({
                    where: { animalId: id }
                });
                if (tags.length > 0) {
                    console.log('Updating tags:', tags);
                    const tagAssignments = tags.map((tagId) => ({
                        animalId: parseInt(id),
                        tagId: tagId,
                    }));
                    await animalAssociations_1.AnimalTagAssignment.bulkCreate(tagAssignments);
                }
            }
            const updatedAnimal = await animalAssociations_1.Animal.findByPk(id, {
                include: [
                    {
                        model: animalAssociations_1.AnimalSpecies,
                        as: 'species',
                    },
                    {
                        model: User_1.User,
                        as: 'owner',
                        attributes: ['id', 'name', 'email'],
                    },
                    {
                        model: animalAssociations_1.AnimalProperty,
                        as: 'properties',
                    },
                    {
                        model: animalAssociations_1.AnimalTag,
                        as: 'tags',
                        through: { attributes: [] },
                    },
                ],
            });
            if (seoUrl) {
                try {
                    await qrCodeService_1.default.generateAnimalQRCode(parseInt(id), seoUrl);
                    console.log(`QR code updated for animal ${id} with SEO URL: ${seoUrl}`);
                }
                catch (qrError) {
                    console.error('Failed to generate QR code:', qrError);
                }
            }
            return res.json({
                success: true,
                message: 'Animal updated successfully',
                data: updatedAnimal,
            });
        }
        catch (error) {
            console.error('Error updating animal:', error);
            return res.status(500).json({
                success: false,
                message: 'Error updating animal',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    static async delete(req, res) {
        try {
            const { id } = req.params;
            const userId = req.headers['x-user-id'];
            let whereClause = { id, isActive: true };
            const hasAdminAccess = true;
            if (!hasAdminAccess && userId) {
                whereClause.ownerId = userId;
            }
            const animal = await animalAssociations_1.Animal.findOne({ where: whereClause });
            if (!animal) {
                return res.status(404).json({
                    success: false,
                    message: 'Animal not found',
                });
            }
            await animal.update({ isActive: false });
            return res.json({
                success: true,
                message: 'Animal deleted successfully',
            });
        }
        catch (error) {
            console.error('Error deleting animal:', error);
            return res.status(500).json({
                success: false,
                message: 'Error deleting animal',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    static async uploadImages(req, res) {
        try {
            const { id } = req.params;
            const files = req.files;
            const userId = req.headers['x-user-id'];
            if (!files || files.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No files uploaded',
                });
            }
            const animal = await animalAssociations_1.Animal.findByPk(id);
            if (!animal) {
                return res.status(404).json({
                    success: false,
                    message: 'Animal not found',
                });
            }
            const hasAccess = true;
            if (!hasAccess) {
                return res.status(403).json({
                    success: false,
                    message: 'Permission denied',
                });
            }
            const uploadedImages = [];
            const uploadsDir = path_1.default.join(__dirname, '../../uploads/animals');
            const errors = [];
            for (const file of files) {
                try {
                    const processedPath = path_1.default.join(uploadsDir, `processed-${file.filename}`);
                    await (0, upload_1.processImage)(file.path, processedPath, {
                        width: 800,
                        height: 600,
                        quality: 85
                    });
                    const thumbPath = path_1.default.join(uploadsDir, `thumb-${file.filename}`);
                    await (0, upload_1.generateThumbnail)(file.path, thumbPath);
                    const imageRecord = await animalAssociations_1.AnimalImage.create({
                        animalId: parseInt(id),
                        filename: file.filename,
                        originalName: file.originalname,
                        processedFilename: `processed-${file.filename}`,
                        thumbnailFilename: `thumb-${file.filename}`,
                        mimeType: file.mimetype,
                        size: file.size,
                        isPrimary: uploadedImages.length === 0,
                        uploadedBy: userId ? parseInt(userId) : 1,
                    });
                    uploadedImages.push({
                        id: imageRecord.id,
                        filename: imageRecord.filename,
                        originalName: imageRecord.originalName,
                        url: `/uploads/animals/${imageRecord.processedFilename}`,
                        thumbnailUrl: `/uploads/animals/${imageRecord.thumbnailFilename}`,
                        isPrimary: imageRecord.isPrimary,
                    });
                    (0, upload_1.deleteImageFile)(file.path);
                }
                catch (error) {
                    console.error('Error processing image:', error);
                    errors.push(`Failed to process ${file.originalname}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                    (0, upload_1.deleteImageFile)(file.path);
                }
            }
            if (errors.length > 0 && uploadedImages.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'All images failed to process',
                    errors: errors,
                });
            }
            return res.json({
                success: true,
                message: uploadedImages.length > 0 ? 'Images uploaded successfully' : 'Some images failed to process',
                data: uploadedImages,
                errors: errors.length > 0 ? errors : undefined,
            });
        }
        catch (error) {
            console.error('Error uploading images:', error);
            return res.status(500).json({
                success: false,
                message: 'Error uploading images',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    static async deleteImage(req, res) {
        try {
            const { id, imageId } = req.params;
            const userId = req.headers['x-user-id'];
            const image = await animalAssociations_1.AnimalImage.findOne({
                where: { id: imageId, animalId: id },
                include: [{
                        model: animalAssociations_1.Animal,
                        as: 'animal',
                    }],
            });
            if (!image) {
                return res.status(404).json({
                    success: false,
                    message: 'Image not found',
                });
            }
            const hasAccess = true;
            if (!hasAccess) {
                return res.status(403).json({
                    success: false,
                    message: 'Permission denied',
                });
            }
            const uploadsDir = path_1.default.join(__dirname, '../../uploads/animals');
            (0, upload_1.deleteImageFile)(path_1.default.join(uploadsDir, image.filename));
            (0, upload_1.deleteImageFile)(path_1.default.join(uploadsDir, `processed-${image.filename}`));
            (0, upload_1.deleteImageFile)(path_1.default.join(uploadsDir, `thumb-${image.filename}`));
            await image.destroy();
            return res.json({
                success: true,
                message: 'Image deleted successfully',
            });
        }
        catch (error) {
            console.error('Error deleting image:', error);
            return res.status(500).json({
                success: false,
                message: 'Error deleting image',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    static async setPrimaryImage(req, res) {
        try {
            const { id, imageId } = req.params;
            const userId = req.headers['x-user-id'];
            const animal = await animalAssociations_1.Animal.findByPk(id);
            if (!animal) {
                return res.status(404).json({
                    success: false,
                    message: 'Animal not found',
                });
            }
            const hasAccess = true;
            if (!hasAccess) {
                return res.status(403).json({
                    success: false,
                    message: 'Permission denied',
                });
            }
            await animalAssociations_1.AnimalImage.update({ isPrimary: false }, { where: { animalId: id } });
            const updatedRows = await animalAssociations_1.AnimalImage.update({ isPrimary: true }, { where: { id: imageId, animalId: id } });
            if (updatedRows[0] === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Image not found',
                });
            }
            return res.json({
                success: true,
                message: 'Primary image updated successfully',
            });
        }
        catch (error) {
            console.error('Error setting primary image:', error);
            return res.status(500).json({
                success: false,
                message: 'Error setting primary image',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    static async generateQRCode(req, res) {
        try {
            const { id } = req.params;
            const { format = 'png', size = 256, includeText = false, customText = '', download = false } = req.method === 'POST' ? req.body : req.query;
            const animal = await animalAssociations_1.Animal.findByPk(id, {
                include: [
                    {
                        model: animalAssociations_1.AnimalSpecies,
                        as: 'species',
                        attributes: ['name', 'category'],
                    },
                    {
                        model: User_1.User,
                        as: 'owner',
                        attributes: ['name'],
                    },
                ],
            });
            if (!animal) {
                return res.status(404).json({
                    success: false,
                    message: 'Animal not found',
                });
            }
            if (!animal.seoUrl) {
                return res.status(400).json({
                    success: false,
                    message: 'Animal must have a SEO URL to generate QR code',
                });
            }
            const baseUrl = process.env.CLIENT_URL || 'http://localhost:8080';
            const shareableUrl = `${baseUrl}/animal/${animal.seoUrl}`;
            const qrOptions = {
                width: parseInt(size) || 256,
                margin: 2,
                errorCorrectionLevel: 'M',
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            };
            if (download && format !== 'png') {
                const filename = `animal-${id}-${animal.seoUrl}.${format}`;
                const filePath = await qrCodeService_1.default.generateFile(shareableUrl, filename, qrOptions);
                res.download(filePath, filename);
                return res;
            }
            else {
                const dataURL = await qrCodeService_1.default.generateDataURL(shareableUrl, qrOptions);
                if (download) {
                    const base64Data = dataURL.replace(/^data:image\/\w+;base64,/, '');
                    const buffer = Buffer.from(base64Data, 'base64');
                    res.setHeader('Content-Type', 'image/png');
                    res.setHeader('Content-Disposition', `attachment; filename="animal-${id}-${animal.seoUrl}.png"`);
                    return res.send(buffer);
                }
                return res.json({
                    success: true,
                    data: {
                        qrCodeUrl: dataURL,
                        seoUrl: animal.seoUrl,
                        shareableUrl,
                        format,
                        size: parseInt(size) || 256,
                    },
                });
            }
        }
        catch (error) {
            console.error('Error generating QR code:', error);
            return res.status(500).json({
                success: false,
                message: 'Error generating QR code',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    static async checkSeoUrl(req, res) {
        try {
            const { seoUrl } = req.params;
            const { excludeId } = req.query;
            let whereClause = { seoUrl };
            if (excludeId) {
                whereClause.id = { [sequelize_1.Op.ne]: excludeId };
            }
            const existingAnimal = await animalAssociations_1.Animal.findOne({
                where: whereClause,
                attributes: ['id', 'name'],
            });
            return res.json({
                success: true,
                data: {
                    available: !existingAnimal,
                    conflictsWith: existingAnimal ? {
                        id: existingAnimal.id,
                        name: existingAnimal.name,
                    } : null,
                },
            });
        }
        catch (error) {
            console.error('Error checking SEO URL:', error);
            return res.status(500).json({
                success: false,
                message: 'Error checking SEO URL',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    static async suggestSeoUrl(req, res) {
        try {
            const { name } = req.body;
            if (!name || typeof name !== 'string') {
                return res.status(400).json({
                    success: false,
                    message: 'Name is required',
                });
            }
            let baseSeoUrl = name
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');
            const suggestions = [baseSeoUrl];
            for (let i = 1; i <= 5; i++) {
                suggestions.push(`${baseSeoUrl}-${i}`);
            }
            const existingUrls = await animalAssociations_1.Animal.findAll({
                where: {
                    seoUrl: {
                        [sequelize_1.Op.in]: suggestions,
                    },
                },
                attributes: ['seoUrl'],
            });
            const existingSet = new Set(existingUrls.map(animal => animal.seoUrl));
            const availableSuggestions = suggestions.filter(url => !existingSet.has(url));
            return res.json({
                success: true,
                data: {
                    suggestions: availableSuggestions.slice(0, 3),
                    baseSuggestion: availableSuggestions[0] || `${baseSeoUrl}-${Date.now()}`,
                },
            });
        }
        catch (error) {
            console.error('Error generating SEO URL suggestions:', error);
            return res.status(500).json({
                success: false,
                message: 'Error generating SEO URL suggestions',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
}
exports.AnimalController = AnimalController;
