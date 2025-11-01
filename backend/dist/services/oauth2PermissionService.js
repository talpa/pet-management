"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.OAuth2PermissionService = void 0;
const models_1 = require("../models");
const sequelize_1 = require("sequelize");
const USER_ROLE_MAPPINGS = [
    {
        email: 'talpa@suchdol.net',
        role: 'admin',
        permissions: ['users.view', 'users.create', 'users.edit', 'users.delete', 'groups.manage', 'permissions.manage'],
        groups: ['Administrators']
    },
    {
        email: 'admin@example.com',
        role: 'admin',
        permissions: ['users.view', 'users.create', 'users.edit', 'users.delete', 'groups.manage', 'permissions.manage'],
        groups: ['Administrators']
    },
    {
        domain: 'suchdol.net',
        role: 'manager',
        permissions: ['users.view', 'users.edit', 'groups.view'],
        groups: ['Managers']
    },
    {
        domain: 'yourcompany.com',
        role: 'employee',
        permissions: ['users.view'],
        groups: ['Employees']
    },
    {
        domain: '*',
        role: 'user',
        permissions: ['users.view'],
        groups: ['Users']
    }
];
class OAuth2PermissionService {
    static async assignPermissionsToUser(user) {
        try {
            console.log(`🔑 Assigning permissions to user: ${user.email}`);
            const mapping = this.findUserMapping(user.email);
            if (!mapping) {
                console.log(`⚠️ No mapping found for user: ${user.email}`);
                return;
            }
            console.log(`📋 Found mapping for ${user.email}:`, mapping);
            if (mapping.role && user.role !== mapping.role) {
                await user.update({ role: mapping.role });
                console.log(`🎭 Updated user role to: ${mapping.role}`);
            }
            if (mapping.permissions && mapping.permissions.length > 0) {
                await this.assignDirectPermissions(user, mapping.permissions);
            }
            if (mapping.groups && mapping.groups.length > 0) {
                await this.assignUserToGroups(user, mapping.groups);
            }
            console.log(`✅ Permissions assigned successfully to: ${user.email}`);
        }
        catch (error) {
            console.error(`❌ Error assigning permissions to user ${user.email}:`, error);
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
    static async assignDirectPermissions(user, permissionCodes) {
        try {
            const permissions = await models_1.Permission.findAll({
                where: {
                    code: {
                        [sequelize_1.Op.in]: permissionCodes
                    }
                }
            });
            console.log(`🔐 Found ${permissions.length} permissions for codes:`, permissionCodes);
            await models_1.UserPermission.destroy({
                where: { userId: user.id }
            });
            const userPermissions = permissions.map(permission => ({
                userId: user.id,
                permissionId: permission.id,
                granted: true,
                grantedBy: user.id,
                grantedAt: new Date(),
            }));
            if (userPermissions.length > 0) {
                await models_1.UserPermission.bulkCreate(userPermissions);
                console.log(`✅ Assigned ${userPermissions.length} direct permissions`);
            }
        }
        catch (error) {
            console.error('Error assigning direct permissions:', error);
            throw error;
        }
    }
    static async assignUserToGroups(user, groupNames) {
        try {
            const groups = await models_1.UserGroup.findAll({
                where: {
                    name: {
                        [sequelize_1.Op.in]: groupNames
                    },
                    isActive: true
                }
            });
            console.log(`👥 Found ${groups.length} groups for names:`, groupNames);
            await models_1.UserGroupMember.destroy({
                where: { userId: user.id }
            });
            const memberships = groups.map(group => ({
                userId: user.id,
                userGroupId: group.id,
                addedBy: user.id,
                addedAt: new Date(),
            }));
            if (memberships.length > 0) {
                await models_1.UserGroupMember.bulkCreate(memberships);
                console.log(`✅ Added user to ${memberships.length} groups`);
            }
            const foundGroupNames = groups.map(g => g.name);
            const missingGroups = groupNames.filter(name => !foundGroupNames.includes(name));
            if (missingGroups.length > 0) {
                console.log(`🏗️ Creating missing groups:`, missingGroups);
                await this.createMissingGroups(missingGroups, user.id);
                await this.assignUserToGroups(user, missingGroups);
            }
        }
        catch (error) {
            console.error('Error assigning user to groups:', error);
            throw error;
        }
    }
    static async createMissingGroups(groupNames, createdBy) {
        try {
            const groupColors = ['#EF4444', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899'];
            const groupsToCreate = groupNames.map((name, index) => ({
                name,
                description: `Auto-created group for OAuth users: ${name}`,
                color: groupColors[index % groupColors.length],
                isActive: true,
                createdBy,
            }));
            const createdGroups = await models_1.UserGroup.bulkCreate(groupsToCreate);
            console.log(`✅ Created ${createdGroups.length} new groups`);
            for (const group of createdGroups) {
                await this.assignDefaultPermissionsToGroup(group);
            }
        }
        catch (error) {
            console.error('Error creating missing groups:', error);
            throw error;
        }
    }
    static async assignDefaultPermissionsToGroup(group) {
        try {
            let defaultPermissions = [];
            switch (group.name.toLowerCase()) {
                case 'administrators':
                case 'admins':
                    defaultPermissions = ['users.view', 'users.create', 'users.edit', 'users.delete', 'groups.manage', 'permissions.manage'];
                    break;
                case 'managers':
                    defaultPermissions = ['users.view', 'users.edit', 'groups.view'];
                    break;
                case 'employees':
                    defaultPermissions = ['users.view'];
                    break;
                case 'users':
                default:
                    defaultPermissions = ['users.view'];
                    break;
            }
            if (defaultPermissions.length > 0) {
                const permissions = await models_1.Permission.findAll({
                    where: {
                        code: {
                            [sequelize_1.Op.in]: defaultPermissions
                        }
                    }
                });
                const { GroupPermission } = await Promise.resolve().then(() => __importStar(require('../models')));
                const groupPermissions = permissions.map(permission => ({
                    userGroupId: group.id,
                    permissionId: permission.id,
                    grantedBy: group.createdBy,
                    grantedAt: new Date(),
                }));
                if (groupPermissions.length > 0) {
                    await GroupPermission.bulkCreate(groupPermissions);
                    console.log(`✅ Assigned ${groupPermissions.length} permissions to group: ${group.name}`);
                }
            }
        }
        catch (error) {
            console.error(`Error assigning default permissions to group ${group.name}:`, error);
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
    static async getUserEffectivePermissions(userId) {
        try {
            const user = await models_1.User.findByPk(userId);
            if (!user) {
                throw new Error(`User with ID ${userId} not found`);
            }
            const directPermissionsResult = await models_1.Permission.findAll({
                include: [{
                        model: models_1.UserPermission,
                        as: 'userPermissions',
                        where: { userId },
                        required: true,
                        attributes: ['grantedAt']
                    }],
                attributes: ['id', 'name', 'code', 'description', 'category']
            });
            const groupPermissionsResult = await models_1.Permission.findAll({
                include: [{
                        model: models_1.GroupPermission,
                        as: 'groupPermissions',
                        required: true,
                        attributes: ['grantedAt'],
                        include: [{
                                model: models_1.UserGroup,
                                as: 'userGroup',
                                required: true,
                                attributes: ['id', 'name', 'color'],
                                include: [{
                                        model: models_1.UserGroupMember,
                                        as: 'memberDetails',
                                        where: { userId },
                                        required: true,
                                        attributes: ['addedAt']
                                    }]
                            }]
                    }],
                attributes: ['id', 'name', 'code', 'description', 'category']
            });
            const groupPermissionsWithGroups = [];
            groupPermissionsResult.forEach((permission) => {
                if (permission.groupPermissions && permission.groupPermissions.length > 0) {
                    permission.groupPermissions.forEach((groupPermission) => {
                        if (groupPermission.userGroup) {
                            groupPermissionsWithGroups.push({
                                ...permission.toJSON(),
                                fromGroup: {
                                    id: groupPermission.userGroup.id,
                                    name: groupPermission.userGroup.name,
                                    color: groupPermission.userGroup.color
                                }
                            });
                        }
                    });
                }
            });
            const effectivePermissions = [];
            const seenPermissionIds = new Set();
            directPermissionsResult.forEach((permission) => {
                effectivePermissions.push({
                    ...permission.toJSON(),
                    source: 'direct'
                });
                seenPermissionIds.add(permission.id);
            });
            groupPermissionsWithGroups.forEach((permission) => {
                if (!seenPermissionIds.has(permission.id)) {
                    effectivePermissions.push({
                        ...permission,
                        source: 'group'
                    });
                    seenPermissionIds.add(permission.id);
                }
            });
            return {
                userId: user.id,
                userName: user.name,
                userEmail: user.email,
                userRole: user.role,
                directPermissions: directPermissionsResult.length,
                groupPermissions: groupPermissionsWithGroups.length,
                totalEffectivePermissions: effectivePermissions.length,
                effectivePermissions: effectivePermissions.sort((a, b) => a.name.localeCompare(b.name))
            };
        }
        catch (error) {
            console.error(`Error getting effective permissions for user ${userId}:`, error);
            throw error;
        }
    }
}
exports.OAuth2PermissionService = OAuth2PermissionService;
exports.default = OAuth2PermissionService;
//# sourceMappingURL=oauth2PermissionService.js.map