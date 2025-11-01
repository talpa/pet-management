-- Add seoUrl column to animals table for QR code generation
ALTER TABLE animals ADD COLUMN seo_url VARCHAR(255) UNIQUE;

-- Create index for better performance on SEO URL lookups
CREATE INDEX idx_animals_seo_url ON animals(seo_url);

-- Update existing animals with basic SEO URLs (optional)
UPDATE animals SET seo_url = LOWER(REPLACE(name, ' ', '-')) || '-' || id WHERE seo_url IS NULL;

-- Add constraint to ensure seo_url is not empty when not null
ALTER TABLE animals ADD CONSTRAINT chk_animals_seo_url_not_empty 
  CHECK (seo_url IS NULL OR LENGTH(TRIM(seo_url)) > 0);