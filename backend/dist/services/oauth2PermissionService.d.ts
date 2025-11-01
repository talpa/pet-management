import { User } from '../models';
export declare class OAuth2PermissionService {
    static assignPermissionsToUser(user: User): Promise<void>;
    private static findUserMapping;
    private static assignDirectPermissions;
    private static assignUserToGroups;
    private static createMissingGroups;
    private static assignDefaultPermissionsToGroup;
    static resyncUserPermissions(userId: number): Promise<void>;
    static getUserEffectivePermissions(userId: number): Promise<any>;
}
export default OAuth2PermissionService;
//# sourceMappingURL=oauth2PermissionService.d.ts.map