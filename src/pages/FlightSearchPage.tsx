import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, Clock, Calendar, Users, ArrowRight, SlidersHorizontal, ArrowUpDown, X, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Flight } from '../types';
import { FlightCardSkeleton } from '../components/Skeleton';
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

type SortOption = 'price-low' | 'price-high' | 'duration' | 'departure';

export default function FlightSearchPage({ searchParams, onNavigate }: FlightSearchPageProps) {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<'economy' | 'business' | 'first_class'>('economy');
  const [sortBy, setSortBy] = useState<SortOption>('price-low');
  const [showFilters, setShowFilters] = useState(false);
  const [maxPrice, setMaxPrice] = useState(5000);
  const [priceFilter, setPriceFilter] = useState(5000);

  useEffect(() => {
    if (!searchParams?.from || !searchParams?.to || !searchParams?.departureDate) {
      setLoading(false);
      return;
    }
    loadFlights();
  }, [searchParams]);

  const loadFlights = async () => {
    setLoading(true);
    try {
      const departureStart = new Date(searchParams.departureDate);
      const departureEnd = new Date(searchParams.departureDate);
      departureEnd.setDate(departureEnd.getDate() + 1);

      const { data } = await supabase
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
        const prices = (data as any).map((f: Flight) => Math.max(f.economy_price, f.business_price, f.first_class_price));
        if (prices.length) {
          const max = Math.ceil(Math.max(...prices) / 100) * 100;
          setMaxPrice(max);
          setPriceFilter(max);
        }
      }
    } catch (err) {
      console.error('Failed to load flights:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (d: string) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const getDurationMinutes = (dep: string, arr: string) => (new Date(arr).getTime() - new Date(dep).getTime()) / 60000;

  const calculateDuration = (dep: string, arr: string) => {
    const diff = new Date(arr).getTime() - new Date(dep).getTime();
    return `${Math.floor(diff / 3600000)}h ${Math.floor((diff % 3600000) / 60000)}m`;
  };

  const getPrice = (f: Flight) => {
    switch (selectedClass) {
      case 'business': return f.business_price;
      case 'first_class': return f.first_class_price;
      default: return f.economy_price;
    }
  };

  const getSeats = (f: Flight) => {
    switch (selectedClass) {
      case 'business': return f.available_business_seats;
      case 'first_class': return f.available_first_class_seats;
      default: return f.available_economy_seats;
    }
  };

  const processed = flights
    .filter(f => getPrice(f) <= priceFilter)
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low': return getPrice(a) - getPrice(b);
        case 'price-high': return getPrice(b) - getPrice(a);
        case 'duration': return getDurationMinutes(a.departure_time, a.arrival_time) - getDurationMinutes(b.departure_time, b.arrival_time);
        case 'departure': return new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime();
        default: return 0;
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="skeleton rounded-2xl h-28 mb-8" />
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => <FlightCardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 md:p-8 mb-6"
          style={{ background: 'var(--color-bg-soft)' }}
        >
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-primary)', color: 'white' }}>
                  <Plane className="w-5 h-5" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold font-display" style={{ color: 'var(--color-text)' }}>
                  Available Flights
                </h1>
              </div>
              <p className="text-sm" style={{ color: 'var(--color-text-3)' }}>
                {flights[0]?.origin_airport?.city || 'Origin'} → {flights[0]?.destination_airport?.city || 'Destination'}
                <span className="mx-2 opacity-50">•</span>
                {formatDate(searchParams.departureDate)}
                <span className="mx-2 opacity-50">•</span>
                {searchParams.passengers} passenger{parseInt(searchParams.passengers) > 1 ? 's' : ''}
              </p>
            </div>

            {/* Class Selector */}
            <div className="flex gap-1.5 p-1 rounded-xl" style={{ background: 'var(--color-surface)' }}>
              {(['economy', 'business', 'first_class'] as const).map(cls => (
                <button
                  key={cls}
                  onClick={() => setSelectedClass(cls)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedClass === cls
                      ? 'bg-brand-500 text-white shadow-md'
                      : ''
                  }`}
                  style={selectedClass !== cls ? { color: 'var(--color-text-3)' } : {}}
                >
                  {cls === 'first_class' ? 'First Class' : cls.charAt(0).toUpperCase() + cls.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm" style={{ color: 'var(--color-text-4)' }}>
            {processed.length} flight{processed.length !== 1 ? 's' : ''} found
          </p>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as SortOption)}
                className="select-field pr-8 text-sm"
                style={{ minWidth: 180 }}
              >
                <option value="price-low">Price: Low → High</option>
                <option value="price-high">Price: High → Low</option>
                <option value="duration">Shortest Duration</option>
                <option value="departure">Earliest Departure</option>
              </select>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                showFilters ? 'ring-2 ring-brand-500' : ''
              }`}
              style={{ background: 'var(--color-surface)', color: showFilters ? 'var(--color-primary)' : 'var(--color-text-3)' }}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 280, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="flex-shrink-0 overflow-hidden"
              >
                <div
                  className="card p-6 w-[280px] sticky top-24"
                  style={{ background: 'var(--color-bg-soft)' }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold font-display flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                      <Filter className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                      Filters
                    </h3>
                    <button onClick={() => setShowFilters(false)} style={{ color: 'var(--color-text-4)' }}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mb-6">
                    <label className="text-sm font-medium block mb-3" style={{ color: 'var(--color-text-2)' }}>
                      Max Price
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={maxPrice}
                      step={50}
                      value={priceFilter}
                      onChange={e => setPriceFilter(Number(e.target.value))}
                      className="w-full h-1.5 rounded-full cursor-pointer accent-brand-500"
                    />
                    <div className="flex justify-between text-xs mt-2" style={{ color: 'var(--color-text-4)' }}>
                      <span>$0</span>
                      <span className="font-semibold" style={{ color: 'var(--color-primary)' }}>${priceFilter}</span>
                      <span>${maxPrice}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setPriceFilter(maxPrice)}
                    className="w-full py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{ background: 'var(--color-surface)', color: 'var(--color-text-3)' }}
                  >
                    Reset Filters
                  </button>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Flight Cards */}
          <div className="flex-1 min-w-0">
            {processed.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="card p-16 text-center"
                style={{ background: 'var(--color-bg-soft)' }}
              >
                <Plane className="w-14 h-14 mx-auto mb-4" style={{ color: 'var(--color-text-4)' }} />
                <h2 className="text-xl font-bold font-display mb-2" style={{ color: 'var(--color-text)' }}>No flights found</h2>
                <p className="text-sm mb-6" style={{ color: 'var(--color-text-3)' }}>
                  Try adjusting your search criteria or choose different dates
                </p>
                <Button onClick={() => onNavigate('home')}>Back to Search</Button>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {processed.map((flight, index) => (
                    <motion.div
                      key={flight.id}
                      layout
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ delay: index * 0.04, duration: 0.3 }}
                      className="card-interactive p-6 md:p-8"
                      style={{ background: 'var(--color-bg-soft)' }}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        {/* Flight Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-5">
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-surface)', color: 'var(--color-primary)' }}>
                              <Plane className="w-4 h-4" />
                            </div>
                            <div>
                              <h3 className="text-base font-bold" style={{ color: 'var(--color-text)' }}>{flight.flight_number}</h3>
                              <p className="text-xs" style={{ color: 'var(--color-text-4)' }}>
                                {flight.aircraft?.manufacturer} {flight.aircraft?.model}
                              </p>
                            </div>
                          </div>

                          {/* Route display */}
                          <div className="grid grid-cols-3 gap-4 items-center">
                            <div>
                              <p className="text-2xl font-bold font-display" style={{ color: 'var(--color-text)' }}>{formatTime(flight.departure_time)}</p>
                              <p className="text-sm font-medium" style={{ color: 'var(--color-text-3)' }}>{flight.origin_airport?.code}</p>
                              <p className="text-xs" style={{ color: 'var(--color-text-4)' }}>{flight.origin_airport?.city}</p>
                            </div>
                            <div className="flex flex-col items-center">
                              <Clock className="w-3.5 h-3.5 mb-1" style={{ color: 'var(--color-text-4)' }} />
                              <p className="text-xs mb-1.5" style={{ color: 'var(--color-text-4)' }}>{calculateDuration(flight.departure_time, flight.arrival_time)}</p>
                              <div className="w-full relative">
                                <div className="h-px w-full" style={{ background: 'var(--color-border-2)' }} />
                                <Plane className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 -rotate-12" style={{ color: 'var(--color-primary)' }} />
                              </div>
                              <p className="text-[10px] mt-1.5 uppercase font-medium" style={{ color: 'var(--color-text-4)' }}>Direct</p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold font-display" style={{ color: 'var(--color-text)' }}>{formatTime(flight.arrival_time)}</p>
                              <p className="text-sm font-medium" style={{ color: 'var(--color-text-3)' }}>{flight.destination_airport?.code}</p>
                              <p className="text-xs" style={{ color: 'var(--color-text-4)' }}>{flight.destination_airport?.city}</p>
                            </div>
                          </div>

                          <div className="mt-4 flex items-center gap-5 text-xs" style={{ color: 'var(--color-text-4)' }}>
                            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {getSeats(flight)} seats left</span>
                            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formatDate(flight.departure_time)}</span>
                          </div>
                        </div>

                        {/* Price & Book */}
                        <div className="lg:border-l lg:pl-8 flex flex-col items-end min-w-[180px]" style={{ borderColor: 'var(--color-border)' }}>
                          <div className="text-right mb-4">
                            <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: 'var(--color-text-4)' }}>Per passenger</p>
                            <p className="text-3xl font-extrabold font-display text-gradient">
                              ${getPrice(flight).toFixed(2)}
                            </p>
                            <p className="text-xs capitalize mt-0.5" style={{ color: 'var(--color-text-3)' }}>{selectedClass.replace('_', ' ')}</p>
                          </div>
                          <Button
                            size="md"
                            onClick={() => onNavigate('seatSelection', { flight, seatClass: selectedClass, passengers: parseInt(searchParams.passengers) })}
                            disabled={getSeats(flight) < parseInt(searchParams.passengers)}
                            className="w-full flex items-center justify-center gap-2"
                          >
                            {getSeats(flight) < parseInt(searchParams.passengers) ? 'Sold Out' : (
                              <>Select Flight <ArrowRight className="w-4 h-4" /></>
                            )}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}