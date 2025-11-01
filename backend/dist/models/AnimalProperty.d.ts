import { Model, Optional } from 'sequelize';
export interface AnimalPropertyAttributes {
    id: number;
    animalId: number;
    propertyName: string;
    propertyValue?: string;
    measuredAt?: Date;
    notes?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
interface AnimalPropertyCreationAttributes extends Optional<AnimalPropertyAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
declare class AnimalProperty extends Model<AnimalPropertyAttributes, AnimalPropertyCreationAttributes> implements AnimalPropertyAttributes {
    id: number;
    animalId: number;
    propertyName: string;
    propertyValue?: string;
    measuredAt?: Date;
    notes?: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default AnimalProperty;
//# sourceMappingURL=AnimalProperty.d.ts.map