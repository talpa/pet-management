import { DataTypes, Model, Optional, Association, Op } from 'sequelize';
import { sequelize } from '../config/database';

interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password?: string; // For local authentication
  phone?: string;
  company?: string;
  role: string;
  status: 'active' | 'inactive';
  // OAuth fields
  provider?: 'local' | 'google' | 'facebook';
  providerId?: string;
  avatar?: string;
  refreshToken?: string;
  lastLoginAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public name!: string;
  public email!: string;
  public password?: string; // For local authentication
  public phone?: string;
  public company?: string;
  public role!: string;
  public status!: 'active' | 'inactive';
  // OAuth fields
  public provider?: 'local' | 'google' | 'facebook';
  public providerId?: string;
  public avatar?: string;
  public refreshToken?: string;
  public lastLoginAt?: Date;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Association properties
  public permissions?: any[];
  public userGroups?: any[];
  public userPermissions?: any[];
  public groupMemberships?: any[];

  // Static associations
  public static associations: {
    permissions: Association<User, any>;
    userGroups: Association<User, any>;
    userPermissions: Association<User, any>;
    groupMemberships: Association<User, any>;
  };
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100],
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true, // Optional because OAuth users might not have passwords
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    company: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: 'active',
    },
    provider: {
      type: DataTypes.ENUM('local', 'google', 'facebook'),
      allowNull: false,
      defaultValue: 'local',
    },
    providerId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'provider_id',
    },
    avatar: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'refresh_token',
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_login_at',
    },
  },
  {
    sequelize,
    tableName: 'users',
    modelName: 'User',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['email'],
      },
      {
        unique: true,
        fields: ['provider', 'provider_id'],
        where: {
          provider: {
            [Op.ne]: 'local'
          }
        }
      },
    ],
  }
);

export { User, UserAttributes, UserCreationAttributes };