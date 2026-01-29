import { useState } from 'react';
import { CreditCard, Lock, AlertCircle } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';

interface PaymentPageProps {
  bookingData: {
    booking_reference: string;
    total_amount: number;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PaymentPage({ bookingData, onSuccess, onCancel }: PaymentPageProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
  };

  const validateForm = () => {
    if (!cardNumber || cardNumber.replace(/\s/g, '').length !== 16) {
      setError('Invalid card number');
      return false;
    }
    if (!cardName) {
      setError('Cardholder name is required');
      return false;
    }
    if (!expiry || expiry.length !== 5) {
      setError('Invalid expiry date');
      return false;
    }
    if (!cvc || cvc.length !== 3) {
      setError('Invalid CVC');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const [month, year] = expiry.split('/');
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;

      if (parseInt(year) < currentYear % 100 || (parseInt(year) === currentYear % 100 && parseInt(month) < currentMonth)) {
        setError('Card has expired');
        setLoading(false);
        return;
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Payment failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <CreditCard className="w-6 h-6" />
              <h1 className="text-2xl font-bold">Secure Payment</h1>
            </div>
            <p className="text-blue-100">Booking Reference: {bookingData.booking_reference}</p>
          </div>

          <div className="p-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 flex items-start gap-3">
              <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900 mb-1">Test Mode</p>
                <p className="text-sm text-blue-800">
                  This is a demo payment. Use test card: 4242 4242 4242 4242
                </p>
              </div>
            </div>

            <div className="mb-8 p-6 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Total Amount:</span>
                <span className="text-3xl font-bold text-blue-600">
                  ${bookingData.total_amount.toFixed(2)}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Cardholder Name"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="John Doe"
              />

              <Input
                label="Card Number"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                placeholder="4242 4242 4242 4242"
                maxLength={19}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Expiry Date"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  placeholder="MM/YY"
                  maxLength={5}
                />
                <Input
                  label="CVC"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
                  placeholder="123"
                  type="password"
                  maxLength={3}
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={onCancel}
                  className="w-full"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  <Lock className="w-5 h-5" />
                  {loading ? 'Processing...' : `Pay $${bookingData.total_amount.toFixed(2)}`}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
