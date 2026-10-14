export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl?: string;
  isActivated: boolean;
  balanceUsd: number;
  points: number;
  referralCode: string;
  referredBy?: string;
  walletAddress?: string;
  preferredCrypto?: 'USDT' | 'ETH' | 'BTC';
  checkInStreak: number;
  lastCheckInDate?: string; // YYYY-MM-DD
  joinedDate: string;
}

export interface SocialTask {
  id: string;
  title: string;
  description: string;
  rewardUsd: number;
  rewardPoints: number;
  icon: 'twitter' | 'discord' | 'telegram' | 'retweet' | 'share';
  platformUrl: string;
  status: 'available' | 'verifying' | 'completed';
  cooldownHours?: number;
}

export interface DailyCheckInDay {
  dayNumber: number;
  rewardUsd: number;
  rewardPoints: number;
  isCompleted: boolean;
  isCurrentDay: boolean;
  isLocked: boolean;
}

export interface ReferralRecord {
  id: string;
  username: string;
  joinedDate: string;
  hasActivated: boolean;
  commissionEarnedUsd: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderUsername: string;
  senderAvatar?: string;
  text: string;
  timestamp: string;
  isSelf: boolean;
}

export interface ChatContact {
  id: string;
  username: string;
  name: string;
  avatarUrl?: string;
  status: 'online' | 'offline';
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

export interface WithdrawalTransaction {
  id: string;
  amountUsd: number;
  network: string;
  walletAddress: string;
  status: 'pending' | 'completed' | 'processing' | 'rejected';
  createdAt: string;
  txHash?: string;
}
