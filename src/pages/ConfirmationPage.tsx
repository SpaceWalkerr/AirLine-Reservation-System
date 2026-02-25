import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Plane, Download, Home, Calendar, Copy, Check, MapPin, Clock, ArrowRight, Ticket } from 'lucide-react';
import Button from '../components/Button';

interface ConfirmationPageProps {
  confirmationData: {
    booking_reference: string;
    flight?: any;
    passengers?: any[];
    total_amount?: number;
    seat_class?: string;
  };
  onNavigate: (page: string) => void;
}

function ConfettiPiece({ delay, left }: { delay: number; left: number }) {
  const colors = ['#6366f1', '#f59e0b', '#0ea5e9', '#10b981', '#f43f5e', '#8b5cf6'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  return (
    <motion.div
      initial={{ y: -20, x: left, opacity: 1, rotate: 0 }}
      animate={{ y: '100vh', opacity: 0, rotate: 720 + Math.random() * 360 }}
      transition={{ duration: 3 + Math.random() * 2, delay, ease: 'linear' }}
      className="fixed top-0 z-50 pointer-events-none"
      style={{ left: `${left}%`, width: 8, height: 8, borderRadius: Math.random() > 0.5 ? '50%' : '2px', background: color }}
    />
  );
}

export default function ConfirmationPage({ confirmationData, onNavigate }: ConfirmationPageProps) {
  const [showConfetti, setShowConfetti] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(t);
  }, []);

  const copyRef = () => {
    navigator.clipboard.writeText(confirmationData.booking_reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const flight = confirmationData.flight;

  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
      <AnimatePresence>
        {showConfetti &&
          Array.from({ length: 40 }).map((_, i) => (
            <ConfettiPiece key={i} delay={i * 0.05} left={Math.random() * 100} />
          ))}
      </AnimatePresence>

      <div className="max-w-lg w-full mx-auto px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="card p-8 text-center"
          style={{ background: 'var(--color-bg-soft)' }}
        >
          {/* Success icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2, stiffness: 200, damping: 15 }}
            className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{ background: 'rgba(16, 185, 129, 0.1)', border: '2px solid rgba(16, 185, 129, 0.3)' }}
          >
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h1 className="text-2xl font-bold font-display mb-2" style={{ color: 'var(--color-text)' }}>
              Booking Confirmed!
            </h1>
            <p className="text-sm mb-8" style={{ color: 'var(--color-text-3)' }}>
              Your flight has been booked successfully. A confirmation email will be sent shortly.
            </p>
          </motion.div>

          {/* Booking Reference */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl p-4 mb-6 cursor-pointer group"
            onClick={copyRef}
            style={{ background: 'rgba(99, 102, 241, 0.06)', border: '1px solid rgba(99, 102, 241, 0.1)' }}
          >
            <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-4)' }}>Booking Reference</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-mono font-bold tracking-[0.2em]" style={{ color: 'var(--color-primary)' }}>
                {confirmationData.booking_reference}
              </span>
              <motion.div whileTap={{ scale: 0.8 }}>
                {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5 opacity-40 group-hover:opacity-70 transition-opacity" style={{ color: 'var(--color-text)' }} />}
              </motion.div>
            </div>
          </motion.div>

          {/* Flight details */}
          {flight && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-xl p-5 mb-6 text-left"
              style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Plane className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{flight.flight_number}</span>
                {confirmationData.seat_class && (
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full capitalize" style={{ background: 'rgba(99, 102, 241, 0.08)', color: 'var(--color-primary)' }}>
                    {confirmationData.seat_class.replace('_', ' ')}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="text-center flex-1">
                  <p className="text-lg font-bold font-display" style={{ color: 'var(--color-text)' }}>
                    {flight.origin_airport?.code || '---'}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-text-4)' }}>
                    {flight.origin_airport?.city || 'Origin'}
                  </p>
                </div>
                <div className="flex items-center gap-1" style={{ color: 'var(--color-text-4)' }}>
                  <div className="w-8 h-px" style={{ background: 'var(--color-border)' }} />
                  <ArrowRight className="w-4 h-4" />
                  <div className="w-8 h-px" style={{ background: 'var(--color-border)' }} />
                </div>
                <div className="text-center flex-1">
                  <p className="text-lg font-bold font-display" style={{ color: 'var(--color-text)' }}>
                    {flight.destination_airport?.code || '---'}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-text-4)' }}>
                    {flight.destination_airport?.city || 'Destination'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                <div className="text-center">
                  <Calendar className="w-3.5 h-3.5 mx-auto mb-1" style={{ color: 'var(--color-text-4)' }} />
                  <p className="text-xs" style={{ color: 'var(--color-text-3)' }}>
                    {flight.departure_time ? new Date(flight.departure_time).toLocaleDateString() : '---'}
                  </p>
                </div>
                <div className="text-center">
                  <Clock className="w-3.5 h-3.5 mx-auto mb-1" style={{ color: 'var(--color-text-4)' }} />
                  <p className="text-xs" style={{ color: 'var(--color-text-3)' }}>
                    {flight.departure_time ? new Date(flight.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---'}
                  </p>
                </div>
                <div className="text-center">
                  <MapPin className="w-3.5 h-3.5 mx-auto mb-1" style={{ color: 'var(--color-text-4)' }} />
                  <p className="text-xs" style={{ color: 'var(--color-text-3)' }}>
                    {confirmationData.passengers?.length || 1} pax
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Total */}
          {confirmationData.total_amount && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="flex items-center justify-between p-3 rounded-lg mb-8"
              style={{ background: 'var(--color-bg)' }}
            >
              <span className="text-sm" style={{ color: 'var(--color-text-3)' }}>Total Paid</span>
              <span className="text-lg font-bold font-display" style={{ color: 'var(--color-text)' }}>${confirmationData.total_amount.toFixed(2)}</span>
            </motion.div>
          )}

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex gap-3"
          >
            <Button variant="secondary" size="lg" className="w-full flex items-center justify-center gap-2" onClick={() => onNavigate('bookings')}>
              <Ticket className="w-4 h-4" /> My Bookings
            </Button>
            <Button size="lg" className="w-full flex items-center justify-center gap-2" onClick={() => onNavigate('home')}>
              <Home className="w-4 h-4" /> Go Home
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}