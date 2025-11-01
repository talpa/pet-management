-- Initialize database with sample data
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sample users data will be inserted by Sequelize
INSERT INTO users (name, email, phone, company, role, status, "createdAt", "updatedAt") VALUES
('John Doe', 'john.doe@example.com', '+420123456789', 'Tech Corp', 'Developer', 'active', NOW(), NOW()),
('Jane Smith', 'jane.smith@example.com', '+420987654321', 'Design Studio', 'Designer', 'active', NOW(), NOW()),
('Bob Johnson', 'bob.johnson@example.com', '+420555666777', 'Marketing Inc', 'Manager', 'inactive', NOW(), NOW()),
('Alice Brown', 'alice.brown@example.com', '+420111222333', 'Data Analytics', 'Analyst', 'active', NOW(), NOW()),
('Charlie Wilson', 'charlie.wilson@example.com', '+420444555666', 'DevOps Solutions', 'DevOps Engineer', 'active', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

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
INSERT INTO permissions (name, code, description, category, "createdAt", "updatedAt") VALUES
-- User management permissions
('View Users', 'users.view', 'Can view user list and user details', 'users', NOW(), NOW()),
('Create Users', 'users.create', 'Can create new users', 'users', NOW(), NOW()),
('Edit Users', 'users.edit', 'Can edit existing users', 'users', NOW(), NOW()),
('Delete Users', 'users.delete', 'Can delete users', 'users', NOW(), NOW()),
('Manage User Permissions', 'users.permissions', 'Can grant and revoke user permissions', 'users', NOW(), NOW()),

-- Data management permissions
('View Data', 'data.view', 'Can view data tables and reports', 'data', NOW(), NOW()),
('Export Data', 'data.export', 'Can export data to files', 'data', NOW(), NOW()),
('Import Data', 'data.import', 'Can import data from files', 'data', NOW(), NOW()),
('Modify Data', 'data.modify', 'Can create, edit, and delete data records', 'data', NOW(), NOW()),

-- Admin permissions
('System Administration', 'admin.system', 'Full system administration access', 'admin', NOW(), NOW()),
('View Logs', 'admin.logs', 'Can view system logs and audit trails', 'admin', NOW(), NOW()),
('Manage Settings', 'admin.settings', 'Can modify system settings', 'admin', NOW(), NOW()),
('Database Access', 'admin.database', 'Can access database directly', 'admin', NOW(), NOW()),

-- Report permissions
('View Reports', 'reports.view', 'Can view generated reports', 'reports', NOW(), NOW()),
('Create Reports', 'reports.create', 'Can create new reports', 'reports', NOW(), NOW()),
('Share Reports', 'reports.share', 'Can share reports with other users', 'reports', NOW(), NOW())

ON CONFLICT (code) DO NOTHING;