import { useState } from 'react';
import { motion } from 'framer-motion';
import { Luggage, DollarSign, AlertTriangle, CheckCircle2, Info, Package } from 'lucide-react';

interface BaggagePageProps {
  onNavigate: (page: string) => void;
}

export default function BaggagePage({ onNavigate: _onNavigate }: BaggagePageProps) {
  const [seatClass, setSeatClass] = useState<'economy' | 'business' | 'first_class'>('economy');
  const [carryOnCount, setCarryOnCount] = useState(1);
  const [checkedBags, setCheckedBags] = useState<Array<{ weight: number; oversized: boolean }>>([
    { weight: 20, oversized: false }
  ]);

  const policies = {
    economy: {
      carryOn: { included: 1, maxWeight: 7, maxSize: '56x36x23 cm' },
      checked: { included: 1, maxWeight: 23, fee: 50, overweightFee: 100 }
    },
    business: {
      carryOn: { included: 2, maxWeight: 10, maxSize: '56x36x23 cm' },
      checked: { included: 2, maxWeight: 32, fee: 0, overweightFee: 75 }
    },
    first_class: {
      carryOn: { included: 2, maxWeight: 15, maxSize: '56x36x23 cm' },
      checked: { included: 3, maxWeight: 32, fee: 0, overweightFee: 50 }
    }
  };

  const policy = policies[seatClass];

  const addBag = () => {
    setCheckedBags([...checkedBags, { weight: 20, oversized: false }]);
  };

  const removeBag = (index: number) => {
    setCheckedBags(checkedBags.filter((_, i) => i !== index));
  };

  const updateBag = (index: number, field: 'weight' | 'oversized', value: number | boolean) => {
    const updated = [...checkedBags];
    updated[index] = { ...updated[index], [field]: value };
    setCheckedBags(updated);
  };

  const calculateFees = () => {
    let total = 0;
    const excess = checkedBags.length - policy.checked.included;
    
    if (excess > 0) {
      total += excess * policy.checked.fee;
    }

    checkedBags.forEach(bag => {
      if (bag.weight > policy.checked.maxWeight) {
        total += policy.checked.overweightFee;
      }
      if (bag.oversized) {
        total += 150; // Oversized fee
      }
    });

    return total;
  };

  const totalFees = calculateFees();

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Hero */}
      <div className="relative py-16 mb-12" style={{ background: 'var(--color-bg-soft)' }}>
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
              style={{ background: 'rgba(99, 102, 241, 0.08)', color: 'var(--color-primary)' }}>
              <Luggage className="w-4 h-4" />
              <span className="text-sm font-semibold">Baggage Calculator</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-4" style={{ color: 'var(--color-text)' }}>
              Calculate Baggage Fees
            </h1>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-text-3)' }}>
              Estimate your baggage costs before you fly
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calculator */}
          <div className="lg:col-span-2 space-y-6">
            {/* Class Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-6"
              style={{ background: 'var(--color-bg-soft)' }}
            >
              <h2 className="text-lg font-bold font-display mb-4" style={{ color: 'var(--color-text)' }}>
                Travel Class
              </h2>
              <select
                value={seatClass}
                onChange={(e) => setSeatClass(e.target.value as any)}
                className="w-full px-4 py-2 rounded-lg text-sm"
                style={{ background: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
              >
                <option value="economy">Economy Class</option>
                <option value="business">Business Class</option>
                <option value="first_class">First Class</option>
              </select>
            </motion.div>

            {/* Carry-On */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-6"
              style={{ background: 'var(--color-bg-soft)' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Package className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                <h2 className="text-lg font-bold font-display" style={{ color: 'var(--color-text)' }}>
                  Carry-On Baggage
                </h2>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                    Number of Bags
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3].map(num => (
                      <button
                        key={num}
                        onClick={() => setCarryOnCount(num)}
                        disabled={num > policy.carryOn.included}
                        className="px-4 py-2 rounded-lg font-semibold transition-all"
                        style={{
                          background: carryOnCount === num ? 'var(--color-primary)' : 'var(--color-surface)',
                          color: carryOnCount === num ? 'white' : num > policy.carryOn.included ? 'var(--color-text-4)' : 'var(--color-text)',
                          border: `1px solid ${carryOnCount === num ? 'transparent' : 'var(--color-border)'}`,
                          opacity: num > policy.carryOn.included ? 0.5 : 1,
                        }}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg" style={{ background: 'rgba(99, 102, 241, 0.06)' }}>
                <p className="text-sm" style={{ color: 'var(--color-text-3)' }}>
                  <strong>Included:</strong> {policy.carryOn.included} bag(s) up to {policy.carryOn.maxWeight}kg each
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-3)' }}>
                  <strong>Max Size:</strong> {policy.carryOn.maxSize}
                </p>
              </div>

              {carryOnCount > policy.carryOn.included && (
                <div className="mt-3 p-3 rounded-lg flex items-start gap-2"
                  style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
                  <p className="text-sm" style={{ color: '#ef4444' }}>
                    Extra carry-on bags not permitted. Consider checking additional bags.
                  </p>
                </div>
              )}
            </motion.div>

            {/* Checked Baggage */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-6"
              style={{ background: 'var(--color-bg-soft)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Luggage className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                  <h2 className="text-lg font-bold font-display" style={{ color: 'var(--color-text)' }}>
                    Checked Baggage
                  </h2>
                </div>
                <button
                  onClick={addBag}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{ background: 'var(--color-primary)', color: 'white' }}
                >
                  + Add Bag
                </button>
              </div>

              <div className="space-y-3 mb-4">
                {checkedBags.map((bag, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg"
                    style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>
                        Bag {index + 1}
                        {index < policy.checked.included && (
                          <span className="ml-2 text-xs px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                            Included
                          </span>
                        )}
                      </h3>
                      {index > 0 && (
                        <button
                          onClick={() => removeBag(index)}
                          className="text-xs px-2 py-1 rounded"
                          style={{ color: '#ef4444' }}
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-3)' }}>
                          Weight (kg)
                        </label>
                        <input
                          type="number"
                          value={bag.weight}
                          onChange={(e) => updateBag(index, 'weight', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 rounded-lg text-sm"
                          style={{
                            background: 'var(--color-bg)',
                            color: 'var(--color-text)',
                            border: `1px solid ${bag.weight > policy.checked.maxWeight ? '#ef4444' : 'var(--color-border)'}`,
                          }}
                          min="0"
                          max="50"
                        />
                        {bag.weight > policy.checked.maxWeight && (
                          <p className="text-xs mt-1" style={{ color: '#ef4444' }}>
                            Overweight: +${policy.checked.overweightFee}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-3)' }}>
                          Size
                        </label>
                        <label className="flex items-center gap-2 p-2 rounded-lg cursor-pointer"
                          style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                          <input
                            type="checkbox"
                            checked={bag.oversized}
                            onChange={(e) => updateBag(index, 'oversized', e.target.checked)}
                            style={{ accentColor: 'var(--color-primary)' }}
                          />
                          <span className="text-xs" style={{ color: 'var(--color-text)' }}>
                            Oversized
                          </span>
                        </label>
                        {bag.oversized && (
                          <p className="text-xs mt-1" style={{ color: '#f59e0b' }}>
                            Oversized fee: +$150
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-lg" style={{ background: 'rgba(99, 102, 241, 0.06)' }}>
                <p className="text-sm" style={{ color: 'var(--color-text-3)' }}>
                  <strong>Included:</strong> {policy.checked.included} bag(s) up to {policy.checked.maxWeight}kg each
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-3)' }}>
                  <strong>Additional bag:</strong> ${policy.checked.fee} each
                </p>
              </div>
            </motion.div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="card p-6 sticky top-24"
              style={{ background: 'var(--color-bg-soft)' }}
            >
              <div className="flex items-center gap-2 mb-6">
                <DollarSign className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                <h2 className="text-lg font-bold font-display" style={{ color: 'var(--color-text)' }}>
                  Fee Summary
                </h2>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--color-text-3)' }}>Seat Class</span>
                  <span className="font-medium capitalize" style={{ color: 'var(--color-text)' }}>
                    {seatClass.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--color-text-3)' }}>Carry-On Bags</span>
                  <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                    {carryOnCount}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--color-text-3)' }}>Checked Bags</span>
                  <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                    {checkedBags.length}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4 mb-6" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex justify-between items-baseline mb-2">
                  <span className="font-medium" style={{ color: 'var(--color-text-3)' }}>
                    Total Baggage Fees
                  </span>
                  <span className="text-3xl font-bold font-display" style={{ color: totalFees > 0 ? '#f59e0b' : '#10b981' }}>
                    ${totalFees}
                  </span>
                </div>
                {totalFees === 0 && (
                  <div className="flex items-center gap-2 mt-3 p-2 rounded-lg"
                    style={{ background: 'rgba(16, 185, 129, 0.08)' }}>
                    <CheckCircle2 className="w-4 h-4" style={{ color: '#10b981' }} />
                    <p className="text-xs" style={{ color: '#10b981' }}>
                      All baggage included!
                    </p>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-lg" style={{ background: 'rgba(99, 102, 241, 0.06)', border: '1px solid rgba(99, 102, 241, 0.12)' }}>
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-primary)' }} />
                  <div className="text-xs" style={{ color: 'var(--color-text-3)' }}>
                    <p className="font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Baggage Tips:</p>
                    <ul className="space-y-1">
                      <li>• Tag your bags with contact info</li>
                      <li>• Remove old baggage tags</li>
                      <li>• Arrive early for bag drop</li>
                      <li>• Keep valuables in carry-on</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
