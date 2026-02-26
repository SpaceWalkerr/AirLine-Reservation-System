import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ThumbsUp, MessageCircle, X, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import Button from './Button';

interface Review {
  id: string;
  user_id: string;
  flight_number: string;
  rating: number;
  comment: string;
  helpful_votes: number;
  verified: boolean;
  created_at: string;
}

interface FlightReviewsProps {
  /** Route label like "JFK-LAX" shown in the header */
  flightNumber: string;
  /** Optional Supabase flight UUID to scope reviews */
  flightId?: string;
}

export default function FlightReviews({ flightNumber, flightId }: FlightReviewsProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());

  useEffect(() => { loadReviews(); }, [flightNumber, flightId]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      let query = supabase.from('flight_reviews').select('*').order('created_at', { ascending: false });
      if (flightId) query = query.eq('flight_id', flightId);
      else query = query.eq('flight_number', flightNumber);
      const { data } = await query;
      setReviews(data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    if (!user || newRating === 0 || !comment.trim()) return;
    setSubmitting(true);
    try {
      const { data, error } = await supabase.from('flight_reviews').insert({
        user_id: user.id, flight_id: flightId || null,
        flight_number: flightNumber, rating: newRating,
        comment: comment.trim(), verified: true,
      }).select().single();
      if (error) throw error;
      if (data) setReviews(prev => [data, ...prev]);
      setSubmitSuccess(true);
      setShowReviewForm(false);
      setNewRating(0);
      setComment('');
      setTimeout(() => setSubmitSuccess(false), 4000);
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  const handleHelpful = async (review: Review) => {
    if (votedIds.has(review.id)) return;
    const newCount = review.helpful_votes + 1;
    await supabase.from('flight_reviews').update({ helpful_votes: newCount }).eq('id', review.id);
    setReviews(prev => prev.map(r => r.id === review.id ? { ...r, helpful_votes: newCount } : r));
    setVotedIds(prev => new Set([...prev, review.id]));
  };

  const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  const StarRating = ({ value, interactive = false, onRate, size = 5 }: { value: number; interactive?: boolean; onRate?: (r: number) => void; size?: number; }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = (interactive ? (hoverRating || newRating) : value) >= star;
        return (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onRate?.(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          className={interactive ? 'transition-transform hover:scale-110' : ''}
        >
          <Star
            className={`w-${size} h-${size} ${interactive ? 'cursor-pointer' : ''}`}
            fill={filled ? '#f59e0b' : 'none'}
            style={{ color: filled ? '#f59e0b' : 'var(--color-text-4)' }}
          />
        </button>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="card p-6" style={{ background: 'var(--color-bg-soft)' }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold font-display mb-1" style={{ color: 'var(--color-text)' }}>
              Passenger Reviews
            </h3>
            <p className="text-sm mb-3" style={{ color: 'var(--color-text-3)' }}>
              Route: <span className="font-semibold">{flightNumber}</span>
            </p>

            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--color-primary)' }} />
                <span className="text-sm" style={{ color: 'var(--color-text-3)' }}>Loading reviews…</span>
              </div>
            ) : reviews.length > 0 ? (
              <div className="flex items-center gap-3">
                <span className="text-4xl font-bold" style={{ color: 'var(--color-primary)' }}>
                  {avgRating.toFixed(1)}
                </span>
                <div>
                  <StarRating value={avgRating} size={4} />
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-3)' }}>
                    {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm" style={{ color: 'var(--color-text-4)' }}>No reviews yet. Be the first!</p>
            )}
          </div>

          <div className="flex flex-col gap-2 items-start md:items-end">
            {user ? (
              <Button onClick={() => setShowReviewForm(true)}>
                <MessageCircle className="w-4 h-4 mr-2" />
                Write a Review
              </Button>
            ) : (
              <p className="text-xs" style={{ color: 'var(--color-text-4)' }}>Sign in to write a review</p>
            )}
            {submitSuccess && (
              <div className="flex items-center gap-1.5 text-sm" style={{ color: '#10b981' }}>
                <CheckCircle2 className="w-4 h-4" />Review submitted!
              </div>
            )}
          </div>
        </div>

        {/* Rating Distribution */}
        {reviews.length > 0 && (
          <div className="mt-6 space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = reviews.filter(r => r.rating === stars).length;
              const pct = reviews.length ? (count / reviews.length) * 100 : 0;
              return (
                <div key={stars} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-16 flex-shrink-0">
                    <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{stars}</span>
                    <Star className="w-3 h-3" fill="#f59e0b" style={{ color: '#f59e0b' }} />
                  </div>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: '#f59e0b' }} />
                  </div>
                  <span className="text-xs w-6 text-right" style={{ color: 'var(--color-text-3)' }}>{count}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Write Review Modal */}
      <AnimatePresence>
        {showReviewForm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowReviewForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="card p-6 max-w-lg w-full"
              style={{ background: 'var(--color-bg-soft)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold font-display" style={{ color: 'var(--color-text)' }}>Write a Review</h3>
                <button onClick={() => setShowReviewForm(false)} style={{ color: 'var(--color-text-3)' }}><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Your Rating</label>
                  <StarRating value={newRating} interactive onRate={setNewRating} size={6} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Your Review</label>
                  <textarea
                    value={comment} onChange={e => setComment(e.target.value)}
                    placeholder="Share your experience with this flight..." rows={5}
                    className="w-full px-4 py-3 rounded-lg text-sm resize-none"
                    style={{ background: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
                  />
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleSubmit} disabled={newRating === 0 || !comment.trim() || submitting} className="flex-1">
                    {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting…</> : 'Submit Review'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowReviewForm(false)}>Cancel</Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews List */}
      {!loading && reviews.length > 0 && (
        <div className="space-y-4">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}
              className="card p-5" style={{ background: 'var(--color-bg-soft)' }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm"
                    style={{ background: 'var(--color-surface)', color: 'var(--color-primary)' }}>P</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>Passenger</span>
                      {review.verified && (
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>Verified</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StarRating value={review.rating} size={3} />
                      <span className="text-xs" style={{ color: 'var(--color-text-4)' }}>
                        {new Date(review.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--color-text-2)' }}>{review.comment}</p>
              <button
                onClick={() => handleHelpful(review)}
                disabled={votedIds.has(review.id)}
                className={`flex items-center gap-1.5 text-xs transition-colors ${votedIds.has(review.id) ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}`}
                style={{ color: votedIds.has(review.id) ? '#10b981' : 'var(--color-text-3)' }}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                Helpful ({review.helpful_votes})
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
