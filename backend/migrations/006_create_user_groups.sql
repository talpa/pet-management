-- Create user_groups table
CREATE TABLE IF NOT EXISTS user_groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#6B7280',
    is_active BOOLEAN DEFAULT true,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user_group_members table (junction table for users and groups)
CREATE TABLE IF NOT EXISTS user_group_members (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_group_id INTEGER NOT NULL REFERENCES user_groups(id) ON DELETE CASCADE,
    added_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, user_group_id)
);

-- Create group_permissions table (junction table for groups and permissions)
CREATE TABLE IF NOT EXISTS group_permissions (
    id SERIAL PRIMARY KEY,
    user_group_id INTEGER NOT NULL REFERENCES user_groups(id) ON DELETE CASCADE,
    permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    granted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_group_id, permission_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_groups_name ON user_groups(name);
CREATE INDEX IF NOT EXISTS idx_user_groups_active ON user_groups(is_active);
CREATE INDEX IF NOT EXISTS idx_user_groups_created_by ON user_groups(created_by);

CREATE INDEX IF NOT EXISTS idx_user_group_members_user_id ON user_group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_user_group_members_group_id ON user_group_members(user_group_id);
CREATE INDEX IF NOT EXISTS idx_user_group_members_added_by ON user_group_members(added_by);

CREATE INDEX IF NOT EXISTS idx_group_permissions_group_id ON group_permissions(user_group_id);
CREATE INDEX IF NOT EXISTS idx_group_permissions_permission_id ON group_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_group_permissions_granted_by ON group_permissions(granted_by);

-- Insert default user groups
INSERT INTO user_groups (name, description, color, is_active, created_by) VALUES
('Administrators', 'Full system access with all permissions', '#EF4444', true, 1),
('Managers', 'Management level access with most permissions', '#F59E0B', true, 1),
('Users', 'Standard user access with basic permissions', '#10B981', true, 1),
('Guests', 'Limited access for guest users', '#6B7280', true, 1),
('Support', 'Customer support team with user management access', '#8B5CF6', true, 1)
ON CONFLICT (name) DO NOTHING;

-- Grant all permissions to Administrators group
INSERT INTO group_permissions (user_group_id, permission_id, granted_by, granted_at)
SELECT 
    (SELECT id FROM user_groups WHERE name = 'Administrators'),
    p.id,
    1,
    CURRENT_TIMESTAMP
FROM permissions p
ON CONFLICT (user_group_id, permission_id) DO NOTHING;

-- Grant management permissions to Managers group
INSERT INTO group_permissions (user_group_id, permission_id, granted_by, granted_at)
SELECT 
    (SELECT id FROM user_groups WHERE name = 'Managers'),
    p.id,
    1,
    CURRENT_TIMESTAMP
FROM permissions p
WHERE p.category IN ('users', 'data')
ON CONFLICT (user_group_id, permission_id) DO NOTHING;

-- Grant basic permissions to Users group
INSERT INTO group_permissions (user_group_id, permission_id, granted_by, granted_at)
SELECT 
    (SELECT id FROM user_groups WHERE name = 'Users'),
    p.id,
    1,
    CURRENT_TIMESTAMP
FROM permissions p
WHERE p.name IN ('data.view', 'data.create', 'users.view')
ON CONFLICT (user_group_id, permission_id) DO NOTHING;

-- Grant read-only permissions to Guests group
INSERT INTO group_permissions (user_group_id, permission_id, granted_by, granted_at)
SELECT 
    (SELECT id FROM user_groups WHERE name = 'Guests'),
    p.id,
    1,
    CURRENT_TIMESTAMP
FROM permissions p
WHERE p.name IN ('data.view', 'users.view')
ON CONFLICT (user_group_id, permission_id) DO NOTHING;

-- Grant support permissions to Support group
INSERT INTO group_permissions (user_group_id, permission_id, granted_by, granted_at)
SELECT 
    (SELECT id FROM user_groups WHERE name = 'Support'),
    p.id,
    1,
    CURRENT_TIMESTAMP
FROM permissions p
WHERE p.category = 'users'
ON CONFLICT (user_group_id, permission_id) DO NOTHING;

-- Add admin user to Administrators group
INSERT INTO user_group_members (user_id, user_group_id, added_by, added_at)
SELECT 
    1,
    (SELECT id FROM user_groups WHERE name = 'Administrators'),
    1,
    CURRENT_TIMESTAMP
ON CONFLICT (user_id, user_group_id) DO NOTHING;