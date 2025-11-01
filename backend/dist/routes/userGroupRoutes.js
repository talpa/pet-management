"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const userGroupController_1 = require("../controllers/userGroupController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const userGroupValidation = [
    (0, express_validator_1.body)('name')
        .trim()
        .notEmpty()
        .withMessage('Group name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Group name must be between 2 and 100 characters'),
    (0, express_validator_1.body)('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description must not exceed 500 characters'),
    (0, express_validator_1.body)('color')
        .optional()
        .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
        .withMessage('Color must be a valid hex color (e.g., #FF0000)'),
    (0, express_validator_1.body)('isActive')
        .optional()
        .isBoolean()
        .withMessage('isActive must be a boolean value'),
];
router.get('/', auth_1.authenticateToken, userGroupController_1.userGroupController.getAllGroups);
router.get('/memberships', auth_1.authenticateToken, userGroupController_1.userGroupController.getAllMemberships);
router.put('/memberships/user/:userId', auth_1.authenticateToken, userGroupController_1.userGroupController.updateUserMemberships);
router.get('/:id', auth_1.authenticateToken, userGroupController_1.userGroupController.getGroup);
router.post('/', auth_1.authenticateToken, userGroupValidation, userGroupController_1.userGroupController.createGroup);
router.put('/:id', auth_1.authenticateToken, userGroupValidation, userGroupController_1.userGroupController.updateGroup);
router.delete('/:id', auth_1.authenticateToken, userGroupController_1.userGroupController.deleteGroup);
router.get('/memberships', auth_1.authenticateToken, userGroupController_1.userGroupController.getAllMemberships);
router.put('/memberships/user/:userId', auth_1.authenticateToken, userGroupController_1.userGroupController.updateUserMemberships);
router.post('/:groupId/members', auth_1.authenticateToken, userGroupController_1.userGroupController.addUserToGroupEnhanced);
router.post('/:groupId/members/:userId', auth_1.authenticateToken, userGroupController_1.userGroupController.addUserToGroup);
router.delete('/:groupId/members/:userId', auth_1.authenticateToken, userGroupController_1.userGroupController.removeUserFromGroup);
router.post('/:groupId/permissions/:permissionId', auth_1.authenticateToken, userGroupController_1.userGroupController.grantPermissionToGroup);
router.delete('/:groupId/permissions/:permissionId', auth_1.authenticateToken, userGroupController_1.userGroupController.revokePermissionFromGroup);
router.get('/users/:userId/effective-permissions', auth_1.authenticateToken, userGroupController_1.userGroupController.getUserEffectivePermissions);
router.get('/users/:userId/effective-permissions-enhanced', auth_1.authenticateToken, userGroupController_1.userGroupController.getUserEffectivePermissionsEnhanced);
router.post('/users/:userId/resync-permissions', auth_1.authenticateToken, userGroupController_1.userGroupController.resyncUserPermissions);
exports.default = router;
//# sourceMappingURL=userGroupRoutes.js.map