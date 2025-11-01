"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getAllUsers = void 0;
const User_1 = require("../models/User");
const sequelize_1 = require("sequelize");
const getAllUsers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page || '1');
        const limit = parseInt(req.query.limit || '10');
        const search = req.query.search || '';
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder || 'DESC';
        const offset = (page - 1) * limit;
        const whereClause = search
            ? {
                [sequelize_1.Op.or]: [
                    { name: { [sequelize_1.Op.iLike]: `%${search}%` } },
                    { email: { [sequelize_1.Op.iLike]: `%${search}%` } },
                    { role: { [sequelize_1.Op.iLike]: `%${search}%` } },
                ],
            }
            : {};
        const { count, rows } = await User_1.User.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [[sortBy, sortOrder]],
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
exports.getAllUsers = getAllUsers;
const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User_1.User.findByPk(id);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        res.json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserById = getUserById;
const createUser = async (req, res, next) => {
    try {
        const userData = req.body;
        const user = await User_1.User.create(userData);
        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: user,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createUser = createUser;
const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userData = req.body;
        const user = await User_1.User.findByPk(id);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        await user.update(userData);
        res.json({
            success: true,
            message: 'User updated successfully',
            data: user,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User_1.User.findByPk(id);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        await user.destroy();
        res.json({
            success: true,
            message: 'User deleted successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteUser = deleteUser;
//# sourceMappingURL=userController.js.map