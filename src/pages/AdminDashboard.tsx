import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Plane, BookOpen, Star,
  TrendingUp, DollarSign, CheckCircle2, XCircle,
  Search, RefreshCw,
  Calendar, Filter
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import Button from '../components/Button';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

type Tab = 'overview' | 'bookings' | 'flights' | 'reviews';

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(false);

  // Overview stats
  const [stats, setStats] = useState({
    totalBookings: 0,
    confirmedBookings: 0,
    totalRevenue: 0,
    totalFlights: 0,
    scheduledFlights: 0,
    totalPassengers: 0,
    avgRating: 0,
    reviewCount: 0,
  });

  // Bookings tab
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');

  // Flights tab
  const [flights, setFlights] = useState<any[]>([]);
  const [flightSearch, setFlightSearch] = useState('');
  const [flightStatusFilter, setFlightStatusFilter] = useState('all');

  // Reviews tab
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'bookings') loadBookings();
    else if (activeTab === 'flights') loadFlights();
    else if (activeTab === 'reviews') loadReviews();
  }, [activeTab]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [bookingsRes, flightsRes, reviewsRes, passengersRes] = await Promise.all([
        supabase.from('bookings').select('booking_status, total_amount'),
        supabase.from('flights').select('status'),
        supabase.from('flight_reviews').select('rating'),
        supabase.from('passengers').select('id', { count: 'exact', head: true }),
      ]);

      const allBookings = bookingsRes.data || [];
      const allFlights = flightsRes.data || [];
      const allReviews = reviewsRes.data || [];

      setStats({
        totalBookings: allBookings.length,
        confirmedBookings: allBookings.filter(b => b.booking_status === 'confirmed').length,
        totalRevenue: allBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0),
        totalFlights: allFlights.length,
        scheduledFlights: allFlights.filter(f => f.status === 'scheduled').length,
        totalPassengers: passengersRes.count || 0,
        avgRating: allReviews.length ? allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length : 0,
        reviewCount: allReviews.length,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('bookings')
        .select(`
          *,
          flight:flights(flight_number, departure_time,
            origin_airport:airports!flights_origin_airport_id_fkey(code, city),
            destination_airport:airports!flights_destination_airport_id_fkey(code, city)
          ),
          passengers(first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(100);
      setBookings(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadFlights = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('flights')
        .select(`
          *,
          aircraft(model, manufacturer),
          origin_airport:airports!flights_origin_airport_id_fkey(code, city),
          destination_airport:airports!flights_destination_airport_id_fkey(code, city)
        `)
        .order('departure_time', { ascending: true })
        .limit(100);
      setFlights(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('flight_reviews')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      setReviews(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (id: string, status: string) => {
    await supabase.from('bookings').update({ booking_status: status }).eq('id', id);
    setBookings(prev => prev.map(b => b.id === id ? { ...b, booking_status: status } : b));
  };

  const updateFlightStatus = async (id: string, status: string) => {
    await supabase.from('flights').update({ status }).eq('id', id);
    setFlights(prev => prev.map(f => f.id === id ? { ...f, status } : f));
  };

  const deleteReview = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    await supabase.from('flight_reviews').delete().eq('id', id);
    setReviews(prev => prev.filter(r => r.id !== id));
  };

  const statusColor = (s: string) => {
    const map: Record<string, string> = {
      confirmed: '#10b981', cancelled: '#ef4444', checked_in: '#3b82f6',
      completed: '#8b5cf6', scheduled: '#10b981', boarding: '#f59e0b',
      departed: '#3b82f6', arrived: '#8b5cf6',
    };
    return map[s] || '#6b7280';
  };

  const filteredBookings = bookings.filter(b => {
    const matchSearch = !bookingSearch ||
      b.booking_reference?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.passengers?.[0]?.first_name?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.passengers?.[0]?.last_name?.toLowerCase().includes(bookingSearch.toLowerCase());
    const matchStatus = bookingStatusFilter === 'all' || b.booking_status === bookingStatusFilter;
    return matchSearch && matchStatus;
  });

  const filteredFlights = flights.filter(f => {
    const matchSearch = !flightSearch ||
      f.flight_number?.toLowerCase().includes(flightSearch.toLowerCase()) ||
      f.origin_airport?.city?.toLowerCase().includes(flightSearch.toLowerCase()) ||
      f.destination_airport?.city?.toLowerCase().includes(flightSearch.toLowerCase());
    const matchStatus = flightStatusFilter === 'all' || f.status === flightStatusFilter;
    return matchSearch && matchStatus;
  });

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'bookings', label: 'Bookings', icon: BookOpen },
    { id: 'flights', label: 'Flights', icon: Plane },
    { id: 'reviews', label: 'Reviews', icon: Star },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Header */}
      <div className="relative py-10 mb-8" style={{ background: 'var(--color-bg-soft)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-primary)' }}>
                Admin
              </p>
              <h1 className="text-3xl font-bold font-display" style={{ color: 'var(--color-text)' }}>
                Dashboard
              </h1>
            </div>
            <Button variant="outline" size="sm" onClick={loadStats}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-8 p-1 rounded-xl w-fit" style={{ background: 'var(--color-surface)' }}>
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all`}
                  style={activeTab === tab.id
                    ? { background: 'var(--color-primary)', color: 'white' }
                    : { color: 'var(--color-text-3)' }}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <AnimatePresence mode="wait">
          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Total Bookings', value: stats.totalBookings, sub: `${stats.confirmedBookings} confirmed`, icon: BookOpen, color: '#3b82f6' },
                  { label: 'Total Revenue', value: `$${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, sub: 'all time', icon: DollarSign, color: '#10b981' },
                  { label: 'Active Flights', value: stats.scheduledFlights, sub: `${stats.totalFlights} total`, icon: Plane, color: '#f59e0b' },
                  { label: 'Passengers', value: stats.totalPassengers, sub: 'registered', icon: Users, color: '#8b5cf6' },
                ].map((card, i) => {
                  const Icon = card.icon;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="card p-6"
                      style={{ background: 'var(--color-bg-soft)' }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: `${card.color}18` }}>
                          <Icon className="w-5 h-5" style={{ color: card.color }} />
                        </div>
                      </div>
                      <p className="text-2xl font-bold font-display mb-1" style={{ color: 'var(--color-text)' }}>
                        {loading ? '—' : card.value}
                      </p>
                      <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--color-text-3)' }}>{card.label}</p>
                      <p className="text-xs" style={{ color: 'var(--color-text-4)' }}>{card.sub}</p>
                    </motion.div>
                  );
                })}
              </div>

              {/* Secondary stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card p-6" style={{ background: 'var(--color-bg-soft)' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                    <h3 className="font-bold" style={{ color: 'var(--color-text)' }}>Booking Status Breakdown</h3>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: 'Confirmed', count: stats.confirmedBookings, color: '#10b981' },
                      { label: 'Cancelled', count: stats.totalBookings - stats.confirmedBookings, color: '#ef4444' },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                          <span className="text-sm" style={{ color: 'var(--color-text-3)' }}>{item.label}</span>
                        </div>
                        <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card p-6" style={{ background: 'var(--color-bg-soft)' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <Star className="w-5 h-5" style={{ color: '#f59e0b' }} />
                    <h3 className="font-bold" style={{ color: 'var(--color-text)' }}>Reviews Summary</h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-bold font-display" style={{ color: 'var(--color-text)' }}>
                      {stats.avgRating ? stats.avgRating.toFixed(1) : '—'}
                    </div>
                    <div>
                      <div className="flex gap-1 mb-1">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} className="w-4 h-4" fill={s <= Math.round(stats.avgRating) ? '#f59e0b' : 'none'} style={{ color: '#f59e0b' }} />
                        ))}
                      </div>
                      <p className="text-sm" style={{ color: 'var(--color-text-3)' }}>
                        {stats.reviewCount} reviews
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── BOOKINGS ── */}
          {activeTab === 'bookings' && (
            <motion.div key="bookings" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Toolbar */}
              <div className="flex flex-wrap gap-3 mb-5">
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl flex-1 min-w-[200px]"
                  style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                  <Search className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-text-4)' }} />
                  <input
                    value={bookingSearch}
                    onChange={e => setBookingSearch(e.target.value)}
                    placeholder="Search reference or passenger…"
                    className="bg-transparent text-sm outline-none flex-1"
                    style={{ color: 'var(--color-text)' }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" style={{ color: 'var(--color-text-4)' }} />
                  <select
                    value={bookingStatusFilter}
                    onChange={e => setBookingStatusFilter(e.target.value)}
                    className="select-field text-sm"
                    style={{ minWidth: 140 }}
                  >
                    <option value="all">All Statuses</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="checked_in">Checked In</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="card overflow-hidden" style={{ background: 'var(--color-bg-soft)' }}>
                {loading ? (
                  <div className="p-12 text-center">
                    <div className="spinner w-6 h-6 mx-auto" />
                  </div>
                ) : filteredBookings.length === 0 ? (
                  <div className="p-12 text-center">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" style={{ color: 'var(--color-text)' }} />
                    <p style={{ color: 'var(--color-text-3)' }}>No bookings found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                          {['Reference', 'Passenger', 'Flight', 'Date', 'Amount', 'Status', 'Actions'].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                              style={{ color: 'var(--color-text-4)' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBookings.map((b, i) => (
                          <tr key={b.id}
                            className="transition-colors"
                            style={{ borderBottom: '1px solid var(--color-border)', background: i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.01)' }}>
                            <td className="px-4 py-3 font-mono font-semibold" style={{ color: 'var(--color-primary)' }}>
                              {b.booking_reference}
                            </td>
                            <td className="px-4 py-3" style={{ color: 'var(--color-text)' }}>
                              {b.passengers?.[0] ? `${b.passengers[0].first_name} ${b.passengers[0].last_name}` : '—'}
                            </td>
                            <td className="px-4 py-3" style={{ color: 'var(--color-text-3)' }}>
                              {b.flight ? `${b.flight.origin_airport?.code} → ${b.flight.destination_airport?.code}` : '—'}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--color-text-3)' }}>
                              {b.flight ? new Date(b.flight.departure_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                            </td>
                            <td className="px-4 py-3 font-semibold" style={{ color: 'var(--color-text)' }}>
                              ${b.total_amount?.toFixed(2)}
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
                                style={{ background: `${statusColor(b.booking_status)}18`, color: statusColor(b.booking_status) }}>
                                {b.booking_status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1">
                                {b.booking_status !== 'confirmed' && (
                                  <button
                                    onClick={() => updateBookingStatus(b.id, 'confirmed')}
                                    className="p-1.5 rounded-lg transition-colors"
                                    style={{ color: '#10b981' }}
                                    title="Confirm"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                  </button>
                                )}
                                {b.booking_status !== 'cancelled' && (
                                  <button
                                    onClick={() => updateBookingStatus(b.id, 'cancelled')}
                                    className="p-1.5 rounded-lg transition-colors"
                                    style={{ color: '#ef4444' }}
                                    title="Cancel"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="px-4 py-3 border-t flex justify-between items-center"
                      style={{ borderColor: 'var(--color-border)' }}>
                      <p className="text-xs" style={{ color: 'var(--color-text-4)' }}>
                        {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── FLIGHTS ── */}
          {activeTab === 'flights' && (
            <motion.div key="flights" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="flex flex-wrap gap-3 mb-5">
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl flex-1 min-w-[200px]"
                  style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                  <Search className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-text-4)' }} />
                  <input
                    value={flightSearch}
                    onChange={e => setFlightSearch(e.target.value)}
                    placeholder="Search flight number or city…"
                    className="bg-transparent text-sm outline-none flex-1"
                    style={{ color: 'var(--color-text)' }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" style={{ color: 'var(--color-text-4)' }} />
                  <select
                    value={flightStatusFilter}
                    onChange={e => setFlightStatusFilter(e.target.value)}
                    className="select-field text-sm"
                    style={{ minWidth: 140 }}
                  >
                    <option value="all">All Statuses</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="boarding">Boarding</option>
                    <option value="departed">Departed</option>
                    <option value="arrived">Arrived</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="card overflow-hidden" style={{ background: 'var(--color-bg-soft)' }}>
                {loading ? (
                  <div className="p-12 text-center"><div className="spinner w-6 h-6 mx-auto" /></div>
                ) : filteredFlights.length === 0 ? (
                  <div className="p-12 text-center">
                    <Plane className="w-12 h-12 mx-auto mb-3 opacity-20" style={{ color: 'var(--color-text)' }} />
                    <p style={{ color: 'var(--color-text-3)' }}>No flights found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                          {['Flight', 'Route', 'Departure', 'Aircraft', 'Economy', 'Business', 'First', 'Status', 'Actions'].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                              style={{ color: 'var(--color-text-4)' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredFlights.map((f, i) => (
                          <tr key={f.id}
                            className="transition-colors"
                            style={{ borderBottom: '1px solid var(--color-border)', background: i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.01)' }}>
                            <td className="px-4 py-3 font-semibold" style={{ color: 'var(--color-primary)' }}>
                              {f.flight_number}
                            </td>
                            <td className="px-4 py-3" style={{ color: 'var(--color-text)' }}>
                              {f.origin_airport?.code} → {f.destination_airport?.code}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--color-text-3)' }}>
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                {new Date(f.departure_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-text-3)' }}>
                              {f.aircraft?.model}
                            </td>
                            <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-text-3)' }}>
                              {f.available_economy_seats}
                            </td>
                            <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-text-3)' }}>
                              {f.available_business_seats}
                            </td>
                            <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-text-3)' }}>
                              {f.available_first_class_seats}
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
                                style={{ background: `${statusColor(f.status)}18`, color: statusColor(f.status) }}>
                                {f.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <select
                                value={f.status}
                                onChange={e => updateFlightStatus(f.id, e.target.value)}
                                className="text-xs px-2 py-1 rounded-lg"
                                style={{
                                  background: 'var(--color-surface)',
                                  color: 'var(--color-text)',
                                  border: '1px solid var(--color-border)',
                                }}
                              >
                                <option value="scheduled">Scheduled</option>
                                <option value="boarding">Boarding</option>
                                <option value="departed">Departed</option>
                                <option value="arrived">Arrived</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                      <p className="text-xs" style={{ color: 'var(--color-text-4)' }}>
                        {filteredFlights.length} flight{filteredFlights.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── REVIEWS ── */}
          {activeTab === 'reviews' && (
            <motion.div key="reviews" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="space-y-4">
                {loading ? (
                  <div className="card p-12 text-center" style={{ background: 'var(--color-bg-soft)' }}>
                    <div className="spinner w-6 h-6 mx-auto" />
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="card p-12 text-center" style={{ background: 'var(--color-bg-soft)' }}>
                    <Star className="w-12 h-12 mx-auto mb-3 opacity-20" style={{ color: 'var(--color-text)' }} />
                    <p style={{ color: 'var(--color-text-3)' }}>No reviews yet</p>
                  </div>
                ) : (
                  reviews.map((review, i) => (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="card p-5"
                      style={{ background: 'var(--color-bg-soft)' }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-semibold text-sm" style={{ color: 'var(--color-primary)' }}>
                              {review.flight_number}
                            </span>
                            <div className="flex gap-0.5">
                              {[1,2,3,4,5].map(s => (
                                <Star key={s} className="w-3.5 h-3.5"
                                  fill={s <= review.rating ? '#f59e0b' : 'none'}
                                  style={{ color: '#f59e0b' }} />
                              ))}
                            </div>
                            {review.verified && (
                              <span className="text-xs px-2 py-0.5 rounded-full"
                                style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                                Verified
                              </span>
                            )}
                          </div>
                          <p className="text-sm mb-2" style={{ color: 'var(--color-text)' }}>{review.comment}</p>
                          <p className="text-xs" style={{ color: 'var(--color-text-4)' }}>
                            {new Date(review.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            {' · '}{review.helpful_votes} helpful votes
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => deleteReview(review.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                            style={{ background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444' }}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Remove
                          </button>
                          <button
                            onClick={async () => {
                              await supabase.from('flight_reviews').update({ verified: !review.verified }).eq('id', review.id);
                              setReviews(prev => prev.map(r => r.id === review.id ? { ...r, verified: !r.verified } : r));
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                            style={{ background: 'rgba(16, 185, 129, 0.08)', color: '#10b981' }}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {review.verified ? 'Unverify' : 'Verify'}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Nav */}
        <div className="mt-8 flex flex-wrap gap-3">
          <Button variant="outline" size="sm" onClick={() => onNavigate('home')}>
            ← Back to Home
          </Button>
          <Button variant="outline" size="sm" onClick={() => onNavigate('bookings')}>
            My Bookings
          </Button>
          <Button variant="outline" size="sm" onClick={() => onNavigate('flight-status')}>
            Flight Status
          </Button>
        </div>
      </div>
    </div>
  );
}
