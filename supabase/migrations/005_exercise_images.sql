-- Add image_url column to exercises for wger.de integration
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS image_url TEXT;
