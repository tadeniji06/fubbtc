'use client';

import React from 'react';
import Image from 'next/image';
import { Sparkles, ArrowUpRight, TrendingUp, ShieldCheck, AlertCircle, Flame, Info } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { useApp } from '@/context/AppContext';

export const BalanceOverview: React.FC = () => {
  const { user, referrals, setActiveTab, setIsActivationModalOpen } = useApp();

  const balanceUsd = user?.balanceUsd || 0;
  const points = user?.points || 0;
  const minWithdrawal = 50.00;
  const progressPercent = Math.min(100, (balanceUsd / minWithdrawal) * 100);
  const remaining = Math.max(0, minWithdrawal - balanceUsd);

  const totalReferrals = referrals.length;
  const referralCommissions = referrals.reduce((sum, r) => sum + r.commissionEarnedUsd, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Main Balance Card */}
      <Card
        variant="default"
        className="lg:col-span-2 p-6 flex flex-col justify-between relative overflow-hidden bg-gradient-to-b from-[#141417] to-[#0f0f11] border-zinc-800"
      >
        {/* Subtle background mascot watermark */}
        <div className="absolute -right-6 -bottom-6 w-44 h-44 opacity-15 pointer-events-none select-none">
          <Image
            src="/mascot.png"
            alt="Funbtc mascot watermark"
            width={176}
            height={176}
            unoptimized
            className="object-contain"
          />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-semibold text-zinc-400 tracking-wider">
                Total Earned Balance
              </span>
              <Tooltip content="Live accumulated earnings across all completed bounties, streak check-ins, and signup bonuses." position="bottom" iconOnly />
              <Badge variant="orange" size="sm">
                Live Earnings
              </Badge>
            </div>
            {user?.isActivated ? (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Activated</span>
              </div>
            ) : (
              <button
                onClick={() => setIsActivationModalOpen(true)}
                className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30 hover:bg-amber-500/20 transition-colors cursor-pointer"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Activation Required</span>
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 mb-2">
            <div className="text-4xl sm:text-5xl font-black text-white tracking-tight">
              ${balanceUsd.toFixed(2)}
            </div>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-[#F7931A]">
              <Sparkles className="w-4 h-4" />
              <span>{points.toLocaleString()} FBTC Points</span>
            </div>
          </div>

          <p className="text-xs text-zinc-400 mb-6">
            1 USD = 1,000 Points. Earn via daily streak check-in, community bounties, and referrals.
          </p>
        </div>

        {/* Withdrawal Progress Section */}
        <div className="relative z-10 pt-4 border-t border-zinc-800/80 space-y-2">
          <ProgressBar
            value={balanceUsd}
            max={minWithdrawal}
            label="Withdrawal Threshold Progress"
            sublabel={`$${balanceUsd.toFixed(2)} / $${minWithdrawal.toFixed(2)}`}
          />
          <div className="flex justify-between items-center text-[11px] text-zinc-400 pt-1">
            <div className="flex items-center gap-1.5">
              {balanceUsd >= minWithdrawal ? (
                <span className="text-emerald-400 font-semibold">Ready for payout! Reviewed & approved within 24 hours.</span>
              ) : (
                <span>
                  <strong className="text-zinc-200">${remaining.toFixed(2)}</strong> needed to unlock $50 payout
                </span>
              )}
              <Tooltip content="Withdrawal drops are reviewed and approved within 24 hours directly by administrators." position="top" iconOnly />
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setActiveTab('wallet')}
              rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
            >
              Go to Wallet
            </Button>
          </div>
        </div>
      </Card>

      {/* Quick Stats / Streak Banner */}
      <Card
        variant="default"
        className="p-6 flex flex-col justify-between border-zinc-800 bg-[#121214]"
      >
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase font-semibold text-zinc-400 tracking-wider">
              Daily Streak
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#F7931A]/10 border border-[#F7931A]/20 flex items-center justify-center text-[#F7931A]">
              <Flame className="w-4 h-4 fill-current" />
            </div>
          </div>

          <div className="text-3xl font-bold text-white mb-1">
            {user?.checkInStreak || 0} <span className="text-base font-normal text-zinc-400">Days</span>
          </div>
          <p className="text-xs text-zinc-400 mb-4">
            Consecutive logins unlock multiplier multipliers up to +1.00 USD on Day 7.
          </p>

          <div className="space-y-2.5 pt-2 border-t border-zinc-800/80 text-xs">
            <div className="flex justify-between items-center text-zinc-300">
              <span className="text-zinc-400">Total Referrals:</span>
              <span className="font-semibold text-white">
                {totalReferrals} {totalReferrals === 1 ? 'Friend' : 'Friends'}
              </span>
            </div>
            <div className="flex justify-between items-center text-zinc-300">
              <span className="text-zinc-400">Referral Commissions:</span>
              <span className="font-semibold text-emerald-400">+${referralCommissions.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-zinc-300">
              <span className="text-zinc-400">Protocol Status:</span>
              <span className="font-medium text-[#F7931A]">Early Pioneer (Tier 1)</span>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="md"
          className="w-full mt-6"
          onClick={() => setActiveTab('referrals')}
          rightIcon={<TrendingUp className="w-4 h-4 text-[#F7931A]" />}
        >
          View Referral Program
        </Button>
      </Card>
    </div>
  );
};
