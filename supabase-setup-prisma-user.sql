-- Supabase Prisma User Setup
-- Run this in Supabase SQL Editor to create a custom Prisma user
-- Replace 'your_secure_password_here' with a strong password

-- Create custom user for Prisma
CREATE USER "prisma" WITH PASSWORD 'your_secure_password_here' BYPASSRLS CREATEDB;

-- Extend prisma's privileges to postgres (necessary to view changes in Dashboard)
GRANT "prisma" TO "postgres";

-- Grant necessary permissions over the public schema
GRANT USAGE ON SCHEMA public TO prisma;
GRANT CREATE ON SCHEMA public TO prisma;
GRANT ALL ON ALL TABLES IN SCHEMA public TO prisma;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO prisma;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO prisma;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO prisma;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO prisma;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO prisma;

-- To change the password later, use:
-- ALTER USER "prisma" WITH PASSWORD 'new_password';
