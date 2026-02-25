import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, Users, Info, Check, ArrowRight, Crown } from 'lucide-react';
import { Flight, SeatClass } from '../types';
import StepIndicator from '../components/StepIndicator';
import Button from '../components/Button';

interface SeatSelectionPageProps {
  bookingData: {
    flight: Flight;
    seatClass: SeatClass;
    passengers: number;
  };
  onNavigate: (page: string, data?: any) => void;
}

function generateSeatMap(seatClass: SeatClass) {
  const config = {
    economy: { rows: 20, cols: 'ABCDEF', startRow: 10, occupied: [15, 22, 35, 8, 41, 50, 12, 27, 33, 44, 19, 30, 48] },
    business: { rows: 8, cols: 'ABCD', startRow: 1, occupied: [3, 7, 10, 18, 25] },
    first_class: { rows: 4, cols: 'AB', startRow: 1, occupied: [2, 5] },
  };

  const c = config[seatClass];
  const seats: { id: string; row: number; col: string; status: 'available' | 'occupied' | 'premium' }[] = [];

  for (let r = 0; r < c.rows; r++) {
    for (let ci = 0; ci < c.cols.length; ci++) {
      const row = r + c.startRow;
      const col = c.cols[ci];
      const seatNum = r * c.cols.length + ci;
      const isOccupied = c.occupied.includes(seatNum);
      const isPremium = seatClass === 'economy' && r < 3;
      seats.push({
        id: `${row}${col}`,
        row,
        col,
        status: isOccupied ? 'occupied' : isPremium ? 'premium' : 'available',
      });
    }
  }

  return { seats, cols: c.cols, rows: c.rows, startRow: c.startRow };
}

const steps = [
  { label: 'Flight', icon: Plane },
  { label: 'Seats', icon: Users },
  { label: 'Details', icon: Info },
  { label: 'Payment', icon: Check },
];

