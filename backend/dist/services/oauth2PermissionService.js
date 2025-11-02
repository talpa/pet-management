"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OAuth2PermissionService = void 0;
const models_1 = require("../models");
const sequelize_1 = require("sequelize");
const USER_ROLE_MAPPINGS = [
    {
        email: 'talpa@suchdol.net',
        role: 'admin',
        permissions: ['users.view', 'users.create', 'users.edit', 'users.delete', 'permissions.manage']
    },
    {
        email: 'admin@example.com',
        role: 'admin',
        permissions: ['users.view', 'users.create', 'users.edit', 'users.delete', 'permissions.manage']
    },
    {
        domain: 'suchdol.net',
        role: 'user',
        permissions: ['users.view', 'users.edit']
    },
    {
        domain: '*',
        role: 'user',
        permissions: ['users.view']
    }
];
class OAuth2PermissionService {
    static async assignPermissionsToUser(user) {
        try {
            console.log(`Processing permissions for user: ${user.email}`);
            const mapping = this.findUserMapping(user.email);
            if (!mapping) {
                console.log(`No mapping found for user: ${user.email}`);
                return;
            }
            if (user.role !== mapping.role) {
                user.role = mapping.role;
                await user.save();
                console.log(`Updated user role to: ${mapping.role}`);
            }
            if (mapping.permissions && mapping.permissions.length > 0) {
                await this.assignDirectPermissions(user, mapping.permissions);
            }
            console.log(`Permissions assigned successfully to: ${user.email}`);
        }
        catch (error) {
            console.error(`Error assigning permissions to user ${user.email}:`, error);
            throw error;
        }
    }
    static findUserMapping(email) {
        let mapping = USER_ROLE_MAPPINGS.find(m => m.email === email);
        if (mapping) {
            return mapping;
        }
        const domain = email.split('@')[1];
        mapping = USER_ROLE_MAPPINGS.find(m => m.domain === domain);
        if (mapping) {
            return mapping;
        }
        return USER_ROLE_MAPPINGS.find(m => m.domain === '*') || null;
    }
    static async assignDirectPermissions(user, permissionNames) {
        try {
            console.log(`Assigning direct permissions to ${user.email}:`, permissionNames);
            const permissions = await models_1.Permission.findAll({
                where: {
                    name: {
                        [sequelize_1.Op.in]: permissionNames
                    }
                }
            });
            if (permissions.length === 0) {
                console.log(`No permissions found for names: ${permissionNames.join(', ')}`);
                return;
            }
            const existingUserPermissions = await models_1.UserPermission.findAll({
                where: { userId: user.id },
                include: [{
                        model: models_1.Permission,
                        as: 'permission'
                    }]
            });
            const existingPermissionNames = existingUserPermissions.map((up) => up.permission.name);
            const newPermissions = permissions.filter(p => !existingPermissionNames.includes(p.name));
            if (newPermissions.length === 0) {
                console.log(`User ${user.email} already has all required permissions`);
                return;
            }
            const userPermissionsToCreate = newPermissions.map(permission => ({
                userId: user.id,
                permissionId: permission.id,
                grantedBy: null,
                grantedAt: new Date()
            }));
            await models_1.UserPermission.bulkCreate(userPermissionsToCreate);
            console.log(`Assigned ${newPermissions.length} new permissions to user: ${user.email}`);
        }
        catch (error) {
            console.error(`Error assigning direct permissions to user ${user.email}:`, error);
            throw error;
        }
    }
    static async getUserPermissions(userId) {
        try {
            const directPermissions = await models_1.Permission.findAll({
                include: [{
                        model: models_1.UserPermission,
                        as: 'userPermissions',
                        where: { userId },
                        required: true
                    }]
            });
            return directPermissions.map((permission) => ({
                id: permission.id,
                name: permission.name,
                description: permission.description,
                resource: permission.resource,
                action: permission.action,
                source: 'direct'
            }));
        }
        catch (error) {
            console.error(`Error getting user permissions for userId ${userId}:`, error);
            throw error;
        }
    }
    static async removeAllUserPermissions(userId) {
        try {
            await models_1.UserPermission.destroy({
                where: { userId }
            });
            console.log(`Removed all permissions for user ID: ${userId}`);
        }
        catch (error) {
            console.error(`Error removing permissions for user ${userId}:`, error);
            throw error;
        }
    }
    static async resyncUserPermissions(userId) {
        try {
            const user = await models_1.User.findByPk(userId);
            if (!user) {
                throw new Error(`User with ID ${userId} not found`);
            }
            await this.assignPermissionsToUser(user);
        }
        catch (error) {
            console.error(`Error resyncing permissions for user ${userId}:`, error);
            throw error;
        }
    }
}
exports.OAuth2PermissionService = OAuth2PermissionService;
exports.default = OAuth2PermissionService;
