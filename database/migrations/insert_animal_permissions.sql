-- Animal Admin Permissions

INSERT INTO permissions (name, code, description, category, "createdAt", "updatedAt") VALUES
('Správa zvířat - Zobrazení', 'ANIMAL_VIEW', 'Zobrazení seznamu zvířat a jejich detailů', 'animal_management', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Správa zvířat - Vytvoření', 'ANIMAL_CREATE', 'Vytváření nových zvířat', 'animal_management', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Správa zvířat - Úprava', 'ANIMAL_UPDATE', 'Úprava existujících zvířat', 'animal_management', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Správa zvířat - Smazání', 'ANIMAL_DELETE', 'Mazání zvířat', 'animal_management', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Správa zvířat - Admin přístup', 'ANIMAL_ADMIN', 'Přístup ke všem zvířatům všech uživatelů', 'animal_management', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Správa druhů zvířat', 'ANIMAL_SPECIES_MANAGE', 'Správa číselníku druhů zvířat a jejich vlastností', 'animal_management', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Nahrávání obrázků zvířat', 'ANIMAL_IMAGES_UPLOAD', 'Nahrávání a správa obrázků zvířat', 'animal_management', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (code) DO NOTHING;