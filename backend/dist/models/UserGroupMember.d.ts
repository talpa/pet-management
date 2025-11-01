import { Model, Optional } from 'sequelize';
interface UserGroupMemberAttributes {
    id: number;
    userId: number;
    userGroupId: number;
    addedBy?: number;
    addedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
interface UserGroupMemberCreationAttributes extends Optional<UserGroupMemberAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
declare class UserGroupMember extends Model<UserGroupMemberAttributes, UserGroupMemberCreationAttributes> implements UserGroupMemberAttributes {
    id: number;
    userId: number;
    userGroupId: number;
    addedBy?: number;
    addedAt?: Date;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export { UserGroupMember, UserGroupMemberAttributes, UserGroupMemberCreationAttributes };
//# sourceMappingURL=UserGroupMember.d.ts.map