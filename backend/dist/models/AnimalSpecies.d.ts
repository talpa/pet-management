import { Model, Optional } from 'sequelize';
export interface AnimalSpeciesAttributes {
    id: number;
    name: string;
    scientificName?: string;
    description?: string;
    category?: string;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
interface AnimalSpeciesCreationAttributes extends Optional<AnimalSpeciesAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
declare class AnimalSpecies extends Model<AnimalSpeciesAttributes, AnimalSpeciesCreationAttributes> implements AnimalSpeciesAttributes {
    id: number;
    name: string;
    scientificName?: string;
    description?: string;
    category?: string;
    isActive: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default AnimalSpecies;
//# sourceMappingURL=AnimalSpecies.d.ts.map