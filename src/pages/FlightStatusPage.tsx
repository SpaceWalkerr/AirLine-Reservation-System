import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, Search, AlertCircle, CheckCircle2, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Button from '../components/Button';
import Input from '../components/Input';

interface FlightStatusPageProps {
  onNavigate: (page: string) => void;
}

export default function FlightStatusPage({ onNavigate }: FlightStatusPageProps) {
  const [flightNumber, setFlightNumber] = useState('');
  const [flightData, setFlightData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchFlight = async () => {
    if (!flightNumber.trim()) {
      setError('Please enter a flight number');
      return;
    }

    setLoading(true);
    setError('');
    setFlightData(null);

    try {
      const { data, error: queryError } = await supabase
        .from('flights')
        .select(`
          *,
          origin_airport:airports!flights_origin_airport_id_fkey(*),
          destination_airport:airports!flights_destination_airport_id_fkey(*),
          aircraft:aircraft(*)
        `)
        .ilike('flight_number', flightNumber.trim())
        .single();

      if (queryError || !data) {
        setError('Flight not found. Please check the flight number and try again.');
      } else {
        setFlightData(data);
      }
    } catch (err) {
      setError('An error occurred while searching. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getFlightStatus = (flight: any) => {
    const now = new Date();
    const departure = new Date(flight.departure_time);
    const arrival = new Date(flight.arrival_time);

    if (now < departure) {
      const minutesUntil = Math.floor((departure.getTime() - now.getTime()) / 60000);
      if (minutesUntil < 120) {
        return { status: 'Boarding', color: '#f59e0b', icon: Loader, message: 'Boarding in progress' };
      }
      return { status: 'Scheduled', color: '#10b981', icon: CheckCircle2, message: 'On time' };
    } else if (now >= departure && now < arrival) {
      return { status: 'In Flight', color: '#3b82f6', icon: Plane, message: 'Currently in the air' };
    } else {
      return { status: 'Landed', color: '#6366f1', icon: CheckCircle2, message: 'Arrived at destination' };
    }
  };

  const calculateProgress = (flight: any) => {
    const now = new Date().getTime();
    const departure = new Date(flight.departure_time).getTime();
    const arrival = new Date(flight.arrival_time).getTime();

    if (now < departure) return 0;
    if (now > arrival) return 100;

    return ((now - departure) / (arrival - departure)) * 100;
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Hero Section */}
      <div className="relative py-16 mb-12" style={{ background: 'var(--color-bg-soft)' }}>
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
              style={{ background: 'rgba(99, 102, 241, 0.08)', color: 'var(--color-primary)' }}>
              <Plane className="w-4 h-4" />
              <span className="text-sm font-semibold">Flight Tracker</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-4" style={{ color: 'var(--color-text)' }}>
              Check Flight Status
            </h1>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-text-3)' }}>
              Track your flight in real-time. Enter your flight number to get the latest updates.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
          style={{ background: 'var(--color-bg-soft)' }}
        >
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                label=""
                value={flightNumber}
                onChange={(e) => {
                  setFlightNumber(e.target.value.toUpperCase());
                  setError('');
                }}
                placeholder="Enter flight number (e.g., SK101)"
                onKeyPress={(e) => e.key === 'Enter' && searchFlight()}
              />
            </div>
            <Button
              onClick={searchFlight}
              disabled={loading}
              className="mt-0"
            >
              <Search className="w-4 h-4 mr-2" />
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 p-3 rounded-lg flex items-center gap-2"
              style={{ background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444' }}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Flight Status Display */}
      <AnimatePresence mode="wait">
        {flightData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto px-4 sm:px-6"
          >
            {(() => {
              const statusInfo = getFlightStatus(flightData);
              const progress = calculateProgress(flightData);
              const StatusIcon = statusInfo.icon;

              return (
                <div className="space-y-6">
                  {/* Status Banner */}
                  <div className="card p-6" style={{ background: 'var(--color-bg-soft)' }}>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="text-sm mb-1" style={{ color: 'var(--color-text-3)' }}>Flight Number</p>
                        <p className="text-2xl font-bold font-display" style={{ color: 'var(--color-text)' }}>
                          {flightData.flight_number}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                          style={{ background: `${statusInfo.color}15`, color: statusInfo.color }}>
                          <StatusIcon className="w-5 h-5" />
                          <span className="font-semibold">{statusInfo.status}</span>
                        </div>
                        <p className="text-sm mt-2" style={{ color: 'var(--color-text-3)' }}>
                          {statusInfo.message}
                        </p>
                      </div>
                    </div>

                    {/* Route */}
                    <div className="grid grid-cols-3 gap-4 items-center mb-6">
                      <div>
                        <p className="text-sm mb-1" style={{ color: 'var(--color-text-3)' }}>Departure</p>
                        <p className="text-3xl font-bold font-display" style={{ color: 'var(--color-text)' }}>
                          {flightData.origin_airport?.code}
                        </p>
                        <p className="text-sm" style={{ color: 'var(--color-text-3)' }}>
                          {flightData.origin_airport?.city}
                        </p>
                        <p className="text-xs mt-1 font-medium" style={{ color: 'var(--color-primary)' }}>
                          {new Date(flightData.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      <div className="relative">
                        <div className="h-1 rounded-full" style={{ background: 'var(--color-border)' }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="h-full rounded-full"
                            style={{ background: statusInfo.color }}
                          />
                        </div>
                        <motion.div
                          initial={{ left: '0%' }}
                          animate={{ left: `${progress}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                        >
                          <Plane className="w-6 h-6" style={{ color: statusInfo.color }} />
                        </motion.div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm mb-1" style={{ color: 'var(--color-text-3)' }}>Arrival</p>
                        <p className="text-3xl font-bold font-display" style={{ color: 'var(--color-text)' }}>
                          {flightData.destination_airport?.code}
                        </p>
                        <p className="text-sm" style={{ color: 'var(--color-text-3)' }}>
                          {flightData.destination_airport?.city}
                        </p>
                        <p className="text-xs mt-1 font-medium" style={{ color: 'var(--color-primary)' }}>
                          {new Date(flightData.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
                      <div>
                        <p className="text-xs mb-1" style={{ color: 'var(--color-text-4)' }}>Date</p>
                        <p className="font-semibold" style={{ color: 'var(--color-text)' }}>
                          {new Date(flightData.departure_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs mb-1" style={{ color: 'var(--color-text-4)' }}>Aircraft</p>
                        <p className="font-semibold" style={{ color: 'var(--color-text)' }}>
                          {flightData.aircraft?.model || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs mb-1" style={{ color: 'var(--color-text-4)' }}>Duration</p>
                        <p className="font-semibold" style={{ color: 'var(--color-text)' }}>
                          {Math.floor((new Date(flightData.arrival_time).getTime() - new Date(flightData.departure_time).getTime()) / 3600000)}h{' '}
                          {Math.floor(((new Date(flightData.arrival_time).getTime() - new Date(flightData.departure_time).getTime()) % 3600000) / 60000)}m
                        </p>
                      </div>
                      <div>
                        <p className="text-xs mb-1" style={{ color: 'var(--color-text-4)' }}>Status</p>
                        <p className="font-semibold capitalize" style={{ color: 'var(--color-text)' }}>
                          {flightData.status}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex flex-wrap gap-3 justify-center">
                    <Button
                      variant="outline"
                      onClick={() => onNavigate('search')}
                    >
                      Book This Flight
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setFlightNumber('');
                        setFlightData(null);
                      }}
                    >
                      Search Another Flight
                    </Button>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Popular Flights */}
      {!flightData && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto px-4 sm:px-6"
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
            Popular Flight Numbers
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['SK101', 'SK102', 'SK201', 'SK202'].map((fn) => (
              <button
                key={fn}
                onClick={() => {
                  setFlightNumber(fn);
                  setTimeout(() => searchFlight(), 100);
                }}
                className="p-4 rounded-lg text-center transition-all hover:scale-105"
                style={{
                  background: 'var(--color-bg-soft)',
                  border: '1px solid var(--color-border)'
                }}
              >
                <Plane className="w-5 h-5 mx-auto mb-2" style={{ color: 'var(--color-primary)' }} />
                <p className="font-mono font-semibold" style={{ color: 'var(--color-text)' }}>
                  {fn}
                </p>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
