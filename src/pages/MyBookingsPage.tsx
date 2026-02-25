import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, Calendar, MapPin, ArrowRight, Ticket, Search, AlertCircle, LogIn, Clock, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Booking } from '../types';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import { BookingCardSkeleton } from '../components/Skeleton';

interface MyBookingsPageProps {
  onNavigate: (page: string) => void;
}

export default function MyBookingsPage({ onNavigate }: MyBookingsPageProps) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'cancelled' | 'completed'>('all');

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    async function fetch() {
      const { data } = await supabase
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
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (data) setBookings(data as any);
      setLoading(false);
    }
    fetch();
  }, [user]);

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.booking_status === filter);

  const statusColor = (s: string) => {
    switch (s) {
      case 'confirmed': return { bg: 'rgba(16, 185, 129, 0.08)', color: '#10b981', border: 'rgba(16, 185, 129, 0.15)' };
      case 'cancelled': return { bg: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.15)' };
      case 'completed': return { bg: 'rgba(99, 102, 241, 0.08)', color: '#6366f1', border: 'rgba(99, 102, 241, 0.15)' };
      default: return { bg: 'rgba(156, 163, 175, 0.08)', color: '#9ca3af', border: 'rgba(156, 163, 175, 0.15)' };
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{ background: 'rgba(99, 102, 241, 0.08)' }}>
            <LogIn className="w-8 h-8" style={{ color: 'var(--color-primary)' }} />
          </div>
          <h2 className="text-xl font-bold font-display mb-2" style={{ color: 'var(--color-text)' }}>
            Sign In Required
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--color-text-3)' }}>
            Please sign in to view your bookings.
          </p>
          <Button onClick={() => onNavigate('home')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Header */}
      <div className="relative py-12 mb-8" style={{ background: 'var(--color-bg-soft)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-primary)' }}>My Bookings</p>
              <h1 className="text-3xl font-bold font-display" style={{ color: 'var(--color-text)' }}>
                Your Trips
              </h1>
            </div>
            <div className="flex gap-2 flex-wrap">
              {(['all', 'confirmed', 'cancelled', 'completed'] as const).map(f => {
                const active = filter === f;
                return (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all"
                    style={{
                      background: active ? 'var(--color-primary)' : 'transparent',
                      color: active ? 'white' : 'var(--color-text-3)',
                      border: active ? 'none' : '1px solid var(--color-border)',
                    }}
                  >
                    {f}
                    {f !== 'all' && (
                      <span className="ml-1 opacity-60">({bookings.filter(b => f === 'all' ? true : b.booking_status === f).length})</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <BookingCardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <Ticket className="w-16 h-16 mx-auto mb-4 opacity-15" style={{ color: 'var(--color-text-4)' }} />
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-2)' }}>
              {filter === 'all' ? 'No bookings yet' : `No ${filter} bookings`}
            </h3>
            <p className="text-sm mb-6" style={{ color: 'var(--color-text-4)' }}>
              {filter === 'all' ? 'Start planning your next adventure!' : 'Try a different filter.'}
            </p>
            {filter === 'all' && (
              <Button onClick={() => onNavigate('search')}>Search Flights</Button>
            )}
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-4">
              {filtered.map((booking, i) => {
                const flight = (booking as any).flight;
                const passengers = (booking as any).passengers || [];
                const sc = statusColor(booking.booking_status);

                return (
                  <motion.div
                    key={booking.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: i * 0.05 }}
                    className="card p-5 sm:p-6"
                    style={{ background: 'var(--color-bg-soft)' }}
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Main info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <span className="font-mono text-sm font-bold" style={{ color: 'var(--color-primary)' }}>
                            {booking.booking_reference}
                          </span>
                          <span
                            className="text-[11px] px-2 py-0.5 rounded-full capitalize font-medium"
                            style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}
                          >
                            {booking.booking_status}
                          </span>
                          {passengers.length > 0 && passengers[0]?.seat_class && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full capitalize"
                              style={{ background: 'rgba(99, 102, 241, 0.06)', color: 'var(--color-text-3)' }}>
                              {passengers[0].seat_class.replace('_', ' ')}
                            </span>
                          )}
                        </div>

                        {flight && (
                          <div className="flex items-center gap-3 mb-3">
                            <div>
                              <p className="text-lg font-bold font-display" style={{ color: 'var(--color-text)' }}>
                                {flight.origin_airport?.code}
                              </p>
                              <p className="text-xs" style={{ color: 'var(--color-text-4)' }}>
                                {flight.origin_airport?.city}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 flex-1 justify-center" style={{ color: 'var(--color-text-4)' }}>
                              <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
                              <Plane className="w-4 h-4 -rotate-0" style={{ color: 'var(--color-primary)' }} />
                              <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold font-display" style={{ color: 'var(--color-text)' }}>
                                {flight.destination_airport?.code}
                              </p>
                              <p className="text-xs" style={{ color: 'var(--color-text-4)' }}>
                                {flight.destination_airport?.city}
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-4 text-xs" style={{ color: 'var(--color-text-4)' }}>
                          {flight?.departure_time && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(flight.departure_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          )}
                          {flight?.departure_time && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {new Date(flight.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                          {passengers.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5" />
                              {passengers.length} passenger{passengers.length > 1 ? 's' : ''}
                            </span>
                          )}
                          {flight?.flight_number && (
                            <span className="flex items-center gap-1">
                              <Plane className="w-3.5 h-3.5" />
                              {flight.flight_number}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Price */}
                      <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between">
                        <p className="text-xl font-bold font-display" style={{ color: 'var(--color-text)' }}>
                          ${booking.total_amount?.toFixed(2) || '0.00'}
                        </p>
                        <p className="text-[10px] uppercase" style={{ color: 'var(--color-text-4)' }}>
                          {new Date(booking.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}