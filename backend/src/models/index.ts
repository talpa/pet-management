import { User } from './User';
import { Permission } from './Permission';
import { UserPermission } from './UserPermission';

// User <-> Permission associations (direct)
User.belongsToMany(Permission, {
  through: UserPermission,
  foreignKey: 'userId',
  otherKey: 'permissionId',
  as: 'permissions',
});

Permission.belongsToMany(User, {
  through: UserPermission,
  foreignKey: 'permissionId',
  otherKey: 'userId',
  as: 'users',
});

// Direct associations with junction tables
User.hasMany(UserPermission, {
  foreignKey: 'userId',
  as: 'userPermissions',
});

Permission.hasMany(UserPermission, {
  foreignKey: 'permissionId',
  as: 'userPermissions',
});

UserPermission.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

UserPermission.belongsTo(Permission, {
  foreignKey: 'permissionId',
  as: 'permission',
});

// Self-referencing associations for tracking who granted permissions
UserPermission.belongsTo(User, {
  foreignKey: 'grantedBy',
  as: 'grantedByUser',
});

export { User, Permission, UserPermission };