import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, Search, CheckCircle2, AlertCircle, User, Luggage, Download, Printer } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Button from '../components/Button';
import Input from '../components/Input';

interface CheckInPageProps {
  onNavigate: (page: string, data?: any) => void;
}

export default function CheckInPage({ onNavigate }: CheckInPageProps) {
  const [bookingRef, setBookingRef] = useState('');
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkedIn, setCheckedIn] = useState(false);
  const [selectedBags, setSelectedBags] = useState<number>(0);

  const searchBooking = async () => {
    if (!bookingRef.trim()) {
      setError('Please enter your booking reference');
      return;
    }

    setLoading(true);
    setError('');
    setBooking(null);

    try {
      const { data, error: queryError } = await supabase
        .from('bookings')
        .select(`
          *,
          flight:flights(
            *,
            origin_airport:airports!flights_origin_airport_id_fkey(*),
            destination_airport:airports!flights_destination_airport_id_fkey(*),
            aircraft:aircraft(*)
          ),
          passengers(*)
        `)
        .eq('booking_reference', bookingRef.toUpperCase())
        .single();

      if (queryError || !data) {
        setError('Booking not found. Please check your booking reference.');
      } else {
        const flight = data.flight;
        const departureTime = new Date(flight.departure_time);
        const now = new Date();
        const hoursUntilDeparture = (departureTime.getTime() - now.getTime()) / (1000 * 60 * 60);

        if (hoursUntilDeparture > 24) {
          setError('Check-in opens 24 hours before departure.');
        } else if (hoursUntilDeparture < 1) {
          setError('Check-in has closed for this flight.');
        } else if (data.booking_status !== 'confirmed') {
          setError('This booking is not eligible for check-in.');
        } else {
          setBooking(data);
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const completeCheckIn = async () => {
    if (!booking) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ booking_status: 'checked_in' })
        .eq('id', booking.id);
      if (error) throw error;
      setCheckedIn(true);
    } catch (err: any) {
      setError(err.message || 'Check-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Hero */}
      <div className="relative py-16 mb-12" style={{ background: 'var(--color-bg-soft)' }}>
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
              style={{ background: 'rgba(99, 102, 241, 0.08)', color: 'var(--color-primary)' }}>
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm font-semibold">Online Check-In</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-4" style={{ color: 'var(--color-text)' }}>
              Check In Online
            </h1>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-text-3)' }}>
              Skip the airport queues. Check in 24 hours before your flight.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {!booking && !checkedIn && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-8 text-center"
            style={{ background: 'var(--color-bg-soft)' }}
          >
            <h2 className="text-2xl font-bold font-display mb-6" style={{ color: 'var(--color-text)' }}>
              Enter Your Booking Details
            </h2>

            <div className="max-w-md mx-auto">
              <div className="flex gap-3 mb-4">
                <div className="flex-1">
                  <Input
                    label="Booking Reference"
                    value={bookingRef}
                    onChange={(e) => {
                      setBookingRef(e.target.value.toUpperCase());
                      setError('');
                    }}
                    placeholder="SW123ABC"
                    onKeyPress={(e) => e.key === 'Enter' && searchBooking()}
                  />
                </div>
                <Button onClick={searchBooking} disabled={loading} className="mt-7">
                  <Search className="w-4 h-4 mr-2" />
                  {loading ? 'Searching...' : 'Find'}
                </Button>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-3 rounded-lg flex items-center gap-2 text-left"
                  style={{ background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444' }}
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </motion.div>
              )}

              <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <p className="text-sm mb-3" style={{ color: 'var(--color-text-3)' }}>
                  Don't have your booking reference?
                </p>
                <Button variant="outline" size="sm" onClick={() => onNavigate('bookings')}>
                  Go to My Bookings
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {booking && !checkedIn && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Flight Info */}
              <div className="card p-6" style={{ background: 'var(--color-bg-soft)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-5 h-5" style={{ color: '#10b981' }} />
                  <h2 className="text-xl font-bold font-display" style={{ color: 'var(--color-text)' }}>
                    Flight Found
                  </h2>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center mb-6">
                  <div>
                    <p className="text-sm mb-1" style={{ color: 'var(--color-text-3)' }}>From</p>
                    <p className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
                      {booking.flight.origin_airport?.code}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--color-text-3)' }}>
                      {booking.flight.origin_airport?.city}
                    </p>
                  </div>
                  <div className="text-center">
                    <Plane className="w-8 h-8 mx-auto" style={{ color: 'var(--color-primary)' }} />
                  </div>
                  <div className="text-right">
                    <p className="text-sm mb-1" style={{ color: 'var(--color-text-3)' }}>To</p>
                    <p className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
                      {booking.flight.destination_airport?.code}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--color-text-3)' }}>
                      {booking.flight.destination_airport?.city}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                  <div>
                    <p className="text-xs mb-1" style={{ color: 'var(--color-text-4)' }}>Flight</p>
                    <p className="font-semibold" style={{ color: 'var(--color-text)' }}>
                      {booking.flight.flight_number}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs mb-1" style={{ color: 'var(--color-text-4)' }}>Date</p>
                    <p className="font-semibold" style={{ color: 'var(--color-text)' }}>
                      {new Date(booking.flight.departure_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs mb-1" style={{ color: 'var(--color-text-4)' }}>Departure</p>
                    <p className="font-semibold" style={{ color: 'var(--color-text)' }}>
                      {new Date(booking.flight.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs mb-1" style={{ color: 'var(--color-text-4)' }}>Passengers</p>
                    <p className="font-semibold" style={{ color: 'var(--color-text)' }}>
                      {booking.passengers?.length || booking.total_passengers}
                    </p>
                  </div>
                </div>
              </div>

              {/* Passengers */}
              <div className="card p-6" style={{ background: 'var(--color-bg-soft)' }}>
                <h3 className="text-lg font-bold font-display mb-4" style={{ color: 'var(--color-text)' }}>
                  Passengers
                </h3>
                <div className="space-y-3">
                  {booking.passengers?.map((passenger: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-lg flex items-center justify-between"
                      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ background: 'var(--color-primary)', color: 'white' }}>
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold" style={{ color: 'var(--color-text)' }}>
                            {passenger.first_name} {passenger.last_name}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--color-text-4)' }}>
                            Seat: {passenger.seat_number || 'Not assigned'}
                          </p>
                        </div>
                      </div>
                      <CheckCircle2 className="w-5 h-5" style={{ color: '#10b981' }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Baggage */}
              <div className="card p-6" style={{ background: 'var(--color-bg-soft)' }}>
                <h3 className="text-lg font-bold font-display mb-4" style={{ color: 'var(--color-text)' }}>
                  Checked Baggage
                </h3>
                <div className="flex items-center gap-4 mb-4">
                  <Luggage className="w-8 h-8" style={{ color: 'var(--color-primary)' }} />
                  <div className="flex-1">
                    <p className="text-sm mb-2" style={{ color: 'var(--color-text-3)' }}>
                      How many bags to check? (Included: 2 per passenger)
                    </p>
                    <div className="flex gap-2">
                      {[0, 1, 2, 3, 4].map((num) => (
                        <button
                          key={num}
                          onClick={() => setSelectedBags(num)}
                          className="px-4 py-2 rounded-lg font-semibold transition-all"
                          style={{
                            background: selectedBags === num ? 'var(--color-primary)' : 'var(--color-surface)',
                            color: selectedBags === num ? 'white' : 'var(--color-text)',
                            border: `1px solid ${selectedBags === num ? 'transparent' : 'var(--color-border)'}`,
                          }}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                {selectedBags > 2 * booking.total_passengers && (
                  <p className="text-sm" style={{ color: '#f59e0b' }}>
                    Additional baggage fee: ${(selectedBags - 2 * booking.total_passengers) * 50}
                  </p>
                )}
              </div>

              {/* Check In Button */}
              <div className="flex gap-3 justify-center">
                <Button onClick={completeCheckIn} disabled={loading} size="lg">
                  {loading ? (
                    <>
                      <div className="spinner w-4 h-4 mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Complete Check-In
                    </>
                  )}
                </Button>
                <Button variant="outline" size="lg" onClick={() => setBooking(null)}>
                  Cancel
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {checkedIn && booking && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card p-8 text-center"
            style={{ background: 'var(--color-bg-soft)' }}
          >
            <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
              style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
              <CheckCircle2 className="w-10 h-10" style={{ color: '#10b981' }} />
            </div>
            <h2 className="text-3xl font-bold font-display mb-4" style={{ color: 'var(--color-text)' }}>
              Check-In Successful!
            </h2>
            <p className="text-lg mb-8" style={{ color: 'var(--color-text-3)' }}>
              You're all set for your flight {booking.flight.flight_number}
            </p>

            <div className="flex flex-wrap gap-3 justify-center mb-8">
              <Button onClick={() => onNavigate('boarding-pass', booking.id)}>
                <Download className="w-4 h-4 mr-2" />
                View Boarding Pass
              </Button>
              <Button variant="outline" onClick={() => window.print()}>
                <Printer className="w-4 h-4 mr-2" />
                Print Boarding Pass
              </Button>
            </div>

            <div className="p-4 rounded-lg text-left max-w-md mx-auto"
              style={{ background: 'rgba(99, 102, 241, 0.06)', border: '1px solid rgba(99, 102, 241, 0.12)' }}>
              <p className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                Important Reminders:
              </p>
              <ul className="text-sm space-y-1" style={{ color: 'var(--color-text-3)' }}>
                <li>• Arrive at the airport at least 2 hours before departure</li>
                <li>• Bring a valid government-issued ID</li>
                <li>• Gate closes 15 minutes before departure</li>
                {selectedBags > 0 && <li>• Drop your {selectedBags} bag(s) at the baggage counter</li>}
              </ul>
            </div>

            <div className="mt-6">
              <Button variant="outline" onClick={() => onNavigate('bookings')}>
                View All Bookings
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
