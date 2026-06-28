-- Drop the legacy `admin_users` table. Admin authentication moved to Supabase
-- Auth (email + password); this table is no longer read by any code.
DROP TABLE "admin_users";
