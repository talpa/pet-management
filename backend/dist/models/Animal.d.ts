import { Model, Optional } from 'sequelize';
import AnimalSpecies from './AnimalSpecies';
import { User } from './User';
export interface AnimalAttributes {
    id: number;
    name: string;
    speciesId: number;
    ownerId: number;
    birthDate?: Date;
    gender?: string;
    description?: string;
    seoUrl?: string;
    isActive: boolean;
    createdBy?: number;
    createdAt?: Date;
    updatedAt?: Date;
}
interface AnimalCreationAttributes extends Optional<AnimalAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
declare class Animal extends Model<AnimalAttributes, AnimalCreationAttributes> implements AnimalAttributes {
    id: number;
    name: string;
    speciesId: number;
    ownerId: number;
    birthDate?: Date;
    gender?: string;
    description?: string;
    seoUrl?: string;
    isActive: boolean;
    createdBy?: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly species?: AnimalSpecies;
    readonly owner?: User;
    readonly creator?: User;
}
export default Animal;
//# sourceMappingURL=Animal.d.ts.map