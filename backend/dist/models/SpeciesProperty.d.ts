import { Model, Optional } from 'sequelize';
export interface SpeciesPropertyAttributes {
    id: number;
    speciesId: number;
    propertyName: string;
    propertyType: string;
    propertyUnit?: string;
    isRequired: boolean;
    defaultValue?: string;
    validationRules?: object;
    displayOrder: number;
    createdAt?: Date;
}
interface SpeciesPropertyCreationAttributes extends Optional<SpeciesPropertyAttributes, 'id' | 'createdAt'> {
}
declare class SpeciesProperty extends Model<SpeciesPropertyAttributes, SpeciesPropertyCreationAttributes> implements SpeciesPropertyAttributes {
    id: number;
    speciesId: number;
    propertyName: string;
    propertyType: string;
    propertyUnit?: string;
    isRequired: boolean;
    defaultValue?: string;
    validationRules?: object;
    displayOrder: number;
    readonly createdAt: Date;
}
export default SpeciesProperty;
//# sourceMappingURL=SpeciesProperty.d.ts.map