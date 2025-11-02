-- Migration: Remove UserGroup system tables
-- Date: 2025-11-02
-- Purpose: Remove UserGroups, UserGroupMembers, and GroupPermissions tables as requested by user

-- Remove foreign key constraints first
ALTER TABLE user_group_members DROP CONSTRAINT IF EXISTS user_group_members_user_id_fkey;
ALTER TABLE user_group_members DROP CONSTRAINT IF EXISTS user_group_members_user_group_id_fkey;
ALTER TABLE group_permissions DROP CONSTRAINT IF EXISTS group_permissions_user_group_id_fkey;
ALTER TABLE group_permissions DROP CONSTRAINT IF EXISTS group_permissions_permission_id_fkey;

-- Drop indexes if they exist
DROP INDEX IF EXISTS idx_user_group_members_user_id;
DROP INDEX IF EXISTS idx_user_group_members_user_group_id;
DROP INDEX IF EXISTS idx_group_permissions_user_group_id;
DROP INDEX IF EXISTS idx_group_permissions_permission_id;

-- Drop tables (in reverse dependency order)
DROP TABLE IF EXISTS group_permissions;
DROP TABLE IF EXISTS user_group_members;
DROP TABLE IF EXISTS user_groups;

-- Clean up any orphaned permissions related to group management
DELETE FROM permissions WHERE name IN (
  'groups.view',
  'groups.create', 
  'groups.edit',
  'groups.delete',
  'groups.manage',
  'group-members.view',
  'group-members.add',
  'group-members.remove',
  'group-permissions.view',
  'group-permissions.assign',
  'group-permissions.revoke'
);

-- Optional: Clean up user permissions that were granted through groups
-- (This removes any orphaned user_permissions that might reference deleted group permissions)
DELETE FROM user_permissions 
WHERE permission_id NOT IN (SELECT id FROM permissions);

COMMIT;