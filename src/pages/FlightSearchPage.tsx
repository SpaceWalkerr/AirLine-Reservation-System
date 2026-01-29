import { useState, useEffect } from 'react';
import { Plane, Clock, Calendar, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Flight, Airport, Aircraft } from '../types';
import Button from '../components/Button';

interface FlightSearchPageProps {
  searchParams: {
    from: string;
    to: string;
    departureDate: string;
    passengers: string;
  };
  onNavigate: (page: string, data?: any) => void;
}

export default function FlightSearchPage({ searchParams, onNavigate }: FlightSearchPageProps) {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<'economy' | 'business' | 'first_class'>('economy');

  useEffect(() => {
    loadFlights();
  }, [searchParams]);

  const loadFlights = async () => {
    setLoading(true);
    const departureStart = new Date(searchParams.departureDate);
    const departureEnd = new Date(searchParams.departureDate);
    departureEnd.setDate(departureEnd.getDate() + 1);

    const { data, error } = await supabase
      .from('flights')
      .select(`
        *,
        aircraft (*),
        origin_airport:airports!flights_origin_airport_id_fkey (*),
        destination_airport:airports!flights_destination_airport_id_fkey (*)
      `)
      .eq('origin_airport_id', searchParams.from)
      .eq('destination_airport_id', searchParams.to)
      .gte('departure_time', departureStart.toISOString())
      .lt('departure_time', departureEnd.toISOString())
      .eq('status', 'scheduled')
      .order('departure_time');

    if (data) {
      setFlights(data as any);
    }
    setLoading(false);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateDuration = (departure: string, arrival: string) => {
    const diff = new Date(arrival).getTime() - new Date(departure).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getPrice = (flight: Flight) => {
    switch (selectedClass) {
      case 'business':
        return flight.business_price;
      case 'first_class':
        return flight.first_class_price;
      default:
        return flight.economy_price;
    }
  };

  const getAvailableSeats = (flight: Flight) => {
    switch (selectedClass) {
      case 'business':
        return flight.available_business_seats;
      case 'first_class':
        return flight.available_first_class_seats;
      default:
        return flight.available_economy_seats;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Plane className="w-16 h-16 text-blue-600 animate-bounce mx-auto mb-4" />
          <p className="text-xl text-gray-600">Searching for flights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Available Flights</h1>
              <p className="text-gray-600">
                {flights[0]?.origin_airport?.city} to {flights[0]?.destination_airport?.city} • {formatDate(searchParams.departureDate)}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedClass('economy')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  selectedClass === 'economy'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Economy
              </button>
              <button
                onClick={() => setSelectedClass('business')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  selectedClass === 'business'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Business
              </button>
              <button
                onClick={() => setSelectedClass('first_class')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  selectedClass === 'first_class'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                First Class
              </button>
            </div>
          </div>
        </div>

        {flights.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Plane className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No flights found</h2>
            <p className="text-gray-600 mb-6">Try adjusting your search criteria</p>
            <Button onClick={() => onNavigate('home')}>Back to Search</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {flights.map((flight) => (
              <div
                key={flight.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="bg-blue-100 p-3 rounded-lg">
                          <Plane className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {flight.flight_number}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {flight.aircraft?.manufacturer} {flight.aircraft?.model}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Departure</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {formatTime(flight.departure_time)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {flight.origin_airport?.code}
                          </p>
                        </div>

                        <div className="flex items-center justify-center">
                          <div className="text-center">
                            <Clock className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                            <p className="text-sm text-gray-600">
                              {calculateDuration(flight.departure_time, flight.arrival_time)}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-gray-600 mb-1">Arrival</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {formatTime(flight.arrival_time)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {flight.destination_airport?.code}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{getAvailableSeats(flight)} seats available</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(flight.departure_time)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="lg:border-l lg:pl-6 flex flex-col items-end justify-between">
                      <div className="text-right mb-4">
                        <p className="text-sm text-gray-600 mb-1">Price per passenger</p>
                        <p className="text-4xl font-bold text-blue-600">
                          ${getPrice(flight).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600 capitalize">{selectedClass.replace('_', ' ')}</p>
                      </div>
                      <Button
                        size="lg"
                        onClick={() =>
                          onNavigate('booking', {
                            flight,
                            seatClass: selectedClass,
                            passengers: parseInt(searchParams.passengers),
                          })
                        }
                        disabled={getAvailableSeats(flight) < parseInt(searchParams.passengers)}
                      >
                        {getAvailableSeats(flight) < parseInt(searchParams.passengers)
                          ? 'Not Available'
                          : 'Book Now'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
