-- OAuth Permission Management Setup
-- Run this SQL to create basic permissions and groups for OAuth integration

-- Insert basic permissions if they don't exist
INSERT INTO permissions (name, code, description, category, "createdAt", "updatedAt") 
VALUES 
  ('View Users', 'users.view', 'Can view user list and user details', 'users', NOW(), NOW()),
  ('Create Users', 'users.create', 'Can create new users', 'users', NOW(), NOW()),
  ('Edit Users', 'users.edit', 'Can edit existing users', 'users', NOW(), NOW()),
  ('Delete Users', 'users.delete', 'Can delete users', 'users', NOW(), NOW()),
  ('Manage Groups', 'groups.manage', 'Can create, edit, and delete user groups', 'groups', NOW(), NOW()),
  ('View Groups', 'groups.view', 'Can view user groups', 'groups', NOW(), NOW()),
  ('Manage Permissions', 'permissions.manage', 'Can grant and revoke permissions', 'permissions', NOW(), NOW()),
  ('System Admin', 'system.admin', 'Full system administration access', 'system', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Insert basic user groups if they don't exist
INSERT INTO user_groups (name, description, color, is_active, created_by, created_at, updated_at) 
VALUES 
  ('Administrators', 'Full system access with all permissions', '#EF4444', true, 1, NOW(), NOW()),
  ('Managers', 'Management level access to user and group management', '#10B981', true, 1, NOW(), NOW()),
  ('Employees', 'Standard employee access with basic permissions', '#3B82F6', true, 1, NOW(), NOW()),
  ('Users', 'Basic user access with minimal permissions', '#6B7280', true, 1, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to groups
-- Administrators get all permissions
INSERT INTO group_permissions (user_group_id, permission_id, granted_by, granted_at, created_at, updated_at)
SELECT 
  ug.id as user_group_id,
  p.id as permission_id,
  1 as granted_by,
  NOW() as granted_at,
  NOW() as created_at,
  NOW() as updated_at
FROM user_groups ug
CROSS JOIN permissions p
WHERE ug.name = 'Administrators'
ON CONFLICT (user_group_id, permission_id) DO NOTHING;

-- Managers get user and group management permissions
INSERT INTO group_permissions (user_group_id, permission_id, granted_by, granted_at, created_at, updated_at)
SELECT 
  ug.id as user_group_id,
  p.id as permission_id,
  1 as granted_by,
  NOW() as granted_at,
  NOW() as created_at,
  NOW() as updated_at
FROM user_groups ug
CROSS JOIN permissions p
WHERE ug.name = 'Managers' 
  AND p.code IN ('users.view', 'users.edit', 'groups.view')
ON CONFLICT (user_group_id, permission_id) DO NOTHING;

-- Employees get basic user view permissions
INSERT INTO group_permissions (user_group_id, permission_id, granted_by, granted_at, created_at, updated_at)
SELECT 
  ug.id as user_group_id,
  p.id as permission_id,
  1 as granted_by,
  NOW() as granted_at,
  NOW() as created_at,
  NOW() as updated_at
FROM user_groups ug
CROSS JOIN permissions p
WHERE ug.name = 'Employees' 
  AND p.code IN ('users.view')
ON CONFLICT (user_group_id, permission_id) DO NOTHING;

-- Users get minimal view permissions
INSERT INTO group_permissions (user_group_id, permission_id, granted_by, granted_at, created_at, updated_at)
SELECT 
  ug.id as user_group_id,
  p.id as permission_id,
  1 as granted_by,
  NOW() as granted_at,
  NOW() as created_at,
  NOW() as updated_at
FROM user_groups ug
CROSS JOIN permissions p
WHERE ug.name = 'Users' 
  AND p.code IN ('users.view')
ON CONFLICT (user_group_id, permission_id) DO NOTHING;

-- Show results
SELECT 
  'Created permissions:' as message,
  COUNT(*) as count
FROM permissions;

SELECT 
  'Created groups:' as message,
  COUNT(*) as count
FROM user_groups;

SELECT 
  'Created group permissions:' as message,
  COUNT(*) as count
FROM group_permissions;