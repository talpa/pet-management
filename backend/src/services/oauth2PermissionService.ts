import { User, Permission, UserPermission, UserGroup, UserGroupMember, GroupPermission } from '../models';
import { Op } from 'sequelize';

interface UserRoleMapping {
  email?: string;
  domain?: string;
  role: string;
  permissions?: string[];
  groups?: string[];
}

// Konfigurace mapování emailů/domén na role a oprávnění
const USER_ROLE_MAPPINGS: UserRoleMapping[] = [
  // Konkrétní admin uživatelé
  {
    email: 'talpa@suchdol.net',
    role: 'admin',
    permissions: ['users.view', 'users.create', 'users.edit', 'users.delete', 'groups.manage', 'permissions.manage'],
    groups: ['Administrators']
  },
  {
    email: 'admin@example.com',
    role: 'admin',
    permissions: ['users.view', 'users.create', 'users.edit', 'users.delete', 'groups.manage', 'permissions.manage'],
    groups: ['Administrators']
  },
  
  // Doménová pravidla
  {
    domain: 'suchdol.net',
    role: 'manager',
    permissions: ['users.view', 'users.edit', 'groups.view'],
    groups: ['Managers']
  },
  {
    domain: 'yourcompany.com',
    role: 'employee',
    permissions: ['users.view'],
    groups: ['Employees']
  },
  
  // Default pro všechny ostatní
  {
    domain: '*', // Wildcard pro všechny domény
    role: 'user',
    permissions: ['users.view'],
    groups: ['Users']
  }
];

export class OAuth2PermissionService {
  /**
   * Přiřadí oprávnění uživateli na základě jeho emailu
   */
  static async assignPermissionsToUser(user: User): Promise<void> {
    try {
      console.log(`🔑 Assigning permissions to user: ${user.email}`);
      
      // Najdi odpovídající pravidlo
      const mapping = this.findUserMapping(user.email);
      
      if (!mapping) {
        console.log(`⚠️ No mapping found for user: ${user.email}`);
        return;
      }

      console.log(`📋 Found mapping for ${user.email}:`, mapping);

      // Aktualizuj roli uživatele
      if (mapping.role && user.role !== mapping.role) {
        await user.update({ role: mapping.role });
        console.log(`🎭 Updated user role to: ${mapping.role}`);
      }

      // Přiřaď oprávnění
      if (mapping.permissions && mapping.permissions.length > 0) {
        await this.assignDirectPermissions(user, mapping.permissions);
      }

      // Přiřaď do skupin
      if (mapping.groups && mapping.groups.length > 0) {
        await this.assignUserToGroups(user, mapping.groups);
      }

      console.log(`✅ Permissions assigned successfully to: ${user.email}`);
    } catch (error) {
      console.error(`❌ Error assigning permissions to user ${user.email}:`, error);
      throw error;
    }
  }

  /**
   * Najdi mapování pro daný email
   */
  private static findUserMapping(email: string): UserRoleMapping | null {
    // Nejdříve hledej konkrétní email
    let mapping = USER_ROLE_MAPPINGS.find(m => m.email === email);
    
    if (mapping) {
      return mapping;
    }

    // Pak hledej podle domény
    const domain = email.split('@')[1];
    mapping = USER_ROLE_MAPPINGS.find(m => m.domain === domain);
    
    if (mapping) {
      return mapping;
    }

    // Nakonec wildcard
    return USER_ROLE_MAPPINGS.find(m => m.domain === '*') || null;
  }

