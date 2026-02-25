import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Lock, AlertCircle, Shield, CheckCircle, Plane, Users, Info, Check, Wifi } from 'lucide-react';
import StepIndicator from '../components/StepIndicator';
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

const steps = [
  { label: 'Flight', icon: Plane },
  { label: 'Seats', icon: Users },
  { label: 'Details', icon: Info },
  { label: 'Payment', icon: Check },
];

export default function PaymentPage({ bookingData, onSuccess, onCancel }: PaymentPageProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const parts = [];
    for (let i = 0; i < Math.min(v.length, 16); i += 4) {
      parts.push(v.substring(i, i + 4));
    }
    return parts.join(' ');
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) return v.slice(0, 2) + '/' + v.slice(2, 4);
    return v;
  };

  const validateForm = () => {
    if (!cardNumber || cardNumber.replace(/\s/g, '').length !== 16) {
      setError('Invalid card number');
      return false;
    }
    if (!cardName) { setError('Cardholder name is required'); return false; }
    if (!expiry || expiry.length !== 5) { setError('Invalid expiry date'); return false; }
    if (!cvc || cvc.length !== 3) { setError('Invalid CVC'); return false; }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
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

  const displayNumber = cardNumber || '•••• •••• •••• ••••';
  const displayName = cardName || 'CARDHOLDER NAME';
  const displayExpiry = expiry || 'MM/YY';

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <StepIndicator steps={steps} currentStep={3} />
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Credit Card Preview */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:sticky lg:top-24"
          >
            <div className="text-center mb-8">
              <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-4)' }}>Total Amount</p>
              <p className="text-4xl font-extrabold font-display text-gradient">${bookingData.total_amount.toFixed(2)}</p>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-4)' }}>
                Ref: <span className="font-mono" style={{ color: 'var(--color-primary)' }}>{bookingData.booking_reference}</span>
              </p>
            </div>

            {/* 3D Card */}
            <div className="credit-card mx-auto" style={{ perspective: '1000px' }}>
              <motion.div
                className="credit-card-inner"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: 'spring', stiffness: 200, damping: 25 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Front */}
                <div className="credit-card-front rounded-2xl p-6 overflow-hidden" style={{ backfaceVisibility: 'hidden' }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700" />
                  <div className="relative z-10 h-full flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-7 rounded bg-amber-400/80" />
                        <Wifi className="w-5 h-5 text-white/50 rotate-90" />
                      </div>
                      <span className="text-white/70 font-display font-bold text-sm">SkyWings</span>
                    </div>
                    <div>
                      <p className="text-xl md:text-2xl font-mono text-white tracking-[0.15em] mb-4">
                        {displayNumber}
                      </p>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[10px] text-white/40 uppercase mb-0.5">Card Holder</p>
                          <p className="text-sm text-white font-medium uppercase tracking-wider">{displayName}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-white/40 uppercase mb-0.5">Expires</p>
                          <p className="text-sm text-white font-mono">{displayExpiry}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Back */}
                <div className="credit-card-back rounded-2xl overflow-hidden" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
                  <div className="relative z-10 h-full flex flex-col">
                    <div className="w-full h-12 bg-gray-950 mt-6" />
                    <div className="px-6 mt-4 flex-1">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-10 rounded bg-white/10 flex items-center justify-end pr-3">
                          <span className="font-mono text-white text-sm tracking-widest">{cvc || '•••'}</span>
                        </div>
                        <p className="text-[10px] text-white/40 uppercase">CVC</p>
                      </div>
                    </div>
                    <div className="px-6 pb-4 flex justify-between items-end">
                      <span className="text-[10px] text-white/30">Authorized Signature</span>
                      <span className="text-white/40 font-display font-bold text-xs">SkyWings</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Security badges */}
            <div className="flex items-center justify-center gap-6 mt-8 text-xs" style={{ color: 'var(--color-text-4)' }}>
              <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> SSL Encrypted</span>
              <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> PCI Compliant</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> Verified</span>
            </div>
          </motion.div>

          {/* Payment Form */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-8"
            style={{ background: 'var(--color-bg-soft)' }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-primary)', color: 'white' }}>
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold font-display" style={{ color: 'var(--color-text)' }}>Payment Details</h2>
                <p className="text-xs" style={{ color: 'var(--color-text-4)' }}>Enter your card information</p>
              </div>
            </div>

            {/* Test mode */}
            <div
              className="rounded-xl p-3 mb-6 flex items-center gap-3"
              style={{ background: 'rgba(14, 165, 233, 0.08)', border: '1px solid rgba(14, 165, 233, 0.15)' }}
            >
              <Shield className="w-4 h-4 text-sky-500 flex-shrink-0" />
              <p className="text-xs" style={{ color: 'var(--color-text-3)' }}>
                Test Mode — use: <span className="font-mono text-sky-500">4242 4242 4242 4242</span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div onFocus={() => setIsFlipped(false)}>
                <Input label="Cardholder Name" value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="John Doe" />
              </div>
              <div onFocus={() => setIsFlipped(false)}>
                <Input label="Card Number" value={cardNumber} onChange={(e) => setCardNumber(formatCardNumber(e.target.value))} placeholder="4242 4242 4242 4242" maxLength={19} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div onFocus={() => setIsFlipped(false)}>
                  <Input label="Expiry" value={expiry} onChange={(e) => setExpiry(formatExpiry(e.target.value))} placeholder="MM/YY" maxLength={5} />
                </div>
                <div onFocus={() => setIsFlipped(true)}>
                  <Input label="CVC" value={cvc} onChange={(e) => setCvc(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))} placeholder="123" type="password" maxLength={3} />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg flex items-start gap-2" style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button variant="secondary" size="lg" onClick={onCancel} className="w-full" disabled={loading}>
                  Cancel
                </Button>
                <Button type="submit" size="lg" className="w-full flex items-center justify-center gap-2" disabled={loading}>
                  {loading ? (
                    <><div className="spinner w-4 h-4" /> Processing...</>
                  ) : (
                    <><Lock className="w-4 h-4" /> Pay ${bookingData.total_amount.toFixed(2)}</>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}