export default function SeatSelectionPage({ bookingData, onNavigate }: SeatSelectionPageProps) {
  const { flight, seatClass, passengers } = bookingData;
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const seatMap = generateSeatMap(seatClass);

  const toggleSeat = (seatId: string, status: string) => {
    if (status === 'occupied') return;
    setSelectedSeats(prev => {
      if (prev.includes(seatId)) return prev.filter(s => s !== seatId);
      if (prev.length >= passengers) return [...prev.slice(1), seatId];
      return [...prev, seatId];
    });
  };

  const getSeatColor = (seatId: string, status: string) => {
    if (selectedSeats.includes(seatId)) return 'seat-selected';
    if (status === 'occupied') return 'seat-occupied';
    if (status === 'premium') return 'seat-premium';
    return 'seat-available';
  };

  const colsArr = seatMap.cols.split('');
  const hasAisle = colsArr.length > 2;
  const aisleAfter = Math.floor(colsArr.length / 2);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <StepIndicator steps={steps} currentStep={1} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid lg:grid-cols-3 gap-8"
        >
          {/* Seat Map */}
          <div className="lg:col-span-2">
            <div className="card p-8 overflow-hidden" style={{ background: 'var(--color-bg-soft)' }}>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold font-display mb-2" style={{ color: 'var(--color-text)' }}>
                  Select Your Seats
                </h2>
                <p className="text-sm" style={{ color: 'var(--color-text-3)' }}>
                  Choose {passengers} seat{passengers > 1 ? 's' : ''} for your {seatClass.replace('_', ' ')} class journey
                </p>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 mb-8 text-sm">
                {[
                  { label: 'Available', cls: 'seat-available' },
                  { label: 'Selected', cls: 'seat-selected' },
                  { label: 'Occupied', cls: 'seat-occupied' },
                  ...(seatClass === 'economy' ? [{ label: 'Premium', cls: 'seat-premium' }] : []),
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className={`seat ${item.cls} w-6 h-6 rounded-md`} />
                    <span style={{ color: 'var(--color-text-4)' }}>{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Airplane fuselage */}
              <div className="relative max-w-md mx-auto">
                {/* Nose */}
                <div className="flex justify-center mb-4">
                  <div
                    className="w-32 h-14 rounded-t-full flex items-center justify-center"
                    style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-2)', borderBottom: 'none' }}
                  >
                    <Plane className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                  </div>
                </div>

                {/* Column headers */}
                <div className="flex items-center justify-center gap-1.5 mb-3">
                  {colsArr.map((col, ci) => (
                    <div key={col} className="flex items-center">
                      <div className="w-9 h-6 flex items-center justify-center text-xs font-bold" style={{ color: 'var(--color-text-4)' }}>
                        {col}
                      </div>
                      {hasAisle && ci === aisleAfter - 1 && <div className="w-8" />}
                    </div>
                  ))}
                </div>

                {/* Seat rows */}
                <div
                  className="space-y-1.5 px-4 py-4 rounded-b-3xl"
                  style={{ borderLeft: '1px solid var(--color-border-2)', borderRight: '1px solid var(--color-border-2)', borderBottom: '1px solid var(--color-border-2)' }}
                >
                  {Array.from({ length: seatMap.rows }).map((_, rowIdx) => {
                    const rowNum = rowIdx + seatMap.startRow;
                    const rowSeats = seatMap.seats.filter(s => s.row === rowNum);
                    return (
                      <div key={rowIdx} className="flex items-center justify-center gap-1.5">
                        {rowSeats.map((seat, ci) => (
                          <div key={seat.id} className="flex items-center">
                            <motion.button
                              whileHover={seat.status !== 'occupied' ? { scale: 1.1 } : {}}
                              whileTap={seat.status !== 'occupied' ? { scale: 0.92 } : {}}
                              onClick={() => toggleSeat(seat.id, seat.status)}
                              className={`seat ${getSeatColor(seat.id, seat.status)} w-9 h-9 rounded-lg text-xs font-bold flex items-center justify-center ${
                                seat.status === 'occupied' ? 'cursor-not-allowed' : 'cursor-pointer'
                              }`}
                              title={`Seat ${seat.id}`}
                            >
                              {selectedSeats.includes(seat.id) ? (
                                <Check className="w-4 h-4" />
                              ) : seat.status === 'premium' ? (
                                <Crown className="w-3.5 h-3.5" />
                              ) : seat.status !== 'occupied' ? (
                                seat.id
                              ) : null}
                            </motion.button>
                            {hasAisle && ci === aisleAfter - 1 && (
                              <div className="w-8 flex items-center justify-center text-xs font-semibold" style={{ color: 'var(--color-text-4)' }}>
                                {rowNum}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>

                {/* Tail */}
                <div className="flex justify-center mt-1">
                  <div
                    className="w-20 h-5 rounded-b-full"
                    style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-2)', borderTop: 'none' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Selection Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24" style={{ background: 'var(--color-bg-soft)' }}>
              <h3 className="text-lg font-bold font-display mb-6" style={{ color: 'var(--color-text)' }}>
                Selection Summary
              </h3>

              <div className="mb-6 pb-6" style={{ borderBottom: '1px solid var(--color-border)' }}>
                <div className="flex items-center gap-3 mb-2">
                  <Plane className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                  <span className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{flight.flight_number}</span>
                </div>
                <div className="flex items-center justify-between text-sm" style={{ color: 'var(--color-text-3)' }}>
                  <span>{flight.origin_airport?.code}</span>
                  <ArrowRight className="w-4 h-4" style={{ color: 'var(--color-text-4)' }} />
                  <span>{flight.destination_airport?.code}</span>
                </div>
              </div>

              {/* Selected seats */}
              <div className="mb-6">
                <p className="text-sm font-medium mb-3" style={{ color: 'var(--color-text-3)' }}>
                  Selected Seats ({selectedSeats.length}/{passengers})
                </p>
                <div className="space-y-2 min-h-[60px]">
                  <AnimatePresence>
                    {selectedSeats.map((seat, i) => (
                      <motion.div
                        key={seat}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex items-center justify-between px-3 py-2 rounded-lg"
                        style={{ background: 'var(--color-surface)' }}
                      >
                        <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Passenger {i + 1}</span>
                        <span className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>Seat {seat}</span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {selectedSeats.length === 0 && (
                    <p className="text-sm text-center py-4" style={{ color: 'var(--color-text-4)' }}>
                      Tap seats on the map to select
                    </p>
                  )}
                </div>
              </div>

              {/* Progress */}
              <div className="mb-6">
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-surface)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'var(--color-primary)' }}
                    animate={{ width: `${(selectedSeats.length / passengers) * 100}%` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                </div>
                <p className="text-xs mt-2 text-right" style={{ color: 'var(--color-text-4)' }}>
                  {selectedSeats.length} of {passengers} selected
                </p>
              </div>

              <Button
                size="lg"
                className="w-full flex items-center justify-center gap-2"
                disabled={selectedSeats.length !== passengers}
                onClick={() => onNavigate('booking', { ...bookingData, selectedSeats })}
              >
                Continue to Details
                <ArrowRight className="w-4 h-4" />
              </Button>

              {selectedSeats.length !== passengers && (
                <p className="text-xs text-center mt-3" style={{ color: 'var(--color-text-4)' }}>
                  Select {passengers - selectedSeats.length} more seat{passengers - selectedSeats.length !== 1 ? 's' : ''} to continue
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}