"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeUserPassword = exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getAllUsers = void 0;
const User_1 = require("../models/User");
const sequelize_1 = require("sequelize");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
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
        console.log('=== updateUser controller ===');
        console.log('User ID:', id);
        console.log('Received userData:', userData);
        const user = await User_1.User.findByPk(id);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        console.log('Current user data:', user.toJSON());
        await user.update(userData);
        console.log('Updated user data:', user.toJSON());
        res.json({
            success: true,
            message: 'User updated successfully',
            data: user,
        });
    }
    catch (error) {
        console.error('Error in updateUser:', error);
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
const changeUserPassword = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { password } = req.body;
        if (!password) {
            res.status(400).json({
                success: false,
                message: 'Password is required',
            });
            return;
        }
        if (password.length < 6) {
            res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long',
            });
            return;
        }
        const user = await User_1.User.findByPk(id);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        if (user.provider !== 'local') {
            res.status(400).json({
                success: false,
                message: 'Cannot change password for OAuth users',
            });
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        await user.update({ password: hashedPassword });
        res.json({
            success: true,
            message: 'Password changed successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.changeUserPassword = changeUserPassword;
