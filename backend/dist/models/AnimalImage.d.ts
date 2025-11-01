import { Model, Optional } from 'sequelize';
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
interface AnimalImageCreationAttributes extends Optional<AnimalImageAttributes, 'id' | 'uploadedAt'> {
}
declare class AnimalImage extends Model<AnimalImageAttributes, AnimalImageCreationAttributes> implements AnimalImageAttributes {
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
    readonly uploadedAt: Date;
    readonly animal?: Animal;
    readonly uploader?: User;
}
export default AnimalImage;
//# sourceMappingURL=AnimalImage.d.ts.map