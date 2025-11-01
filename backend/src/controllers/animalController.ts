import { Request, Response } from 'express';
import { Animal, AnimalSpecies, AnimalProperty, AnimalImage, AnimalTag, AnimalTagAssignment } from '../models/animalAssociations';
import SpeciesProperty from '../models/SpeciesProperty';
import { User } from '../models/User';
import { Op } from 'sequelize';
import { processImage, generateThumbnail, deleteImageFile } from '../middleware/upload';
import QRCodeService from '../services/qrCodeService';
import path from 'path';
import fs from 'fs';

// Helper function to add URLs to image data
const transformImageData = (images: any[]) => {
  return images.map((image: any) => {
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

// Helper function to transform animal data with images
const transformAnimalData = (animal: any) => {
  const animalJson = animal.toJSON();
  
  // Add owner name for frontend compatibility
  if (animalJson.owner) {
    animalJson.ownerName = animalJson.owner.name;
    animalJson.ownerId = animalJson.owner.id;
  }
  
  if (animalJson.images && animalJson.images.length > 0) {
    animalJson.images = transformImageData(animal.images);
  }
  return animalJson;
};

export class AnimalController {
  // Get all animals (with permission check)
  static async getAll(req: Request, res: Response) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        search, 
        speciesId, 
        ownerId, 
        gender, 
        tags, 
        sortBy = 'created_at', 
        sortOrder = 'DESC' 
      } = req.query;
      const user = (req as any).user;
      const offset = (Number(page) - 1) * Number(limit);

      let whereClause: any = { isActive: true };
      let includeClause: any[] = [
        {
          model: AnimalSpecies,
          as: 'species',
          attributes: ['id', 'name', 'scientificName', 'category'],
        },
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: AnimalProperty,
          as: 'properties',
        },
        {
          model: AnimalImage,
          as: 'images',
          required: false,
        },
        {
          model: AnimalTag,
          as: 'tags',
          through: { attributes: [] }, // Don't include junction table data
          required: false,
        },
      ];

      // Permission check - if not admin, only show own animals
      const isAdmin = user && user.role === 'admin';
      if (!isAdmin && user) {
        whereClause.ownerId = user.id;
      }

      // If no user and not admin, only show public animals (for public gallery)
      if (!user) {
        // For public access, we can show all animals or implement specific public logic
        // For now, let's allow public access to view all animals
      }

      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ];
      }

      if (speciesId) {
        whereClause.speciesId = speciesId;
      }

      if (ownerId && isAdmin) {
        whereClause.ownerId = ownerId;
      }

      if (gender) {
        whereClause.gender = gender;
      }

      // Tag filtering
      if (tags) {
        // Parse tags - can be array or comma-separated string
        let tagArray: string[];
        if (Array.isArray(tags)) {
          tagArray = tags as string[];
        } else {
          tagArray = (tags as string).split(',').map(tag => tag.trim());
        }
        if (tagArray.length > 0) {
          // Filter by animals that have any of the specified tags (OR logic)
          // First find tag IDs for the given names
          const tagRecords = await AnimalTag.findAll({
            where: { name: { [Op.in]: tagArray as string[] } },
            attributes: ['id']
          });
          
          if (tagRecords.length > 0) {
            const tagIds = tagRecords.map(tag => tag.id);
            // Find all animals that have any of these tags
            const animalTagAssignments = await AnimalTagAssignment.findAll({
              where: { tagId: { [Op.in]: tagIds } },
              attributes: ['animalId']
            });
            
            const animalIds = [...new Set(animalTagAssignments.map(ata => ata.animalId))];
            if (animalIds.length > 0) {
              whereClause.id = { [Op.in]: animalIds };
            } else {
              whereClause.id = { [Op.in]: [] };
            }
          } else {
            // No tags found, return empty result
            whereClause.id = { [Op.in]: [] };
          }
        }
      }

      // Validate sort parameters
      const validSortFields = ['created_at', 'updated_at', 'name', 'birthDate'];
      const validSortOrders = ['ASC', 'DESC'];
      const finalSortBy = validSortFields.includes(sortBy as string) ? sortBy as string : 'created_at';
      const finalSortOrder = validSortOrders.includes((sortOrder as string).toUpperCase()) ? (sortOrder as string).toUpperCase() : 'DESC';

      const { count, rows: animals } = await Animal.findAndCountAll({
        where: whereClause,
        include: includeClause,
        order: [[finalSortBy, finalSortOrder]],
        limit: Number(limit),
        offset,
        distinct: true, // Important for many-to-many associations
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
    } catch (error) {
      console.error('Error fetching animals:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching animals',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get single animal by ID
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.headers['x-user-id'] as string;

      let whereClause: any = { id, isActive: true };

      // Permission check
      const hasAdminAccess = true; // TODO: Implement proper permission check
      if (!hasAdminAccess && userId) {
        whereClause.ownerId = userId;
      }

      const animal = await Animal.findOne({
        where: whereClause,
        include: [
          {
            model: AnimalSpecies,
            as: 'species',
            include: [{
              model: require('../models/SpeciesProperty').default,
              as: 'properties',
              order: [['displayOrder', 'ASC']],
            }],
          },
          {
            model: User,
            as: 'owner',
            attributes: ['id', 'name', 'email'],
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'name', 'email'],
          },
          {
            model: AnimalProperty,
            as: 'properties',
          },
          {
            model: AnimalImage,
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
    } catch (error) {
      console.error('Error fetching animal:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching animal',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get animal by SEO URL
  static async getBySeoUrl(req: Request, res: Response) {
    try {
      const { seoUrl } = req.params;

      // Public endpoint - no authentication required, only active animals
      const whereClause: any = { seoUrl, isActive: true };

      const animal = await Animal.findOne({
        where: whereClause,
        include: [
          {
            model: AnimalSpecies,
            as: 'species',
            include: [{
              model: require('../models/SpeciesProperty').default,
              as: 'properties',
              order: [['displayOrder', 'ASC']],
            }],
          },
          {
            model: User,
            as: 'owner',
            attributes: ['id', 'name', 'email'],
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'name', 'email'],
          },
          {
            model: AnimalProperty,
            as: 'properties',
          },
          {
            model: AnimalImage,
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
    } catch (error) {
      console.error('Error fetching animal by SEO URL:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching animal',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Create new animal
  static async create(req: Request, res: Response) {
    try {
      const { name, speciesId, ownerId, birthDate, gender, description, seoUrl, properties = [], tags = [] } = req.body;
      const userId = req.headers['x-user-id'] as string;

      const animal = await Animal.create({
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

      // Create properties if provided
      if (properties.length > 0) {
        console.log('Properties received:', JSON.stringify(properties, null, 2));
        
        // Get property details for each speciesPropertyId
        const speciesPropertyIds = properties.map((p: any) => p.speciesPropertyId);
        console.log('SpeciesPropertyIds:', speciesPropertyIds);
        
        const speciesProperties = await SpeciesProperty.findAll({
          where: { id: speciesPropertyIds }
        });
        console.log('SpeciesProperties found:', JSON.stringify(speciesProperties.map(sp => ({ id: sp.id, propertyName: sp.propertyName })), null, 2));

        const animalProperties = properties.map((prop: any) => {
          const speciesProperty = speciesProperties.find((sp: any) => sp.id === prop.speciesPropertyId);
          return {
            animalId: animal.id,
            propertyName: speciesProperty?.propertyName || `Property ${prop.speciesPropertyId}`,
            propertyValue: prop.value,
            notes: prop.notes || null,
          };
        });

        console.log('AnimalProperties to create:', JSON.stringify(animalProperties, null, 2));
        await AnimalProperty.bulkCreate(animalProperties);
      }

      // Assign tags if provided
      if (tags.length > 0) {
        console.log('Tags to assign:', tags);
        const tagAssignments = tags.map((tagId: number) => ({
          animalId: animal.id,
          tagId: tagId,
        }));
        await AnimalTagAssignment.bulkCreate(tagAssignments);
      }

      // Fetch the created animal with all associations
      const createdAnimal = await Animal.findByPk(animal.id, {
        include: [
          {
            model: AnimalSpecies,
            as: 'species',
          },
          {
            model: User,
            as: 'owner',
            attributes: ['id', 'name', 'email'],
          },
          {
            model: AnimalProperty,
            as: 'properties',
          },
          {
            model: AnimalTag,
            as: 'tags',
            through: { attributes: [] },
          },
        ],
      });

      // Generate QR code if seoUrl is provided
      if (seoUrl) {
        try {
          await QRCodeService.generateAnimalQRCode(animal.id, seoUrl);
          console.log(`QR code generated for animal ${animal.id} with SEO URL: ${seoUrl}`);
        } catch (qrError) {
          console.error('Failed to generate QR code:', qrError);
          // Don't fail the animal creation if QR code generation fails
        }
      }

      res.status(201).json({
        success: true,
        message: 'Animal created successfully',
        data: createdAnimal,
      });
    } catch (error) {
      console.error('Error creating animal:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating animal',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Update animal
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, speciesId, ownerId, birthDate, gender, description, seoUrl, properties, tags } = req.body;
      const userId = req.headers['x-user-id'] as string;

      let whereClause: any = { id, isActive: true };

      // Permission check
      const hasAdminAccess = true; // TODO: Implement proper permission check
      if (!hasAdminAccess && userId) {
        whereClause.ownerId = userId;
      }

      const animal = await Animal.findOne({ where: whereClause });
      if (!animal) {
        return res.status(404).json({
          success: false,
          message: 'Animal not found',
        });
      }

      // Update animal
      await animal.update({
        name,
        speciesId,
        ownerId: ownerId || animal.ownerId, // Update owner only if provided
        birthDate,
        gender,
        description,
        seoUrl,
      });

      // Update properties if provided
      if (properties && Array.isArray(properties)) {
        // Delete existing properties
        await AnimalProperty.destroy({
          where: { animalId: id }
        });

        // Create new properties
        if (properties.length > 0) {
          console.log('Updating properties:', JSON.stringify(properties, null, 2));
          
          // Get species property details to get propertyName
          const speciesPropertyIds = properties.map((prop: any) => prop.speciesPropertyId);
          const speciesProperties = await SpeciesProperty.findAll({
            where: { id: speciesPropertyIds }
          });
          console.log('SpeciesProperties found for update:', JSON.stringify(speciesProperties.map(sp => ({ id: sp.id, propertyName: sp.propertyName })), null, 2));

          const animalProperties = properties.map((prop: any) => {
            const speciesProperty = speciesProperties.find((sp: any) => sp.id === prop.speciesPropertyId);
            return {
              animalId: parseInt(id), // Convert string to number
              propertyName: speciesProperty?.propertyName || `Property ${prop.speciesPropertyId}`,
              propertyValue: prop.value,
              notes: prop.notes || null,
            };
          });

          console.log('AnimalProperties to update:', JSON.stringify(animalProperties, null, 2));
          await AnimalProperty.bulkCreate(animalProperties);
        }
      }

      // Update tags if provided
      if (tags !== undefined && Array.isArray(tags)) {
        // Delete existing tag assignments
        await AnimalTagAssignment.destroy({
          where: { animalId: id }
        });

        // Create new tag assignments
        if (tags.length > 0) {
          console.log('Updating tags:', tags);
          const tagAssignments = tags.map((tagId: number) => ({
            animalId: parseInt(id),
            tagId: tagId,
          }));
          await AnimalTagAssignment.bulkCreate(tagAssignments);
        }
      }

      // Fetch updated animal
      const updatedAnimal = await Animal.findByPk(id, {
        include: [
          {
            model: AnimalSpecies,
            as: 'species',
          },
          {
            model: User,
            as: 'owner',
            attributes: ['id', 'name', 'email'],
          },
          {
            model: AnimalProperty,
            as: 'properties',
          },
          {
            model: AnimalTag,
            as: 'tags',
            through: { attributes: [] },
          },
        ],
      });

      // Generate QR code if seoUrl is provided and changed
      if (seoUrl) {
        try {
          await QRCodeService.generateAnimalQRCode(parseInt(id), seoUrl);
          console.log(`QR code updated for animal ${id} with SEO URL: ${seoUrl}`);
        } catch (qrError) {
          console.error('Failed to generate QR code:', qrError);
          // Don't fail the animal update if QR code generation fails
        }
      }

      return res.json({
        success: true,
        message: 'Animal updated successfully',
        data: updatedAnimal,
      });
    } catch (error) {
      console.error('Error updating animal:', error);
      return res.status(500).json({
        success: false,
        message: 'Error updating animal',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Delete animal (soft delete)
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.headers['x-user-id'] as string;

      let whereClause: any = { id, isActive: true };

      // Permission check
      const hasAdminAccess = true; // TODO: Implement proper permission check
      if (!hasAdminAccess && userId) {
        whereClause.ownerId = userId;
      }

      const animal = await Animal.findOne({ where: whereClause });
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
    } catch (error) {
      console.error('Error deleting animal:', error);
      return res.status(500).json({
        success: false,
        message: 'Error deleting animal',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Upload images for animal
  static async uploadImages(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const files = req.files as Express.Multer.File[];
      const userId = req.headers['x-user-id'] as string;

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded',
        });
      }

      // Check if animal exists and user has permission
      const animal = await Animal.findByPk(id);
      if (!animal) {
        return res.status(404).json({
          success: false,
          message: 'Animal not found',
        });
      }

      // TODO: Add proper permission check
      const hasAccess = true; // animal.ownerId.toString() === userId || hasAdminAccess;

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Permission denied',
        });
      }

      const uploadedImages = [];
      const uploadsDir = path.join(__dirname, '../../uploads/animals');
      const errors = [];

      for (const file of files) {
        try {
          // Process main image
          const processedPath = path.join(uploadsDir, `processed-${file.filename}`);
          await processImage(file.path, processedPath, {
            width: 800,
            height: 600,
            quality: 85
          });

          // Generate thumbnail
          const thumbPath = path.join(uploadsDir, `thumb-${file.filename}`);
          await generateThumbnail(file.path, thumbPath);

          // Save to database
          const imageRecord: any = await AnimalImage.create({
            animalId: parseInt(id),
            filename: file.filename,
            originalName: file.originalname,
            processedFilename: `processed-${file.filename}`,
            thumbnailFilename: `thumb-${file.filename}`,
            mimeType: file.mimetype,
            size: file.size,
            isPrimary: uploadedImages.length === 0, // First image is primary
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

          // Delete original file
          deleteImageFile(file.path);
        } catch (error) {
          console.error('Error processing image:', error);
          errors.push(`Failed to process ${file.originalname}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          // Clean up on error
          deleteImageFile(file.path);
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
    } catch (error) {
      console.error('Error uploading images:', error);
      return res.status(500).json({
        success: false,
        message: 'Error uploading images',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Delete animal image
  static async deleteImage(req: Request, res: Response): Promise<Response> {
    try {
      const { id, imageId } = req.params;
      const userId = req.headers['x-user-id'] as string;

      const image = await AnimalImage.findOne({
        where: { id: imageId, animalId: id },
        include: [{
          model: Animal,
          as: 'animal',
        }],
      });

      if (!image) {
        return res.status(404).json({
          success: false,
          message: 'Image not found',
        });
      }

      // TODO: Add proper permission check
      const hasAccess = true;

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Permission denied',
        });
      }

      // Delete files
      const uploadsDir = path.join(__dirname, '../../uploads/animals');
      deleteImageFile(path.join(uploadsDir, image.filename));
      deleteImageFile(path.join(uploadsDir, `processed-${image.filename}`));
      deleteImageFile(path.join(uploadsDir, `thumb-${image.filename}`));

      // Delete from database
      await image.destroy();

      return res.json({
        success: true,
        message: 'Image deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting image:', error);
      return res.status(500).json({
        success: false,
        message: 'Error deleting image',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Set primary image
  static async setPrimaryImage(req: Request, res: Response): Promise<Response> {
    try {
      const { id, imageId } = req.params;
      const userId = req.headers['x-user-id'] as string;

      const animal = await Animal.findByPk(id);
      if (!animal) {
        return res.status(404).json({
          success: false,
          message: 'Animal not found',
        });
      }

      // TODO: Add proper permission check
      const hasAccess = true;

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Permission denied',
        });
      }

      // Reset all images to non-primary
      await AnimalImage.update(
        { isPrimary: false },
        { where: { animalId: id } }
      );

      // Set selected image as primary
      const updatedRows = await AnimalImage.update(
        { isPrimary: true },
        { where: { id: imageId, animalId: id } }
      );

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
    } catch (error) {
      console.error('Error setting primary image:', error);
      return res.status(500).json({
        success: false,
        message: 'Error setting primary image',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Generate QR code for animal
  static async generateQRCode(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { format = 'png', size = 256, includeText = false, customText = '', download = false } = req.method === 'POST' ? req.body : req.query;

      const animal = await Animal.findByPk(id, {
        include: [
          {
            model: AnimalSpecies,
            as: 'species',
            attributes: ['name', 'category'],
          },
          {
            model: User,
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
      
      // QR code options based on request
      const qrOptions = {
        width: parseInt(size as string) || 256,
        margin: 2,
        errorCorrectionLevel: 'M' as const,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      };

      if (download && format !== 'png') {
        // For file download, generate file and send as blob
        const filename = `animal-${id}-${animal.seoUrl}.${format}`;
        const filePath = await QRCodeService.generateFile(shareableUrl, filename, qrOptions);
        
        res.download(filePath, filename);
        return res;
      } else {
        // For display/download, generate data URL
        const dataURL = await QRCodeService.generateDataURL(shareableUrl, qrOptions);
        
        if (download) {
          // Convert data URL to buffer and send as download
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
            size: parseInt(size as string) || 256,
          },
        });
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      return res.status(500).json({
        success: false,
        message: 'Error generating QR code',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Check SEO URL availability
  static async checkSeoUrl(req: Request, res: Response): Promise<Response> {
    try {
      const { seoUrl } = req.params;
      const { excludeId } = req.query;

      let whereClause: any = { seoUrl };
      if (excludeId) {
        whereClause.id = { [Op.ne]: excludeId };
      }

      const existingAnimal = await Animal.findOne({
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
    } catch (error) {
      console.error('Error checking SEO URL:', error);
      return res.status(500).json({
        success: false,
        message: 'Error checking SEO URL',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Generate SEO URL suggestion
  static async suggestSeoUrl(req: Request, res: Response): Promise<Response> {
    try {
      const { name } = req.body;

      if (!name || typeof name !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Name is required',
        });
      }

      // Generate base SEO URL
      let baseSeoUrl = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

      // Check availability and suggest alternatives
      const suggestions = [baseSeoUrl];
      
      for (let i = 1; i <= 5; i++) {
        suggestions.push(`${baseSeoUrl}-${i}`);
      }

      const existingUrls = await Animal.findAll({
        where: {
          seoUrl: {
            [Op.in]: suggestions,
          },
        },
        attributes: ['seoUrl'],
      });

      const existingSet = new Set(existingUrls.map(animal => animal.seoUrl));
      const availableSuggestions = suggestions.filter(url => !existingSet.has(url));

      return res.json({
        success: true,
        data: {
          suggestions: availableSuggestions.slice(0, 3), // Return top 3 suggestions
          baseSuggestion: availableSuggestions[0] || `${baseSeoUrl}-${Date.now()}`,
        },
      });
    } catch (error) {
      console.error('Error generating SEO URL suggestions:', error);
      return res.status(500).json({
        success: false,
        message: 'Error generating SEO URL suggestions',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}