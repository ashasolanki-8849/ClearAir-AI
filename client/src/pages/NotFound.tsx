import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Wind, ArrowLeft } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-black text-center">
      <div className="max-w-md space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-black">
          <Wind className="h-7 w-7" />
        </div>
        <h1 className="text-4xl font-extrabold font-mono text-zinc-900 dark:text-zinc-100">404</h1>
        <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">Page Not Found</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          The requested air quality resource or page could not be located.
        </p>
        <Link to="/dashboard" className="inline-block pt-2">
          <Button leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Return to AQI Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};
