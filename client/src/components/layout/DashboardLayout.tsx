import { ReactNode, useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { LocationSelectorModal } from '../dashboard/LocationSelectorModal';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-white text-zinc-900 dark:bg-black dark:text-zinc-100 transition-colors">
      <Navbar onOpenLocationModal={() => setIsLocationModalOpen(true)} />

      <div className="flex-1 flex mx-auto w-full max-w-7xl">
        <Sidebar />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 w-full max-w-full overflow-hidden">
          {children}
        </main>
      </div>

      <Footer />

      <LocationSelectorModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />
    </div>
  );
};
