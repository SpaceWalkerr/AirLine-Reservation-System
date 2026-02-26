import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Plus, Trash2, Edit2, Save, X, BookOpen, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import Button from '../components/Button';
import Input from '../components/Input';

interface UserProfilePageProps {
  onNavigate: (page: string) => void;
}

interface SavedTraveler {
  id?: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  passport_number: string;
  nationality: string;
  phone?: string;
}

export default function UserProfilePage({ onNavigate }: UserProfilePageProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [savedTravelers, setSavedTravelers] = useState<SavedTraveler[]>([]);
  const [newTraveler, setNewTraveler] = useState<SavedTraveler | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [profile, setProfile] = useState({
    full_name: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    date_of_birth: '',
  });

  const [preferences, setPreferences] = useState({
    meal_preference: 'standard',
    seat_preference: 'window',
    newsletter: true,
  });

  useEffect(() => {
    if (user) {
      loadProfile();
      loadSavedTravelers();
    }
  }, [user]);

  const loadProfile = async () => {
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user!.id)
      .single();
    if (data) {
      setProfile({
        full_name: data.full_name || '',
        phone: data.phone || '',
        address: data.address || '',
        city: data.city || '',
        country: data.country || '',
        date_of_birth: data.date_of_birth || '',
      });
      setPreferences({
        meal_preference: data.meal_preference || 'standard',
        seat_preference: data.seat_preference || 'window',
        newsletter: data.newsletter ?? true,
      });
    } else {
      setProfile({
        full_name: user?.email?.split('@')[0] || '',
        phone: '',
        address: '',
        city: '',
        country: '',
        date_of_birth: '',
      });
    }
  };

  const loadSavedTravelers = async () => {
    const { data } = await supabase
      .from('saved_travelers')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });
    setSavedTravelers(data || []);
  };

  const saveProfile = async () => {
    setLoading(true);
    setSaveError('');
    try {
      const payload = {
        user_id: user!.id,
        ...profile,
        ...preferences,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase
        .from('user_profiles')
        .upsert(payload, { onConflict: 'user_id' });
      if (error) throw error;
      setSaveSuccess(true);
      setEditMode(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addTraveler = () => {
    setNewTraveler({
      first_name: '',
      last_name: '',
      date_of_birth: '',
      passport_number: '',
      nationality: '',
      phone: '',
    });
  };

  const saveTraveler = async () => {
    if (!newTraveler || !newTraveler.first_name || !newTraveler.last_name) return;
    const { data, error } = await supabase
      .from('saved_travelers')
      .insert({ user_id: user!.id, ...newTraveler })
      .select()
      .single();
    if (!error && data) {
      setSavedTravelers([data, ...savedTravelers]);
      setNewTraveler(null);
    }
  };

  const deleteTraveler = async (id: string) => {
    if (!confirm('Remove this traveler?')) return;
    await supabase.from('saved_travelers').delete().eq('id', id).eq('user_id', user!.id);
    setSavedTravelers(savedTravelers.filter(t => t.id !== id));
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
            Please sign in to view profile
          </h2>
          <Button onClick={() => onNavigate('home')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Header */}
      <div className="relative py-12 mb-8" style={{ background: 'var(--color-bg-soft)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-primary)' }}>
                Account Settings
              </p>
              <h1 className="text-3xl font-bold font-display" style={{ color: 'var(--color-text)' }}>
                My Profile
              </h1>
            </div>
            {!editMode && (
              <Button onClick={() => setEditMode(true)} variant="outline">
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Personal Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
          style={{ background: 'var(--color-bg-soft)' }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-surface)' }}>
              <User className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
            </div>
            <h2 className="text-xl font-bold font-display" style={{ color: 'var(--color-text)' }}>
              Personal Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              disabled={!editMode}
            />
            <Input
              label="Email"
              value={user.email || ''}
              disabled
            />
            <Input
              label="Phone"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              placeholder="+1 (555) 123-4567"
              disabled={!editMode}
            />
            <Input
              type="date"
              label="Date of Birth"
              value={profile.date_of_birth}
              onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })}
              disabled={!editMode}
            />
            <Input
              label="Address"
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              placeholder="123 Main St"
              disabled={!editMode}
            />
            <Input
              label="City"
              value={profile.city}
              onChange={(e) => setProfile({ ...profile, city: e.target.value })}
              placeholder="New York"
              disabled={!editMode}
            />
            <Input
              label="Country"
              value={profile.country}
              onChange={(e) => setProfile({ ...profile, country: e.target.value })}
              placeholder="United States"
              disabled={!editMode}
            />
          </div>

          {saveSuccess && (
            <div className="mt-4 p-3 rounded-lg flex items-center gap-2"
              style={{ background: 'rgba(16, 185, 129, 0.08)', color: '#10b981' }}>
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium">Profile saved successfully!</span>
            </div>
          )}
          {saveError && (
            <div className="mt-4 p-3 rounded-lg flex items-center gap-2"
              style={{ background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444' }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{saveError}</span>
            </div>
          )}
          {editMode && (
            <div className="flex gap-3 mt-6">
              <Button onClick={saveProfile} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={() => setEditMode(false)}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </motion.div>

        {/* Travel Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
          style={{ background: 'var(--color-bg-soft)' }}
        >
          <h2 className="text-xl font-bold font-display mb-6" style={{ color: 'var(--color-text)' }}>
            Travel Preferences
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                Preferred Meal
              </label>
              <select
                value={preferences.meal_preference}
                onChange={(e) => setPreferences({ ...preferences, meal_preference: e.target.value })}
                disabled={!editMode}
                className="w-full px-4 py-2 rounded-lg text-sm"
                style={{
                  background: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <option value="standard">Standard Meal</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="halal">Halal</option>
                <option value="kosher">Kosher</option>
                <option value="gluten-free">Gluten-Free</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                Preferred Seat
              </label>
              <select
                value={preferences.seat_preference}
                onChange={(e) => setPreferences({ ...preferences, seat_preference: e.target.value })}
                disabled={!editMode}
                className="w-full px-4 py-2 rounded-lg text-sm"
                style={{
                  background: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <option value="window">Window Seat</option>
                <option value="aisle">Aisle Seat</option>
                <option value="middle">Middle Seat</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.newsletter}
                onChange={(e) => setPreferences({ ...preferences, newsletter: e.target.checked })}
                disabled={!editMode}
                className="w-4 h-4"
                style={{ accentColor: 'var(--color-primary)' }}
              />
              <span className="text-sm" style={{ color: 'var(--color-text)' }}>
                Receive promotional emails and special offers
              </span>
            </label>
          </div>
        </motion.div>

        {/* Saved Travelers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
          style={{ background: 'var(--color-bg-soft)' }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold font-display" style={{ color: 'var(--color-text)' }}>
              Saved Travelers
            </h2>
            <Button variant="outline" size="sm" onClick={addTraveler}>
              <Plus className="w-4 h-4 mr-2" />
              Add Traveler
            </Button>
          </div>

          {/* New Traveler Form */}
          {newTraveler && (
            <div className="mb-6 p-4 rounded-lg" style={{ background: 'var(--color-surface)', border: '2px dashed var(--color-border)' }}>
              <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-text)' }}>New Traveler</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  label="First Name"
                  value={newTraveler.first_name}
                  onChange={(e) => setNewTraveler({ ...newTraveler, first_name: e.target.value })}
                  placeholder="John"
                />
                <Input
                  label="Last Name"
                  value={newTraveler.last_name}
                  onChange={(e) => setNewTraveler({ ...newTraveler, last_name: e.target.value })}
                  placeholder="Doe"
                />
                <Input
                  type="date"
                  label="Date of Birth"
                  value={newTraveler.date_of_birth}
                  onChange={(e) => setNewTraveler({ ...newTraveler, date_of_birth: e.target.value })}
                />
                <Input
                  label="Passport Number"
                  value={newTraveler.passport_number}
                  onChange={(e) => setNewTraveler({ ...newTraveler, passport_number: e.target.value })}
                  placeholder="AB1234567"
                />
                <Input
                  label="Nationality"
                  value={newTraveler.nationality}
                  onChange={(e) => setNewTraveler({ ...newTraveler, nationality: e.target.value })}
                  placeholder="United States"
                />
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" onClick={saveTraveler}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Traveler
                </Button>
                <Button size="sm" variant="outline" onClick={() => setNewTraveler(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Saved Travelers List */}
          {savedTravelers.length === 0 && !newTraveler ? (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" style={{ color: 'var(--color-text)' }} />
              <p className="text-sm" style={{ color: 'var(--color-text-3)' }}>
                No saved travelers yet. Add frequent travelers for faster bookings.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedTravelers.map((traveler) => (
                <div
                  key={traveler.id}
                  className="p-4 rounded-lg flex items-center justify-between"
                  style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                >
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--color-text)' }}>
                      {traveler.first_name} {traveler.last_name}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-4)' }}>
                      {traveler.passport_number} • {traveler.nationality}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteTraveler(traveler.id!)}
                    className="p-2 rounded-lg transition-colors"
                    style={{ color: '#ef4444' }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
