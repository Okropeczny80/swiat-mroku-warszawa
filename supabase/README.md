# Supabase

The existing Supabase project is preserved for now. Before changing its schema:
1. inspect the current schema and policies,
2. create a database backup/export,
3. write a migration,
4. test it against a branch or staging project,
5. apply only after verification.

Never store service-role keys in the browser or commit environment files.
