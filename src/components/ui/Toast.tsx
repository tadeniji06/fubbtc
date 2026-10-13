'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export const Toast: React.FC = () => {
  const { toastMessage } = useApp();

  return (
    <AnimatePresence>
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 15, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#161618] border border-[#F7931A]/40 text-white px-4 py-3 rounded-xl shadow-xl max-w-sm"
        >
          <div className="w-8 h-8 rounded-lg bg-[#F7931A]/15 border border-[#F7931A]/30 flex items-center justify-center flex-shrink-0 text-[#F7931A]">
            <Sparkles className="w-4 h-4" />
          </div>
          <p className="text-xs font-medium text-zinc-200 leading-snug">{toastMessage}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
