import { Request, Response, NextFunction } from 'express';
interface AuthenticatedRequest extends Request {
    userId?: number;
    user?: any;
}
export declare const authenticateToken: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const requirePermission: (permissionName: string) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export {};
//# sourceMappingURL=auth.d.ts.map