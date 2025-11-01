-- Migration: Add animal tags support
-- Run this in your PostgreSQL database

-- Create animal_tags table
CREATE TABLE animal_tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    color VARCHAR(7) DEFAULT '#1976d2',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create animal_tag_assignments table (many-to-many)
CREATE TABLE animal_tag_assignments (
    id SERIAL PRIMARY KEY,
    animal_id INTEGER NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES animal_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(animal_id, tag_id)
);

-- Create indexes for better performance
CREATE INDEX idx_animal_tag_assignments_animal_id ON animal_tag_assignments(animal_id);
CREATE INDEX idx_animal_tag_assignments_tag_id ON animal_tag_assignments(tag_id);
CREATE INDEX idx_animal_tags_name ON animal_tags(name);

-- Insert some default tags
INSERT INTO animal_tags (name, description, color) VALUES
    ('roztomilý', 'Roztomilá zvířátka', '#FF69B4'),
    ('velký', 'Velká zvířata', '#FF8C00'),
    ('malý', 'Malá zvířata', '#32CD32'),
    ('hravý', 'Hravá a aktivní zvířata', '#FFD700'),
    ('klidný', 'Klidná a pohodová zvířata', '#4169E1'),
    ('chytrý', 'Inteligentní zvířata', '#9932CC'),
    ('přátelský', 'Přátelská k lidem', '#20B2AA'),
    ('domácí', 'Domácí mazlíčci', '#228B22'),
    ('outdoor', 'Zvířata pro venkovní chov', '#8B4513'),
    ('indoor', 'Zvířata pro vnitřní chov', '#4682B4'),
    ('začátečník', 'Vhodné pro začátečníky', '#3CB371'),
    ('pokročilý', 'Pro zkušené chovátele', '#DC143C'),
    ('exotický', 'Exotická zvířata', '#FF4500'),
    ('vzácný', 'Vzácné druhy', '#8A2BE2'),
    ('léčivý', 'Terapeutická zvířata', '#00CED1'),
    ('výstavní', 'Výstavní exempláře', '#FFB6C1'),
    ('plemenitba', 'Určeno k plemenitbě', '#DDA0DD'),
    ('pracovní', 'Pracovní zvířata', '#D2691E'),
    ('sportovní', 'Sportovní zvířata', '#FF1493'),
    ('rodina', 'Vhodné pro rodiny s dětmi', '#FFA07A');

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_animal_tags_updated_at 
    BEFORE UPDATE ON animal_tags
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_animal_tag_assignments_updated_at 
    BEFORE UPDATE ON animal_tag_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();