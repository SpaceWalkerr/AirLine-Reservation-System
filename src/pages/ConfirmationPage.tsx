import { CheckCircle, Plane, Calendar, MapPin, Download, Mail } from 'lucide-react';
import { Flight, Booking } from '../types';
import Button from '../components/Button';

interface ConfirmationPageProps {
  confirmationData: {
    booking: Booking;
    flight: Flight;
  };
  onNavigate: (page: string) => void;
}

export default function ConfirmationPage({ confirmationData, onNavigate }: ConfirmationPageProps) {
  const { booking, flight } = confirmationData;

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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-xl text-gray-600">
            Your flight has been successfully booked
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-sm opacity-90 mb-1">Booking Reference</p>
                <p className="text-3xl font-bold tracking-wider">{booking.booking_reference}</p>
              </div>
              <Plane className="w-12 h-12 opacity-80" />
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Plane className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Flight Number</p>
                    <p className="font-semibold text-gray-900">{flight.flight_number}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Departure Date</p>
                    <p className="font-semibold text-gray-900">{formatDate(flight.departure_time)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Route</p>
                    <p className="font-semibold text-gray-900">
                      {flight.origin_airport?.code} → {flight.destination_airport?.code}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Flight Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Departure</span>
                    <span className="font-semibold">{formatTime(flight.departure_time)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Arrival</span>
                    <span className="font-semibold">{formatTime(flight.arrival_time)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Passengers</span>
                    <span className="font-semibold">{booking.total_passengers}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-gray-200">
                    <span className="text-gray-900 font-semibold">Total Amount</span>
                    <span className="text-blue-600 font-bold text-xl">
                      ${booking.total_amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <div className="flex items-start gap-3">
                <Mail className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Confirmation Email Sent</h3>
                  <p className="text-sm text-blue-800">
                    A confirmation email with your booking details and e-ticket has been sent to your registered email address.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                size="lg"
                className="w-full flex items-center justify-center gap-2"
                onClick={() => onNavigate('bookings')}
              >
                <Download className="w-5 h-5" />
                View My Bookings
              </Button>
              <Button
                size="lg"
                className="w-full"
                onClick={() => onNavigate('home')}
              >
                Book Another Flight
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Important Information</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Please arrive at the airport at least 2 hours before departure for international flights</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Carry a valid passport and visa documents for international travel</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Check-in online 24 hours before departure to save time</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Review baggage allowance and restrictions before packing</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
