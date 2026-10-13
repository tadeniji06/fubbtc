'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-xl transition-colors duration-150 select-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 h-8',
    md: 'text-sm px-4 py-2.5 gap-2 h-10',
    lg: 'text-base px-6 py-3.5 gap-2.5 h-12',
  }[size];

  const variantStyles = {
    primary:
      'bg-[#F7931A] text-black font-semibold hover:bg-[#E08213] focus:ring-[#F7931A] shadow-sm',
    secondary:
      'bg-zinc-800/80 text-white hover:bg-zinc-700/80 border border-zinc-700/60 focus:ring-zinc-500',
    outline:
      'bg-transparent text-white border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-900/60 focus:ring-zinc-400',
    ghost:
      'bg-transparent text-zinc-300 hover:text-white hover:bg-zinc-800/50 focus:ring-zinc-600',
    danger:
      'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 focus:ring-red-500',
  }[variant];

  return (
    <motion.button
      whileHover={disabled || isLoading ? undefined : { y: -1 }}
      whileTap={disabled || isLoading ? undefined : { y: 0 }}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        leftIcon && <span className="flex-shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </motion.button>
  );
};
