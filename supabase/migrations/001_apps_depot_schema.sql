-- ============================================================
-- Apps Depot — Database Schema
-- Run this in your Supabase SQL editor to set up the platform
-- ============================================================

-- ────────────────────────────────────────────────
-- ENUMS
-- ────────────────────────────────────────────────
CREATE TYPE pricing_model AS ENUM ('free', 'one_time', 'subscription', 'usage_based');
CREATE TYPE deployment_type AS ENUM ('saas', 'self_hosted', 'api', 'open_source');
CREATE TYPE app_status AS ENUM ('active', 'beta', 'deprecated', 'coming_soon');
CREATE TYPE order_status AS ENUM ('pending', 'completed', 'refunded', 'failed');
CREATE TYPE deployment_status AS ENUM ('pending', 'deploying', 'active', 'stopped', 'error');
CREATE TYPE user_role AS ENUM ('customer', 'vendor', 'admin');

-- ────────────────────────────────────────────────
-- USER PROFILES
-- Extends Supabase auth.users
-- ────────────────────────────────────────────────
CREATE TABLE public.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        TEXT NOT NULL,
  full_name    TEXT,
  avatar_url   TEXT,
  role         user_role NOT NULL DEFAULT 'customer',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ────────────────────────────────────────────────
-- CATEGORIES (Aisles)
-- ────────────────────────────────────────────────
CREATE TABLE public.categories (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  slug         TEXT NOT NULL UNIQUE,
  description  TEXT,
  icon         TEXT,
  aisle        INTEGER NOT NULL,
  color        TEXT NOT NULL DEFAULT '#F97316',
  app_count    INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);

-- ────────────────────────────────────────────────
-- VENDORS
-- ────────────────────────────────────────────────
CREATE TABLE public.vendors (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  slug         TEXT NOT NULL UNIQUE,
  description  TEXT,
  logo_url     TEXT,
  website_url  TEXT,
  verified     BOOLEAN NOT NULL DEFAULT false,
  app_count    INTEGER NOT NULL DEFAULT 0,
  total_sales  INTEGER NOT NULL DEFAULT 0,
  rating       NUMERIC(3,2) NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view vendors" ON public.vendors FOR SELECT USING (true);
CREATE POLICY "Vendors can update their own record"
  ON public.vendors FOR UPDATE USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────
-- APPS (Products)
-- ────────────────────────────────────────────────
CREATE TABLE public.apps (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id       UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  category_id     UUID NOT NULL REFERENCES public.categories(id),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  tagline         TEXT NOT NULL,
  description     TEXT,
  logo_url        TEXT,
  screenshots     TEXT[] DEFAULT '{}',
  price           NUMERIC(10,2) NOT NULL DEFAULT 0,
  pricing_model   pricing_model NOT NULL DEFAULT 'free',
  billing_period  TEXT CHECK (billing_period IN ('monthly', 'yearly')),
  version         TEXT NOT NULL DEFAULT '1.0.0',
  rating          NUMERIC(3,2) NOT NULL DEFAULT 0,
  review_count    INTEGER NOT NULL DEFAULT 0,
  install_count   INTEGER NOT NULL DEFAULT 0,
  featured        BOOLEAN NOT NULL DEFAULT false,
  new_arrival     BOOLEAN NOT NULL DEFAULT false,
  deployment_type deployment_type NOT NULL DEFAULT 'saas',
  tags            TEXT[] DEFAULT '{}',
  status          app_status NOT NULL DEFAULT 'active',
  requirements    TEXT[] DEFAULT '{}',
  demo_url        TEXT,
  website_url     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.apps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active apps"
  ON public.apps FOR SELECT USING (status != 'deprecated');
CREATE POLICY "Vendors can manage their own apps"
  ON public.apps FOR ALL USING (
    vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid())
  );

CREATE INDEX idx_apps_category ON public.apps(category_id);
CREATE INDEX idx_apps_vendor ON public.apps(vendor_id);
CREATE INDEX idx_apps_slug ON public.apps(slug);
CREATE INDEX idx_apps_featured ON public.apps(featured) WHERE featured = true;

-- Full text search
ALTER TABLE public.apps ADD COLUMN search_vector TSVECTOR
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(tagline, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'C')
  ) STORED;

