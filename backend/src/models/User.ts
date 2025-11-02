import { DataTypes, Model, Optional, Association, Op } from 'sequelize';
import { sequelize } from '../config/database';

interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password?: string; // For local authentication
  phone?: string;
  company?: string;
  // New contact fields
  address?: string;
  viber?: string;
  whatsapp?: string;
  signal?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
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
  // New contact fields
  public address?: string;
  public viber?: string;
  public whatsapp?: string;
  public signal?: string;
  public facebook?: string;
  public instagram?: string;
  public twitter?: string;
  public linkedin?: string;
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
  public userPermissions?: any[];

  // Static associations
  public static associations: {
    permissions: Association<User, any>;
    userPermissions: Association<User, any>;
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
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    viber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    whatsapp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    signal: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    facebook: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    instagram: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    twitter: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    linkedin: {
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