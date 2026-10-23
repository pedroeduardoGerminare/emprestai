-- Prisma Migrate metadata only. The hosted schema was applied from the exact
-- versioned migration via the authenticated Supabase connector (no DB password).
CREATE TABLE IF NOT EXISTS public._prisma_migrations (
  id varchar(36) PRIMARY KEY NOT NULL,
  checksum varchar(64) NOT NULL,
  finished_at timestamptz,
  migration_name varchar(255) NOT NULL,
  logs text,
  rolled_back_at timestamptz,
  started_at timestamptz NOT NULL DEFAULT now(),
  applied_steps_count integer NOT NULL DEFAULT 0
);
ALTER TABLE public._prisma_migrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY prisma_history_client_deny ON public._prisma_migrations
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
REVOKE ALL ON public._prisma_migrations FROM anon, authenticated;
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, applied_steps_count)
SELECT gen_random_uuid()::text,
  '47d32eee2ca6941f0b7be5a19e5b88abfa118196c0502e6aad6613dea9654aad',
  now(), '20261023122556_initial_schema', 1
WHERE NOT EXISTS (SELECT 1 FROM public._prisma_migrations WHERE migration_name = '20261023122556_initial_schema' AND finished_at IS NOT NULL);
