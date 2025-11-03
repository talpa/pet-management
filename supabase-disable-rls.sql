-- Disable Row Level Security for public API access
-- Run this in Supabase SQL Editor after importing data

-- Disable RLS for main tables that API accesses
ALTER TABLE animals DISABLE ROW LEVEL SECURITY;
ALTER TABLE animal_species DISABLE ROW LEVEL SECURITY; 
ALTER TABLE animal_tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE animal_tag_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE animal_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE statistics DISABLE ROW LEVEL SECURITY;

-- Keep RLS enabled for sensitive tables
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE permissions DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_groups DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_group_members DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;

-- Grant public access to main tables
GRANT SELECT ON animals TO anon;
GRANT SELECT ON animal_species TO anon;
GRANT SELECT ON animal_tags TO anon;
GRANT SELECT ON animal_tag_assignments TO anon;
GRANT SELECT ON animal_images TO anon;
GRANT SELECT ON statistics TO anon;

-- Verify settings
SELECT schemaname, tablename, rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;