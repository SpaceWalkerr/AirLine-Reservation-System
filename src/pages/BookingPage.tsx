import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, AlertCircle, Plane, ArrowRight, Lock, Users, Info, Check, Utensils, Accessibility } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Flight, Passenger, SeatClass } from '../types';
import StepIndicator from '../components/StepIndicator';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Modal from '../components/Modal';
import AuthModal from '../components/AuthModal';

interface BookingPageProps {
  bookingData: {
    flight: Flight;
    seatClass: SeatClass;
    passengers: number;
    selectedSeats?: string[];
  };
  onNavigate: (page: string, data?: any) => void;
}

const steps = [
  { label: 'Flight', icon: Plane },
  { label: 'Seats', icon: Users },
  { label: 'Details', icon: Info },
  { label: 'Payment', icon: Check },
];

export default function BookingPage({ bookingData, onNavigate }: BookingPageProps) {
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mealPreference, setMealPreference] = useState('standard');
  const [specialAssistance, setSpecialAssistance] = useState<string[]>([]);
  const [passengers, setPassengers] = useState<Passenger[]>(
    Array.from({ length: bookingData.passengers }, () => ({
      first_name: '',
      last_name: '',
      date_of_birth: '',
      passport_number: '',
      nationality: '',
      seat_class: bookingData.seatClass,
    }))
  );

  const { flight, seatClass } = bookingData;

  const getPrice = () => {
    switch (seatClass) {
      case 'business': return flight.business_price;
      case 'first_class': return flight.first_class_price;
      default: return flight.economy_price;
    }
  };

  const totalAmount = getPrice() * bookingData.passengers;

  const updatePassenger = (index: number, field: keyof Passenger, value: string) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);
  };

  const validateForm = () => {
    for (const p of passengers) {
      if (!p.first_name || !p.last_name || !p.date_of_birth || !p.passport_number || !p.nationality) {
        setError('Please fill in all passenger details');
        return false;
      }
    }
    return true;
  };

  const handleBooking = async () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const bookingReference = `SW${Date.now().toString(36).toUpperCase()}`;

      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          flight_id: flight.id,
          booking_reference: bookingReference,
          total_passengers: bookingData.passengers,
          total_amount: totalAmount,
          booking_status: 'confirmed',
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      const passengersData = passengers.map((p, index) => ({
        ...p,
        booking_id: booking.id,
        seat_number: bookingData.selectedSeats?.[index] || `${index + 1}A`,
      }));

      const { error: passengersError } = await supabase.from('passengers').insert(passengersData);
      if (passengersError) throw passengersError;

      const seatField =
        seatClass === 'business'
          ? 'available_business_seats'
          : seatClass === 'first_class'
          ? 'available_first_class_seats'
          : 'available_economy_seats';

      const currentSeats = flight[seatField as keyof Flight] as number;
      await supabase.from('flights').update({ [seatField]: currentSeats - bookingData.passengers }).eq('id', flight.id);

      onNavigate('payment', { booking_reference: bookingReference, total_amount: totalAmount, booking, flight });
    } catch (err: any) {
      setError(err.message || 'An error occurred while booking');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (d: string) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <>
      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <StepIndicator steps={steps} currentStep={2} />
          </div>

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold font-display mb-1" style={{ color: 'var(--color-text)' }}>
              Complete Your Booking
            </h1>
            <p className="text-sm" style={{ color: 'var(--color-text-3)' }}>
              You're just a few steps away from your next adventure
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Passenger Forms */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card p-6 md:p-8"
                style={{ background: 'var(--color-bg-soft)' }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-surface)', color: 'var(--color-primary)' }}>
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold font-display" style={{ color: 'var(--color-text)' }}>Passenger Details</h2>
                    <p className="text-xs" style={{ color: 'var(--color-text-4)' }}>As they appear on passport</p>
                  </div>
                </div>

                <div className="space-y-7">
                  {passengers.map((passenger, index) => (
                    <div key={index} className="pb-7 last:pb-0" style={{ borderBottom: index < passengers.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                      <div className="flex items-center gap-2 mb-4">
                        <span
                          className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white"
                          style={{ background: 'var(--color-primary)' }}
                        >
                          {index + 1}
                        </span>
                        <h3 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>
                          Passenger {index + 1}
                          {bookingData.selectedSeats?.[index] && (
                            <span className="ml-2 text-sm font-normal" style={{ color: 'var(--color-primary)' }}>
                              • Seat {bookingData.selectedSeats[index]}
                            </span>
                          )}
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="First Name" value={passenger.first_name} onChange={(e) => updatePassenger(index, 'first_name', e.target.value)} placeholder="John" required />
                        <Input label="Last Name" value={passenger.last_name} onChange={(e) => updatePassenger(index, 'last_name', e.target.value)} placeholder="Doe" required />
                        <Input type="date" label="Date of Birth" value={passenger.date_of_birth} onChange={(e) => updatePassenger(index, 'date_of_birth', e.target.value)} required />
                        <Input label="Passport Number" value={passenger.passport_number} onChange={(e) => updatePassenger(index, 'passport_number', e.target.value)} placeholder="AB1234567" required />
                        <div className="md:col-span-2">
                          <Input label="Nationality" value={passenger.nationality} onChange={(e) => updatePassenger(index, 'nationality', e.target.value)} placeholder="United States" required />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Special Requests */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="card p-6 md:p-8"
                style={{ background: 'var(--color-bg-soft)' }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-surface)', color: 'var(--color-primary)' }}>
                    <Utensils className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold font-display" style={{ color: 'var(--color-text)' }}>Special Requests</h2>
                    <p className="text-xs" style={{ color: 'var(--color-text-4)' }}>Optional preferences for your journey</p>
                  </div>
                </div>

                <div className="space-y-5">
                  {/* Meal Preference */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                      Meal Preference
                    </label>
                    <Select
                      value={mealPreference}
                      onChange={(e) => setMealPreference(e.target.value)}
                    >
                      <option value="standard">Standard Meal</option>
                      <option value="vegetarian">Vegetarian</option>
                      <option value="vegan">Vegan</option>
                      <option value="halal">Halal</option>
                      <option value="kosher">Kosher</option>
                      <option value="gluten-free">Gluten-Free</option>
                      <option value="diabetic">Diabetic-Friendly</option>
                      <option value="child">Child Meal</option>
                    </Select>
                  </div>

                  {/* Special Assistance */}
                  <div>
                    <label className="block text-sm font-medium mb-3" style={{ color: 'var(--color-text)' }}>
                      Special Assistance
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: 'wheelchair', label: 'Wheelchair Assistance', icon: Accessibility },
                        { value: 'extra-legroom', label: 'Extra Legroom Required' },
                        { value: 'oxygen', label: 'Oxygen Supply' },
                        { value: 'infant', label: 'Traveling with Infant' },
                        { value: 'pet', label: 'Pet in Cabin' },
                      ].map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all"
                          style={{
                            background: specialAssistance.includes(option.value) ? 'rgba(99, 102, 241, 0.06)' : 'transparent',
                            border: `1px solid ${specialAssistance.includes(option.value) ? 'rgba(99, 102, 241, 0.2)' : 'var(--color-border)'}`,
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={specialAssistance.includes(option.value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSpecialAssistance([...specialAssistance, option.value]);
                              } else {
                                setSpecialAssistance(specialAssistance.filter(v => v !== option.value));
                              }
                            }}
                            className="w-4 h-4 rounded"
                            style={{ accentColor: 'var(--color-primary)' }}
                          />
                          <span className="text-sm flex-1" style={{ color: 'var(--color-text)' }}>
                            {option.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Security notice */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3 p-4 rounded-xl"
                style={{ background: 'rgba(99, 102, 241, 0.06)', border: '1px solid rgba(99, 102, 241, 0.12)' }}
              >
                <Lock className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                <p className="text-sm" style={{ color: 'var(--color-text-3)' }}>
                  Your personal information is encrypted and secure. We never share your data with third parties.
                </p>
              </motion.div>
            </div>

            {/* Booking Summary Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="card p-6 sticky top-24"
                style={{ background: 'var(--color-bg-soft)' }}
              >
                <h2 className="text-lg font-bold font-display mb-5" style={{ color: 'var(--color-text)' }}>Booking Summary</h2>

                {/* Flight mini card */}
                <div className="p-4 rounded-xl mb-5" style={{ background: 'var(--color-surface)' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <Plane className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                    <span className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>{flight.flight_number}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>{flight.origin_airport?.code}</p>
                      <p className="text-xs" style={{ color: 'var(--color-text-4)' }}>{formatTime(flight.departure_time)}</p>
                    </div>
                    <div className="flex-1 mx-3 relative">
                      <div className="h-px" style={{ background: 'var(--color-border-2)' }} />
                      <Plane className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3" style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>{flight.destination_airport?.code}</p>
                      <p className="text-xs" style={{ color: 'var(--color-text-4)' }}>{formatTime(flight.arrival_time)}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-5">
                  {[
                    { label: 'Date', value: formatDate(flight.departure_time) },
                    { label: 'Class', value: seatClass.replace('_', ' ') },
                    { label: 'Passengers', value: String(bookingData.passengers) },
                    { label: 'Per person', value: `$${getPrice().toFixed(2)}` },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span style={{ color: 'var(--color-text-4)' }}>{item.label}</span>
                      <span className="font-medium capitalize" style={{ color: 'var(--color-text)' }}>{item.value}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 mb-5" style={{ borderTop: '1px solid var(--color-border)' }}>
                  <div className="flex justify-between items-baseline">
                    <span className="font-medium" style={{ color: 'var(--color-text-3)' }}>Total</span>
                    <span className="text-2xl font-extrabold font-display text-gradient">${totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-lg flex items-start gap-2" style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-500">{error}</p>
                  </div>
                )}

                <Button size="lg" className="w-full flex items-center justify-center gap-2" onClick={handleBooking} disabled={loading}>
                  {loading ? (
                    <><div className="spinner w-4 h-4" /> Processing...</>
                  ) : user ? (
                    <>Proceed to Payment <ArrowRight className="w-4 h-4" /></>
                  ) : (
                    'Sign In to Book'
                  )}
                </Button>

                {!user && (
                  <p className="mt-3 text-xs text-center" style={{ color: 'var(--color-text-4)' }}>
                    You need to sign in to complete your booking
                  </p>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)}>
        <AuthModal onClose={() => setAuthModalOpen(false)} />
      </Modal>
    </>
  );
}