CREATE INDEX idx_apps_search ON public.apps USING GIN(search_vector);

-- ────────────────────────────────────────────────
-- APP VERSIONS
-- ────────────────────────────────────────────────
CREATE TABLE public.app_versions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id       UUID NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  version      TEXT NOT NULL,
  changelog    JSONB NOT NULL DEFAULT '[]',
  release_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.app_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view versions" ON public.app_versions FOR SELECT USING (true);

-- ────────────────────────────────────────────────
-- REVIEWS
-- ────────────────────────────────────────────────
CREATE TABLE public.reviews (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  app_id         UUID NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  rating         INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title          TEXT NOT NULL,
  body           TEXT,
  helpful_count  INTEGER NOT NULL DEFAULT 0,
  verified       BOOLEAN NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, app_id)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create reviews"
  ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reviews"
  ON public.reviews FOR UPDATE USING (auth.uid() = user_id);

-- Auto-update app rating when a review is added/updated
CREATE OR REPLACE FUNCTION public.update_app_rating()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.apps
  SET
    rating = (SELECT ROUND(AVG(rating)::numeric, 2) FROM public.reviews WHERE app_id = NEW.app_id),
    review_count = (SELECT COUNT(*) FROM public.reviews WHERE app_id = NEW.app_id)
  WHERE id = NEW.app_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_review_change
  AFTER INSERT OR UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_app_rating();

-- ────────────────────────────────────────────────
-- ORDERS
-- ────────────────────────────────────────────────
CREATE TABLE public.orders (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  total                     NUMERIC(10,2) NOT NULL DEFAULT 0,
  status                    order_status NOT NULL DEFAULT 'pending',
  stripe_payment_intent_id  TEXT UNIQUE,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────
-- ORDER ITEMS
-- ────────────────────────────────────────────────
CREATE TABLE public.order_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  app_id       UUID NOT NULL REFERENCES public.apps(id),
  price_paid   NUMERIC(10,2) NOT NULL,
  license_key  TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view items from their own orders"
  ON public.order_items FOR SELECT
  USING (order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid()));

-- ────────────────────────────────────────────────
-- DEPLOYMENTS
-- ────────────────────────────────────────────────
CREATE TABLE public.deployments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  app_id           UUID NOT NULL REFERENCES public.apps(id),
  order_id         UUID NOT NULL REFERENCES public.orders(id),
  status           deployment_status NOT NULL DEFAULT 'pending',
  deployment_url   TEXT,
  config           JSONB NOT NULL DEFAULT '{}',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own deployments"
  ON public.deployments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own deployments"
  ON public.deployments FOR UPDATE USING (auth.uid() = user_id);

-- Realtime for deployment status updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.deployments;

-- ────────────────────────────────────────────────
-- SEED DATA — Categories
-- ────────────────────────────────────────────────
INSERT INTO public.categories (name, slug, description, icon, aisle, color, app_count) VALUES
  ('Productivity',     'productivity',     'Task managers, note-taking and workflow tools.',         '⚡', 1, '#3B82F6', 47),
  ('Communication',    'communication',    'Messaging, video calls, and team chat platforms.',       '💬', 2, '#10B981', 31),
  ('Developer Tools',  'developer-tools',  'CI/CD, code review, monitoring, and deployment tools.', '🛠️', 3, '#8B5CF6', 68),
  ('Design & Creative','design-creative',  'UI/UX design, video editing, and creative suites.',     '🎨', 4, '#EC4899', 29),
  ('Analytics & Data', 'analytics-data',   'Business intelligence, dashboards, and data pipelines.','📊', 5, '#F59E0B', 42),
  ('Security',         'security',         'Vulnerability scanning, secrets management.',           '🔒', 6, '#EF4444', 25),
  ('Finance & Billing','finance-billing',  'Invoicing, payroll, accounting tools.',                 '💰', 7, '#14B8A6', 38),
  ('E-Commerce',       'ecommerce',        'Online stores, inventory, and checkout tools.',         '🛒', 8, '#F97316', 33);
