import { Model, Optional } from 'sequelize';
interface PermissionAttributes {
    id: number;
    name: string;
    code: string;
    description?: string;
    category: string;
    createdAt?: Date;
    updatedAt?: Date;
}
interface PermissionCreationAttributes extends Optional<PermissionAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
declare class Permission extends Model<PermissionAttributes, PermissionCreationAttributes> implements PermissionAttributes {
    id: number;
    name: string;
    code: string;
    description?: string;
    category: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export { Permission, PermissionAttributes, PermissionCreationAttributes };
//# sourceMappingURL=Permission.d.ts.map