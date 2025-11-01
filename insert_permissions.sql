INSERT INTO permissions (name, code, description, category, "createdAt", "updatedAt") VALUES
('View Users', 'users.view', 'Can view user list and user details', 'users', NOW(), NOW()),
('Create Users', 'users.create', 'Can create new users', 'users', NOW(), NOW()),
('Edit Users', 'users.edit', 'Can edit existing users', 'users', NOW(), NOW()),
('Delete Users', 'users.delete', 'Can delete users', 'users', NOW(), NOW()),
('Manage User Permissions', 'users.permissions', 'Can grant and revoke user permissions', 'users', NOW(), NOW()),
('View Data', 'data.view', 'Can view data tables and reports', 'data', NOW(), NOW()),
('Export Data', 'data.export', 'Can export data to files', 'data', NOW(), NOW()),
('Import Data', 'data.import', 'Can import data from files', 'data', NOW(), NOW()),
('Modify Data', 'data.modify', 'Can create, edit, and delete data records', 'data', NOW(), NOW()),
('System Administration', 'admin.system', 'Full system administration access', 'admin', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;