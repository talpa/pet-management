"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userGroupController = void 0;
const models_1 = require("../models");
const express_validator_1 = require("express-validator");
const oauth2PermissionService_1 = require("../services/oauth2PermissionService");
exports.userGroupController = {
    getAllGroups: async (req, res) => {
        try {
            const groups = await models_1.UserGroup.findAll({
                include: [
                    {
                        model: models_1.User,
                        as: 'creator',
                        attributes: ['id', 'name', 'email'],
                    },
                    {
                        model: models_1.User,
                        as: 'members',
                        attributes: ['id', 'name', 'email'],
                        through: {
                            attributes: ['addedAt'],
                        },
                    },
                    {
                        model: models_1.Permission,
                        as: 'permissions',
                        attributes: ['id', 'name', 'description', 'category'],
                        through: {
                            attributes: ['grantedAt'],
                        },
                    },
                ],
                order: [['name', 'ASC']],
            });
            res.json({
                success: true,
                data: groups,
            });
        }
        catch (error) {
            console.error('Error fetching user groups:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch user groups',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    },
    getGroup: async (req, res) => {
        try {
            const { id } = req.params;
            const group = await models_1.UserGroup.findByPk(id, {
                include: [
                    {
                        model: models_1.User,
                        as: 'creator',
                        attributes: ['id', 'name', 'email'],
                    },
                    {
                        model: models_1.User,
                        as: 'members',
                        attributes: ['id', 'name', 'email'],
                        through: {
                            attributes: ['addedAt'],
                        },
                    },
                    {
                        model: models_1.Permission,
                        as: 'permissions',
                        attributes: ['id', 'name', 'description', 'category'],
                        through: {
                            attributes: ['grantedAt'],
                        },
                    },
                ],
            });
            if (!group) {
                res.status(404).json({
                    success: false,
                    message: 'User group not found',
                });
                return;
            }
            res.json({
                success: true,
                data: group,
            });
        }
        catch (error) {
            console.error('Error fetching user group:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch user group',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    },
    createGroup: async (req, res) => {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: 'Validation errors',
                    errors: errors.array(),
                });
                return;
            }
            const { name, description, color } = req.body;
            const createdBy = req.userId;
            const group = await models_1.UserGroup.create({
                name,
                description,
                color,
                createdBy,
                isActive: true,
            });
            const groupWithDetails = await models_1.UserGroup.findByPk(group.id, {
                include: [
                    {
                        model: models_1.User,
                        as: 'creator',
                        attributes: ['id', 'name', 'email'],
                    },
                ],
            });
            res.status(201).json({
                success: true,
                message: 'User group created successfully',
                data: groupWithDetails,
            });
        }
        catch (error) {
            console.error('Error creating user group:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create user group',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    },
    updateGroup: async (req, res) => {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: 'Validation errors',
                    errors: errors.array(),
                });
                return;
            }
            const { id } = req.params;
            const { name, description, color, isActive } = req.body;
            const group = await models_1.UserGroup.findByPk(id);
            if (!group) {
                res.status(404).json({
                    success: false,
                    message: 'User group not found',
                });
                return;
            }
            await group.update({
                name,
                description,
                color,
                isActive,
            });
            const updatedGroup = await models_1.UserGroup.findByPk(id, {
                include: [
                    {
                        model: models_1.User,
                        as: 'creator',
                        attributes: ['id', 'name', 'email'],
                    },
                    {
                        model: models_1.User,
                        as: 'members',
                        attributes: ['id', 'name', 'email'],
                        through: {
                            attributes: ['addedAt'],
                        },
                    },
                    {
                        model: models_1.Permission,
                        as: 'permissions',
                        attributes: ['id', 'name', 'description', 'category'],
                        through: {
                            attributes: ['grantedAt'],
                        },
                    },
                ],
            });
            res.json({
                success: true,
                message: 'User group updated successfully',
                data: updatedGroup,
            });
        }
        catch (error) {
            console.error('Error updating user group:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update user group',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    },
    deleteGroup: async (req, res) => {
        try {
            const { id } = req.params;
            const group = await models_1.UserGroup.findByPk(id);
            if (!group) {
                res.status(404).json({
                    success: false,
                    message: 'User group not found',
                });
                return;
            }
            await group.destroy();
            res.json({
                success: true,
                message: 'User group deleted successfully',
            });
        }
        catch (error) {
            console.error('Error deleting user group:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete user group',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    },
    addUserToGroup: async (req, res) => {
        try {
            const { groupId, userId } = req.params;
            const addedBy = req.userId;
            const group = await models_1.UserGroup.findByPk(groupId);
            if (!group) {
                res.status(404).json({
                    success: false,
                    message: 'User group not found',
                });
                return;
            }
            const user = await models_1.User.findByPk(userId);
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: 'User not found',
                });
                return;
            }
            const existingMembership = await models_1.UserGroupMember.findOne({
                where: { userId, userGroupId: groupId },
            });
            if (existingMembership) {
                res.status(400).json({
                    success: false,
                    message: 'User is already a member of this group',
                });
                return;
            }
            await models_1.UserGroupMember.create({
                userId: parseInt(userId),
                userGroupId: parseInt(groupId),
                addedBy,
                addedAt: new Date(),
            });
            res.json({
                success: true,
                message: 'User added to group successfully',
            });
        }
        catch (error) {
            console.error('Error adding user to group:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to add user to group',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    },
    removeUserFromGroup: async (req, res) => {
        try {
            const { groupId, userId } = req.params;
            const membership = await models_1.UserGroupMember.findOne({
                where: { userId, userGroupId: groupId },
            });
            if (!membership) {
                res.status(404).json({
                    success: false,
                    message: 'User is not a member of this group',
                });
                return;
            }
            await membership.destroy();
            res.json({
                success: true,
                message: 'User removed from group successfully',
            });
        }
        catch (error) {
            console.error('Error removing user from group:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to remove user from group',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    },
    grantPermissionToGroup: async (req, res) => {
        try {
            const { groupId, permissionId } = req.params;
            const grantedBy = req.userId;
            const group = await models_1.UserGroup.findByPk(groupId);
            if (!group) {
                res.status(404).json({
                    success: false,
                    message: 'User group not found',
                });
                return;
            }
            const permission = await models_1.Permission.findByPk(permissionId);
            if (!permission) {
                res.status(404).json({
                    success: false,
                    message: 'Permission not found',
                });
                return;
            }
            const existingPermission = await models_1.GroupPermission.findOne({
                where: { userGroupId: groupId, permissionId },
            });
            if (existingPermission) {
                res.status(400).json({
                    success: false,
                    message: 'Group already has this permission',
                });
                return;
            }
            await models_1.GroupPermission.create({
                userGroupId: parseInt(groupId),
                permissionId: parseInt(permissionId),
                grantedBy,
                grantedAt: new Date(),
            });
            res.json({
                success: true,
                message: 'Permission granted to group successfully',
            });
        }
        catch (error) {
            console.error('Error granting permission to group:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to grant permission to group',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    },
    revokePermissionFromGroup: async (req, res) => {
        try {
            const { groupId, permissionId } = req.params;
            const groupPermission = await models_1.GroupPermission.findOne({
                where: { userGroupId: groupId, permissionId },
            });
            if (!groupPermission) {
                res.status(404).json({
                    success: false,
                    message: 'Group does not have this permission',
                });
                return;
            }
            await groupPermission.destroy();
            res.json({
                success: true,
                message: 'Permission revoked from group successfully',
            });
        }
        catch (error) {
            console.error('Error revoking permission from group:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to revoke permission from group',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    },
    getUserEffectivePermissions: async (req, res) => {
        try {
            const { userId } = req.params;
            const user = await models_1.User.findByPk(userId, {
                include: [
                    {
                        model: models_1.Permission,
                        as: 'permissions',
                        attributes: ['id', 'name', 'description', 'category'],
                        through: {
                            attributes: ['grantedAt'],
                        },
                    },
                    {
                        model: models_1.UserGroup,
                        as: 'userGroups',
                        attributes: ['id', 'name', 'color'],
                        through: {
                            attributes: ['addedAt'],
                        },
                        include: [
                            {
                                model: models_1.Permission,
                                as: 'permissions',
                                attributes: ['id', 'name', 'description', 'category'],
                                through: {
                                    attributes: ['grantedAt'],
                                },
                            },
                        ],
                    },
                ],
            });
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: 'User not found',
                });
                return;
            }
            const directPermissions = user.permissions || [];
            const groupPermissions = [];
            if (user.userGroups) {
                user.userGroups.forEach((group) => {
                    if (group.permissions) {
                        group.permissions.forEach((permission) => {
                            groupPermissions.push({
                                ...permission.toJSON(),
                                fromGroup: {
                                    id: group.id,
                                    name: group.name,
                                    color: group.color,
                                },
                            });
                        });
                    }
                });
            }
            const effectivePermissions = [];
            const addedPermissionIds = new Set();
            directPermissions.forEach((permission) => {
                effectivePermissions.push({
                    ...permission.toJSON(),
                    source: 'direct',
                });
                addedPermissionIds.add(permission.id);
            });
            groupPermissions.forEach((permission) => {
                if (!addedPermissionIds.has(permission.id)) {
                    effectivePermissions.push({
                        ...permission,
                        source: 'group',
                    });
                    addedPermissionIds.add(permission.id);
                }
            });
            res.json({
                success: true,
                data: {
                    userId: user.id,
                    userName: user.name,
                    userEmail: user.email,
                    effectivePermissions,
                    directPermissionsCount: directPermissions.length,
                    groupPermissionsCount: groupPermissions.length,
                    totalEffectivePermissions: effectivePermissions.length,
                },
            });
        }
        catch (error) {
            console.error('Error fetching user effective permissions:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch user effective permissions',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    },
    getAllMemberships: async (req, res) => {
        try {
            const memberships = await models_1.UserGroupMember.findAll({
                include: [
                    {
                        model: models_1.User,
                        as: 'user',
                        attributes: ['id', 'name', 'email', 'role', 'status', 'avatar'],
                    },
                    {
                        model: models_1.UserGroup,
                        as: 'userGroup',
                        attributes: ['id', 'name', 'description', 'color', 'isActive'],
                    },
                ],
                order: [['addedAt', 'DESC']],
            });
            res.json({
                success: true,
                data: memberships,
            });
        }
        catch (error) {
            console.error('Error fetching memberships:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch memberships',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    },
    updateUserMemberships: async (req, res) => {
        try {
            const { userId } = req.params;
            const { groupIds } = req.body;
            const addedBy = req.userId;
            const user = await models_1.User.findByPk(userId);
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: 'User not found',
                });
                return;
            }
            if (!Array.isArray(groupIds)) {
                res.status(400).json({
                    success: false,
                    message: 'groupIds must be an array',
                });
                return;
            }
            const groups = await models_1.UserGroup.findAll({
                where: { id: groupIds },
            });
            if (groups.length !== groupIds.length) {
                res.status(400).json({
                    success: false,
                    message: 'One or more groups not found',
                });
                return;
            }
            await models_1.UserGroupMember.destroy({
                where: { userId },
            });
            if (groupIds.length > 0) {
                const memberships = groupIds.map((groupId) => ({
                    userId: parseInt(userId),
                    userGroupId: groupId,
                    addedBy,
                    addedAt: new Date(),
                }));
                await models_1.UserGroupMember.bulkCreate(memberships);
            }
            res.json({
                success: true,
                message: 'User group memberships updated successfully',
                data: {
                    userId: parseInt(userId),
                    groupCount: groupIds.length,
                },
            });
        }
        catch (error) {
            console.error('Error updating user memberships:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update user memberships',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    },
    addUserToGroupEnhanced: async (req, res) => {
        try {
            const { groupId } = req.params;
            const { userId } = req.body;
            const addedBy = req.userId;
            const group = await models_1.UserGroup.findByPk(groupId);
            if (!group) {
                res.status(404).json({
                    success: false,
                    message: 'User group not found',
                });
                return;
            }
            const user = await models_1.User.findByPk(userId);
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: 'User not found',
                });
                return;
            }
            const existingMembership = await models_1.UserGroupMember.findOne({
                where: { userId, userGroupId: groupId },
            });
            if (existingMembership) {
                res.status(400).json({
                    success: false,
                    message: 'User is already a member of this group',
                });
                return;
            }
            await models_1.UserGroupMember.create({
                userId,
                userGroupId: parseInt(groupId),
                addedBy,
                addedAt: new Date(),
            });
            res.json({
                success: true,
                message: 'User added to group successfully',
            });
        }
        catch (error) {
            console.error('Error adding user to group:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to add user to group',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    },
    resyncUserPermissions: async (req, res) => {
        try {
            const { userId } = req.params;
            await oauth2PermissionService_1.OAuth2PermissionService.resyncUserPermissions(parseInt(userId));
            res.json({
                success: true,
                message: 'User permissions resynced successfully',
            });
        }
        catch (error) {
            console.error('Error resyncing user permissions:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to resync user permissions',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    },
    getUserEffectivePermissionsEnhanced: async (req, res) => {
        try {
            const { userId } = req.params;
            const effectivePermissions = await oauth2PermissionService_1.OAuth2PermissionService.getUserEffectivePermissions(parseInt(userId));
            res.json({
                success: true,
                data: effectivePermissions,
            });
        }
        catch (error) {
            console.error('Error fetching user effective permissions:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch user effective permissions',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    },
};
//# sourceMappingURL=userGroupController.js.map