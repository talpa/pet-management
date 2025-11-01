"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPermissionCategories = exports.createPermission = exports.revokePermission = exports.grantPermission = exports.getUserPermissions = exports.getAllPermissions = void 0;
const models_1 = require("../models");
const sequelize_1 = require("sequelize");
const getAllPermissions = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page || '1');
        const limit = parseInt(req.query.limit || '10');
        const search = req.query.search || '';
        const category = req.query.category || '';
        const offset = (page - 1) * limit;
        const whereClause = {};
        if (search) {
            whereClause[sequelize_1.Op.or] = [
                { name: { [sequelize_1.Op.iLike]: `%${search}%` } },
                { code: { [sequelize_1.Op.iLike]: `%${search}%` } },
                { description: { [sequelize_1.Op.iLike]: `%${search}%` } },
            ];
        }
        if (category) {
            whereClause.category = category;
        }
        const { count, rows } = await models_1.Permission.findAndCountAll({
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
    }
    catch (error) {
        next(error);
    }
};
exports.getAllPermissions = getAllPermissions;
const getUserPermissions = async (req, res, next) => {
    try {
        const userId = parseInt(req.params.userId);
        const userPermissions = await models_1.UserPermission.findAll({
            where: { userId },
            include: [
                {
                    model: models_1.Permission,
                    as: 'permission',
                },
                {
                    model: models_1.User,
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
    }
    catch (error) {
        next(error);
    }
};
exports.getUserPermissions = getUserPermissions;
const grantPermission = async (req, res, next) => {
    try {
        const { userId, permissionId, grantedBy, expiresAt } = req.body;
        const userPermission = await models_1.UserPermission.upsert({
            userId,
            permissionId,
            granted: true,
            grantedBy,
            grantedAt: new Date(),
            expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        });
        const result = await models_1.UserPermission.findOne({
            where: { userId, permissionId },
            include: [
                {
                    model: models_1.Permission,
                    as: 'permission',
                },
                {
                    model: models_1.User,
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
    }
    catch (error) {
        next(error);
    }
};
exports.grantPermission = grantPermission;
const revokePermission = async (req, res, next) => {
    try {
        const { userId, permissionId } = req.params;
        const deleted = await models_1.UserPermission.destroy({
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
    }
    catch (error) {
        next(error);
    }
};
exports.revokePermission = revokePermission;
const createPermission = async (req, res, next) => {
    try {
        const permissionData = req.body;
        const permission = await models_1.Permission.create(permissionData);
        res.status(201).json({
            success: true,
            message: 'Permission created successfully',
            data: permission,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createPermission = createPermission;
const getPermissionCategories = async (req, res, next) => {
    try {
        const categories = await models_1.Permission.findAll({
            attributes: ['category'],
            group: ['category'],
            order: [['category', 'ASC']],
        });
        const categoryList = categories.map(item => item.category);
        res.json({
            success: true,
            data: categoryList,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getPermissionCategories = getPermissionCategories;
//# sourceMappingURL=permissionController.js.map