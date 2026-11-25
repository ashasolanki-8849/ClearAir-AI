import { ShieldCheck, MapPin, Lock, EyeOff } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';

export const PrivacyPage = () => {
  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Privacy Policy
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            How ClearAir protects your location and account information.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm space-y-6 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-sky-500" />
              <span>Location Information</span>
            </h2>
            <p>
              When you allow location permission, your browser provides your latitude and longitude. 
              We use this solely to look up the air pollution readings in your area and suggest safer travel routes. 
              We do not track your movements or share your location with advertisers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-sky-500" />
              <span>Account Information</span>
            </h2>
            <p>
              If you create an account, we store your name, email address, password hash, and optional preferences (such as your saved location and notification preferences). 
              Your password is encrypted using industry-standard hashing and is never stored in plain text.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-sky-500" />
              <span>No Unnecessary Data Collection</span>
            </h2>
            <p>
              ClearAir only collects the minimum information needed to provide air quality safety information. 
              You can update your saved location or delete your preferences at any time from your Profile & Settings page.
            </p>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};
