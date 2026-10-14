'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Flame,
  Users,
  Coins,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useApp } from '@/context/AppContext';

export const LandingHero: React.FC = () => {
  const { setIsAuthModalOpen, setAuthMode, setIsActivationModalOpen, user } = useApp();

  const handleGetStarted = () => {
    if (!user) {
      setAuthMode('signup');
      setIsAuthModalOpen(true);
    } else if (!user.isActivated) {
      setIsActivationModalOpen(true);
    }
  };

  return (
    <div className="relative overflow-hidden py-10 md:py-16">
      {/* Background radial accent - very subtle */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#F7931A]/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Hero Copy */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-7 space-y-6 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 bg-[#18181b] border border-zinc-800 rounded-full px-3.5 py-1.5 text-xs">
              <Badge variant="orange" size="sm">
                Web3 Social-Fi Hub
              </Badge>
              <span className="text-zinc-300 font-medium">
                The New Bitcoin Era is Social
              </span>
            </div>

            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08]">
                Unlock Real Crypto. <br />
                <span className="text-[#F7931A]">earn.play.socialize</span>
              </h1>
              <p className="text-sm sm:text-base text-zinc-400 mt-4 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Funbtc connects Web3 enthusiasts, social bounty hunters, and daily streak claimers into one unified platform. Complete daily check-ins, collaborate with crypto peers, and withdraw earnings directly to your personal wallet.
              </p>
            </div>

            {/* CTA Button Group */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={handleGetStarted}
                rightIcon={<ArrowRight className="w-4 h-4 text-black" />}
                className="w-full sm:w-auto"
              >
                Join Funbtc Now
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => {
                  setAuthMode('login');
                  setIsAuthModalOpen(true);
                }}
                className="w-full sm:w-auto"
              >
                Sign In to Account
              </Button>
            </div>

            {/* Highlights row */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-zinc-800/80 text-left">
              <div className="p-3 bg-zinc-950/60 border border-zinc-800/60 rounded-xl">
                <div className="text-xs font-bold text-white">$20 Deposit</div>
                <div className="text-[11px] text-[#F7931A] font-medium mt-0.5">+$5 Signup Bonus</div>
              </div>
              <div className="p-3 bg-zinc-950/60 border border-zinc-800/60 rounded-xl">
                <div className="text-xs font-bold text-white">Daily Streak</div>
                <div className="text-[11px] text-zinc-400 mt-0.5">Up to +$1.00/day</div>
              </div>
              <div className="p-3 bg-zinc-950/60 border border-zinc-800/60 rounded-xl">
                <div className="text-xs font-bold text-white">$50 Threshold</div>
                <div className="text-[11px] text-emerald-400 font-medium mt-0.5">24h Drop & Approval</div>
              </div>
            </div>
          </motion.div>

          {/* Right Mascot Feature Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45 }}
            className="lg:col-span-5 flex justify-center"
          >
            <div className="relative w-full max-w-sm">
              {/* Outer Card with Crisp Border */}
              <div className="relative rounded-3xl bg-[#121214] border border-zinc-800 p-6 shadow-2xl overflow-hidden">
                <div className="absolute top-4 right-4">
                  <Badge variant="orange" size="sm">
                    Funbtc Mascot
                  </Badge>
                </div>

                {/* Mascot image */}
                <div className="relative w-64 h-64 mx-auto my-2 flex items-center justify-center">
                  <Image
                    src="/mascot.png"
                    alt="Funbtc black fox mascot holding Bitcoin"
                    width={256}
                    height={256}
                    priority
                    unoptimized
                    className="object-contain drop-shadow-md select-none"
                  />
                </div>

                {/* Mascot Profile Tag */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-2 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Funbtc Alpha Fox</span>
                    <span className="text-xs font-semibold text-[#F7931A]">Level 99 Mascot</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span>Protocol Security:</span>
                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> 100% Verified
                    </span>
                  </div>
                  <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#F7931A] h-full w-4/5 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
