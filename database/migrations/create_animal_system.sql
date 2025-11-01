-- Animal Management System Database Schema

-- 1. Animal Species (Živočišné druhy)
CREATE TABLE IF NOT EXISTS animal_species (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    scientific_name VARCHAR(150),
    description TEXT,
    category VARCHAR(50), -- mammals, birds, fish, reptiles, etc.
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Species Properties (Vlastnosti druhů)
CREATE TABLE IF NOT EXISTS species_properties (
    id SERIAL PRIMARY KEY,
    species_id INTEGER REFERENCES animal_species(id) ON DELETE CASCADE,
    property_name VARCHAR(100) NOT NULL,
    property_type VARCHAR(50) NOT NULL, -- text, number, select, boolean, date
    property_unit VARCHAR(20), -- cm, kg, years, etc.
    is_required BOOLEAN DEFAULT false,
    default_value TEXT,
    validation_rules JSONB, -- min, max, options for select, etc.
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(species_id, property_name)
);

-- 3. Animals (Zvířata)
CREATE TABLE IF NOT EXISTS animals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    species_id INTEGER REFERENCES animal_species(id) ON DELETE RESTRICT,
    owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    birth_date DATE,
    gender VARCHAR(20), -- male, female, unknown
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Animal Properties (Konkrétní vlastnosti zvířat)
CREATE TABLE IF NOT EXISTS animal_properties (
    id SERIAL PRIMARY KEY,
    animal_id INTEGER REFERENCES animals(id) ON DELETE CASCADE,
    property_name VARCHAR(100) NOT NULL,
    property_value TEXT,
    measured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(animal_id, property_name)
);

-- 5. Animal Images (Obrázky zvířat)
CREATE TABLE IF NOT EXISTS animal_images (
    id SERIAL PRIMARY KEY,
    animal_id INTEGER REFERENCES animals(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255),
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    is_primary BOOLEAN DEFAULT false,
    uploaded_by INTEGER REFERENCES users(id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_animals_species_id ON animals(species_id);
CREATE INDEX IF NOT EXISTS idx_animals_owner_id ON animals(owner_id);
CREATE INDEX IF NOT EXISTS idx_animal_properties_animal_id ON animal_properties(animal_id);
CREATE INDEX IF NOT EXISTS idx_animal_images_animal_id ON animal_images(animal_id);
CREATE INDEX IF NOT EXISTS idx_species_properties_species_id ON species_properties(species_id);

-- Insert basic animal species
INSERT INTO animal_species (name, scientific_name, description, category) VALUES
('Pes domácí', 'Canis lupus familiaris', 'Domestikovaný druh vlka', 'mammals'),
('Kočka domácí', 'Felis catus', 'Domestikovaná kočka', 'mammals'),
('Zlatá rybka', 'Carassius auratus', 'Populární akvarijní ryba', 'fish'),
('Křeček zlatý', 'Mesocricetus auratus', 'Malý hlodavec', 'mammals'),
('Papoušek vlnkový', 'Melopsittacus undulatus', 'Malý papoušek', 'birds')
ON CONFLICT (name) DO NOTHING;

-- Insert basic properties for each species
-- Dog properties
INSERT INTO species_properties (species_id, property_name, property_type, property_unit, is_required, validation_rules, display_order) 
SELECT id, 'Výška v kohoutku', 'number', 'cm', true, '{"min": 10, "max": 100}', 1 FROM animal_species WHERE name = 'Pes domácí'
ON CONFLICT (species_id, property_name) DO NOTHING;

INSERT INTO species_properties (species_id, property_name, property_type, property_unit, is_required, validation_rules, display_order) 
SELECT id, 'Hmotnost', 'number', 'kg', true, '{"min": 1, "max": 100}', 2 FROM animal_species WHERE name = 'Pes domácí'
ON CONFLICT (species_id, property_name) DO NOTHING;

INSERT INTO species_properties (species_id, property_name, property_type, is_required, validation_rules, display_order) 
SELECT id, 'Délka srsti', 'select', null, false, '{"options": ["krátká", "střední", "dlouhá"]}', 3 FROM animal_species WHERE name = 'Pes domácí'
ON CONFLICT (species_id, property_name) DO NOTHING;

INSERT INTO species_properties (species_id, property_name, property_type, is_required, validation_rules, display_order) 
SELECT id, 'Barva srsti', 'text', null, false, '{}', 4 FROM animal_species WHERE name = 'Pes domácí'
ON CONFLICT (species_id, property_name) DO NOTHING;

-- Cat properties
INSERT INTO species_properties (species_id, property_name, property_type, property_unit, is_required, validation_rules, display_order) 
SELECT id, 'Hmotnost', 'number', 'kg', true, '{"min": 1, "max": 20}', 1 FROM animal_species WHERE name = 'Kočka domácí'
ON CONFLICT (species_id, property_name) DO NOTHING;

INSERT INTO species_properties (species_id, property_name, property_type, is_required, validation_rules, display_order) 
SELECT id, 'Délka srsti', 'select', null, false, '{"options": ["krátká", "dlouhá"]}', 2 FROM animal_species WHERE name = 'Kočka domácí'
ON CONFLICT (species_id, property_name) DO NOTHING;

INSERT INTO species_properties (species_id, property_name, property_type, is_required, validation_rules, display_order) 
SELECT id, 'Barva očí', 'select', null, false, '{"options": ["zelené", "modré", "žluté", "oranžové", "různobarevné"]}', 3 FROM animal_species WHERE name = 'Kočka domácí'
ON CONFLICT (species_id, property_name) DO NOTHING;

-- Fish properties
INSERT INTO species_properties (species_id, property_name, property_type, property_unit, is_required, validation_rules, display_order) 
SELECT id, 'Délka těla', 'number', 'cm', true, '{"min": 1, "max": 50}', 1 FROM animal_species WHERE name = 'Zlatá rybka'
ON CONFLICT (species_id, property_name) DO NOTHING;

INSERT INTO species_properties (species_id, property_name, property_type, property_unit, is_required, validation_rules, display_order) 
SELECT id, 'Délka hřbetní ploutve', 'number', 'cm', false, '{"min": 0.5, "max": 10}', 2 FROM animal_species WHERE name = 'Zlatá rybka'
ON CONFLICT (species_id, property_name) DO NOTHING;

INSERT INTO species_properties (species_id, property_name, property_type, is_required, validation_rules, display_order) 
SELECT id, 'Typ ploutví', 'select', null, false, '{"options": ["normální", "závoj", "ryukin", "oranda"]}', 3 FROM animal_species WHERE name = 'Zlatá rybka'
ON CONFLICT (species_id, property_name) DO NOTHING;

-- Hamster properties
INSERT INTO species_properties (species_id, property_name, property_type, property_unit, is_required, validation_rules, display_order) 
SELECT id, 'Délka těla', 'number', 'cm', true, '{"min": 8, "max": 20}', 1 FROM animal_species WHERE name = 'Křeček zlatý'
ON CONFLICT (species_id, property_name) DO NOTHING;

INSERT INTO species_properties (species_id, property_name, property_type, property_unit, is_required, validation_rules, display_order) 
SELECT id, 'Hmotnost', 'number', 'g', true, '{"min": 80, "max": 200}', 2 FROM animal_species WHERE name = 'Křeček zlatý'
ON CONFLICT (species_id, property_name) DO NOTHING;

-- Bird properties
INSERT INTO species_properties (species_id, property_name, property_type, property_unit, is_required, validation_rules, display_order) 
SELECT id, 'Rozpětí křídel', 'number', 'cm', false, '{"min": 15, "max": 30}', 1 FROM animal_species WHERE name = 'Papoušek vlnkový'
ON CONFLICT (species_id, property_name) DO NOTHING;

INSERT INTO species_properties (species_id, property_name, property_type, is_required, validation_rules, display_order) 
SELECT id, 'Barva peří', 'text', null, false, '{}', 2 FROM animal_species WHERE name = 'Papoušek vlnkový'
ON CONFLICT (species_id, property_name) DO NOTHING;

INSERT INTO species_properties (species_id, property_name, property_type, is_required, validation_rules, display_order) 
SELECT id, 'Umí mluvit', 'boolean', null, false, '{}', 3 FROM animal_species WHERE name = 'Papoušek vlnkový'
ON CONFLICT (species_id, property_name) DO NOTHING;