import { User } from './User';
import { Permission } from './Permission';
import { UserPermission } from './UserPermission';
import { UserGroup } from './UserGroup';
import { UserGroupMember } from './UserGroupMember';
import { GroupPermission } from './GroupPermission';

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

// User <-> UserGroup associations
User.belongsToMany(UserGroup, {
  through: UserGroupMember,
  foreignKey: 'userId',
  otherKey: 'userGroupId',
  as: 'userGroups',
});

UserGroup.belongsToMany(User, {
  through: UserGroupMember,
  foreignKey: 'userGroupId',
  otherKey: 'userId',
  as: 'members',
});

// UserGroup <-> Permission associations
UserGroup.belongsToMany(Permission, {
  through: GroupPermission,
  foreignKey: 'userGroupId',
  otherKey: 'permissionId',
  as: 'permissions',
});

Permission.belongsToMany(UserGroup, {
  through: GroupPermission,
  foreignKey: 'permissionId',
  otherKey: 'userGroupId',
  as: 'userGroups',
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

// UserGroupMember associations
User.hasMany(UserGroupMember, {
  foreignKey: 'userId',
  as: 'groupMemberships',
});

UserGroup.hasMany(UserGroupMember, {
  foreignKey: 'userGroupId',
  as: 'memberDetails',
});

UserGroupMember.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

UserGroupMember.belongsTo(UserGroup, {
  foreignKey: 'userGroupId',
  as: 'userGroup',
});

// GroupPermission associations
UserGroup.hasMany(GroupPermission, {
  foreignKey: 'userGroupId',
  as: 'groupPermissions',
});

Permission.hasMany(GroupPermission, {
  foreignKey: 'permissionId',
  as: 'groupPermissions',
});

GroupPermission.belongsTo(UserGroup, {
  foreignKey: 'userGroupId',
  as: 'userGroup',
});

GroupPermission.belongsTo(Permission, {
  foreignKey: 'permissionId',
  as: 'permission',
});

// Self-referencing associations for tracking who granted/added
UserPermission.belongsTo(User, {
  foreignKey: 'grantedBy',
  as: 'grantedByUser',
});

UserGroupMember.belongsTo(User, {
  foreignKey: 'addedBy',
  as: 'addedByUser',
});

GroupPermission.belongsTo(User, {
  foreignKey: 'grantedBy',
  as: 'grantedByUser',
});

UserGroup.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator',
});

export { User, Permission, UserPermission, UserGroup, UserGroupMember, GroupPermission };