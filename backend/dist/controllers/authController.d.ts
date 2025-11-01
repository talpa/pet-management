import { Request, Response } from 'express';
interface AuthenticatedRequest extends Request {
    user?: any;
}
export declare const loginSuccess: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const loginFailure: (req: Request, res: Response) => Promise<void>;
export declare const getCurrentUser: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const logout: (req: Request, res: Response) => Promise<void>;
export declare const verifyToken: (req: Request, res: Response) => Promise<void>;
export declare const classicLogin: (req: Request, res: Response) => Promise<void>;
export declare const classicRegister: (req: Request, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=authController.d.ts.map