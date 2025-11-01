import { Request, Response } from 'express';
export declare class AnimalSpeciesController {
    static getAll(req: Request, res: Response): Promise<void>;
    static getById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static create(req: Request, res: Response): Promise<void>;
    static update(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static delete(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getCategories(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=animalSpeciesController.d.ts.map