import { Request, Response } from 'express';
export declare class AnimalController {
    static getAll(req: Request, res: Response): Promise<void>;
    static getById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getBySeoUrl(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static create(req: Request, res: Response): Promise<void>;
    static update(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static delete(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static uploadImages(req: Request, res: Response): Promise<Response>;
    static deleteImage(req: Request, res: Response): Promise<Response>;
    static setPrimaryImage(req: Request, res: Response): Promise<Response>;
    static generateQRCode(req: Request, res: Response): Promise<Response>;
    static checkSeoUrl(req: Request, res: Response): Promise<Response>;
    static suggestSeoUrl(req: Request, res: Response): Promise<Response>;
}
//# sourceMappingURL=animalController.d.ts.map