import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import Animal from './Animal';
import { User } from './User';

export interface AnimalImageAttributes {
  id: number;
  animalId: number;
  filename: string;
  originalName?: string;
  processedFilename?: string;
  thumbnailFilename?: string;
  filePath?: string;
  size?: number;
  mimeType?: string;
  isPrimary: boolean;
  uploadedBy?: number;
  uploadedAt?: Date;
}

interface AnimalImageCreationAttributes extends Optional<AnimalImageAttributes, 'id' | 'uploadedAt'> {}

class AnimalImage extends Model<AnimalImageAttributes, AnimalImageCreationAttributes> 
  implements AnimalImageAttributes {
  public id!: number;
  public animalId!: number;
  public filename!: string;
  public originalName?: string;
  public processedFilename?: string;
  public thumbnailFilename?: string;
  public filePath?: string;
  public size?: number;
  public mimeType?: string;
  public isPrimary!: boolean;
  public uploadedBy?: number;

  // timestamps!
  public readonly uploadedAt!: Date;

  // associations
  public readonly animal?: Animal;
  public readonly uploader?: User;
}

AnimalImage.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    animalId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Animal,
        key: 'id',
      },
      field: 'animal_id',
    },
    filename: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    originalName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'original_name',
    },
    processedFilename: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'processed_filename',
    },
    thumbnailFilename: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'thumbnail_filename',
    },
    filePath: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'file_path',
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'file_size',
    },
    mimeType: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'mime_type',
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_primary',
    },
    uploadedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: User,
        key: 'id',
      },
      field: 'uploaded_by',
    },
  },
  {
    sequelize,
    modelName: 'AnimalImage',
    tableName: 'animal_images',
    timestamps: true,
    createdAt: 'uploaded_at',
    updatedAt: false,
  }
);

export default AnimalImage;