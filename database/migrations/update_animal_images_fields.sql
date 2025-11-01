-- Update animal_images table to support new image processing fields
ALTER TABLE animal_images 
  ADD COLUMN processed_filename VARCHAR(255),
  ADD COLUMN thumbnail_filename VARCHAR(255),
  ALTER COLUMN file_path DROP NOT NULL;