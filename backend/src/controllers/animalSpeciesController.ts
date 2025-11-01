import { Request, Response } from 'express';
import { AnimalSpecies, SpeciesProperty } from '../models/animalAssociations';
import { Op } from 'sequelize';

export class AnimalSpeciesController {
  // Get all animal species with their properties
  static async getAll(req: Request, res: Response) {
    try {
      const { page = 1, limit = 20, search, category, active } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      let whereClause: any = {};

      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { scientificName: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ];
      }

      if (category) {
        whereClause.category = category;
      }

      if (active !== undefined) {
        whereClause.isActive = active === 'true';
      }

      const { count, rows: species } = await AnimalSpecies.findAndCountAll({
        where: whereClause,
        include: [{
          model: SpeciesProperty,
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
    } catch (error) {
      console.error('Error fetching animal species:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching animal species',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get single animal species by ID
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const species = await AnimalSpecies.findByPk(id, {
        include: [{
          model: SpeciesProperty,
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
    } catch (error) {
      console.error('Error fetching animal species:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching animal species',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Create new animal species
  static async create(req: Request, res: Response) {
    try {
      const { name, scientificName, description, category, isActive = true, properties = [] } = req.body;

      // Create species
      const species = await AnimalSpecies.create({
        name,
        scientificName,
        description,
        category,
        isActive,
      });

      // Create properties if provided
      if (properties.length > 0) {
        const speciesProperties = properties.map((prop: any, index: number) => ({
          ...prop,
          speciesId: species.id,
          displayOrder: prop.displayOrder !== undefined ? prop.displayOrder : index,
        }));

        await SpeciesProperty.bulkCreate(speciesProperties);
      }

      // Fetch the created species with properties
      const createdSpecies = await AnimalSpecies.findByPk(species.id, {
        include: [{
          model: SpeciesProperty,
          as: 'properties',
          order: [['displayOrder', 'ASC']],
        }],
      });

      res.status(201).json({
        success: true,
        message: 'Animal species created successfully',
        data: createdSpecies,
      });
    } catch (error) {
      console.error('Error creating animal species:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating animal species',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Update animal species
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, scientificName, description, category, isActive, properties } = req.body;

      const species = await AnimalSpecies.findByPk(id);
      if (!species) {
        return res.status(404).json({
          success: false,
          message: 'Animal species not found',
        });
      }

      // Update species
      await species.update({
        name,
        scientificName,
        description,
        category,
        isActive,
      });

      // Update properties if provided
      if (properties) {
        // Delete existing properties
        await SpeciesProperty.destroy({
          where: { speciesId: id }
        });

        // Create new properties
        if (properties.length > 0) {
          const speciesProperties = properties.map((prop: any, index: number) => ({
            ...prop,
            speciesId: id,
            displayOrder: prop.displayOrder !== undefined ? prop.displayOrder : index,
          }));

          await SpeciesProperty.bulkCreate(speciesProperties);
        }
      }

      // Fetch updated species with properties
      const updatedSpecies = await AnimalSpecies.findByPk(id, {
        include: [{
          model: SpeciesProperty,
          as: 'properties',
          order: [['displayOrder', 'ASC']],
        }],
      });

      return res.json({
        success: true,
        message: 'Animal species updated successfully',
        data: updatedSpecies,
      });
    } catch (error) {
      console.error('Error updating animal species:', error);
      return res.status(500).json({
        success: false,
        message: 'Error updating animal species',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Delete animal species
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const species = await AnimalSpecies.findByPk(id);
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
    } catch (error) {
      console.error('Error deleting animal species:', error);
      return res.status(500).json({
        success: false,
        message: 'Error deleting animal species',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get categories
  static async getCategories(req: Request, res: Response) {
    try {
      const categories = await AnimalSpecies.findAll({
        attributes: ['category'],
        where: {
          category: { [Op.ne]: null as any },
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
    } catch (error) {
      console.error('Error fetching categories:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching categories',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}