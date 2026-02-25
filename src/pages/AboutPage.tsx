import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Plane, Shield, Globe, Heart, Award, Users, Clock, MapPin, ArrowRight } from 'lucide-react';
import { AnimatedSection, StaggerContainer, staggerItem } from '../components/AnimatedPage';
import Button from '../components/Button';

function AnimatedCounter({ end, suffix = '' }: { end: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0;
        const step = end / 60;
        const timer = setInterval(() => {
          start += step;
          if (start >= end) { setVal(end); clearInterval(timer); }
          else setVal(Math.floor(start));
        }, 16);
        obs.disconnect();
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

const values = [
  { icon: Shield, title: 'Safety First', desc: 'Industry-leading safety protocols and certifications ensure every journey is secure.' },
  { icon: Globe, title: 'Global Reach', desc: 'Connecting 200+ destinations across 6 continents with seamless travel experiences.' },
  { icon: Heart, title: 'Customer Care', desc: '24/7 dedicated support with a commitment to passenger satisfaction.' },
  { icon: Award, title: 'Excellence', desc: 'Award-winning service recognized by industry experts and travelers alike.' },
];

const stats = [
  { label: 'Passengers', value: 50, suffix: 'M+', icon: Users },
  { label: 'Destinations', value: 200, suffix: '+', icon: MapPin },
  { label: 'Years', value: 15, suffix: '+', icon: Clock },
  { label: 'Aircraft', value: 120, suffix: '+', icon: Plane },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Hero */}
      <div className="relative py-20 overflow-hidden" style={{ background: 'var(--color-bg-soft)' }}>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative">
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6"
              style={{ background: 'rgba(99, 102, 241, 0.08)', color: 'var(--color-primary)' }}>
              <Plane className="w-4 h-4" /> About SkyWings
            </div>
            <h1 className="text-4xl md:text-6xl font-bold font-display mb-6" style={{ color: 'var(--color-text)' }}>
              Elevating the Art of <span className="text-gradient">Air Travel</span>
            </h1>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-text-3)' }}>
              Since 2009, SkyWings has been redefining the travel experience with cutting-edge
              technology, sustainable practices, and an unwavering commitment to our passengers.
            </p>
          </AnimatedSection>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="card p-5 text-center"
              style={{ background: 'var(--color-bg-soft)' }}
            >
              <s.icon className="w-5 h-5 mx-auto mb-2" style={{ color: 'var(--color-primary)' }} />
              <p className="text-2xl font-bold font-display" style={{ color: 'var(--color-text)' }}>
                <AnimatedCounter end={s.value} suffix={s.suffix} />
              </p>
              <p className="text-xs" style={{ color: 'var(--color-text-4)' }}>{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Story */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <AnimatedSection>
            <p className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-primary)' }}>Our Story</p>
            <h2 className="text-3xl font-bold font-display mb-4" style={{ color: 'var(--color-text)' }}>
              From Dream to Destination
            </h2>
            <div className="space-y-4 text-sm leading-relaxed" style={{ color: 'var(--color-text-3)' }}>
              <p>
                What started as a small regional airline has grown into one of the most trusted names
                in international aviation. Our founders believed that air travel should be accessible,
                comfortable, and inspirational.
              </p>
              <p>
                Today, we operate over 120 aircraft across 200+ destinations, carrying millions of
                passengers each year. But our core mission remains the same: to connect people with
                the world in ways that inspire wonder.
              </p>
              <p>
                We continue to invest in sustainable aviation fuel, modern aircraft, and digital 
                innovation to ensure every journey leaves the lightest possible footprint.
              </p>
            </div>
          </AnimatedSection>
          <AnimatedSection>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-soft">
                <img
                  src="https://images.unsplash.com/photo-1436491865332-7a61a109db05?w=600&q=80"
                  alt="SkyWings Aircraft"
                  className="w-full h-72 object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 rounded-xl overflow-hidden shadow-medium border-4" style={{ borderColor: 'var(--color-bg)' }}>
                <img
                  src="https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=200&q=80"
                  alt="Cabin interior"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Values */}
      <section className="py-16" style={{ background: 'var(--color-bg-soft)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <AnimatedSection className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-primary)' }}>Our Values</p>
            <h2 className="text-3xl font-bold font-display" style={{ color: 'var(--color-text)' }}>What Drives Us Forward</h2>
          </AnimatedSection>

          <StaggerContainer className="grid sm:grid-cols-2 gap-6">
            {values.map((v) => (
              <motion.div key={v.title} variants={staggerItem} className="card p-6 flex gap-4"
                style={{ background: 'var(--color-bg)' }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(99, 102, 241, 0.08)' }}>
                  <v.icon className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                </div>
                <div>
                  <h3 className="font-semibold font-display mb-1" style={{ color: 'var(--color-text)' }}>{v.title}</h3>
                  <p className="text-sm" style={{ color: 'var(--color-text-3)' }}>{v.desc}</p>
                </div>
              </motion.div>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <AnimatedSection>
            <h2 className="text-3xl font-bold font-display mb-4" style={{ color: 'var(--color-text)' }}>
              Ready to Fly?
            </h2>
            <p className="mb-8" style={{ color: 'var(--color-text-3)' }}>
              Discover our latest routes and book your next adventure today.
            </p>
            <Button size="lg" className="inline-flex items-center gap-2">
              Explore Flights <ArrowRight className="w-4 h-4" />
            </Button>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}