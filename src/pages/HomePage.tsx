import { useState, useEffect } from 'react';
import { Search, Calendar, Users, MapPin, TrendingUp, Shield, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Airport } from '../types';
import Button from '../components/Button';
import Select from '../components/Select';
import Input from '../components/Input';

interface HomePageProps {
  onNavigate: (page: string, data?: any) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [passengers, setPassengers] = useState('1');

  useEffect(() => {
    loadAirports();
  }, []);

  const loadAirports = async () => {
    const { data } = await supabase
      .from('airports')
      .select('*')
      .order('city');
    if (data) setAirports(data);
  };

  const handleSearch = () => {
    if (from && to && departureDate) {
      onNavigate('flights', { from, to, departureDate, passengers });
    }
  };

  const airportOptions = [
    { value: '', label: 'Select Airport' },
    ...airports.map(airport => ({
      value: airport.id,
      label: `${airport.city} (${airport.code})`
    }))
  ];

  return (
    <div className="min-h-screen">
      <div
        className="relative h-[600px] bg-cover bg-center flex items-center"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(https://images.pexels.com/photos/358319/pexels-photo-358319.jpeg)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              Explore the World with SkyWings
            </h1>
            <p className="text-xl text-gray-200">
              Book your next adventure with confidence and comfort
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-1">
                <Select
                  label="From"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  options={airportOptions}
                />
              </div>

              <div className="lg:col-span-1">
                <Select
                  label="To"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  options={airportOptions}
                />
              </div>

              <div className="lg:col-span-1">
                <Input
                  type="date"
                  label="Departure"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="lg:col-span-1">
                <Select
                  label="Passengers"
                  value={passengers}
                  onChange={(e) => setPassengers(e.target.value)}
                  options={[
                    { value: '1', label: '1 Passenger' },
                    { value: '2', label: '2 Passengers' },
                    { value: '3', label: '3 Passengers' },
                    { value: '4', label: '4 Passengers' },
                    { value: '5', label: '5+ Passengers' },
                  ]}
                />
              </div>

              <div className="lg:col-span-1 flex items-end">
                <Button
                  onClick={handleSearch}
                  size="lg"
                  className="w-full flex items-center justify-center space-x-2"
                >
                  <Search className="w-5 h-5" />
                  <span>Search</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose SkyWings?</h2>
          <p className="text-xl text-gray-600">Experience excellence in every flight</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Best Prices</h3>
            <p className="text-gray-600">
              Competitive fares and exclusive deals to make your travel affordable and enjoyable.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Safe & Secure</h3>
            <p className="text-gray-600">
              Your safety is our priority with modern aircraft and experienced crew members.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">24/7 Support</h3>
            <p className="text-gray-600">
              Round-the-clock customer service to assist you whenever you need help.
            </p>
          </div>
        </div>

        <div
          className="relative h-[400px] bg-cover bg-center rounded-2xl overflow-hidden shadow-xl"
          style={{
            backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(https://images.pexels.com/photos/62623/wing-plane-flying-airplane-62623.jpeg)',
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready for Your Next Adventure?
              </h2>
              <Button
                size="lg"
                onClick={() => onNavigate('aircraft')}
                className="text-lg px-8 py-4"
              >
                Explore Our Fleet
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
