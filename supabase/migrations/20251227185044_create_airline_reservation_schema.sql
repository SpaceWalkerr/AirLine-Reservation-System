/*
  # Airline Reservation System Database Schema

  ## Overview
  Complete database schema for a full-featured airline reservation system with airports, aircraft, flights, bookings, and passenger management.

  ## New Tables

  ### 1. airports
  Stores airport information for departure and arrival locations
  - `id` (uuid, primary key) - Unique airport identifier
  - `code` (text, unique) - IATA airport code (e.g., 'JFK', 'LAX')
  - `name` (text) - Full airport name
  - `city` (text) - City name
  - `country` (text) - Country name
  - `timezone` (text) - Airport timezone
  - `created_at` (timestamptz) - Record creation timestamp

  ### 2. aircraft
  Stores aircraft types and specifications
  - `id` (uuid, primary key) - Unique aircraft identifier
  - `model` (text) - Aircraft model name (e.g., 'Boeing 737-800')
  - `manufacturer` (text) - Manufacturer name
  - `total_seats` (integer) - Total seating capacity
  - `economy_seats` (integer) - Economy class seats
  - `business_seats` (integer) - Business class seats
  - `first_class_seats` (integer) - First class seats
  - `cruise_speed` (integer) - Cruise speed in km/h
  - `range_km` (integer) - Maximum range in kilometers
  - `image_url` (text) - Aircraft image URL
  - `description` (text) - Aircraft description
  - `created_at` (timestamptz) - Record creation timestamp

  ### 3. flights
  Stores flight schedules and availability
  - `id` (uuid, primary key) - Unique flight identifier
  - `flight_number` (text, unique) - Flight number (e.g., 'AA123')
  - `aircraft_id` (uuid, foreign key) - Reference to aircraft
  - `origin_airport_id` (uuid, foreign key) - Departure airport
  - `destination_airport_id` (uuid, foreign key) - Arrival airport
  - `departure_time` (timestamptz) - Scheduled departure time
  - `arrival_time` (timestamptz) - Scheduled arrival time
  - `economy_price` (decimal) - Economy class ticket price
  - `business_price` (decimal) - Business class ticket price
  - `first_class_price` (decimal) - First class ticket price
  - `available_economy_seats` (integer) - Available economy seats
  - `available_business_seats` (integer) - Available business seats
  - `available_first_class_seats` (integer) - Available first class seats
  - `status` (text) - Flight status (scheduled, boarding, departed, arrived, cancelled)
  - `created_at` (timestamptz) - Record creation timestamp

  ### 4. bookings
  Stores booking information
  - `id` (uuid, primary key) - Unique booking identifier
  - `user_id` (uuid, foreign key) - Reference to auth.users
  - `flight_id` (uuid, foreign key) - Reference to flights
  - `booking_reference` (text, unique) - Booking confirmation code
  - `total_passengers` (integer) - Number of passengers
  - `total_amount` (decimal) - Total booking amount
  - `booking_status` (text) - Status (confirmed, cancelled, completed)
  - `created_at` (timestamptz) - Booking creation timestamp

  ### 5. passengers
  Stores passenger details for each booking
  - `id` (uuid, primary key) - Unique passenger record identifier
  - `booking_id` (uuid, foreign key) - Reference to bookings
  - `first_name` (text) - Passenger first name
  - `last_name` (text) - Passenger last name
  - `date_of_birth` (date) - Passenger date of birth
  - `passport_number` (text) - Passport number
  - `nationality` (text) - Passenger nationality
  - `seat_class` (text) - Seat class (economy, business, first_class)
  - `seat_number` (text) - Assigned seat number
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  - Enable RLS on all tables
  - Public read access for airports, aircraft, and flights
  - Authenticated users can create bookings
  - Users can only view their own bookings and passenger details
  - Only authenticated users can view their booking history
*/

-- Create airports table
CREATE TABLE IF NOT EXISTS airports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  city text NOT NULL,
  country text NOT NULL,
  timezone text NOT NULL DEFAULT 'UTC',
  created_at timestamptz DEFAULT now()
);

-- Create aircraft table
CREATE TABLE IF NOT EXISTS aircraft (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model text NOT NULL,
  manufacturer text NOT NULL,
  total_seats integer NOT NULL DEFAULT 0,
  economy_seats integer NOT NULL DEFAULT 0,
  business_seats integer NOT NULL DEFAULT 0,
  first_class_seats integer NOT NULL DEFAULT 0,
  cruise_speed integer NOT NULL DEFAULT 0,
  range_km integer NOT NULL DEFAULT 0,
  image_url text DEFAULT '',
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create flights table
CREATE TABLE IF NOT EXISTS flights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_number text UNIQUE NOT NULL,
  aircraft_id uuid REFERENCES aircraft(id) ON DELETE CASCADE,
  origin_airport_id uuid REFERENCES airports(id) ON DELETE CASCADE,
  destination_airport_id uuid REFERENCES airports(id) ON DELETE CASCADE,
  departure_time timestamptz NOT NULL,
  arrival_time timestamptz NOT NULL,
  economy_price decimal(10, 2) NOT NULL DEFAULT 0,
  business_price decimal(10, 2) NOT NULL DEFAULT 0,
  first_class_price decimal(10, 2) NOT NULL DEFAULT 0,
  available_economy_seats integer NOT NULL DEFAULT 0,
  available_business_seats integer NOT NULL DEFAULT 0,
  available_first_class_seats integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'scheduled',
  created_at timestamptz DEFAULT now()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  flight_id uuid REFERENCES flights(id) ON DELETE CASCADE,
  booking_reference text UNIQUE NOT NULL,
  total_passengers integer NOT NULL DEFAULT 1,
  total_amount decimal(10, 2) NOT NULL DEFAULT 0,
  booking_status text NOT NULL DEFAULT 'confirmed',
  created_at timestamptz DEFAULT now()
);

