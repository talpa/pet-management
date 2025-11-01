import { Router } from 'express';
import { body } from 'express-validator';
import { userGroupController } from '../controllers/userGroupController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Validation rules for user group creation and updates
const userGroupValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Group name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Group name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Color must be a valid hex color (e.g., #FF0000)'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
];

// Get all user groups
router.get('/', authenticateToken, userGroupController.getAllGroups);

// Group membership management endpoints (must come before /:id routes)
router.get('/memberships', authenticateToken, userGroupController.getAllMemberships);
router.put('/memberships/user/:userId', authenticateToken, userGroupController.updateUserMemberships);

// Get specific user group
router.get('/:id', authenticateToken, userGroupController.getGroup);

// Create new user group
router.post('/', authenticateToken, userGroupValidation, userGroupController.createGroup);

// Update user group
router.put('/:id', authenticateToken, userGroupValidation, userGroupController.updateGroup);

// Delete user group
router.delete('/:id', authenticateToken, userGroupController.deleteGroup);

// Group membership management
router.get('/memberships', authenticateToken, userGroupController.getAllMemberships);
router.put('/memberships/user/:userId', authenticateToken, userGroupController.updateUserMemberships);
router.post('/:groupId/members', authenticateToken, userGroupController.addUserToGroupEnhanced);
router.post('/:groupId/members/:userId', authenticateToken, userGroupController.addUserToGroup);
router.delete('/:groupId/members/:userId', authenticateToken, userGroupController.removeUserFromGroup);

// Group permission management
router.post('/:groupId/permissions/:permissionId', authenticateToken, userGroupController.grantPermissionToGroup);
router.delete('/:groupId/permissions/:permissionId', authenticateToken, userGroupController.revokePermissionFromGroup);

// Get user's effective permissions (direct + group permissions)
router.get('/users/:userId/effective-permissions', authenticateToken, userGroupController.getUserEffectivePermissions);
router.get('/users/:userId/effective-permissions-enhanced', authenticateToken, userGroupController.getUserEffectivePermissionsEnhanced);

// OAuth permission management
router.post('/users/:userId/resync-permissions', authenticateToken, userGroupController.resyncUserPermissions);

export default router;