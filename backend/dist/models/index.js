"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupPermission = exports.UserGroupMember = exports.UserGroup = exports.UserPermission = exports.Permission = exports.User = void 0;
const User_1 = require("./User");
Object.defineProperty(exports, "User", { enumerable: true, get: function () { return User_1.User; } });
const Permission_1 = require("./Permission");
Object.defineProperty(exports, "Permission", { enumerable: true, get: function () { return Permission_1.Permission; } });
const UserPermission_1 = require("./UserPermission");
Object.defineProperty(exports, "UserPermission", { enumerable: true, get: function () { return UserPermission_1.UserPermission; } });
const UserGroup_1 = require("./UserGroup");
Object.defineProperty(exports, "UserGroup", { enumerable: true, get: function () { return UserGroup_1.UserGroup; } });
const UserGroupMember_1 = require("./UserGroupMember");
Object.defineProperty(exports, "UserGroupMember", { enumerable: true, get: function () { return UserGroupMember_1.UserGroupMember; } });
const GroupPermission_1 = require("./GroupPermission");
Object.defineProperty(exports, "GroupPermission", { enumerable: true, get: function () { return GroupPermission_1.GroupPermission; } });
User_1.User.belongsToMany(Permission_1.Permission, {
    through: UserPermission_1.UserPermission,
    foreignKey: 'userId',
    otherKey: 'permissionId',
    as: 'permissions',
});
Permission_1.Permission.belongsToMany(User_1.User, {
    through: UserPermission_1.UserPermission,
    foreignKey: 'permissionId',
    otherKey: 'userId',
    as: 'users',
});
User_1.User.belongsToMany(UserGroup_1.UserGroup, {
    through: UserGroupMember_1.UserGroupMember,
    foreignKey: 'userId',
    otherKey: 'userGroupId',
    as: 'userGroups',
});
UserGroup_1.UserGroup.belongsToMany(User_1.User, {
    through: UserGroupMember_1.UserGroupMember,
    foreignKey: 'userGroupId',
    otherKey: 'userId',
    as: 'members',
});
UserGroup_1.UserGroup.belongsToMany(Permission_1.Permission, {
    through: GroupPermission_1.GroupPermission,
    foreignKey: 'userGroupId',
    otherKey: 'permissionId',
    as: 'permissions',
});
Permission_1.Permission.belongsToMany(UserGroup_1.UserGroup, {
    through: GroupPermission_1.GroupPermission,
    foreignKey: 'permissionId',
    otherKey: 'userGroupId',
    as: 'userGroups',
});
User_1.User.hasMany(UserPermission_1.UserPermission, {
    foreignKey: 'userId',
    as: 'userPermissions',
});
Permission_1.Permission.hasMany(UserPermission_1.UserPermission, {
    foreignKey: 'permissionId',
    as: 'userPermissions',
});
UserPermission_1.UserPermission.belongsTo(User_1.User, {
    foreignKey: 'userId',
    as: 'user',
});
UserPermission_1.UserPermission.belongsTo(Permission_1.Permission, {
    foreignKey: 'permissionId',
    as: 'permission',
});
User_1.User.hasMany(UserGroupMember_1.UserGroupMember, {
    foreignKey: 'userId',
    as: 'groupMemberships',
});
UserGroup_1.UserGroup.hasMany(UserGroupMember_1.UserGroupMember, {
    foreignKey: 'userGroupId',
    as: 'memberDetails',
});
UserGroupMember_1.UserGroupMember.belongsTo(User_1.User, {
    foreignKey: 'userId',
    as: 'user',
});
UserGroupMember_1.UserGroupMember.belongsTo(UserGroup_1.UserGroup, {
    foreignKey: 'userGroupId',
    as: 'userGroup',
});
UserGroup_1.UserGroup.hasMany(GroupPermission_1.GroupPermission, {
    foreignKey: 'userGroupId',
    as: 'groupPermissions',
});
Permission_1.Permission.hasMany(GroupPermission_1.GroupPermission, {
    foreignKey: 'permissionId',
    as: 'groupPermissions',
});
GroupPermission_1.GroupPermission.belongsTo(UserGroup_1.UserGroup, {
    foreignKey: 'userGroupId',
    as: 'userGroup',
});
GroupPermission_1.GroupPermission.belongsTo(Permission_1.Permission, {
    foreignKey: 'permissionId',
    as: 'permission',
});
UserPermission_1.UserPermission.belongsTo(User_1.User, {
    foreignKey: 'grantedBy',
    as: 'grantedByUser',
});
UserGroupMember_1.UserGroupMember.belongsTo(User_1.User, {
    foreignKey: 'addedBy',
    as: 'addedByUser',
});
GroupPermission_1.GroupPermission.belongsTo(User_1.User, {
    foreignKey: 'grantedBy',
    as: 'grantedByUser',
});
UserGroup_1.UserGroup.belongsTo(User_1.User, {
    foreignKey: 'createdBy',
    as: 'creator',
});
//# sourceMappingURL=index.js.map