-- Create passengers table
CREATE TABLE IF NOT EXISTS passengers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  date_of_birth date NOT NULL,
  passport_number text NOT NULL,
  nationality text NOT NULL,
  seat_class text NOT NULL DEFAULT 'economy',
  seat_number text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE airports ENABLE ROW LEVEL SECURITY;
ALTER TABLE aircraft ENABLE ROW LEVEL SECURITY;
ALTER TABLE flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE passengers ENABLE ROW LEVEL SECURITY;

-- Airports policies (public read)
CREATE POLICY "Anyone can view airports"
  ON airports FOR SELECT
  TO public
  USING (true);

-- Aircraft policies (public read)
CREATE POLICY "Anyone can view aircraft"
  ON aircraft FOR SELECT
  TO public
  USING (true);

-- Flights policies (public read)
CREATE POLICY "Anyone can view flights"
  ON flights FOR SELECT
  TO public
  USING (true);

-- Bookings policies
CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Passengers policies
CREATE POLICY "Users can view passengers in their bookings"
  ON passengers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = passengers.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add passengers to their bookings"
  ON passengers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = passengers.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

-- Insert sample airports
INSERT INTO airports (code, name, city, country, timezone) VALUES
  ('JFK', 'John F. Kennedy International Airport', 'New York', 'United States', 'America/New_York'),
  ('LAX', 'Los Angeles International Airport', 'Los Angeles', 'United States', 'America/Los_Angeles'),
  ('ORD', 'O''Hare International Airport', 'Chicago', 'United States', 'America/Chicago'),
  ('LHR', 'London Heathrow Airport', 'London', 'United Kingdom', 'Europe/London'),
  ('DXB', 'Dubai International Airport', 'Dubai', 'United Arab Emirates', 'Asia/Dubai'),
  ('SIN', 'Singapore Changi Airport', 'Singapore', 'Singapore', 'Asia/Singapore'),
  ('NRT', 'Narita International Airport', 'Tokyo', 'Japan', 'Asia/Tokyo'),
  ('CDG', 'Charles de Gaulle Airport', 'Paris', 'France', 'Europe/Paris'),
  ('SYD', 'Sydney Kingsford Smith Airport', 'Sydney', 'Australia', 'Australia/Sydney'),
  ('HKG', 'Hong Kong International Airport', 'Hong Kong', 'Hong Kong', 'Asia/Hong_Kong')
ON CONFLICT (code) DO NOTHING;

-- Insert sample aircraft
INSERT INTO aircraft (model, manufacturer, total_seats, economy_seats, business_seats, first_class_seats, cruise_speed, range_km, image_url, description) VALUES
  ('Boeing 737-800', 'Boeing', 189, 162, 27, 0, 842, 5436, 'https://images.pexels.com/photos/358319/pexels-photo-358319.jpeg', 'Popular short to medium-range narrow-body aircraft with excellent fuel efficiency'),
  ('Boeing 777-300ER', 'Boeing', 396, 340, 42, 14, 905, 13649, 'https://images.pexels.com/photos/46148/aircraft-jet-landing-cloud-46148.jpeg', 'Long-range wide-body aircraft perfect for international routes'),
  ('Airbus A320', 'Airbus', 180, 156, 24, 0, 840, 6150, 'https://images.pexels.com/photos/912050/pexels-photo-912050.jpeg', 'Efficient single-aisle aircraft for domestic and short international flights'),
  ('Airbus A350-900', 'Airbus', 325, 280, 35, 10, 903, 15372, 'https://images.pexels.com/photos/2406660/pexels-photo-2406660.jpeg', 'State-of-the-art long-range aircraft with advanced technology'),
  ('Boeing 787 Dreamliner', 'Boeing', 296, 246, 40, 10, 913, 14140, 'https://images.pexels.com/photos/67807/airplane-aircraft-take-off-sky-67807.jpeg', 'Modern fuel-efficient aircraft with enhanced passenger comfort')
ON CONFLICT DO NOTHING;

-- Insert sample flights
INSERT INTO flights (flight_number, aircraft_id, origin_airport_id, destination_airport_id, departure_time, arrival_time, economy_price, business_price, first_class_price, available_economy_seats, available_business_seats, available_first_class_seats, status)
SELECT 
  'SK' || LPAD((ROW_NUMBER() OVER())::text, 3, '0'),
  a.id,
  o.id,
  d.id,
  now() + (INTERVAL '1 day' * (ROW_NUMBER() OVER() % 30)),
  now() + (INTERVAL '1 day' * (ROW_NUMBER() OVER() % 30)) + INTERVAL '8 hours',
  299.99 + (RANDOM() * 500)::numeric(10,2),
  899.99 + (RANDOM() * 1000)::numeric(10,2),
  1999.99 + (RANDOM() * 2000)::numeric(10,2),
  a.economy_seats,
  a.business_seats,
  a.first_class_seats,
  'scheduled'
FROM 
  aircraft a,
  airports o,
  airports d
WHERE 
  o.code IN ('JFK', 'LAX', 'ORD', 'LHR', 'DXB')
  AND d.code IN ('SIN', 'NRT', 'CDG', 'SYD', 'HKG')
  AND o.id != d.id
LIMIT 50
ON CONFLICT (flight_number) DO NOTHING;