  /**
   * Přiřadí přímá oprávnění uživateli
   */
  private static async assignDirectPermissions(user: User, permissionCodes: string[]): Promise<void> {
    try {
      // Najdi oprávnění podle kódů
      const permissions = await Permission.findAll({
        where: {
          code: {
            [Op.in]: permissionCodes
          }
        }
      });

      console.log(`🔐 Found ${permissions.length} permissions for codes:`, permissionCodes);

      // Odstraň stará přímá oprávnění
      await UserPermission.destroy({
        where: { userId: user.id }
      });

      // Přiřaď nová oprávnění
      const userPermissions = permissions.map(permission => ({
        userId: user.id,
        permissionId: permission.id,
        granted: true,
        grantedBy: user.id, // Self-granted via OAuth
        grantedAt: new Date(),
      }));

      if (userPermissions.length > 0) {
        await UserPermission.bulkCreate(userPermissions);
        console.log(`✅ Assigned ${userPermissions.length} direct permissions`);
      }
    } catch (error) {
      console.error('Error assigning direct permissions:', error);
      throw error;
    }
  }

  /**
   * Přiřadí uživatele do skupin
   */
  private static async assignUserToGroups(user: User, groupNames: string[]): Promise<void> {
    try {
      // Najdi skupiny podle jmen
      const groups = await UserGroup.findAll({
        where: {
          name: {
            [Op.in]: groupNames
          },
          isActive: true
        }
      });

      console.log(`👥 Found ${groups.length} groups for names:`, groupNames);

      // Odstraň stará členství
      await UserGroupMember.destroy({
        where: { userId: user.id }
      });

      // Přiřaď do nových skupin
      const memberships = groups.map(group => ({
        userId: user.id,
        userGroupId: group.id,
        addedBy: user.id, // Self-added via OAuth
        addedAt: new Date(),
      }));

      if (memberships.length > 0) {
        await UserGroupMember.bulkCreate(memberships);
        console.log(`✅ Added user to ${memberships.length} groups`);
      }

      // Vytvoř chybějící skupiny, pokud je to potřeba
      const foundGroupNames = groups.map(g => g.name);
      const missingGroups = groupNames.filter(name => !foundGroupNames.includes(name));
      
      if (missingGroups.length > 0) {
        console.log(`🏗️ Creating missing groups:`, missingGroups);
        await this.createMissingGroups(missingGroups, user.id);
        
        // Rekurzivně zkus znovu přiřadit do nově vytvořených skupin
        await this.assignUserToGroups(user, missingGroups);
      }
    } catch (error) {
      console.error('Error assigning user to groups:', error);
      throw error;
    }
  }

