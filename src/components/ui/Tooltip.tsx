'use client';

import React, { useState } from 'react';
import { HelpCircle, Info } from 'lucide-react';

interface TooltipProps {
  content: React.ReactNode;
  children?: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  iconOnly?: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  className = '',
  iconOnly = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }[position];

  return (
    <div
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
      tabIndex={0}
      role="tooltip"
    >
      {iconOnly ? (
        <button
          type="button"
          aria-label="Information tooltip"
          className="text-zinc-500 hover:text-zinc-300 transition-colors p-0.5 rounded cursor-help"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>
      ) : (
        children
      )}

      {isVisible && (
        <div
          className={`absolute ${positionStyles} z-50 w-56 sm:w-64 p-2.5 bg-[#18181b] border border-zinc-700/80 rounded-xl shadow-2xl text-[11px] leading-relaxed text-zinc-300 pointer-events-none animate-in fade-in zoom-in-95 duration-150`}
        >
          <div className="flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#F7931A] shrink-0 mt-0.5" />
            <div className="flex-1 text-zinc-200">{content}</div>
          </div>
          <div
            className={`absolute w-2 h-2 bg-[#18181b] border-zinc-700/80 rotate-45 ${
              position === 'top'
                ? 'top-full -mt-1 left-1/2 -translate-x-1/2 border-r border-b'
                : position === 'bottom'
                ? 'bottom-full -mb-1 left-1/2 -translate-x-1/2 border-l border-t'
                : position === 'left'
                ? 'left-full -ml-1 top-1/2 -translate-y-1/2 border-t border-r'
                : 'right-full -mr-1 top-1/2 -translate-y-1/2 border-b border-l'
            }`}
          />
        </div>
      )}
    </div>
  );
};
