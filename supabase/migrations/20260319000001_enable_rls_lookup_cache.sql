-- Enable RLS on lookup_cache
-- No policies needed: only Edge Functions (service_role) write/read this table.
-- service_role bypasses RLS, so Edge Functions are unaffected.
-- This blocks direct PostgREST access from anon/authenticated users, which is correct.

ALTER TABLE lookup_cache ENABLE ROW LEVEL SECURITY;
