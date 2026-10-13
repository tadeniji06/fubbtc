'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Lock, Sparkles, Calendar, Flame, Clock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useApp } from '@/context/AppContext';

export const DailyCheckIn: React.FC = () => {
  const {
    checkInDays,
    claimDailyCheckIn,
    user,
    canClaimToday,
    alreadyClaimedToday,
    claimableDayNumber,
    countdownToMidnight,
    setIsActivationModalOpen,
  } = useApp();

  const currentDay = checkInDays.find((d) => d.dayNumber === claimableDayNumber && d.isCurrentDay);

  const handleClaim = () => {
    if (!user?.isActivated) {
      setIsActivationModalOpen(true);
      return;
    }
    claimDailyCheckIn();
  };

  return (
    <Card variant="default" className="p-6 border-zinc-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#F7931A]" />
              <span>Daily Check-in Streak</span>
            </h3>
            <Badge variant="orange" size="sm">
              7-Day Cycle
            </Badge>
            {user?.checkInStreak ? (
              <Badge variant="green" size="sm">
                {user.checkInStreak} Day Streak
              </Badge>
            ) : null}
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Check in daily to build your streak. 1 claim per calendar day. Reach Day 7 to unlock the $1.00 Jackpot Bonus!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {alreadyClaimedToday && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-900/90 border border-zinc-800 px-3 py-1.5 rounded-lg">
              <Clock className="w-3.5 h-3.5 text-[#F7931A]" />
              <span>Next claim in:</span>
              <span className="font-mono font-semibold text-white">{countdownToMidnight}</span>
            </div>
          )}

          <Button
            variant={canClaimToday ? 'primary' : 'secondary'}
            size="md"
            onClick={handleClaim}
            disabled={!canClaimToday}
            leftIcon={<Flame className="w-4 h-4 text-black" />}
          >
            {canClaimToday && currentDay
              ? `Claim Day ${currentDay.dayNumber} (+$${currentDay.rewardUsd.toFixed(2)})`
              : 'Checked In For Today'}
          </Button>
        </div>
      </div>

      {/* 7-Day Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
        {checkInDays.map((day) => {
          const isDone = day.isCompleted;
          const isCurrent = day.isCurrentDay;
          const isLocked = day.isLocked;

          return (
            <motion.div
              key={day.dayNumber}
              whileHover={isCurrent ? { scale: 1.03 } : undefined}
              className={`relative rounded-xl p-3 flex flex-col items-center justify-between text-center transition-all border ${
                isDone
                  ? 'bg-zinc-900/40 border-zinc-800/60 text-zinc-400'
                  : isCurrent
                  ? 'bg-[#1a1610] border-[#F7931A] ring-1 ring-[#F7931A]/50 shadow-[0_0_15px_rgba(247,147,26,0.1)] text-white'
                  : 'bg-[#121214] border-zinc-800/80 text-zinc-400'
              }`}
            >
              {/* Day Header */}
              <div className="text-[11px] font-semibold uppercase tracking-wider mb-2">
                Day {day.dayNumber}
              </div>

              {/* Status Icon */}
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center my-1 transition-colors ${
                  isDone
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : isCurrent
                    ? 'bg-[#F7931A] text-black font-bold shadow-md'
                    : 'bg-zinc-800 text-zinc-500 border border-zinc-700/50'
                }`}
              >
                {isDone ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : isLocked ? (
                  <Lock className="w-3.5 h-3.5" />
                ) : (
                  <Sparkles className="w-4 h-4 fill-current" />
                )}
              </div>

              {/* Reward info */}
              <div className="mt-2">
                <div
                  className={`text-xs font-bold ${
                    isCurrent ? 'text-[#F7931A]' : isDone ? 'text-zinc-400' : 'text-zinc-200'
                  }`}
                >
                  +${day.rewardUsd.toFixed(2)}
                </div>
                <div className="text-[10px] text-zinc-500 font-medium">
                  {day.rewardPoints} pts
                </div>
              </div>

              {isDone && (
                <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />
              )}
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
};
