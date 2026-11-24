interface LoadingSpinnerProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner = ({ label = 'Loading real-time data...', size = 'md' }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-7 h-7 border-2',
    lg: 'w-10 h-10 border-3',
  }[size];

  return (
    <div className="flex flex-col items-center justify-center py-10 space-y-3">
      <div
        className={`${sizeClasses} rounded-full border-zinc-300 border-t-zinc-900 dark:border-zinc-800 dark:border-t-zinc-100 animate-spin`}
      />
      {label && <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</p>}
    </div>
  );
};
