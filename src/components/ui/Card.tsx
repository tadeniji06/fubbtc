'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface CardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'surface' | 'glass' | 'highlight';
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  hoverEffect = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'rounded-2xl transition-all duration-200 border';

  const variantStyles = {
    default: 'bg-[#121214] border-zinc-800/80 text-zinc-100 shadow-sm',
    surface: 'bg-[#18181b]/70 border-zinc-800 text-zinc-100',
    glass: 'bg-[#0f0f11]/90 backdrop-blur-md border-zinc-800/80 text-zinc-100',
    highlight: 'bg-[#14120f] border-[#F7931A]/30 text-zinc-100 shadow-[0_0_15px_rgba(247,147,26,0.06)]',
  }[variant];

  return (
    <motion.div
      whileHover={hoverEffect ? { y: -2, borderColor: 'rgba(255, 255, 255, 0.18)' } : undefined}
      className={`${baseStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};
