import { DailyCheckInDay } from '@/types';

export const REWARD_SCHEDULE: { dayNumber: number; rewardUsd: number; rewardPoints: number }[] = [
  { dayNumber: 1, rewardUsd: 0.20, rewardPoints: 200 },
  { dayNumber: 2, rewardUsd: 0.25, rewardPoints: 250 },
  { dayNumber: 3, rewardUsd: 0.30, rewardPoints: 300 },
  { dayNumber: 4, rewardUsd: 0.35, rewardPoints: 350 },
  { dayNumber: 5, rewardUsd: 0.40, rewardPoints: 400 },
  { dayNumber: 6, rewardUsd: 0.50, rewardPoints: 500 },
  { dayNumber: 7, rewardUsd: 1.00, rewardPoints: 1000 },
];

/**
 * Returns the current date formatted as YYYY-MM-DD in the user's local timezone.
 */
export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns yesterday's date formatted as YYYY-MM-DD in the user's local timezone.
 */
export function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return getLocalDateString(d);
}

/**
 * Returns a live string countdown until midnight (next calendar day).
 */
export function getTimeUntilMidnight(): string {
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
  const diffMs = midnight.getTime() - now.getTime();
  if (diffMs <= 0) return '00h 00m 00s';
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
  return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
}

export interface LiveCheckInResult {
  days: DailyCheckInDay[];
  canClaimToday: boolean;
  alreadyClaimedToday: boolean;
  claimableDayNumber: number | null;
  currentDayReward: { dayNumber: number; rewardUsd: number; rewardPoints: number } | null;
}

/**
 * Computes the exact 7-day calendar streak status based on user's last check-in date
 * and streak count stored in Supabase.
 */
export function generateLiveCheckInDays(
  lastCheckInDate?: string,
  rawStreak: number = 0
): LiveCheckInResult {
  const todayStr = getLocalDateString();
  const yesterdayStr = getYesterdayDateString();

  const claimedToday = Boolean(lastCheckInDate && lastCheckInDate === todayStr);
  const claimedYesterday = Boolean(lastCheckInDate && lastCheckInDate === yesterdayStr);

  const effectiveStreak = rawStreak || 0;
  let canClaimToday = false;
  let claimableDayNumber: number | null = null;
  let completedDaysCount = 0;

  if (claimedToday) {
    // User already claimed today. Strictly forbid claiming again.
    canClaimToday = false;
    claimableDayNumber = null;
    completedDaysCount = effectiveStreak > 0 ? ((effectiveStreak - 1) % 7) + 1 : 0;
  } else if (claimedYesterday) {
    // User claimed yesterday. Streak is active! Next day in cycle is claimable today.
    canClaimToday = true;
    const completedInCycle = effectiveStreak % 7;
    claimableDayNumber = completedInCycle + 1;
    completedDaysCount = completedInCycle;
  } else {
    // Brand new user OR user missed yesterday (streak broken). Start at Day 1.
    canClaimToday = true;
    claimableDayNumber = 1;
    completedDaysCount = 0;
  }

  const days: DailyCheckInDay[] = REWARD_SCHEDULE.map((sch) => {
    const isCompleted = sch.dayNumber <= completedDaysCount;
    const isCurrentDay = canClaimToday && sch.dayNumber === claimableDayNumber;
    const isLocked = !isCompleted && !isCurrentDay;

    return {
      dayNumber: sch.dayNumber,
      rewardUsd: sch.rewardUsd,
      rewardPoints: sch.rewardPoints,
      isCompleted,
      isCurrentDay,
      isLocked,
    };
  });

  const currentDayReward = claimableDayNumber
    ? REWARD_SCHEDULE.find((s) => s.dayNumber === claimableDayNumber) || null
    : null;

  return {
    days,
    canClaimToday,
    alreadyClaimedToday: claimedToday,
    claimableDayNumber,
    currentDayReward,
  };
}
