import { Request, Response, NextFunction } from 'express';
interface PaginationQuery {
    page?: string;
    limit?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}
export declare const getAllUsers: (req: Request<{}, {}, {}, PaginationQuery>, res: Response, next: NextFunction) => Promise<void>;
export declare const getUserById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export {};
//# sourceMappingURL=userController.d.ts.map