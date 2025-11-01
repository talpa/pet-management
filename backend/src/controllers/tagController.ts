import { Request, Response } from 'express';
import { Op } from 'sequelize';
import AnimalTag from '../models/AnimalTag';
import AnimalTagAssignment from '../models/AnimalTagAssignment';
import Animal from '../models/Animal';

export const getTags = async (req: Request, res: Response) => {
  try {
    const { search, active = 'true' } = req.query;
    
    const whereClause: any = {};
    
    if (active === 'true') {
      whereClause.isActive = true;
    }
    
    if (search) {
      whereClause.name = {
        [Op.iLike]: `%${search}%`
      };
    }

    const tags = await AnimalTag.findAll({
      where: whereClause,
      order: [['name', 'ASC']],
      include: [
        {
          model: AnimalTagAssignment,
          as: 'animalAssignments',
          attributes: ['id'],
          required: false,
        }
      ]
    });

    // Add usage count for each tag
    const tagsWithCount = tags.map(tag => {
      const assignments = tag.get('animalAssignments') as any[];
      return {
        ...tag.toJSON(),
        usageCount: assignments?.length || 0
      };
    });

    res.json({
      success: true,
      data: tagsWithCount,
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tags',
    });
  }
};

export const createTag = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, color = '#1976d2' } = req.body;

    if (!name) {
      res.status(400).json({
        success: false,
        message: 'Tag name is required',
      });
      return;
    }

    // Check if tag already exists
    const existingTag = await AnimalTag.findOne({
      where: { name: name.trim() }
    });

    if (existingTag) {
      res.status(409).json({
        success: false,
        message: 'Tag with this name already exists',
      });
      return;
    }

    const tag = await AnimalTag.create({
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
  } catch (error) {
    console.error('Error creating tag:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create tag',
    });
  }
};

export const updateTag = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, color, isActive } = req.body;

    const tag = await AnimalTag.findByPk(id);

    if (!tag) {
      res.status(404).json({
        success: false,
        message: 'Tag not found',
      });
      return;
    }

    // Check if name already exists for other tags
    if (name && name.trim() !== tag.name) {
      const existingTag = await AnimalTag.findOne({
        where: { 
          name: name.trim(),
          id: { [Op.ne]: id }
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
  } catch (error) {
    console.error('Error updating tag:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update tag',
    });
  }
};

export const deleteTag = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const tag = await AnimalTag.findByPk(id);

    if (!tag) {
      res.status(404).json({
        success: false,
        message: 'Tag not found',
      });
      return;
    }

    // Check if tag is used by any animals
    const usageCount = await AnimalTagAssignment.count({
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
  } catch (error) {
    console.error('Error deleting tag:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete tag',
    });
  }
};

export const assignTagsToAnimal = async (req: Request, res: Response): Promise<void> => {
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

    // Verify animal exists
    const animal = await Animal.findByPk(animalId);
    if (!animal) {
      res.status(404).json({
        success: false,
        message: 'Animal not found',
      });
      return;
    }

    // Verify all tags exist
    const tags = await AnimalTag.findAll({
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

    // Remove existing tag assignments
    await AnimalTagAssignment.destroy({
      where: { animalId }
    });

    // Create new assignments
    if (tagIds.length > 0) {
      const assignments = tagIds.map((tagId: number) => ({
        animalId: parseInt(animalId),
        tagId
      }));

      await AnimalTagAssignment.bulkCreate(assignments);
    }

    res.json({
      success: true,
      message: 'Tags assigned successfully',
    });
  } catch (error) {
    console.error('Error assigning tags:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign tags',
    });
  }
};

export const getAnimalTags = async (req: Request, res: Response) => {
  try {
    const { animalId } = req.params;

    const assignments = await AnimalTagAssignment.findAll({
      where: { animalId },
      include: [
        {
          model: AnimalTag,
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
  } catch (error) {
    console.error('Error fetching animal tags:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch animal tags',
    });
  }
};