import { Model, Optional } from 'sequelize';
interface UserGroupAttributes {
    id: number;
    name: string;
    description?: string;
    color?: string;
    isActive: boolean;
    createdBy?: number;
    createdAt?: Date;
    updatedAt?: Date;
}
interface UserGroupCreationAttributes extends Optional<UserGroupAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
declare class UserGroup extends Model<UserGroupAttributes, UserGroupCreationAttributes> implements UserGroupAttributes {
    id: number;
    name: string;
    description?: string;
    color?: string;
    isActive: boolean;
    createdBy?: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export { UserGroup, UserGroupAttributes, UserGroupCreationAttributes };
//# sourceMappingURL=UserGroup.d.ts.map