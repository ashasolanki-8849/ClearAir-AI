import { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { User, Sun, Moon, Shield, Award, Calendar, MapPin, Mail, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ProfilePage = () => {
  const { user, isAuthenticated, updateUserProfile } = useAuth();
  const { theme, toggleTheme, setTheme } = useTheme();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [city, setCity] = useState(user?.city || '');
  const [userCategory, setUserCategory] = useState(user?.userCategory || 'professional');
  const [ageGroup, setAgeGroup] = useState(user?.ageGroup || '18_35');
  const [saving, setSaving] = useState(false);

  if (!isAuthenticated || !user) {
    return (
      <DashboardLayout>
        <div className="py-12 text-center">
          <p className="text-zinc-500 mb-4">Please sign in to view your profile & settings.</p>
          <Link to="/login">
            <Button size="sm">Sign In</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUserProfile({
        fullName,
        city,
        userCategory: userCategory as any,
        ageGroup: ageGroup as any,
      });
    } catch (e) {
      // handled in context
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          User Profile & Risk Settings
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Personalize your demographic category to receive tailored smog advisories and environmental recommendations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-6 text-center space-y-4">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-zinc-900 text-3xl font-extrabold text-white dark:bg-zinc-100 dark:text-black">
              {user.fullName.charAt(0).toUpperCase()}
            </div>

            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{user.fullName}</h2>
              <p className="text-xs text-zinc-500 font-mono">{user.email}</p>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Shield className="w-3.5 h-3.5" />
              <span>Category: {user.userCategory}</span>
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-900 grid grid-cols-2 gap-3 text-left text-xs">
              <div>
                <span className="text-zinc-400 text-[10px] uppercase font-mono block">Registered City</span>
                <span className="font-semibold">{user.city}</span>
              </div>
              <div>
                <span className="text-zinc-400 text-[10px] uppercase font-mono block">Age Bracket</span>
                <span className="font-semibold">{user.ageGroup.replace('_', ' ').toUpperCase()}</span>
              </div>
            </div>
          </Card>

          {/* Theme Preference Card */}
          <Card className="p-5 space-y-3">
            <h3 className="text-xs font-mono uppercase font-bold text-zinc-400">
              Interface Theme & Ergonomics
            </h3>
            <p className="text-xs text-zinc-500">
              Choose your display aesthetic. Dark mode uses pure black (<code className="font-mono text-emerald-500">#000000</code>) for maximum battery efficiency on OLED displays and nighttime reading comfort.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-xs font-semibold transition-colors ${
                  theme === 'light'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Pure Light</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-xs font-semibold transition-colors ${
                  theme === 'dark'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <Moon className="w-4 h-4 text-zinc-300" />
                <span>Pure Black (#000000)</span>
              </button>
            </div>
          </Card>
        </div>

        {/* Edit Profile Form */}
        <div className="lg:col-span-7">
          <Card className="p-6">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-900">
              Edit Demographic Information
            </h3>

            <form onSubmit={handleUpdate} className="space-y-4">
              <Input
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />

              <Input
                label="Primary City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  User Category (For Targeted Smog Advisories)
                </label>
                <select
                  value={userCategory}
                  onChange={(e) => setUserCategory(e.target.value as any)}
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-black py-2 px-3 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-300"
                >
                  <option value="student">Student (School / College)</option>
                  <option value="professional">Working Professional (Daily Commuter)</option>
                  <option value="family">Family (Parents & Children)</option>
                  <option value="elderly">Elderly / Senior Citizen</option>
                  <option value="community">Community / Health Worker</option>
                </select>
                <p className="text-[11px] text-zinc-400">
                  Allows ClearAir AI to formulate specific exposure recommendations for your daily routine.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Age Group
                </label>
                <select
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value as any)}
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-black py-2 px-3 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-300"
                >
                  <option value="under_18">Under 18 Years (Vulnerable Pediatric)</option>
                  <option value="18_35">18 – 35 Years</option>
                  <option value="36_60">36 – 60 Years</option>
                  <option value="above_60">Above 60 Years (Vulnerable Geriatric)</option>
                </select>
              </div>

              <div className="pt-2">
                <Button type="submit" size="md" isLoading={saving}>
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};
