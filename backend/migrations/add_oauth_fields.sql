-- Add OAuth columns to users table
ALTER TABLE users 
ADD COLUMN provider VARCHAR(20) DEFAULT 'local',
ADD COLUMN provider_id VARCHAR(255),
ADD COLUMN avatar TEXT,
ADD COLUMN refresh_token TEXT;

-- Update existing enum to include OAuth providers
ALTER TYPE "enum_users_provider" RENAME TO "enum_users_provider_old";
CREATE TYPE "enum_users_provider" AS ENUM('local', 'google', 'facebook', 'microsoft');
ALTER TABLE users ALTER COLUMN provider TYPE "enum_users_provider" USING provider::text::"enum_users_provider";
DROP TYPE "enum_users_provider_old";

-- Create unique index for OAuth provider and ID combination
CREATE UNIQUE INDEX CONCURRENTLY users_provider_provider_id_unique
ON users (provider, provider_id)
WHERE provider != 'local';

-- Update existing users to have 'local' provider if not set
UPDATE users SET provider = 'local' WHERE provider IS NULL;