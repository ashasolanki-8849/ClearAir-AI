import { HTMLAttributes, ReactNode } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: 'default' | 'good' | 'satisfactory' | 'moderate' | 'poor' | 'verypoor' | 'severe' | 'outline';
  size?: 'sm' | 'md';
}

export const Badge = ({ children, variant = 'default', size = 'sm', className = '', ...props }: BadgeProps) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm font-medium';

  const variantClasses = {
    default:
      'bg-zinc-100 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800',
    good: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    satisfactory: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20',
    moderate: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    poor: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20',
    verypoor: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20',
    severe: 'bg-red-900/20 text-red-700 dark:text-red-400 border border-red-800/30 font-semibold',
    outline: 'border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 bg-transparent',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
