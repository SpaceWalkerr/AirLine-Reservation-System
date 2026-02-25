import { useState } from 'react';
import { Mail, Lock, AlertCircle, Plane } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from './Button';
import Input from './Input';

interface AuthModalProps {
  onClose: () => void;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password);
        if (error) throw error;
        onClose();
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Logo */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center">
          <Plane className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold font-display" style={{ color: 'var(--color-text)' }}>
          SkyWings
        </span>
      </div>

      <h3 className="text-center text-lg font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
        {isSignUp ? 'Create your account' : 'Welcome back'}
      </h3>
      <p className="text-center text-sm mb-6" style={{ color: 'var(--color-text-3)' }}>
        {isSignUp ? 'Sign up to start booking flights' : 'Sign in to manage your bookings'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Input
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="relative">
          <Input
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={6}
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? (
            <><div className="spinner w-4 h-4" /> Processing...</>
          ) : isSignUp ? (
            'Create Account'
          ) : (
            'Sign In'
          )}
        </Button>
      </form>

      <div className="mt-5 text-center">
        <button
          onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
          className="text-sm font-medium hover:underline"
          style={{ color: 'var(--color-primary)' }}
        >
          {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  );
}