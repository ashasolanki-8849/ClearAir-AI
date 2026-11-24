import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card } from '../components/common/Card';
import { Wind, Lock, Mail, User, MapPin, ArrowRight } from 'lucide-react';

export const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ageGroup, setAgeGroup] = useState('18_35');
  const [userCategory, setUserCategory] = useState('professional');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName || !email || !password || !city) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await register({
        fullName,
        email,
        password,
        ageGroup,
        userCategory,
        city,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-black py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-black">
              <Wind className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
              ClearAir <span className="text-emerald-500 font-mono">AI</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Create Free Account
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Tailor environmental alerts to your daily lifestyle and vulnerable family members.
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-600 dark:text-red-400 font-medium">
                {error}
              </div>
            )}

            <Input
              label="Full Name"
              placeholder="e.g. Priya Sharma"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              leftIcon={<User className="w-4 h-4 text-zinc-400" />}
              required
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4 text-zinc-400" />}
              required
            />

            <Input
              label="Password (min 6 characters)"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4 text-zinc-400" />}
              required
            />

            <Input
              label="City"
              placeholder="e.g. New Delhi, Noida, Mumbai, Lahore"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              leftIcon={<MapPin className="w-4 h-4 text-zinc-400" />}
              required
            />

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                User Category
              </label>
              <select
                value={userCategory}
                onChange={(e) => setUserCategory(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-black py-2 px-3 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-300"
              >
                <option value="student">Student</option>
                <option value="professional">Working Professional</option>
                <option value="family">Family</option>
                <option value="elderly">Elderly</option>
                <option value="community">Community</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Age Group
              </label>
              <select
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-black py-2 px-3 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-300"
              >
                <option value="under_18">Under 18</option>
                <option value="18_35">18 – 35</option>
                <option value="36_60">36 – 60</option>
                <option value="above_60">Above 60</option>
              </select>
            </div>

            <Button
              type="submit"
              size="md"
              className="w-full justify-center pt-2"
              isLoading={loading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Complete Registration
            </Button>
          </form>

          <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-900 text-center text-xs text-zinc-500">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-emerald-500 hover:underline">
              Sign in
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
