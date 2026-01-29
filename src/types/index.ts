export interface Airport {
  id: string;
  code: string;
  name: string;
  city: string;
  country: string;
  timezone: string;
  created_at: string;
}

export interface Aircraft {
  id: string;
  model: string;
  manufacturer: string;
  total_seats: number;
  economy_seats: number;
  business_seats: number;
  first_class_seats: number;
  cruise_speed: number;
  range_km: number;
  image_url: string;
  description: string;
  created_at: string;
}

export interface Flight {
  id: string;
  flight_number: string;
  aircraft_id: string;
  origin_airport_id: string;
  destination_airport_id: string;
  departure_time: string;
  arrival_time: string;
  economy_price: number;
  business_price: number;
  first_class_price: number;
  available_economy_seats: number;
  available_business_seats: number;
  available_first_class_seats: number;
  status: string;
  created_at: string;
  aircraft?: Aircraft;
  origin_airport?: Airport;
  destination_airport?: Airport;
}

export interface Booking {
  id: string;
  user_id: string;
  flight_id: string;
  booking_reference: string;
  total_passengers: number;
  total_amount: number;
  booking_status: string;
  created_at: string;
  flight?: Flight;
}

export interface Passenger {
  id?: string;
  booking_id?: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  passport_number: string;
  nationality: string;
  seat_class: 'economy' | 'business' | 'first_class';
  seat_number?: string;
}

export type SeatClass = 'economy' | 'business' | 'first_class';
