import { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
}

export const Card = ({ children, className = '', hoverable = false, ...props }: CardProps) => {
  return (
    <div
      className={`rounded-xl border border-zinc-200 bg-white p-5 text-zinc-900 shadow-sm dark:border-zinc-800/80 dark:bg-[#080808] dark:text-zinc-100 ${
        hoverable ? 'hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
