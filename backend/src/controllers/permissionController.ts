import { Request, Response, NextFunction } from 'express';
import { Permission, User, UserPermission } from '../models';
import { Op } from 'sequelize';

interface PaginationQuery {
  page?: string;
  limit?: string;
  search?: string;
  category?: string;
}

// Get all permissions
export const getAllPermissions = async (req: Request<{}, {}, {}, PaginationQuery>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page || '1');
    const limit = parseInt(req.query.limit || '10');
    const search = req.query.search || '';
    const category = req.query.category || '';
    
    const offset = (page - 1) * limit;
    
    const whereClause: any = {};
    
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { code: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }
    
    if (category) {
      whereClause.category = category;
    }

    const { count, rows } = await Permission.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['category', 'ASC'], ['name', 'ASC']],
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get user permissions
export const getUserPermissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = parseInt(req.params.userId);
    
    const userPermissions = await UserPermission.findAll({
      where: { userId },
      include: [
        {
          model: Permission,
          as: 'permission',
        },
        {
          model: User,
          as: 'grantedByUser',
          attributes: ['id', 'name', 'email'],
        },
      ],
      order: [['permission', 'category', 'ASC'], ['permission', 'name', 'ASC']],
    });

    res.json({
      success: true,
      data: userPermissions,
    });
  } catch (error) {
    next(error);
  }
};

// Grant permission to user
export const grantPermission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, permissionId, grantedBy, expiresAt } = req.body;
    
    const userPermission = await UserPermission.upsert({
      userId,
      permissionId,
      granted: true,
      grantedBy,
      grantedAt: new Date(),
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    });

    const result = await UserPermission.findOne({
      where: { userId, permissionId },
      include: [
        {
          model: Permission,
          as: 'permission',
        },
        {
          model: User,
          as: 'grantedByUser',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Permission granted successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Revoke permission from user
export const revokePermission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, permissionId } = req.params;
    
    const deleted = await UserPermission.destroy({
      where: {
        userId: parseInt(userId),
        permissionId: parseInt(permissionId),
      },
    });

    if (deleted === 0) {
      res.status(404).json({
        success: false,
        message: 'Permission not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Permission revoked successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Create new permission
export const createPermission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const permissionData = req.body;
    const permission = await Permission.create(permissionData);

    res.status(201).json({
      success: true,
      message: 'Permission created successfully',
      data: permission,
    });
  } catch (error) {
    next(error);
  }
};

// Get permission categories
export const getPermissionCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categories = await Permission.findAll({
      attributes: ['category'],
      group: ['category'],
      order: [['category', 'ASC']],
    });

    const categoryList = categories.map(item => item.category);

    res.json({
      success: true,
      data: categoryList,
    });
  } catch (error) {
    next(error);
  }
};