'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  label?: string;
  sublabel?: string;
  showPercentage?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  sublabel,
  showPercentage = true,
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={`w-full space-y-2 ${className}`}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center text-xs">
          {label && <span className="font-medium text-zinc-300">{label}</span>}
          <div className="flex items-center gap-2">
            {sublabel && <span className="text-zinc-500">{sublabel}</span>}
            {showPercentage && (
              <span className="font-bold text-[#F7931A]">{percentage.toFixed(1)}%</span>
            )}
          </div>
        </div>
      )}
      <div className="relative w-full h-2.5 bg-zinc-900 border border-zinc-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-[#F7931A] to-[#FFAB3D] rounded-full relative"
        />
      </div>
    </div>
  );
};
