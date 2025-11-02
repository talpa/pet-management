"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserPermission = exports.Permission = exports.User = void 0;
const User_1 = require("./User");
Object.defineProperty(exports, "User", { enumerable: true, get: function () { return User_1.User; } });
const Permission_1 = require("./Permission");
Object.defineProperty(exports, "Permission", { enumerable: true, get: function () { return Permission_1.Permission; } });
const UserPermission_1 = require("./UserPermission");
Object.defineProperty(exports, "UserPermission", { enumerable: true, get: function () { return UserPermission_1.UserPermission; } });
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
UserPermission_1.UserPermission.belongsTo(User_1.User, {
    foreignKey: 'grantedBy',
    as: 'grantedByUser',
});