  /**
   * Vytvoří chybějící skupiny
   */
  private static async createMissingGroups(groupNames: string[], createdBy: number): Promise<void> {
    try {
      const groupColors = ['#EF4444', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899'];
      
      const groupsToCreate = groupNames.map((name, index) => ({
        name,
        description: `Auto-created group for OAuth users: ${name}`,
        color: groupColors[index % groupColors.length],
        isActive: true,
        createdBy,
      }));

      const createdGroups = await UserGroup.bulkCreate(groupsToCreate);
      console.log(`✅ Created ${createdGroups.length} new groups`);

      // Přiřaď základní oprávnění novým skupinám
      for (const group of createdGroups) {
        await this.assignDefaultPermissionsToGroup(group);
      }
    } catch (error) {
      console.error('Error creating missing groups:', error);
      throw error;
    }
  }

  /**
   * Přiřadí výchozí oprávnění nové skupině
   */
  private static async assignDefaultPermissionsToGroup(group: UserGroup): Promise<void> {
    try {
      let defaultPermissions: string[] = [];

      // Základní oprávnění podle názvu skupiny
      switch (group.name.toLowerCase()) {
        case 'administrators':
        case 'admins':
          defaultPermissions = ['users.view', 'users.create', 'users.edit', 'users.delete', 'groups.manage', 'permissions.manage'];
          break;
        case 'managers':
          defaultPermissions = ['users.view', 'users.edit', 'groups.view'];
          break;
        case 'employees':
          defaultPermissions = ['users.view'];
          break;
        case 'users':
        default:
          defaultPermissions = ['users.view'];
          break;
      }

      if (defaultPermissions.length > 0) {
        const permissions = await Permission.findAll({
          where: {
            code: {
              [Op.in]: defaultPermissions
            }
          }
        });

        // Přiřaď oprávnění skupině
        const { GroupPermission } = await import('../models');
        const groupPermissions = permissions.map(permission => ({
          userGroupId: group.id,
          permissionId: permission.id,
          grantedBy: group.createdBy,
          grantedAt: new Date(),
        }));

        if (groupPermissions.length > 0) {
          await GroupPermission.bulkCreate(groupPermissions);
          console.log(`✅ Assigned ${groupPermissions.length} permissions to group: ${group.name}`);
        }
      }
    } catch (error) {
      console.error(`Error assigning default permissions to group ${group.name}:`, error);
    }
  }

  /**
   * Synchronizuje oprávnění pro existujícího uživatele (re-sync)
   */
  static async resyncUserPermissions(userId: number): Promise<void> {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }

      await this.assignPermissionsToUser(user);
    } catch (error) {
      console.error(`Error resyncing permissions for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Získá efektivní oprávnění uživatele (přímá + skupinová)
   */
  static async getUserEffectivePermissions(userId: number): Promise<any> {
    try {
      // Získej uživatele základní informace
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }

      // Získej přímá oprávnění uživatele
      const directPermissionsResult = await Permission.findAll({
        include: [{
          model: UserPermission,
          as: 'userPermissions',
          where: { userId },
          required: true,
          attributes: ['grantedAt']
        }],
        attributes: ['id', 'name', 'code', 'description', 'category']
      });

      // Získej skupinová oprávnění
      const groupPermissionsResult = await Permission.findAll({
        include: [{
          model: GroupPermission,
          as: 'groupPermissions',
          required: true,
          attributes: ['grantedAt'],
          include: [{
            model: UserGroup,
            as: 'userGroup',
            required: true,
            attributes: ['id', 'name', 'color'],
            include: [{
              model: UserGroupMember,
              as: 'memberDetails',
              where: { userId },
              required: true,
              attributes: ['addedAt']
            }]
          }]
        }],
        attributes: ['id', 'name', 'code', 'description', 'category']
      });

      // Zpracuj skupinová oprávnění s informacemi o skupinách
      const groupPermissionsWithGroups: any[] = [];
      groupPermissionsResult.forEach((permission: any) => {
        if (permission.groupPermissions && permission.groupPermissions.length > 0) {
          permission.groupPermissions.forEach((groupPermission: any) => {
            if (groupPermission.userGroup) {
              groupPermissionsWithGroups.push({
                ...permission.toJSON(),
                fromGroup: {
                  id: groupPermission.userGroup.id,
                  name: groupPermission.userGroup.name,
                  color: groupPermission.userGroup.color
                }
              });
            }
          });
        }
      });

      // Odstraň duplikáty
      const effectivePermissions: any[] = [];
      const seenPermissionIds = new Set();

      // Přidej přímá oprávnění
      directPermissionsResult.forEach((permission: any) => {
        effectivePermissions.push({
          ...permission.toJSON(),
          source: 'direct'
        });
        seenPermissionIds.add(permission.id);
      });

      // Přidej skupinová oprávnění (pokud ještě nejsou přímá)
      groupPermissionsWithGroups.forEach((permission: any) => {
        if (!seenPermissionIds.has(permission.id)) {
          effectivePermissions.push({
            ...permission,
            source: 'group'
          });
          seenPermissionIds.add(permission.id);
        }
      });

      return {
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userRole: user.role,
        directPermissions: directPermissionsResult.length,
        groupPermissions: groupPermissionsWithGroups.length,
        totalEffectivePermissions: effectivePermissions.length,
        effectivePermissions: effectivePermissions.sort((a, b) => a.name.localeCompare(b.name))
      };
    } catch (error) {
      console.error(`Error getting effective permissions for user ${userId}:`, error);
      throw error;
    }
  }
}

export default OAuth2PermissionService;