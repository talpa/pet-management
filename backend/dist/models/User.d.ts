import { Model, Optional, Association } from 'sequelize';
interface UserAttributes {
    id: number;
    name: string;
    email: string;
    password?: string;
    phone?: string;
    company?: string;
    role: string;
    status: 'active' | 'inactive';
    provider?: 'local' | 'google' | 'facebook';
    providerId?: string;
    avatar?: string;
    refreshToken?: string;
    lastLoginAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
declare class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    id: number;
    name: string;
    email: string;
    password?: string;
    phone?: string;
    company?: string;
    role: string;
    status: 'active' | 'inactive';
    provider?: 'local' | 'google' | 'facebook';
    providerId?: string;
    avatar?: string;
    refreshToken?: string;
    lastLoginAt?: Date;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    permissions?: any[];
    userGroups?: any[];
    userPermissions?: any[];
    groupMemberships?: any[];
    static associations: {
        permissions: Association<User, any>;
        userGroups: Association<User, any>;
        userPermissions: Association<User, any>;
        groupMemberships: Association<User, any>;
    };
}
export { User, UserAttributes, UserCreationAttributes };
//# sourceMappingURL=User.d.ts.map