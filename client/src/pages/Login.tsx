import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card } from '../components/common/Card';
import { Wind, Lock, Mail, ArrowRight } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-black">
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
            Sign In to ClearAir AI
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Access personalized smog telemetry, saved locations, and health alerts.
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-600 dark:text-red-400 font-medium">
                {error}
              </div>
            )}

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
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4 text-zinc-400" />}
              required
            />

            <div className="flex items-center justify-between text-xs">
              <Link
                to="/forgot-password"
                className="text-zinc-500 hover:text-emerald-500 transition-colors"
              >
                Forgot your password?
              </Link>
            </div>

            <Button
              type="submit"
              size="md"
              className="w-full justify-center"
              isLoading={loading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-900 text-center text-xs text-zinc-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-semibold text-emerald-500 hover:underline">
              Register now
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
