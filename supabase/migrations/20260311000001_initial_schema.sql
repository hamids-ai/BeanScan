-- BeanScan Initial Schema
-- Run this in the Supabase SQL Editor

-- =============================================
-- PROFILES (display name for each user)
-- =============================================
CREATE TABLE profiles (
  id    uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name  text NOT NULL
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read and update their own profile"
  ON profiles FOR ALL
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- =============================================
-- COFFEES
-- =============================================
CREATE TABLE coffees (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Required fields
  bag_name           text NOT NULL,
  roaster_name       text NOT NULL,

  -- AI-populated fields (all optional)
  roaster_location   text,
  origins            text,
  roast_level        text CHECK (roast_level IN ('light', 'medium-light', 'medium', 'medium-dark', 'dark')),
  varietal           text,
  altitude           text,
  processing_method  text CHECK (processing_method IN ('washed', 'natural', 'honey', 'anaerobic')),
  flavor_profile     text,   -- comma-separated string e.g. "Blueberry, Jasmine, Citrus"
  body_category      text CHECK (body_category IN ('light', 'medium', 'full')),
  body_description   text,
  photo_url          text,   -- professional product photo URL (not user photo)

  date_added         timestamptz NOT NULL DEFAULT now(),

  -- Brew log (embedded, all nullable until user adds it)
  brew_date          date,
  roast_date         date,
  grind_setting      numeric(5,1),
  rating             text CHECK (rating IN ('great', 'good', 'neutral', 'meh', 'bad')),
  tasting_notes      text,
  body_notes         text,
  brew_last_updated  timestamptz
);

ALTER TABLE coffees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own coffees"
  ON coffees FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =============================================
-- DAILY ADD COUNTS (enforce 20 coffees/day limit)
-- =============================================
CREATE TABLE daily_add_counts (
  user_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day      date NOT NULL DEFAULT CURRENT_DATE,
  count    integer NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, day)
);

ALTER TABLE daily_add_counts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own counts"
  ON daily_add_counts FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =============================================
-- LOOKUP CACHE (90-day coffee lookup result cache)
-- No user data. RLS is enabled (see migration 20260319000001) with no policies,
-- so only service_role (Edge Functions) can access it — not anon/authenticated clients.
-- =============================================
CREATE TABLE lookup_cache (
  cache_key  text PRIMARY KEY,  -- lower(roaster_name || '|' || bag_name)
  result     jsonb NOT NULL,
  cached_at  timestamptz NOT NULL DEFAULT now()
);

-- Auto-create a profile row when a new user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'Coffee Lover'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
