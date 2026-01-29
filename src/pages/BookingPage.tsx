import { useState } from 'react';
import { User, CreditCard, Shield, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Flight, Passenger, SeatClass } from '../types';
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
  };
  onNavigate: (page: string, data?: any) => void;
}

export default function BookingPage({ bookingData, onNavigate }: BookingPageProps) {
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
      case 'business':
        return flight.business_price;
      case 'first_class':
        return flight.first_class_price;
      default:
        return flight.economy_price;
    }
  };

  const totalAmount = getPrice() * bookingData.passengers;

  const updatePassenger = (index: number, field: keyof Passenger, value: string) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);
  };

  const validateForm = () => {
    for (const passenger of passengers) {
      if (
        !passenger.first_name ||
        !passenger.last_name ||
        !passenger.date_of_birth ||
        !passenger.passport_number ||
        !passenger.nationality
      ) {
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
        seat_number: `${index + 1}A`,
      }));

      const { error: passengersError } = await supabase
        .from('passengers')
        .insert(passengersData);

      if (passengersError) throw passengersError;

      const seatField =
        seatClass === 'business'
          ? 'available_business_seats'
          : seatClass === 'first_class'
          ? 'available_first_class_seats'
          : 'available_economy_seats';

      const currentSeats = flight[seatField as keyof Flight] as number;
      await supabase
        .from('flights')
        .update({ [seatField]: currentSeats - bookingData.passengers })
        .eq('id', flight.id);

      onNavigate('confirmation', { booking, flight });
    } catch (err: any) {
      setError(err.message || 'An error occurred while booking');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Complete Your Booking</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Passenger Details</h2>
                </div>

                <div className="space-y-8">
                  {passengers.map((passenger, index) => (
                    <div key={index} className="border-b border-gray-200 pb-8 last:border-b-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Passenger {index + 1}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="First Name"
                          value={passenger.first_name}
                          onChange={(e) => updatePassenger(index, 'first_name', e.target.value)}
                          placeholder="John"
                          required
                        />
                        <Input
                          label="Last Name"
                          value={passenger.last_name}
                          onChange={(e) => updatePassenger(index, 'last_name', e.target.value)}
                          placeholder="Doe"
                          required
                        />
                        <Input
                          type="date"
                          label="Date of Birth"
                          value={passenger.date_of_birth}
                          onChange={(e) => updatePassenger(index, 'date_of_birth', e.target.value)}
                          required
                        />
                        <Input
                          label="Passport Number"
                          value={passenger.passport_number}
                          onChange={(e) => updatePassenger(index, 'passport_number', e.target.value)}
                          placeholder="AB1234567"
                          required
                        />
                        <div className="md:col-span-2">
                          <Input
                            label="Nationality"
                            value={passenger.nationality}
                            onChange={(e) => updatePassenger(index, 'nationality', e.target.value)}
                            placeholder="United States"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">Secure Booking</h3>
                    <p className="text-sm text-blue-800">
                      Your personal information is encrypted and secure. We never share your data with third parties.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Booking Summary</h2>

                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-600">Flight</p>
                    <p className="font-semibold text-gray-900">{flight.flight_number}</p>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm text-gray-600 mb-2">Route</p>
                    <p className="font-semibold text-gray-900">
                      {flight.origin_airport?.city} ({flight.origin_airport?.code})
                    </p>
                    <p className="font-semibold text-gray-900">
                      {flight.destination_airport?.city} ({flight.destination_airport?.code})
                    </p>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm text-gray-600">Departure</p>
                    <p className="font-semibold text-gray-900">{formatDate(flight.departure_time)}</p>
                    <p className="text-gray-700">{formatTime(flight.departure_time)}</p>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm text-gray-600">Class</p>
                    <p className="font-semibold text-gray-900 capitalize">
                      {seatClass.replace('_', ' ')}
                    </p>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm text-gray-600">Passengers</p>
                    <p className="font-semibold text-gray-900">{bookingData.passengers}</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Price per passenger</span>
                    <span className="font-semibold">${getPrice().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span className="text-blue-600">${totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleBooking}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : user ? 'Confirm Booking' : 'Sign In to Book'}
                </Button>

                {!user && (
                  <p className="mt-4 text-sm text-gray-600 text-center">
                    You need to sign in to complete your booking
                  </p>
                )}
              </div>
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
