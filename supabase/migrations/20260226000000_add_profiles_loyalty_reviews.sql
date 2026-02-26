/*
  # Extended Schema: Profiles, Loyalty, Reviews, Check-in

  ## New Tables
  1. user_profiles       – Stores personal info and travel preferences per user
  2. saved_travelers     – Quick-add frequent travelers per user
  3. loyalty_members     – Loyalty program membership record per user
  4. loyalty_transactions – Points earn/redeem history
  5. flight_reviews      – Ratings and reviews submitted by passengers

  ## Changes to existing tables
  - bookings.booking_status now supports 'checked_in' value (no schema change needed,
    it is stored as free-form text already)
*/

-- ─────────────────────────────────────────────
-- user_profiles
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_profiles (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name         text NOT NULL DEFAULT '',
  phone             text NOT NULL DEFAULT '',
  address           text NOT NULL DEFAULT '',
  city              text NOT NULL DEFAULT '',
  country           text NOT NULL DEFAULT '',
  date_of_birth     date,
  meal_preference   text NOT NULL DEFAULT 'standard',
  seat_preference   text NOT NULL DEFAULT 'window',
  newsletter        boolean NOT NULL DEFAULT true,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- saved_travelers
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS saved_travelers (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  first_name       text NOT NULL,
  last_name        text NOT NULL,
  date_of_birth    date,
  passport_number  text NOT NULL DEFAULT '',
  nationality      text NOT NULL DEFAULT '',
  phone            text NOT NULL DEFAULT '',
  created_at       timestamptz DEFAULT now()
);

ALTER TABLE saved_travelers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own saved travelers"
  ON saved_travelers FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- loyalty_members
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS loyalty_members (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  points           integer NOT NULL DEFAULT 0,
  tier             text NOT NULL DEFAULT 'blue',
  total_flights    integer NOT NULL DEFAULT 0,
  member_since     timestamptz DEFAULT now(),
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

ALTER TABLE loyalty_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own loyalty record"
  ON loyalty_members FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own loyalty record"
  ON loyalty_members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own loyalty record"
  ON loyalty_members FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- loyalty_transactions
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  description      text NOT NULL,
  points           integer NOT NULL,
  transaction_type text NOT NULL DEFAULT 'earned',  -- 'earned' | 'redeemed' | 'bonus'
  booking_id       uuid REFERENCES bookings(id) ON DELETE SET NULL,
  created_at       timestamptz DEFAULT now()
);

ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON loyalty_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON loyalty_transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- flight_reviews
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS flight_reviews (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  flight_id      uuid REFERENCES flights(id) ON DELETE CASCADE,
  flight_number  text NOT NULL,
  rating         integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment        text NOT NULL,
  helpful_votes  integer NOT NULL DEFAULT 0,
  verified       boolean NOT NULL DEFAULT false,
  created_at     timestamptz DEFAULT now()
);

ALTER TABLE flight_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view flight reviews"
  ON flight_reviews FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert reviews"
  ON flight_reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON flight_reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON flight_reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
