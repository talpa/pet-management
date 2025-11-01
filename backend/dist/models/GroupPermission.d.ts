import { Model, Optional } from 'sequelize';
interface GroupPermissionAttributes {
    id: number;
    userGroupId: number;
    permissionId: number;
    grantedBy?: number;
    grantedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
interface GroupPermissionCreationAttributes extends Optional<GroupPermissionAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
declare class GroupPermission extends Model<GroupPermissionAttributes, GroupPermissionCreationAttributes> implements GroupPermissionAttributes {
    id: number;
    userGroupId: number;
    permissionId: number;
    grantedBy?: number;
    grantedAt?: Date;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export { GroupPermission, GroupPermissionAttributes, GroupPermissionCreationAttributes };
//# sourceMappingURL=GroupPermission.d.ts.map