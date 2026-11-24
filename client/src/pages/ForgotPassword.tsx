import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card } from '../components/common/Card';
import { Wind, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../services/api';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await apiClient<{ success: boolean; message: string }>('/auth/forgot-password', {
        method: 'POST',
        bodyData: { email },
      });
      setMessage(res.message);
      setSubmitted(true);
    } catch (e: any) {
      setMessage('Password reset request dispatched.');
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-md space-y-6">
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
            Reset Password
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Enter your registered email address to receive password recovery instructions.
          </p>
        </div>

        <Card className="p-6">
          {submitted ? (
            <div className="text-center py-4 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Request Sent</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{message}</p>
              <Link to="/login" className="inline-block pt-2">
                <Button variant="outline" size="sm">
                  Back to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Registered Email"
                type="email"
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4 text-zinc-400" />}
                required
              />

              <Button type="submit" size="md" className="w-full justify-center" isLoading={loading}>
                Send Recovery Instructions
              </Button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-900 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
