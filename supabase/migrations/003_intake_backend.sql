-- ============================================================
-- Apps Depot — Real Intake Backend
-- Stores build requests, requested apps, and app wishes in Supabase.
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_status') THEN
    CREATE TYPE public.project_status AS ENUM (
      'submitted',
      'reviewing',
      'quoted',
      'approved',
      'building',
      'testing',
      'delivered',
      'cancelled'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'wish_status') THEN
    CREATE TYPE public.wish_status AS ENUM (
      'new',
      'reviewing',
      'accepted',
      'planned',
      'built',
      'declined'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.build_requests (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number      TEXT NOT NULL UNIQUE DEFAULT ('AD-' || UPPER(SUBSTRING(REPLACE(gen_random_uuid()::TEXT, '-', ''), 1, 8))),
  customer_user_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name       TEXT NOT NULL,
  customer_email      TEXT NOT NULL,
  customer_phone      TEXT,
  company             TEXT,
  requirements        TEXT NOT NULL,
  budget_range        TEXT NOT NULL,
  timeline            TEXT NOT NULL,
  preferred_stack     TEXT,
  status              public.project_status NOT NULL DEFAULT 'submitted',
  source              TEXT NOT NULL DEFAULT 'website',
  internal_notes      TEXT,
  quoted_price        NUMERIC(10,2),
  estimated_delivery  DATE,
  delivered_url       TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.build_request_apps (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_request_id  UUID NOT NULL REFERENCES public.build_requests(id) ON DELETE CASCADE,
  app_slug          TEXT,
  app_name          TEXT NOT NULL,
  category          TEXT,
  starting_price    TEXT,
  build_time        TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.app_wishes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wish_number     TEXT NOT NULL UNIQUE DEFAULT ('WISH-' || UPPER(SUBSTRING(REPLACE(gen_random_uuid()::TEXT, '-', ''), 1, 8))),
  customer_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  category_name   TEXT,
  description     TEXT NOT NULL,
  target_users    TEXT,
  features        TEXT[] NOT NULL DEFAULT '{}',
  inspiration     TEXT,
  budget_range    TEXT,
  timeline        TEXT,
  name            TEXT NOT NULL,
  email           TEXT NOT NULL,
  company         TEXT,
  status          public.wish_status NOT NULL DEFAULT 'new',
  internal_notes  TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.build_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.build_request_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_wishes ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS set_build_requests_updated_at ON public.build_requests;
CREATE TRIGGER set_build_requests_updated_at
  BEFORE UPDATE ON public.build_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_app_wishes_updated_at ON public.app_wishes;
CREATE TRIGGER set_app_wishes_updated_at
  BEFORE UPDATE ON public.app_wishes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_build_requests_email ON public.build_requests (LOWER(customer_email));
CREATE INDEX IF NOT EXISTS idx_build_requests_user ON public.build_requests (customer_user_id);
CREATE INDEX IF NOT EXISTS idx_build_requests_status ON public.build_requests (status);
CREATE INDEX IF NOT EXISTS idx_build_request_apps_request ON public.build_request_apps (build_request_id);
CREATE INDEX IF NOT EXISTS idx_app_wishes_email ON public.app_wishes (LOWER(email));

DROP POLICY IF EXISTS "Anyone can submit build requests" ON public.build_requests;
CREATE POLICY "Anyone can submit build requests"
  ON public.build_requests FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Clients can view their own build requests" ON public.build_requests;
CREATE POLICY "Clients can view their own build requests"
  ON public.build_requests FOR SELECT
  USING (
    auth.uid() = customer_user_id
    OR LOWER(customer_email) = LOWER(COALESCE(auth.jwt()->>'email', ''))
  );

DROP POLICY IF EXISTS "Anyone can submit requested apps" ON public.build_request_apps;
CREATE POLICY "Anyone can submit requested apps"
  ON public.build_request_apps FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Clients can view apps for their own requests" ON public.build_request_apps;
CREATE POLICY "Clients can view apps for their own requests"
  ON public.build_request_apps FOR SELECT
  USING (
    build_request_id IN (
      SELECT id FROM public.build_requests
      WHERE auth.uid() = customer_user_id
         OR LOWER(customer_email) = LOWER(COALESCE(auth.jwt()->>'email', ''))
    )
  );

DROP POLICY IF EXISTS "Anyone can submit app wishes" ON public.app_wishes;
CREATE POLICY "Anyone can submit app wishes"
  ON public.app_wishes FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Clients can view their own wishes" ON public.app_wishes;
CREATE POLICY "Clients can view their own wishes"
  ON public.app_wishes FOR SELECT
  USING (
    auth.uid() = customer_user_id
    OR LOWER(email) = LOWER(COALESCE(auth.jwt()->>'email', ''))
  );
