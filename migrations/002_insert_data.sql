-- Migration 002: Insert initial data and default permissions
-- This script inserts essential data for the application

-- Insert basic animal species
INSERT INTO animal_species (name, description) VALUES 
    ('Pes', 'Domácí pes (Canis lupus familiaris)'),
    ('Kočka', 'Domácí kočka (Felis catus)'),
    ('Králík', 'Domácí králík (Oryctolagus cuniculus)'),
    ('Chomík', 'Zlatý chomík (Mesocricetus auratus)'),
    ('Morče', 'Domácí morče (Cavia porcellus)'),
    ('Papoušek', 'Různé druhy papoušků'),
    ('Kanárek', 'Domácí kanárek (Serinus canaria)')
ON CONFLICT (name) DO NOTHING;

-- Insert basic animal tags
INSERT INTO animal_tags (name, color) VALUES 
    ('Přátelský', '#4caf50'),
    ('Hravý', '#ff9800'),
    ('Klidný', '#2196f3'),
    ('Energický', '#f44336'),
    ('Chytrý', '#9c27b0'),
    ('Společenský', '#ff5722'),
    ('Nezávislý', '#607d8b'),
    ('Učenlivý', '#795548')
ON CONFLICT (name) DO NOTHING;

-- Insert basic permissions
INSERT INTO permissions (name, description, resource, action) VALUES 
    ('read_own_animals', 'Číst vlastní zvířata', 'animals', 'read'),
    ('write_own_animals', 'Upravovat vlastní zvířata', 'animals', 'write'),
    ('delete_own_animals', 'Mazat vlastní zvířata', 'animals', 'delete'),
    ('read_all_animals', 'Číst všechna zvířata', 'animals', 'read_all'),
    ('write_all_animals', 'Upravovat všechna zvířata', 'animals', 'write_all'),
    ('delete_all_animals', 'Mazat všechna zvířata', 'animals', 'delete_all'),
    ('manage_species', 'Spravovat druhy zvířat', 'species', 'manage'),
    ('manage_tags', 'Spravovat štítky', 'tags', 'manage'),
    ('manage_users', 'Spravovat uživatele', 'users', 'manage'),
    ('manage_groups', 'Spravovat skupiny', 'groups', 'manage'),
    ('view_statistics', 'Zobrazit statistiky', 'statistics', 'view'),
    ('admin_access', 'Administrátorský přístup', 'admin', 'access')
ON CONFLICT (name) DO NOTHING;

-- Insert default user groups
INSERT INTO user_groups (name, description) VALUES 
    ('Administrátoři', 'Plný přístup k systému'),
    ('Moderátoři', 'Rozšířený přístup k správě obsahu'),
    ('Registrovaní uživatelé', 'Základní uživatelé s vlastními zvířaty'),
    ('Hosté', 'Omezený přístup pouze ke čtení')
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to user groups
-- Administrátoři - všechna oprávnění
INSERT INTO group_permissions (group_id, permission_id)
SELECT ug.id, p.id 
FROM user_groups ug, permissions p 
WHERE ug.name = 'Administrátoři'
ON CONFLICT (group_id, permission_id) DO NOTHING;

-- Moderátoři - správa obsahu
INSERT INTO group_permissions (group_id, permission_id)
SELECT ug.id, p.id 
FROM user_groups ug, permissions p 
WHERE ug.name = 'Moderátoři' 
AND p.name IN ('read_all_animals', 'write_all_animals', 'manage_species', 'manage_tags', 'view_statistics')
ON CONFLICT (group_id, permission_id) DO NOTHING;

-- Registrovaní uživatelé - vlastní zvířata
INSERT INTO group_permissions (group_id, permission_id)
SELECT ug.id, p.id 
FROM user_groups ug, permissions p 
WHERE ug.name = 'Registrovaní uživatelé' 
AND p.name IN ('read_own_animals', 'write_own_animals', 'delete_own_animals')
ON CONFLICT (group_id, permission_id) DO NOTHING;

-- Insert some sample data for testing
INSERT INTO animals (name, species_id, description, is_public, seo_url) VALUES 
    ('Rex', (SELECT id FROM animal_species WHERE name = 'Pes'), 'Přátelský zlatý retrívr', true, 'rex-zlaty-retrivr'),
    ('Míca', (SELECT id FROM animal_species WHERE name = 'Kočka'), 'Krásná perská kočka', true, 'mica-perska-kocka'),
    ('Bobík', (SELECT id FROM animal_species WHERE name = 'Králík'), 'Malý bílý králíček', true, 'bobik-bily-kralik')
ON CONFLICT (seo_url) DO NOTHING;