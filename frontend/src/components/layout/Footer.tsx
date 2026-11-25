import { Link } from 'react-router-dom';
import { Wind } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-zinc-200 bg-white py-10 dark:border-zinc-800 dark:bg-black text-zinc-500 text-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-zinc-100 dark:border-zinc-900">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500 dark:bg-sky-500/20 dark:text-sky-400">
              <Wind className="h-4 w-4" />
            </div>
            <div>
              <span className="font-bold text-sm text-zinc-900 dark:text-white block">ClearAir</span>
              <span className="text-[11px] text-zinc-500">Know Your Air. Stay Safe.</span>
            </div>
          </div>

          {/* 5 Working Footer Sections */}
          <nav className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium">
            <Link
              to="/reviews"
              className="text-zinc-600 hover:text-sky-600 dark:text-zinc-400 dark:hover:text-sky-400 transition-colors"
            >
              Reviews
            </Link>
            <Link
              to="/contact"
              className="text-zinc-600 hover:text-sky-600 dark:text-zinc-400 dark:hover:text-sky-400 transition-colors"
            >
              Contact
            </Link>
            <Link
              to="/help"
              className="text-zinc-600 hover:text-sky-600 dark:text-zinc-400 dark:hover:text-sky-400 transition-colors"
            >
              Help Center
            </Link>
            <Link
              to="/about"
              className="text-zinc-600 hover:text-sky-600 dark:text-zinc-400 dark:hover:text-sky-400 transition-colors"
            >
              About Us
            </Link>
            <Link
              to="/privacy"
              className="text-zinc-600 hover:text-sky-600 dark:text-zinc-400 dark:hover:text-sky-400 transition-colors"
            >
              Privacy Policy
            </Link>
          </nav>
        </div>

        {/* Bottom copyright notice */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500 gap-2">
          <p>© {new Date().getFullYear()} ClearAir. All rights reserved.</p>
          <p>Simple air pollution safety guide for families, students, and communities.</p>
        </div>
      </div>
    </footer>
  );
};
