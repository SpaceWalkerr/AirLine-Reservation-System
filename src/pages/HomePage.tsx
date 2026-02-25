import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Search, Calendar, Users, Plane, Globe, Star, ArrowRight, 
  Shield, Clock, TrendingUp, ChevronRight, ChevronLeft, MapPin
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Airport } from '../types';
import { AnimatedSection, StaggerContainer, staggerItem } from '../components/AnimatedPage';
import Button from '../components/Button';
import Select from '../components/Select';
import Input from '../components/Input';

interface HomePageProps {
  onNavigate: (page: string, data?: any) => void;
}

function AnimatedCounter({ end, duration = 2000, suffix = '' }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const counted = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true;
          let start = 0;
          const step = end / (duration / 16);
          const timer = setInterval(() => {
            start += step;
            if (start >= end) { setCount(end); clearInterval(timer); }
            else setCount(Math.floor(start));
          }, 16);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return <div ref={ref}>{count.toLocaleString()}{suffix}</div>;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [passengers, setPassengers] = useState('1');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    loadAirports();
  }, []);

  const loadAirports = async () => {
    try {
      const { data } = await supabase.from('airports').select('*').order('city');
      if (data) setAirports(data);
    } catch (err) {
      console.error('Failed to load airports:', err);
    }
  };

  const handleSearch = () => {
    if (from && to && departureDate) {
      onNavigate('flights', { from, to, departureDate, passengers });
    }
  };

  const airportOptions = [
    { value: '', label: 'Select Airport' },
    ...airports.map(a => ({ value: a.id, label: `${a.city} (${a.code})` })),
  ];

  const destinations = [
    { city: 'Tokyo', country: 'Japan', image: 'https://images.pexels.com/photos/2614818/pexels-photo-2614818.jpeg?auto=compress&cs=tinysrgb&w=600', price: '$499', tag: 'Popular' },
    { city: 'Paris', country: 'France', image: 'https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg?auto=compress&cs=tinysrgb&w=600', price: '$399', tag: 'Trending' },
    { city: 'Dubai', country: 'UAE', image: 'https://images.pexels.com/photos/1470502/pexels-photo-1470502.jpeg?auto=compress&cs=tinysrgb&w=600', price: '$349', tag: 'Best Deal' },
    { city: 'Singapore', country: 'Singapore', image: 'https://images.pexels.com/photos/777059/pexels-photo-777059.jpeg?auto=compress&cs=tinysrgb&w=600', price: '$449', tag: 'New' },
    { city: 'London', country: 'UK', image: 'https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg?auto=compress&cs=tinysrgb&w=600', price: '$379', tag: 'Classic' },
    { city: 'New York', country: 'United States', image: 'https://images.pexels.com/photos/802024/pexels-photo-802024.jpeg?auto=compress&cs=tinysrgb&w=600', price: '$299', tag: 'Popular' },
  ];

  const testimonials = [
    { name: 'Sarah Mitchell', role: 'Frequent Traveler', text: 'SkyWings has redefined flying for me. The booking experience is seamless and the comfort on board is unmatched.', rating: 5 },
    { name: 'James Chen', role: 'Business Executive', text: "As someone who flies weekly, SkyWings' efficiency and premium service save me time and make every trip enjoyable.", rating: 5 },
    { name: 'Elena Rodriguez', role: 'Travel Blogger', text: 'From the interface to the in-flight experience, every detail is crafted with care. SkyWings is the gold standard.', rating: 5 },
  ];

  const visibleDests = 4;
  const maxCarousel = Math.max(0, destinations.length - visibleDests);

  return (
    <div style={{ color: 'var(--color-text)' }}>
      {/* ======== HERO ======== */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: 'url(https://images.pexels.com/photos/62623/wing-plane-flying-airplane-62623.jpeg?auto=compress&cs=tinysrgb&w=1920)',
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, rgba(11,15,26,0.92) 0%, rgba(11,15,26,0.75) 50%, rgba(11,15,26,0.85) 100%)',
            }}
          />
          {/* Dot pattern */}
          <div className="hero-pattern absolute inset-0 opacity-[0.03]" />
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-32 pb-24"
        >
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-8"
              style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818CF8' }}
            >
              <Star className="w-3.5 h-3.5" />
              Trusted by 10M+ travelers worldwide
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl md:text-7xl font-extrabold font-display leading-[1.1] mb-6 text-white"
            >
              Your Journey
              <br />
              <span className="text-gradient">Starts Here</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg md:text-xl text-slate-300 max-w-xl mb-10 leading-relaxed"
            >
              Experience world-class air travel with SkyWings. Premium comfort,
              unbeatable prices, and 120+ destinations that take your breath away.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap gap-4 mb-16"
            >
              <Button
                size="lg"
                onClick={() => document.getElementById('search-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-2"
              >
                <Search className="w-5 h-5" />
                Search Flights
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => onNavigate('aircraft')}
                className="flex items-center gap-2 !border-white/30 !text-white hover:!bg-white/10"
              >
                Explore Fleet
                <ArrowRight className="w-5 h-5" />
              </Button>
            </motion.div>

            {/* Mini Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="flex gap-10"
            >
              {[
                { value: '120+', label: 'Destinations' },
                { value: '500+', label: 'Daily Flights' },
                { value: '99.8%', label: 'On-Time Rate' },
              ].map((stat, i) => (
                <div key={i}>
                  <div className="text-2xl font-bold text-white mb-0.5">{stat.value}</div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-xs text-slate-500 uppercase tracking-widest">Scroll</span>
          <div className="w-5 h-8 rounded-full border border-slate-600 flex items-start justify-center p-1.5">
            <motion.div
              className="w-1 h-2 rounded-full bg-brand-500"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* ======== SEARCH ======== */}
      <section id="search-section" className="relative py-20 -mt-16 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="card-elevated p-8"
            style={{ background: 'var(--color-bg-soft)' }}
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold font-display mb-2" style={{ color: 'var(--color-text)' }}>
                Where will you go next?
              </h2>
              <p className="text-sm" style={{ color: 'var(--color-text-3)' }}>
                Search from 500+ daily flights to your dream destination
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-1">
                <Select label="From" value={from} onChange={(e) => setFrom(e.target.value)} options={airportOptions} />
              </div>
              <div className="lg:col-span-1">
                <Select label="To" value={to} onChange={(e) => setTo(e.target.value)} options={airportOptions} />
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
                <Button onClick={handleSearch} size="lg" className="w-full flex items-center justify-center gap-2">
                  <Search className="w-5 h-5" />
                  Search
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ======== FEATURES ======== */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-primary)' }}>
              Why choose us
            </p>
            <h2 className="text-3xl md:text-4xl font-bold font-display" style={{ color: 'var(--color-text)' }}>
              The SkyWings Experience
            </h2>
          </AnimatedSection>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: TrendingUp,
                title: 'Unbeatable Prices',
                description: 'Dynamic pricing ensures you always get the best deal. Save up to 40% on every booking.',
                color: '#10B981',
              },
              {
                icon: Shield,
                title: 'Safe & Secure',
                description: 'Bank-grade encryption protects your data. Our modern fleet guarantees your safety.',
                color: '#6366F1',
              },
              {
                icon: Clock,
                title: '24/7 Global Support',
                description: 'Expert support team available around the clock in 15+ languages worldwide.',
                color: '#0EA5E9',
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  variants={staggerItem}
                  className="card p-7 group"
                  style={{ background: 'var(--color-bg-soft)' }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110"
                    style={{ background: `${feature.color}15`, color: feature.color }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold font-display mb-2" style={{ color: 'var(--color-text)' }}>
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-3)' }}>
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* ======== STATS ======== */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div
              className="rounded-2xl p-10 md:p-14"
              style={{
                background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
              }}
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { value: 10, suffix: 'M+', label: 'Happy Passengers', icon: Users },
                  { value: 120, suffix: '+', label: 'Destinations', icon: Globe },
                  { value: 500, suffix: '+', label: 'Daily Flights', icon: Plane },
                  { value: 25, suffix: '+', label: 'Years of Excellence', icon: Star },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={i} className="text-center">
                      <Icon className="w-7 h-7 text-white/40 mx-auto mb-3" />
                      <div className="text-3xl md:text-4xl font-extrabold font-display text-white mb-1">
                        <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                      </div>
                      <p className="text-sm text-white/60">{stat.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ======== DESTINATIONS ======== */}
      <section className="py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="flex items-end justify-between mb-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-primary)' }}>
                Trending Now
              </p>
              <h2 className="text-3xl md:text-4xl font-bold font-display" style={{ color: 'var(--color-text)' }}>
                Popular Destinations
              </h2>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => setCarouselIndex(Math.max(0, carouselIndex - 1))}
                disabled={carouselIndex === 0}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
                style={{ background: 'var(--color-surface)', color: 'var(--color-text-3)' }}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCarouselIndex(Math.min(maxCarousel, carouselIndex + 1))}
                disabled={carouselIndex >= maxCarousel}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
                style={{ background: 'var(--color-surface)', color: 'var(--color-text-3)' }}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </AnimatedSection>

          <div className="overflow-hidden">
            <motion.div
              className="flex gap-5"
              animate={{ x: `-${carouselIndex * (100 / visibleDests + 1.5)}%` }}
              transition={{ type: 'spring', stiffness: 200, damping: 30 }}
            >
              {destinations.map((dest, i) => (
                <motion.div
                  key={i}
                  className="min-w-[80vw] sm:min-w-[calc(50%-10px)] lg:min-w-[calc(25%-15px)] flex-shrink-0 group cursor-pointer"
                  onClick={() => onNavigate('flights')}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="relative rounded-2xl overflow-hidden h-72">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                      style={{ backgroundImage: `url(${dest.image})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className="tag">{dest.tag}</span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-xs text-slate-300 mb-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {dest.country}
                          </p>
                          <h3 className="text-xl font-bold font-display text-white">{dest.city}</h3>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-slate-400 uppercase">from</p>
                          <p className="text-lg font-bold text-brand-300">{dest.price}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ======== TESTIMONIALS ======== */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-primary)' }}>
              Testimonials
            </p>
            <h2 className="text-3xl md:text-4xl font-bold font-display" style={{ color: 'var(--color-text)' }}>
              Loved by Millions
            </h2>
          </AnimatedSection>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                className="card p-7"
                style={{ background: 'var(--color-bg-soft)' }}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--color-text-2)' }}>
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: 'var(--color-primary)' }}
                  >
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{t.name}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-4)' }}>{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ======== CTA ======== */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="relative rounded-2xl overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: 'url(https://images.pexels.com/photos/62623/wing-plane-flying-airplane-62623.jpeg?auto=compress&cs=tinysrgb&w=1260)',
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-navy-950/95 via-navy-950/80 to-navy-950/60" />
              <div className="relative px-8 md:px-16 py-16">
                <div className="max-w-lg">
                  <h2 className="text-3xl md:text-4xl font-bold font-display text-white mb-4 leading-tight">
                    Ready for Your Next Adventure?
                  </h2>
                  <p className="text-slate-300 mb-8 leading-relaxed">
                    Explore our world-class fleet and discover the comfort of SkyWings premium service.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button size="lg" onClick={() => onNavigate('aircraft')} className="flex items-center gap-2">
                      <Plane className="w-5 h-5" />
                      Explore Fleet
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => onNavigate('about')}
                      className="flex items-center gap-2 !border-white/30 !text-white hover:!bg-white/10"
                    >
                      Learn More <ArrowRight className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}