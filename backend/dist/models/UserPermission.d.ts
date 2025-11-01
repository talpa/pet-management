import { Model, Optional } from 'sequelize';
interface UserPermissionAttributes {
    id: number;
    userId: number;
    permissionId: number;
    granted: boolean;
    grantedBy?: number;
    grantedAt?: Date;
    expiresAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
interface UserPermissionCreationAttributes extends Optional<UserPermissionAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
declare class UserPermission extends Model<UserPermissionAttributes, UserPermissionCreationAttributes> implements UserPermissionAttributes {
    id: number;
    userId: number;
    permissionId: number;
    granted: boolean;
    grantedBy?: number;
    grantedAt?: Date;
    expiresAt?: Date;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export { UserPermission, UserPermissionAttributes, UserPermissionCreationAttributes };
//# sourceMappingURL=UserPermission.d.ts.map