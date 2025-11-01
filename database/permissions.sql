-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create user_permissions table
CREATE TABLE IF NOT EXISTS user_permissions (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "permissionId" INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  granted BOOLEAN NOT NULL DEFAULT true,
  "grantedBy" INTEGER REFERENCES users(id),
  "grantedAt" TIMESTAMP WITH TIME ZONE,
  "expiresAt" TIMESTAMP WITH TIME ZONE,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE("userId", "permissionId")
);

-- Insert default permissions
INSERT INTO permissions (name, code, description, category) VALUES
-- User management permissions
('View Users', 'users.view', 'Can view user list and user details', 'users'),
('Create Users', 'users.create', 'Can create new users', 'users'),
('Edit Users', 'users.edit', 'Can edit existing users', 'users'),
('Delete Users', 'users.delete', 'Can delete users', 'users'),
('Manage User Permissions', 'users.permissions', 'Can grant and revoke user permissions', 'users'),

-- Data management permissions
('View Data', 'data.view', 'Can view data tables and reports', 'data'),
('Export Data', 'data.export', 'Can export data to files', 'data'),
('Import Data', 'data.import', 'Can import data from files', 'data'),
('Modify Data', 'data.modify', 'Can create, edit, and delete data records', 'data'),

-- Admin permissions
('System Administration', 'admin.system', 'Full system administration access', 'admin'),
('View Logs', 'admin.logs', 'Can view system logs and audit trails', 'admin'),
('Manage Settings', 'admin.settings', 'Can modify system settings', 'admin'),
('Database Access', 'admin.database', 'Can access database directly', 'admin'),

-- Report permissions
('View Reports', 'reports.view', 'Can view generated reports', 'reports'),
('Create Reports', 'reports.create', 'Can create new reports', 'reports'),
('Share Reports', 'reports.share', 'Can share reports with other users', 'reports')

ON CONFLICT (code) DO NOTHING;