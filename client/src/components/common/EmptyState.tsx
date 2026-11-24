import { ReactNode } from 'react';
import { Wind } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export const EmptyState = ({
  title,
  description,
  icon = <Wind className="w-10 h-10 text-zinc-400" />,
  action,
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-black/40">
      <div className="p-3 mb-3 rounded-full bg-zinc-100 dark:bg-zinc-900">{icon}</div>
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 max-w-sm">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};
