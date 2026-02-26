import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, TrendingUp, Gift, Star, Plane, Zap, Crown, Users, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import Button from '../components/Button';

interface LoyaltyProgramPageProps {
  onNavigate: (page: string) => void;
}

export default function LoyaltyProgramPage({ onNavigate }: LoyaltyProgramPageProps) {
  const { user } = useAuth();
  const [memberData, setMemberData] = useState({
    points: 0,
    tier: 'blue',
    totalFlights: 0,
    memberSince: new Date().toISOString(),
    pointsToNextTier: 10000,
  });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [dbLoading, setDbLoading] = useState(true);

  useEffect(() => {
    if (user) loadMemberData();
  }, [user]);

  const loadMemberData = async () => {
    setDbLoading(true);
    try {
      // Load or create loyalty member record
      let { data: member } = await supabase
        .from('loyalty_members')
        .select('*')
        .eq('user_id', user!.id)
        .single();

      if (!member) {
        const { data: created } = await supabase
          .from('loyalty_members')
          .insert({ user_id: user!.id, points: 0, tier: 'blue', total_flights: 0 })
          .select()
          .single();
        member = created;
      }

      if (member) {
        // Compute tier dynamically
        const pts = member.points;
        const tier = pts >= 50000 ? 'platinum' : pts >= 25000 ? 'gold' : pts >= 10000 ? 'silver' : 'blue';
        const tierThresholds: Record<string, number> = { blue: 10000, silver: 25000, gold: 50000, platinum: 50000 };
        setMemberData({
          points: pts,
          tier,
          totalFlights: member.total_flights,
          memberSince: member.member_since,
          pointsToNextTier: Math.max(0, (tierThresholds[tier] || 50000) - pts),
        });
      }

      // Load recent transactions
      const { data: txns } = await supabase
        .from('loyalty_transactions')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(10);
      setTransactions(txns || []);
    } catch (err) {
      console.error(err);
    } finally {
      setDbLoading(false);
    }
  };

  const tiers = [
    {
      name: 'Blue',
      icon: Plane,
      color: '#3b82f6',
      minPoints: 0,
      benefits: ['Earn 1 point per $1', 'Priority customer service', 'Early booking access']
    },
    {
      name: 'Silver',
      icon: Star,
      color: '#94a3b8',
      minPoints: 10000,
      benefits: ['Earn 1.5 points per $1', '1 free checked bag', 'Priority boarding', 'Lounge access 2x/year']
    },
    {
      name: 'Gold',
      icon: Award,
      color: '#f59e0b',
      minPoints: 25000,
      benefits: ['Earn 2 points per $1', '2 free checked bags', 'Priority boarding', 'Unlimited lounge access', 'Complimentary upgrades']
    },
    {
      name: 'Platinum',
      icon: Crown,
      color: '#8b5cf6',
      minPoints: 50000,
      benefits: ['Earn 2.5 points per $1', '3 free checked bags', 'Priority everything', 'Unlimited lounge access', 'Guaranteed upgrades',  'Exclusive events']
    }
  ];

  const rewards = [
    { name: 'Free Domestic Flight', points: 15000, icon: Plane, color: '#3b82f6' },
    { name: 'Business Class Upgrade', points: 10000, icon: TrendingUp, color: '#f59e0b' },
    { name: 'Airport Lounge Day Pass', points: 3000, icon: Crown, color: '#8b5cf6' },
    { name: '$50 Travel Voucher', points: 5000, icon: Gift, color: '#10b981' },
    { name: 'Extra Baggage Allowance', points: 2000, icon: Users, color: '#6366f1' },
    { name: 'Priority Check-In', points: 1500, icon: Zap, color: '#f59e0b' },
  ];

  const currentTierIndex = tiers.findIndex(t => t.name.toLowerCase() === memberData.tier);
  const currentTier = tiers[currentTierIndex] || tiers[0];
  const nextTier = tiers[currentTierIndex + 1];
  const progress = nextTier ? ((memberData.points - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100 : 100;

  if (!user) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Award className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-primary)', opacity: 0.3 }} />
          <h2 className="text-2xl font-bold font-display mb-2" style={{ color: 'var(--color-text)' }}>
            Join SkyWings Rewards
          </h2>
          <p className="mb-6" style={{ color: 'var(--color-text-3)' }}>
            Sign in to start earning points and enjoying exclusive benefits
          </p>
          <Button onClick={() => onNavigate('home')}>Go Home</Button>
        </div>
      </div>
    );
  }

  if (dbLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin" style={{ color: 'var(--color-primary)' }} />
          <p className="text-sm" style={{ color: 'var(--color-text-3)' }}>Loading your rewards…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Hero */}
      <div className="relative py-16 mb-12" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }} />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center text-white">
            <Award className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">
              SkyWings Rewards
            </h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Earn points on every flight and unlock exclusive benefits
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Member Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl p-8 text-white"
          style={{
            background: `linear-gradient(135deg, ${currentTier.color} 0%, ${currentTier.color}dd 100%)`
          }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
            <currentTier.icon className="w-full h-full" />
          </div>
          
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-white/80 text-sm mb-1">Member Status</p>
              <p className="text-3xl font-bold font-display mb-2">{currentTier.name}</p>
              <p className="text-white/90 text-sm">Member since {new Date(memberData.memberSince).getFullYear()}</p>
            </div>
            <div>
              <p className="text-white/80 text-sm mb-1">Available Points</p>
              <p className="text-4xl font-bold font-display">{memberData.points.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-white/80 text-sm mb-1">Total Flights</p>
              <p className="text-4xl font-bold font-display">{memberData.totalFlights}</p>
            </div>
          </div>

          {nextTier && (
            <div className="mt-6 p-4 rounded-lg bg-white/10 backdrop-blur">
              <div className="flex justify-between text-sm mb-2">
                <span>{memberData.pointsToNextTier.toLocaleString()} points to {nextTier.name}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/20 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-white rounded-full"
                />
              </div>
            </div>
          )}
        </motion.div>

        {/* Tier Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tiers.map((tier, index) => {
            const TierIcon = tier.icon;
            const isCurrentTier = tier.name.toLowerCase() === memberData.tier;
            const isUnlocked = memberData.points >= tier.minPoints;

            return (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card p-5 relative overflow-hidden"
                style={{
                  background: isCurrentTier ? `${tier.color}15` : 'var(--color-bg-soft)',
                  border: `2px solid ${isCurrentTier ? tier.color : 'var(--color-border)'}`,
                  opacity: isUnlocked ? 1 : 0.6
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ background: `${tier.color}20` }}>
                      <TierIcon className="w-5 h-5" style={{ color: tier.color }} />
                    </div>
                    <div>
                      <h3 className="font-bold" style={{ color: 'var(--color-text)' }}>{tier.name}</h3>
                      <p className="text-xs" style={{ color: 'var(--color-text-4)' }}>
                        {tier.minPoints.toLocaleString()}+ pts
                      </p>
                    </div>
                  </div>
                  {isCurrentTier && (
                    <div className="w-2 h-2 rounded-full" style={{ background: tier.color }} />
                  )}
                </div>

                <ul className="space-y-1.5 text-xs" style={{ color: 'var(--color-text-3)' }}>
                  {tier.benefits.slice(0, 3).map((benefit, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <Star className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: tier.color }} />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Rewards Catalog */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card p-6"
              style={{ background: 'var(--color-bg-soft)' }}
            >
              <h2 className="text-2xl font-bold font-display mb-6" style={{ color: 'var(--color-text)' }}>
                Redeem Rewards
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rewards.map((reward, index) => {
                  const canAfford = memberData.points >= reward.points;
                  const RewardIcon = reward.icon;

                  return (
                    <div
                      key={index}
                      className="p-4 rounded-lg"
                      style={{
                        background: 'var(--color-surface)',
                        border: `1px solid ${canAfford ? reward.color : 'var(--color-border)'}`,
                        opacity: canAfford ? 1 : 0.6
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ background: `${reward.color}15` }}>
                            <RewardIcon className="w-5 h-5" style={{ color: reward.color }} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
                              {reward.name}
                            </h3>
                            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-4)' }}>
                              {reward.points.toLocaleString()} points
                            </p>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={canAfford ? 'primary' : 'outline'}
                        disabled={!canAfford}
                        className="w-full"
                        onClick={() => alert('Reward redemption coming soon!')}
                      >
                        {canAfford ? 'Redeem' : 'Locked'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Activity */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="card p-6"
              style={{ background: 'var(--color-bg-soft)' }}
            >
              <h2 className="text-xl font-bold font-display mb-4" style={{ color: 'var(--color-text)' }}>
                Recent Activity
              </h2>

              {transactions.length === 0 ? (
                <div className="py-6 text-center">
                  <p className="text-sm" style={{ color: 'var(--color-text-4)' }}>
                    No activity yet. Book a flight to earn points!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((activity, index) => (
                    <div
                      key={index}
                      className="pb-3 border-b last:border-b-0"
                      style={{ borderColor: 'var(--color-border)' }}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                          {activity.description}
                        </p>
                        <span
                          className="text-sm font-bold"
                          style={{
                            color: activity.transaction_type === 'redeemed' ? '#ef4444' : '#10b981'
                          }}
                        >
                          {activity.points > 0 ? '+' : ''}{activity.points.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs" style={{ color: 'var(--color-text-4)' }}>
                        {new Date(activity.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
