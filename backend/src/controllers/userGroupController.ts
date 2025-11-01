import { Request, Response } from 'express';
import { UserGroup, User, Permission, UserGroupMember, GroupPermission } from '../models';
import { validationResult } from 'express-validator';
import { OAuth2PermissionService } from '../services/oauth2PermissionService';

interface AuthenticatedRequest extends Request {
  userId?: number;
}

export const userGroupController = {
  // Get all user groups
  getAllGroups: async (req: Request, res: Response): Promise<void> => {
    try {
      const groups = await UserGroup.findAll({
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'name', 'email'],
          },
          {
            model: User,
            as: 'members',
            attributes: ['id', 'name', 'email'],
            through: {
              attributes: ['addedAt'],
            },
          },
          {
            model: Permission,
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
    } catch (error) {
      console.error('Error fetching user groups:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user groups',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  // Get single user group
  getGroup: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const group = await UserGroup.findByPk(id, {
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'name', 'email'],
          },
          {
            model: User,
            as: 'members',
            attributes: ['id', 'name', 'email'],
            through: {
              attributes: ['addedAt'],
            },
          },
          {
            model: Permission,
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
    } catch (error) {
      console.error('Error fetching user group:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user group',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  // Create new user group
  createGroup: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
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

      const group = await UserGroup.create({
        name,
        description,
        color,
        createdBy,
        isActive: true,
      });

      const groupWithDetails = await UserGroup.findByPk(group.id, {
        include: [
          {
            model: User,
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
    } catch (error) {
      console.error('Error creating user group:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create user group',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  // Update user group
  updateGroup: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
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

      const group = await UserGroup.findByPk(id);
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

      const updatedGroup = await UserGroup.findByPk(id, {
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'name', 'email'],
          },
          {
            model: User,
            as: 'members',
            attributes: ['id', 'name', 'email'],
            through: {
              attributes: ['addedAt'],
            },
          },
          {
            model: Permission,
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
    } catch (error) {
      console.error('Error updating user group:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user group',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  // Delete user group
  deleteGroup: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const group = await UserGroup.findByPk(id);
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
    } catch (error) {
      console.error('Error deleting user group:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete user group',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  // Add user to group
  addUserToGroup: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { groupId, userId } = req.params;
      const addedBy = req.userId;

      // Check if group exists
      const group = await UserGroup.findByPk(groupId);
      if (!group) {
        res.status(404).json({
          success: false,
          message: 'User group not found',
        });
        return;
      }

      // Check if user exists
      const user = await User.findByPk(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      // Check if user is already in group
      const existingMembership = await UserGroupMember.findOne({
        where: { userId, userGroupId: groupId },
      });

      if (existingMembership) {
        res.status(400).json({
          success: false,
          message: 'User is already a member of this group',
        });
        return;
      }

      // Add user to group
      await UserGroupMember.create({
        userId: parseInt(userId),
        userGroupId: parseInt(groupId),
        addedBy,
        addedAt: new Date(),
      });

      res.json({
        success: true,
        message: 'User added to group successfully',
      });
    } catch (error) {
      console.error('Error adding user to group:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add user to group',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  // Remove user from group
  removeUserFromGroup: async (req: Request, res: Response): Promise<void> => {
    try {
      const { groupId, userId } = req.params;

      const membership = await UserGroupMember.findOne({
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
    } catch (error) {
      console.error('Error removing user from group:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove user from group',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  // Grant permission to group
  grantPermissionToGroup: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { groupId, permissionId } = req.params;
      const grantedBy = req.userId;

      // Check if group exists
      const group = await UserGroup.findByPk(groupId);
      if (!group) {
        res.status(404).json({
          success: false,
          message: 'User group not found',
        });
        return;
      }

      // Check if permission exists
      const permission = await Permission.findByPk(permissionId);
      if (!permission) {
        res.status(404).json({
          success: false,
          message: 'Permission not found',
        });
        return;
      }

      // Check if group already has this permission
      const existingPermission = await GroupPermission.findOne({
        where: { userGroupId: groupId, permissionId },
      });

      if (existingPermission) {
        res.status(400).json({
          success: false,
          message: 'Group already has this permission',
        });
        return;
      }

      // Grant permission to group
      await GroupPermission.create({
        userGroupId: parseInt(groupId),
        permissionId: parseInt(permissionId),
        grantedBy,
        grantedAt: new Date(),
      });

      res.json({
        success: true,
        message: 'Permission granted to group successfully',
      });
    } catch (error) {
      console.error('Error granting permission to group:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to grant permission to group',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  // Revoke permission from group
  revokePermissionFromGroup: async (req: Request, res: Response): Promise<void> => {
    try {
      const { groupId, permissionId } = req.params;

      const groupPermission = await GroupPermission.findOne({
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
    } catch (error) {
      console.error('Error revoking permission from group:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to revoke permission from group',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  // Get user's effective permissions (direct + group permissions)
  getUserEffectivePermissions: async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;

      // Get user with direct permissions and group permissions
      const user = await User.findByPk(userId, {
        include: [
          {
            model: Permission,
            as: 'permissions',
            attributes: ['id', 'name', 'description', 'category'],
            through: {
              attributes: ['grantedAt'],
            },
          },
          {
            model: UserGroup,
            as: 'userGroups',
            attributes: ['id', 'name', 'color'],
            through: {
              attributes: ['addedAt'],
            },
            include: [
              {
                model: Permission,
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

      // Combine direct and group permissions
      const directPermissions = user.permissions || [];
      const groupPermissions: any[] = [];

      if (user.userGroups) {
        user.userGroups.forEach((group: any) => {
          if (group.permissions) {
            group.permissions.forEach((permission: any) => {
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

      // Remove duplicates (prefer direct permissions over group permissions)
      const effectivePermissions: any[] = [];
      const addedPermissionIds = new Set();

      // Add direct permissions first
      directPermissions.forEach((permission: any) => {
        effectivePermissions.push({
          ...permission.toJSON(),
          source: 'direct',
        });
        addedPermissionIds.add(permission.id);
      });

      // Add group permissions that are not already direct
      groupPermissions.forEach((permission: any) => {
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
    } catch (error) {
      console.error('Error fetching user effective permissions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user effective permissions',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  // Get all memberships
  getAllMemberships: async (req: Request, res: Response): Promise<void> => {
    try {
      const memberships = await UserGroupMember.findAll({
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'role', 'status', 'avatar'],
          },
          {
            model: UserGroup,
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
    } catch (error) {
      console.error('Error fetching memberships:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch memberships',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  // Update user's group memberships (bulk update)
  updateUserMemberships: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const { groupIds } = req.body;
      const addedBy = req.userId;

      // Check if user exists
      const user = await User.findByPk(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      // Validate group IDs
      if (!Array.isArray(groupIds)) {
        res.status(400).json({
          success: false,
          message: 'groupIds must be an array',
        });
        return;
      }

      // Verify all groups exist
      const groups = await UserGroup.findAll({
        where: { id: groupIds },
      });

      if (groups.length !== groupIds.length) {
        res.status(400).json({
          success: false,
          message: 'One or more groups not found',
        });
        return;
      }

      // Remove user from all current groups
      await UserGroupMember.destroy({
        where: { userId },
      });

      // Add user to new groups
      if (groupIds.length > 0) {
        const memberships = groupIds.map((groupId: number) => ({
          userId: parseInt(userId),
          userGroupId: groupId,
          addedBy,
          addedAt: new Date(),
        }));

        await UserGroupMember.bulkCreate(memberships);
      }

      res.json({
        success: true,
        message: 'User group memberships updated successfully',
        data: {
          userId: parseInt(userId),
          groupCount: groupIds.length,
        },
      });
    } catch (error) {
      console.error('Error updating user memberships:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user memberships',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  // Add user to group (enhanced to handle body with userId)
  addUserToGroupEnhanced: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { groupId } = req.params;
      const { userId } = req.body;
      const addedBy = req.userId;

      // Check if group exists
      const group = await UserGroup.findByPk(groupId);
      if (!group) {
        res.status(404).json({
          success: false,
          message: 'User group not found',
        });
        return;
      }

      // Check if user exists
      const user = await User.findByPk(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      // Check if user is already in group
      const existingMembership = await UserGroupMember.findOne({
        where: { userId, userGroupId: groupId },
      });

      if (existingMembership) {
        res.status(400).json({
          success: false,
          message: 'User is already a member of this group',
        });
        return;
      }

      // Add user to group
      await UserGroupMember.create({
        userId,
        userGroupId: parseInt(groupId),
        addedBy,
        addedAt: new Date(),
      });

      res.json({
        success: true,
        message: 'User added to group successfully',
      });
    } catch (error) {
      console.error('Error adding user to group:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add user to group',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  // Resync user permissions based on OAuth rules
  resyncUserPermissions: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;

      await OAuth2PermissionService.resyncUserPermissions(parseInt(userId));

      res.json({
        success: true,
        message: 'User permissions resynced successfully',
      });
    } catch (error) {
      console.error('Error resyncing user permissions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to resync user permissions',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  // Get user's effective permissions (enhanced version)
  getUserEffectivePermissionsEnhanced: async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;

      const effectivePermissions = await OAuth2PermissionService.getUserEffectivePermissions(parseInt(userId));

      res.json({
        success: true,
        data: effectivePermissions,
      });
    } catch (error) {
      console.error('Error fetching user effective permissions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user effective permissions',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },
};