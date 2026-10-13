'use client';

import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'orange' | 'green' | 'neutral' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'orange',
  size = 'sm',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
  }[size];

  const variantStyles = {
    orange: 'bg-[#F7931A]/15 text-[#F7931A] border border-[#F7931A]/30',
    green: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    neutral: 'bg-zinc-800 text-zinc-300 border border-zinc-700/60',
    outline: 'bg-transparent text-zinc-400 border border-zinc-700',
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full uppercase tracking-wider ${sizeStyles} ${variantStyles} ${className}`}
    >
      {children}
    </span>
  );
};
