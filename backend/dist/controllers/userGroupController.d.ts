import { Request, Response } from 'express';
interface AuthenticatedRequest extends Request {
    userId?: number;
}
export declare const userGroupController: {
    getAllGroups: (req: Request, res: Response) => Promise<void>;
    getGroup: (req: Request, res: Response) => Promise<void>;
    createGroup: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    updateGroup: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    deleteGroup: (req: Request, res: Response) => Promise<void>;
    addUserToGroup: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    removeUserFromGroup: (req: Request, res: Response) => Promise<void>;
    grantPermissionToGroup: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    revokePermissionFromGroup: (req: Request, res: Response) => Promise<void>;
    getUserEffectivePermissions: (req: Request, res: Response) => Promise<void>;
    getAllMemberships: (req: Request, res: Response) => Promise<void>;
    updateUserMemberships: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    addUserToGroupEnhanced: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    resyncUserPermissions: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    getUserEffectivePermissionsEnhanced: (req: Request, res: Response) => Promise<void>;
};
export {};
//# sourceMappingURL=userGroupController.d.ts.map