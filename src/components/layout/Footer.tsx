'use client';

import React from 'react';
import Image from 'next/image';
import { ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-zinc-800/80 bg-[#070708] py-8 mt-16 text-zinc-500 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
            <Image
              src="/mascot.png"
              alt="Funbtc mascot"
              width={32}
              height={32}
              unoptimized
              className="object-contain"
            />
          </div>
          <span className="font-bold text-white tracking-tight">Funbtc</span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-400 font-mono text-[11px]">earn.play.socialize</span>
        </div>

        <div className="flex items-center gap-6 text-zinc-400">
          <span className="hover:text-white transition-colors cursor-pointer">Protocol Rules</span>
          <span className="hover:text-white transition-colors cursor-pointer">Smart Contracts</span>
          <span className="hover:text-white transition-colors cursor-pointer">Community Guild</span>
          <span className="hover:text-white transition-colors cursor-pointer">Support</span>
        </div>

        <div className="text-zinc-500 text-[11px]">
          © 2026 Funbtc. Built for Web3 Sovereignty.
        </div>
      </div>
    </footer>
  );
};
