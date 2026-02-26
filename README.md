<div align="center">

# ✈️ SkyWings Airline Reservation System

**A full-featured, modern airline booking platform built with React, TypeScript & Supabase**

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Framer Motion](https://img.shields.io/badge/Framer-Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion)

<br/>

> Book flights, manage passengers, earn loyalty points, and check in online —  
> all in one beautiful, dark-mode-ready application.

</div>

---

## 📸 Features at a Glance

| 🏠 Home & Search | 🗺️ Seat Selection | 🎫 Boarding Pass |
|:---:|:---:|:---:|
| Animated hero with live airport autocomplete | Interactive 2D seat map with real-time availability | Digital boarding pass with print support |

| 👤 User Profile | 🏆 Loyalty Rewards | 🛠️ Admin Dashboard |
|:---:|:---:|:---:|
| Profile editor with saved travelers | Tier system with points & rewards | Manage bookings, flights & reviews |

---

## 🚀 Feature Overview

### ✈️ Core Booking Flow
- **Airport Autocomplete** — search by IATA code, city, or airport name
- **One-way & Round-trip** support with date validation
- **1–5+ Passengers** with per-passenger seat assignment
- **Interactive 2D Seat Map** — colour-coded available / booked / selected seats
- **3 Cabin Classes** — Economy · Business · First Class with live pricing
- **Mock Payment Gateway** — card validation, test card `4242 4242 4242 4242`
- **Instant Confirmation** — booking reference + confirmation page

### 📋 Booking Management
- **My Bookings** — full history sorted by most recent, with status badges
- **Booking Cancellation** — seat inventory automatically restored in Supabase
- **Seat Change** — reassign seats post-booking via an interactive modal
- **Digital Boarding Pass** — printable / downloadable pass with QR code
- **Online Check-In** — available 1–24 hours before departure, updates booking to `checked_in`

### 👤 User Account
- **Authentication** — Supabase Auth (email/password, sign-up, sign-in, sign-out)
- **User Profile** — personal info, address, travel preferences, saved to `user_profiles` table
- **Saved Travelers** — add frequent passengers for faster booking, stored in `saved_travelers` table
- **Travel Preferences** — preferred meal, seat type, newsletter opt-in

### 🏆 Loyalty Program
- **SkyWings Rewards** — earn points on every booking
- **4 Tiers** — Blue · Silver (10k pts) · Gold (25k pts) · Platinum (50k pts)
- **Rewards Catalog** — redeem for upgrades, lounge passes, vouchers, free flights
- **Activity History** — real-time transaction log from `loyalty_transactions` table

### 🌟 Flight Reviews
- **Star Ratings** — 1–5 star per-flight reviews stored in `flight_reviews`
- **Rating Distribution** — visual bar chart breakdown
- **Helpful Votes** — upvote useful reviews (persisted to DB)
- **Verified Badge** — automatically verified for authenticated users
- **Integrated** inline on the flight search results page

### 🛩️ Flight Information
- **Flight Status Tracker** — search by flight number, animated progress bar for live status
- **Fleet Page** — full aircraft specs (model, seats, range, speed) with images
- **Baggage Calculator** — per-class policy with carry-on / checked bag fees
- **Special Requests** — meal preferences + special assistance during booking

### 🛠️ Admin Dashboard
| Tab | Capabilities |
|-----|-------------|
| **Overview** | Total bookings, revenue, passengers, avg review rating |
| **Bookings** | Search & filter, confirm / cancel any booking |
| **Flights** | Inline status updater (scheduled → boarding → departed → arrived) |
| **Reviews** | Verify or remove passenger reviews |

### 🎨 UI & Experience
- **Dark / Light Mode** — system-aware with manual toggle
- **Framer Motion** animations — page transitions, staggered cards, progress bars
- **Fully Responsive** — mobile-first layouts throughout
- **Skeleton Loaders** — no blank states while data loads
- **Error Boundary** — graceful fallback for unexpected errors

---

## 🗄️ Database Schema

```
┌─────────────────┐    ┌─────────────────┐    ┌──────────────────┐
│    airports     │    │    aircraft     │    │     flights      │
├─────────────────┤    ├─────────────────┤    ├──────────────────┤
│ id (uuid)       │    │ id (uuid)       │    │ id (uuid)        │
│ code (text)     │    │ model (text)    │    │ flight_number    │
│ name (text)     │    │ manufacturer   │    │ aircraft_id      │
│ city (text)     │    │ total_seats     │    │ origin_airport   │
│ country (text)  │    │ economy_seats   │    │ dest_airport     │
│ timezone (text) │    │ business_seats  │    │ departure_time   │
└─────────────────┘    │ first_cl_seats  │    │ economy_price    │
                       └─────────────────┘    │ business_price   │
                                              │ first_cl_price   │
                                              │ available_seats  │
                                              │ status           │
                                              └──────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌──────────────────┐
│    bookings     │    │   passengers    │    │  user_profiles   │
├─────────────────┤    ├─────────────────┤    ├──────────────────┤
│ id (uuid)       │    │ id (uuid)       │    │ user_id (uuid)   │
│ user_id         │    │ booking_id      │    │ full_name        │
│ flight_id       │    │ first_name      │    │ phone            │
│ booking_ref     │    │ last_name       │    │ address / city   │
│ total_amount    │    │ date_of_birth   │    │ meal_preference  │
│ booking_status  │    │ passport_number │    │ seat_preference  │
└─────────────────┘    │ seat_number     │    │ newsletter       │
                       └─────────────────┘    └──────────────────┘

┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│ loyalty_members  │   │loyalty_transact. │   │  flight_reviews  │
├──────────────────┤   ├──────────────────┤   ├──────────────────┤
│ user_id (uuid)   │   │ user_id (uuid)   │   │ user_id (uuid)   │
│ points (int)     │   │ description      │   │ flight_id        │
│ tier (text)      │   │ points (int)     │   │ flight_number    │
│ total_flights    │   │ transaction_type │   │ rating (1-5)     │
│ member_since     │   │ booking_id       │   │ comment          │
└──────────────────┘   └──────────────────┘   │ helpful_votes    │
                                              │ verified         │
                                              └──────────────────┘
```

All tables use **Row Level Security (RLS)** — users can only read/write their own data.

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 18 + TypeScript |
| **Build Tool** | Vite 5 |
| **Styling** | Tailwind CSS + CSS custom properties |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Backend / DB** | Supabase (PostgreSQL + Auth + RLS) |
| **State** | React Context API (Auth, Theme) |
| **Routing** | Custom SPA router via `useState` |

---

## 📦 Getting Started

### Prerequisites
- Node.js ≥ 18
- A free [Supabase](https://supabase.com) project

### 1. Clone the repository
```bash
git clone https://github.com/your-username/airline-reservation-system.git
cd airline-reservation-system
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

> Find these in your Supabase dashboard under **Settings → API**.

### 4. Apply database migrations

```bash
# Using Supabase CLI
npx supabase db push

# Or paste each file from supabase/migrations/ into the Supabase SQL Editor
```

Migrations (run in order):
1. `20251227185044_create_airline_reservation_schema.sql` — core tables + sample data
2. `20260226000000_add_profiles_loyalty_reviews.sql` — profiles, loyalty, reviews

### 5. Start the dev server
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) 🎉

---

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── Navbar.tsx        # Top nav with auth + theme toggle
│   ├── Footer.tsx        # Footer with page links
│   ├── FlightReviews.tsx # Star ratings + review form
│   ├── AuthModal.tsx     # Sign in / Sign up modal
│   ├── Modal.tsx         # Generic modal wrapper
│   ├── Button.tsx        # Styled button variants
│   ├── Input.tsx         # Form input with label
│   ├── Select.tsx        # Styled select input
│   ├── Skeleton.tsx      # Loading skeletons
│   ├── StepIndicator.tsx # Multi-step progress dots
│   └── AnimatedPage.tsx  # Page transition wrapper
│
├── pages/                # Route-level page components
│   ├── HomePage.tsx         # Hero + search form
│   ├── FlightSearchPage.tsx # Results + filters + reviews
│   ├── SeatSelectionPage.tsx
│   ├── BookingPage.tsx      # Passenger details + special requests
│   ├── PaymentPage.tsx      # Card payment form
│   ├── ConfirmationPage.tsx
│   ├── MyBookingsPage.tsx   # Booking history + cancel + seat change
│   ├── BoardingPassPage.tsx
│   ├── CheckInPage.tsx      # Online check-in flow
│   ├── UserProfilePage.tsx  # Profile editor + saved travelers
│   ├── LoyaltyProgramPage.tsx
│   ├── BaggagePage.tsx
│   ├── FlightStatusPage.tsx
│   ├── AircraftPage.tsx
│   ├── AboutPage.tsx
│   ├── ContactPage.tsx
│   └── AdminDashboard.tsx   # Bookings / flights / reviews management
│
├── context/
│   ├── AuthContext.tsx    # Supabase auth state
│   └── ThemeContext.tsx   # Dark / light mode
│
├── lib/
│   └── supabase.ts        # Supabase client
│
├── types/
│   └── index.ts           # Shared TypeScript interfaces
│
├── App.tsx                # Root router + layout
└── main.tsx
```

---

## 🧪 Test Payment Card

Use this card in the payment form to simulate a successful booking:

| Field | Value |
|-------|-------|
| Card Number | `4242 4242 4242 4242` |
| Expiry | Any future date (e.g. `12/28`) |
| CVC | Any 3 digits (e.g. `123`) |

---

## 🗺️ Pages & Routes

| Page | Description |
|------|-------------|
| `/` Home | Flight search with animated hero |
| Flights | Search results with filters, sort, class selector |
| Seat Selection | Interactive seat map |
| Booking | Passenger form + special requests |
| Payment | Card form with validation |
| Confirmation | Booking summary with reference code |
| My Bookings | History, cancel, seat change, boarding pass |
| Check-In | Online check-in via booking reference |
| Boarding Pass | Digital pass with print/download |
| Flight Status | Live status tracker by flight number |
| User Profile | Personal info + saved travelers |
| Loyalty Rewards | Points, tiers, transaction history |
| Baggage | Per-class fee calculator |
| Fleet | Aircraft models and specs |
| About | Company information |
| Contact | Support form + FAQs |
| Admin | Bookings · Flights · Reviews management |

---

## 🔐 Authentication

SkyWings uses **Supabase Auth** with email/password. Protected pages (My Bookings, Profile, Loyalty, Check-In, Admin) prompt for sign-in automatically.

Row Level Security ensures:
- Users can only view/edit **their own** bookings, profile, and loyalty data
- Flight reviews are **publicly readable**, but only writeable by authenticated users
- Airport, aircraft, and flight data is **public read-only**

---

## 📜 License

MIT © 2026 SkyWings Airlines

---

<div align="center">

**Built with ❤️ using React + Supabase**

⭐ Star this repo if you found it useful!

</div>
