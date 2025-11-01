import { Router } from 'express';
import {
  getAllPermissions,
  getUserPermissions,
  grantPermission,
  revokePermission,
  createPermission,
  getPermissionCategories,
} from '../controllers/permissionController';

const router = Router();

// Permission routes
router.get('/', getAllPermissions);
router.post('/', createPermission);
router.get('/categories', getPermissionCategories);

// User permission routes
router.get('/user/:userId', getUserPermissions);
router.post('/grant', grantPermission);
router.delete('/user/:userId/permission/:permissionId', revokePermission);

export default router;