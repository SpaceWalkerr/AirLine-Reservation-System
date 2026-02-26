import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plane, Download, ArrowLeft, Printer, QrCode } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

interface BoardingPassPageProps {
  onNavigate: (page: string) => void;
  bookingId?: string;
}

export default function BoardingPassPage({ onNavigate, bookingId }: BoardingPassPageProps) {
  const { user } = useAuth();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const passRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || !bookingId) {
      setLoading(false);
      return;
    }

    async function fetchBooking() {
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
        .eq('id', bookingId)
        .eq('user_id', user!.id)
        .single();

      if (data) setBooking(data);
      setLoading(false);
    }

    fetchBooking();
  }, [user, bookingId]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // In a real app, generate PDF here
    alert('In production, this would generate a PDF boarding pass. For now, use Print to save as PDF.');
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>Please sign in to view boarding pass</h2>
          <Button onClick={() => onNavigate('home')}>Go Home</Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>Booking not found</h2>
          <Button onClick={() => onNavigate('my-bookings')}>Back to My Bookings</Button>
        </div>
      </div>
    );
  }

  const flight = booking.flight;
  const departureDate = new Date(flight.departure_time);

  return (
    <div className="min-h-screen pt-24 pb-16" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-6 print:hidden">
        <button
          onClick={() => onNavigate('my-bookings')}
          className="flex items-center gap-2 text-sm font-medium mb-4 transition-colors"
          style={{ color: 'var(--color-text-3)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Bookings
        </button>

        <div className="flex flex-wrap gap-3 justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold font-display" style={{ color: 'var(--color-text)' }}>
              Boarding Pass
            </h1>
            <p className="text-sm" style={{ color: 'var(--color-text-3)' }}>
              Booking Reference: <span className="font-mono font-semibold">{booking.booking_reference}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
              style={{
                background: 'var(--color-bg-soft)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)'
              }}
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
              style={{
                background: 'var(--color-primary)',
                color: 'white'
              }}
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* Boarding Pass */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div
          ref={passRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '20px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
          }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }} />

          {/* Main Content */}
          <div className="relative p-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white font-display mb-1">SkyWings Airlines</h2>
                <p className="text-white/80 text-sm">Boarding Pass</p>
              </div>
              <div className="text-right">
                <p className="text-white/80 text-xs mb-1">Booking Reference</p>
                <p className="text-white font-mono font-bold text-lg">{booking.booking_reference}</p>
              </div>
            </div>

            {/* Flight Route */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div>
                <p className="text-white/70 text-xs mb-1">From</p>
                <p className="text-white text-4xl font-bold font-display">{flight.origin_airport?.code}</p>
                <p className="text-white/90 text-sm">{flight.origin_airport?.city}</p>
              </div>
              <div className="flex items-center justify-center">
                <Plane className="w-8 h-8 text-white/60" />
              </div>
              <div className="text-right">
                <p className="text-white/70 text-xs mb-1">To</p>
                <p className="text-white text-4xl font-bold font-display">{flight.destination_airport?.code}</p>
                <p className="text-white/90 text-sm">{flight.destination_airport?.city}</p>
              </div>
            </div>

            {/* Flight Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 p-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <div>
                <p className="text-white/70 text-xs mb-1">Date</p>
                <p className="text-white font-semibold">
                  {departureDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div>
                <p className="text-white/70 text-xs mb-1">Departure</p>
                <p className="text-white font-semibold">
                  {departureDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div>
                <p className="text-white/70 text-xs mb-1">Flight</p>
                <p className="text-white font-semibold">{flight.flight_number}</p>
              </div>
              <div>
                <p className="text-white/70 text-xs mb-1">Gate</p>
                <p className="text-white font-semibold">A{Math.floor(Math.random() * 30 + 1)}</p>
              </div>
            </div>

            {/* Passenger Info */}
            {booking.passengers?.map((pass: any, idx: number) => (
              <div key={idx} className="mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <div>
                    <p className="text-white/70 text-xs mb-1">Passenger {idx + 1}</p>
                    <p className="text-white font-semibold">{pass.first_name} {pass.last_name}</p>
                  </div>
                  <div>
                    <p className="text-white/70 text-xs mb-1">Seat</p>
                    <p className="text-white font-semibold">{pass.seat_number || 'Not assigned'}</p>
                  </div>
                  <div>
                    <p className="text-white/70 text-xs mb-1">Class</p>
                    <p className="text-white font-semibold capitalize">{pass.seat_class?.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-white/70 text-xs mb-1">Boarding</p>
                    <p className="text-white font-semibold">
                      {new Date(departureDate.getTime() - 30 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* QR Code & Barcode */}
            <div className="flex items-center justify-center gap-8 pt-4">
              <div className="text-center">
                <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center mb-2">
                  <QrCode className="w-20 h-20" style={{ color: '#667eea' }} />
                </div>
                <p className="text-white/70 text-xs">Scan at gate</p>
              </div>
              <div className="hidden md:block text-center">
                <div className="h-24 w-64 bg-white rounded-lg flex items-center justify-center px-4">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 40 }).map((_, i) => (
                      <div key={i} className="w-1 bg-black" style={{ height: `${Math.random() * 60 + 40}%` }} />
                    ))}
                  </div>
                </div>
                <p className="text-white/70 text-xs mt-2">{booking.booking_reference}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-white/20 text-center">
              <p className="text-white/70 text-xs">
                Please arrive at the gate at least 30 minutes before departure • ID required • Boarding closes 15 minutes before departure
              </p>
            </div>
          </div>
        </motion.div>

        {/* Important Information */}
        <div className="mt-8 p-6 rounded-xl print:hidden" style={{ background: 'var(--color-bg-soft)' }}>
          <h3 className="font-semibold mb-3" style={{ color: 'var(--color-text)' }}>Important Information</h3>
          <ul className="space-y-2 text-sm" style={{ color: 'var(--color-text-3)' }}>
            <li>• Please arrive at the airport at least 2 hours before your scheduled departure time</li>
            <li>• Valid government-issued ID is required for boarding</li>
            <li>• Ensure your baggage complies with airline regulations</li>
            <li>• Check-in counters close 60 minutes before departure</li>
            <li>• Gate closes 15 minutes before departure</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
