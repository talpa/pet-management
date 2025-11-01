import { Request, Response, NextFunction } from 'express';
interface PaginationQuery {
    page?: string;
    limit?: string;
    search?: string;
    category?: string;
}
export declare const getAllPermissions: (req: Request<{}, {}, {}, PaginationQuery>, res: Response, next: NextFunction) => Promise<void>;
export declare const getUserPermissions: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const grantPermission: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const revokePermission: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createPermission: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getPermissionCategories: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export {};
//# sourceMappingURL=permissionController.d.ts.map