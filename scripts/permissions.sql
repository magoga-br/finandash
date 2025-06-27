-- Grant necessary permissions for authenticated users on all tables.
-- This ensures that users who are logged in can perform CRUD operations
-- on the data they own, as defined by the Row-Level Security (RLS) policies.

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE accounts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE contracts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE employees TO authenticated;

-- Grant usage on the public schema
GRANT USAGE ON SCHEMA public TO authenticated;
