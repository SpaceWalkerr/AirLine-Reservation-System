import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plane, Users, Gauge, Ruler, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Aircraft } from '../types';
import { AnimatedSection, StaggerContainer, staggerItem } from '../components/AnimatedPage';
import { FlightCardSkeleton } from '../components/Skeleton';

export default function AircraftPage() {
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchAircraft() {
      const { data } = await supabase.from('aircraft').select('*').order('manufacturer');
      if (data) setAircraft(data);
      setLoading(false);
    }
    fetchAircraft();
  }, []);

  const filtered = aircraft.filter(a =>
    `${a.manufacturer} ${a.model} ${a.registration_number}`.toLowerCase().includes(search.toLowerCase())
  );

  const images = [
    'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=600&q=80',
    'https://images.unsplash.com/photo-1436491865332-7a61a109db05?w=600&q=80',
    'https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=600&q=80',
    'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=600&q=80',
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Hero */}
      <div className="relative py-16 mb-12 overflow-hidden" style={{ background: 'var(--color-bg-soft)' }}>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
          <AnimatedSection>
            <p className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-primary)' }}>Our Fleet</p>
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-4" style={{ color: 'var(--color-text)' }}>
              World-Class Aircraft
            </h1>
            <p className="text-lg max-w-xl" style={{ color: 'var(--color-text-3)' }}>
              Explore our modern fleet of aircraft designed for comfort, safety, and efficiency.
            </p>
          </AnimatedSection>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Search */}
        <div className="relative max-w-md mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-4)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search aircraft..."
            className="input-field pl-10 w-full"
          />
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <FlightCardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Plane className="w-12 h-12 mx-auto mb-4 opacity-20" style={{ color: 'var(--color-text-4)' }} />
            <p className="text-lg font-semibold" style={{ color: 'var(--color-text-2)' }}>No aircraft found</p>
          </div>
        ) : (
          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((a, i) => (
              <motion.div key={a.id} variants={staggerItem} className="card-interactive overflow-hidden group" style={{ background: 'var(--color-bg-soft)' }}>
                <div className="h-40 overflow-hidden relative">
                  <img
                    src={images[i % images.length]}
                    alt={`${a.manufacturer} ${a.model}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4">
                    <p className="text-white font-bold font-display text-lg">{a.manufacturer} {a.model}</p>
                    <p className="text-white/70 text-xs font-mono">{a.registration_number}</p>
                  </div>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-2 rounded-lg" style={{ background: 'var(--color-bg)' }}>
                      <Users className="w-4 h-4 mx-auto mb-1" style={{ color: 'var(--color-primary)' }} />
                      <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{a.total_seats}</p>
                      <p className="text-[10px]" style={{ color: 'var(--color-text-4)' }}>Seats</p>
                    </div>
                    <div className="text-center p-2 rounded-lg" style={{ background: 'var(--color-bg)' }}>
                      <Gauge className="w-4 h-4 mx-auto mb-1" style={{ color: 'var(--color-primary)' }} />
                      <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>920</p>
                      <p className="text-[10px]" style={{ color: 'var(--color-text-4)' }}>km/h</p>
                    </div>
                    <div className="text-center p-2 rounded-lg" style={{ background: 'var(--color-bg)' }}>
                      <Ruler className="w-4 h-4 mx-auto mb-1" style={{ color: 'var(--color-primary)' }} />
                      <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>12k</p>
                      <p className="text-[10px]" style={{ color: 'var(--color-text-4)' }}>km</p>
                    </div>
                  </div>
                  {a.economy_seats > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {a.economy_seats > 0 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(99, 102, 241, 0.08)', color: 'var(--color-primary)' }}>
                          Economy: {a.economy_seats}
                        </span>
                      )}
                      {a.business_seats > 0 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(245, 158, 11, 0.08)', color: '#f59e0b' }}>
                          Business: {a.business_seats}
                        </span>
                      )}
                      {a.first_class_seats > 0 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(16, 185, 129, 0.08)', color: '#10b981' }}>
                          First: {a.first_class_seats}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </StaggerContainer>
        )}
      </div>
    </div>
  );
}