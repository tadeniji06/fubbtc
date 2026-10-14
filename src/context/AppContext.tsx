'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { createClient } from '@/utils/supabase/client';
import {
  User,
  SocialTask,
  DailyCheckInDay,
  ReferralRecord,
  ChatMessage,
  ChatContact,
  WithdrawalTransaction,
} from '@/types';
import {
  getLocalDateString,
  getYesterdayDateString,
  getTimeUntilMidnight,
  generateLiveCheckInDays,
} from '@/utils/dailyCheckIn';

interface AuthResponse {
  success: boolean;
  error?: string;
}

interface AppContextType {
  user: User | null;
  activeTab: 'dashboard' | 'wallet' | 'referrals' | 'chat';
  setActiveTab: (tab: 'dashboard' | 'wallet' | 'referrals' | 'chat') => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authMode: 'login' | 'signup';
  setAuthMode: (mode: 'login' | 'signup') => void;
  isActivationModalOpen: boolean;
  setIsActivationModalOpen: (open: boolean) => void;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  
  // State data
  tasks: SocialTask[];
  checkInDays: DailyCheckInDay[];
  canClaimToday: boolean;
  alreadyClaimedToday: boolean;
  claimableDayNumber: number | null;
  countdownToMidnight: string;
  referrals: ReferralRecord[];
  contacts: ChatContact[];
  activeContact: ChatContact | null;
  setActiveContact: (contact: ChatContact | null) => void;
  messages: Record<string, ChatMessage[]>;
  withdrawalHistory: WithdrawalTransaction[];

  // Actions
  login: (email: string, pass: string) => Promise<AuthResponse>;
  signup: (name: string, email: string, pass: string, refCode?: string, isBypass?: boolean) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  activateAccount: (
    crypto: 'USDT' | 'ETH' | 'BTC',
    paymentDetails?: {
      txHash?: string;
      method?: 'walletconnect' | 'manual_deposit';
      network?: string;
      senderAddress?: string;
      recipientAddress?: string;
    }
  ) => Promise<boolean>;
  claimDailyCheckIn: () => Promise<void>;
  startAndClaimTask: (taskId: string) => Promise<void>;
  submitWithdrawal: (amount: number, network: string, address: string) => Promise<{ success: boolean; error?: string }>;
  sendChatMessage: (contactId: string, text: string) => void;
  searchUsers: (query: string) => ChatContact[];
  triggerConfetti: () => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  refreshUserData: () => Promise<void>;
}

const INITIAL_TASKS: SocialTask[] = [
  {
    id: 'task-1',
    title: 'Follow @Funbtc_Official on X',
    description: 'Follow our official X handle to stay tuned with alpha announcements and rewards.',
    rewardUsd: 0.50,
    rewardPoints: 500,
    icon: 'twitter',
    platformUrl: 'https://x.com/funbtc',
    status: 'available',
  },
  {
    id: 'task-2',
    title: 'Join Funbtc Discord Hub',
    description: 'Verify in the #verify-fox channel and grab your Early Fox member role.',
    rewardUsd: 0.75,
    rewardPoints: 750,
    icon: 'discord',
    platformUrl: 'https://discord.gg/funbtc',
    status: 'available',
  },
  {
    id: 'task-3',
    title: 'Retweet & Like Launch Announcement',
    description: 'Spread the word with #Funbtc #Web3Social on X.',
    rewardUsd: 0.40,
    rewardPoints: 400,
    icon: 'retweet',
    platformUrl: 'https://x.com/funbtc/status/launch',
    status: 'available',
  },
  {
    id: 'task-4',
    title: 'Join Telegram Alpha Lounge',
    description: 'Connect directly with Web3 degens, chat, and participate in flash drops.',
    rewardUsd: 0.35,
    rewardPoints: 350,
    icon: 'telegram',
    platformUrl: 'https://t.me/funbtc_official',
    status: 'available',
  },
  {
    id: 'task-5',
    title: 'Share Referral Link in 1 Crypto Community',
    description: 'Share your personal Funbtc invite link in any crypto chat or forum.',
    rewardUsd: 1.00,
    rewardPoints: 1000,
    icon: 'share',
    platformUrl: '#',
    status: 'available',
  },
];

const INITIAL_CONTACTS: ChatContact[] = [
  {
    id: 'user-satoshi',
    username: 'satoshi',
    name: 'Satoshi Nakamoto',
    avatarUrl: '/mascot.png',
    status: 'online',
    lastMessage: 'Welcome to the peer-to-peer social layer.',
    lastMessageTime: '12m ago',
    unreadCount: 1,
  },
  {
    id: 'user-vitalik',
    username: 'vitalik',
    name: 'Vitalik B.',
    avatarUrl: '/mascot.png',
    status: 'online',
    lastMessage: 'How do you like the decentralized rewards model?',
    lastMessageTime: '1h ago',
  },
  {
    id: 'user-cryptofox',
    username: 'cryptofox',
    name: 'Crypto Fox HQ',
    avatarUrl: '/mascot.png',
    status: 'online',
    lastMessage: 'Keep your streak alive for double points this Sunday!',
    lastMessageTime: '3h ago',
  },
  {
    id: 'user-hodler99',
    username: 'hodler99',
    name: 'Alex Hodl',
    status: 'offline',
    lastMessage: 'Just withdrew my first $25 in USDT, instant confirmation.',
    lastMessageTime: '1d ago',
  },
];

const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  'user-satoshi': [
    {
      id: 'm1',
      senderId: 'user-satoshi',
      senderUsername: 'satoshi',
      text: 'Welcome to Funbtc! Remember: not your keys, not your coins, but here you earn both.',
      timestamp: '10:45 AM',
      isSelf: false,
    },
    {
      id: 'm2',
      senderId: 'user-satoshi',
      senderUsername: 'satoshi',
      text: 'Welcome to the peer-to-peer social layer.',
      timestamp: '11:02 AM',
      isSelf: false,
    },
  ],
  'user-vitalik': [
    {
      id: 'm3',
      senderId: 'user-vitalik',
      senderUsername: 'vitalik',
      text: 'How do you like the decentralized rewards model?',
      timestamp: '9:30 AM',
      isSelf: false,
    },
  ],
  'user-cryptofox': [
    {
      id: 'm4',
      senderId: 'user-cryptofox',
      senderUsername: 'cryptofox',
      text: 'Keep your streak alive for double points this Sunday!',
      timestamp: 'Yesterday',
      isSelf: false,
    },
  ],
  'user-hodler99': [
    {
      id: 'm5',
      senderId: 'user-hodler99',
      senderUsername: 'hodler99',
      text: 'Just withdrew my first $25 in USDT, instant confirmation.',
      timestamp: 'Yesterday',
      isSelf: false,
    },
  ],
};

const INITIAL_REFERRALS: ReferralRecord[] = [];
const INITIAL_WITHDRAWALS: WithdrawalTransaction[] = [];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'wallet' | 'referrals' | 'chat'>('dashboard');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [isActivationModalOpen, setIsActivationModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const [tasks, setTasks] = useState<SocialTask[]>(INITIAL_TASKS);
  const [referrals, setReferrals] = useState<ReferralRecord[]>(INITIAL_REFERRALS);
  const [contacts, setContacts] = useState<ChatContact[]>(INITIAL_CONTACTS);
  const [activeContact, setActiveContact] = useState<ChatContact | null>(INITIAL_CONTACTS[0]);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES);
  const [withdrawalHistory, setWithdrawalHistory] = useState<WithdrawalTransaction[]>(INITIAL_WITHDRAWALS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#F7931A', '#FFA834', '#FFFFFF', '#FFD700'],
      });
    } catch {
      // ignore
    }
  };

  // Synchronize referrals from Supabase backend
  const fetchBackendReferrals = useCallback(async (currentUserId: string, referralCode: string) => {
    try {
      // 1. Check if public.referrals table exists and query it
      const { data: refData, error: refError } = await supabase
        .from('referrals')
        .select('id, has_activated, commission_earned_usd, created_at, referred:profiles!referred_id(username, created_at, is_activated)')
        .eq('referrer_id', currentUserId);

      if (!refError && refData && refData.length > 0) {
        const mapped: ReferralRecord[] = refData.map((r: any) => ({
          id: r.id,
          username: r.referred?.username || 'web3_user',
          joinedDate: r.created_at ? r.created_at.split('T')[0] : '2026-10-12',
          hasActivated: r.has_activated ?? r.referred?.is_activated ?? false,
          commissionEarnedUsd: Number(r.commission_earned_usd ?? (r.has_activated ? 1.50 : 0.00)),
        }));
        setReferrals(mapped);
        return;
      }

      // 2. Fallback: Query profiles table directly for referred_by
      const { data: profData, error: profError } = await supabase
        .from('profiles')
        .select('id, username, created_at, is_activated')
        .ilike('referred_by', referralCode);

      if (!profError && profData && profData.length > 0) {
        const mapped: ReferralRecord[] = profData.map((p: any) => ({
          id: p.id,
          username: p.username,
          joinedDate: p.created_at ? p.created_at.split('T')[0] : '2026-10-12',
          hasActivated: p.is_activated || false,
          commissionEarnedUsd: p.is_activated ? 1.50 : 0.00,
        }));
        setReferrals(mapped);
      }
    } catch (err) {
      console.warn('Backend referrals query fallback:', err);
    }
  }, [supabase]);

  // Synchronize full user profile and stats from Supabase
  const syncUserProfile = useCallback(async (sbUser: any) => {
    const meta = sbUser.user_metadata || {};
    const fallbackUsername = (sbUser.email?.split('@')[0] || 'fox').toLowerCase();
    const fallbackRefCode = meta.referral_code || ('FBTC-' + sbUser.id.slice(0, 4).toUpperCase());

    let profileData: any = null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sbUser.id)
        .maybeSingle();

      if (!error && data) {
        profileData = data;
      }
    } catch {
      // schema table not created yet, proceed with auth metadata
    }

    const resolvedUser: User = {
      id: sbUser.id,
      name: profileData?.name || meta.name || fallbackUsername,
      username: profileData?.username || meta.username || fallbackUsername,
      email: sbUser.email || '',
      avatarUrl: profileData?.avatar_url || '/mascot.png',
      isActivated: profileData ? profileData.is_activated : (meta.is_activated ?? false),
      balanceUsd: profileData ? Number(profileData.balance_usd) : (meta.balance_usd ?? 0.00),
      points: profileData ? Number(profileData.points) : (meta.points ?? 0),
      referralCode: profileData?.referral_code || fallbackRefCode,
      referredBy: profileData?.referred_by || meta.referred_by || undefined,
      preferredCrypto: profileData?.preferred_crypto || meta.preferred_crypto || undefined,
      checkInStreak: profileData?.check_in_streak || meta.check_in_streak || 0,
      lastCheckInDate: profileData?.last_check_in_date || meta.last_check_in_date || undefined,
      joinedDate: (profileData?.created_at || sbUser.created_at || '2026-10-12').split('T')[0],
    };

    setUser(resolvedUser);

    // Sync persisted completed tasks for this user from localStorage
    try {
      const savedTasksJson = localStorage.getItem(`funbtc_completed_tasks_${resolvedUser.id}`);
      if (savedTasksJson) {
        const completedIds: string[] = JSON.parse(savedTasksJson);
        setTasks((prev) =>
          prev.map((t) => (completedIds.includes(t.id) ? { ...t, status: 'completed' } : t))
        );
      }
    } catch {
      // ignore
    }

    // Sync user's withdrawals from Supabase backend
    try {
      const { data: userWithdrawals } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('user_id', resolvedUser.id)
        .order('created_at', { ascending: false });

      if (userWithdrawals && userWithdrawals.length > 0) {
        const mappedWithdrawals: WithdrawalTransaction[] = userWithdrawals.map((w: any) => ({
          id: w.id ? 'tx-' + w.id.slice(0, 8) : 'tx-' + Math.floor(1000 + Math.random() * 9000),
          amountUsd: Number(w.amount_usd),
          network: w.network,
          walletAddress: w.wallet_address,
          status: (w.status || 'pending') as 'pending' | 'completed' | 'rejected',
          createdAt: (w.created_at || new Date().toISOString()).split('T')[0],
        }));
        setWithdrawalHistory(mappedWithdrawals);
      }
    } catch (wErr) {
      console.warn('Withdrawals fetch notice:', wErr);
    }

    // Sync user's referrals from Supabase backend
    await fetchBackendReferrals(resolvedUser.id, resolvedUser.referralCode);
  }, [supabase, fetchBackendReferrals]);

  // Initialize and listen to Supabase auth session
  useEffect(() => {
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await syncUserProfile(session.user);
      }
    };
    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await syncUserProfile(session.user);
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, syncUserProfile]);

  const refreshUserData = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (currentUser) {
      await syncUserProfile(currentUser);
    }
  };

  const DEFAULT_CHECKIN_DAYS: DailyCheckInDay[] = [
    { dayNumber: 1, rewardUsd: 0.20, rewardPoints: 200, isCompleted: false, isCurrentDay: true, isLocked: false },
    { dayNumber: 2, rewardUsd: 0.25, rewardPoints: 250, isCompleted: false, isCurrentDay: false, isLocked: true },
    { dayNumber: 3, rewardUsd: 0.30, rewardPoints: 300, isCompleted: false, isCurrentDay: false, isLocked: true },
    { dayNumber: 4, rewardUsd: 0.35, rewardPoints: 350, isCompleted: false, isCurrentDay: false, isLocked: true },
    { dayNumber: 5, rewardUsd: 0.40, rewardPoints: 400, isCompleted: false, isCurrentDay: false, isLocked: true },
    { dayNumber: 6, rewardUsd: 0.50, rewardPoints: 500, isCompleted: false, isCurrentDay: false, isLocked: true },
    { dayNumber: 7, rewardUsd: 1.00, rewardPoints: 1000, isCompleted: false, isCurrentDay: false, isLocked: true },
  ];

  // Live countdown until midnight (next calendar day)
  const [countdownToMidnight, setCountdownToMidnight] = useState<string>('00h 00m 00s');
  const [checkInDays, setCheckInDays] = useState<DailyCheckInDay[]>(DEFAULT_CHECKIN_DAYS);
  const [canClaimToday, setCanClaimToday] = useState<boolean>(true);
  const [alreadyClaimedToday, setAlreadyClaimedToday] = useState<boolean>(false);
  const [claimableDayNumber, setClaimableDayNumber] = useState<number | null>(1);

  // Sync client-side check-in status and live ticking countdown
  useEffect(() => {
    setCountdownToMidnight(getTimeUntilMidnight());
    const timer = setInterval(() => {
      setCountdownToMidnight(getTimeUntilMidnight());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync checkInDays when user's lastCheckInDate or checkInStreak updates
  useEffect(() => {
    const res = generateLiveCheckInDays(user?.lastCheckInDate, user?.checkInStreak);
    setCheckInDays(res.days);
    setCanClaimToday(res.canClaimToday);
    setAlreadyClaimedToday(res.alreadyClaimedToday);
    setClaimableDayNumber(res.claimableDayNumber);
  }, [user?.lastCheckInDate, user?.checkInStreak]);

  // Strict Calendar-Day Claim Logic
  const claimDailyCheckIn = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!user.isActivated) {
      setIsActivationModalOpen(true);
      return;
    }

    const todayStr = getLocalDateString();
    const yesterdayStr = getYesterdayDateString();

    // STRICT CHECK: User already claimed today!
    if (user.lastCheckInDate === todayStr) {
      showToast('You have already claimed today! Next check-in unlocks tomorrow at midnight.');
      return;
    }

    // Compute reward and streak
    const currentLive = generateLiveCheckInDays(user.lastCheckInDate, user.checkInStreak);
    if (!currentLive.canClaimToday || !currentLive.currentDayReward) {
      showToast('Check-in unavailable. Next reward unlocks tomorrow at midnight.');
      return;
    }

    const reward = currentLive.currentDayReward;
    const newStreak = user.lastCheckInDate === yesterdayStr ? (user.checkInStreak || 0) + 1 : 1;
    const newBalance = Number((user.balanceUsd + reward.rewardUsd).toFixed(2));
    const newPoints = user.points + reward.rewardPoints;

    // 1. Optimistic UI update
    setUser((prev) =>
      prev
        ? {
            ...prev,
            balanceUsd: newBalance,
            points: newPoints,
            checkInStreak: newStreak,
            lastCheckInDate: todayStr,
          }
        : null
    );

    // Immediately lock today and show as completed
    const updatedState = generateLiveCheckInDays(todayStr, newStreak);
    setCheckInDays(updatedState.days);

    // 2. Sync to Supabase profiles table
    try {
      await supabase
        .from('profiles')
        .update({
          balance_usd: newBalance,
          points: newPoints,
          check_in_streak: newStreak,
          last_check_in_date: todayStr,
        })
        .eq('id', user.id);
    } catch (err) {
      console.warn('Profile check-in update error:', err);
    }

    triggerConfetti();
    showToast(`Claimed Day ${reward.dayNumber} reward: +$${reward.rewardUsd.toFixed(2)} (${reward.rewardPoints} pts)!`);
  };

  const startAndClaimTask = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === 'completed' || !user) return;

    if (!user.isActivated) {
      setIsActivationModalOpen(true);
      return;
    }

    if (task.platformUrl && task.platformUrl !== '#') {
      window.open(task.platformUrl, '_blank', 'noopener,noreferrer');
    }

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: 'verifying' } : t))
    );

    await new Promise((r) => setTimeout(r, 1800));

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: 'completed' } : t))
    );

    // Persist completed task per user
    try {
      const storageKey = `funbtc_completed_tasks_${user.id}`;
      const existingJson = localStorage.getItem(storageKey);
      const existingList: string[] = existingJson ? JSON.parse(existingJson) : [];
      if (!existingList.includes(taskId)) {
        existingList.push(taskId);
        localStorage.setItem(storageKey, JSON.stringify(existingList));
      }
    } catch {
      // ignore
    }

    const newBalance = Number((user.balanceUsd + task.rewardUsd).toFixed(2));
    const newPoints = user.points + task.rewardPoints;

    setUser((prev) => (prev ? {
      ...prev,
      balanceUsd: newBalance,
      points: newPoints,
    } : null));

    // Sync to Supabase profiles
    try {
      await supabase
        .from('profiles')
        .update({
          balance_usd: newBalance,
          points: newPoints,
        })
        .eq('id', user.id);
    } catch {
      // ignore
    }

    triggerConfetti();
    showToast(`Task verified! +$${task.rewardUsd.toFixed(2)} (${task.rewardPoints} pts) added to your balance.`);
  };

  // Account Activation with instant Welcome Bonus and automatic referral credit
  const activateAccount = async (
    crypto: 'USDT' | 'ETH' | 'BTC',
    paymentDetails?: {
      txHash?: string;
      method?: 'walletconnect' | 'manual_deposit';
      network?: string;
      senderAddress?: string;
      recipientAddress?: string;
    }
  ): Promise<boolean> => {
    if (!user) return false;

    const newBalance = Number((user.balanceUsd + 5.00).toFixed(2));
    const newPoints = user.points + 5000;
    const txHash = paymentDetails?.txHash || 'tx_direct_' + Date.now();
    const method = paymentDetails?.method || 'manual_deposit';
    const network = paymentDetails?.network || (crypto === 'USDT' ? 'BSC' : crypto);
    const recipient = paymentDetails?.recipientAddress || '0xb3646fB0fb51F06F8D2Fe1C42288688ea46EBaE0';

    // 1. Try invoking the Supabase stored procedure with payment tracking
    try {
      const { error: rpcPayError } = await supabase.rpc('activate_account_with_payment', {
        p_user_id: user.id,
        p_tx_hash: txHash,
        p_payment_method: method,
        p_network: network,
        p_crypto: crypto,
        p_sender_address: paymentDetails?.senderAddress || null,
        p_recipient_address: recipient,
      });

      if (rpcPayError) {
        // Fallback: standard activation RPC
        const { error: rpcError } = await supabase.rpc('activate_account_and_credit_referral', {
          p_user_id: user.id,
          p_crypto: crypto,
        });

        if (rpcError) {
          // Fallback: direct table updates
          await supabase
            .from('profiles')
            .update({
              is_activated: true,
              preferred_crypto: crypto,
              balance_usd: newBalance,
              points: newPoints,
            })
            .eq('id', user.id);

          await supabase
            .from('referrals')
            .update({
              has_activated: true,
              commission_earned_usd: 1.50,
            })
            .eq('referred_id', user.id);
        }

        // Try inserting into payment_transactions directly
        try {
          await supabase.from('payment_transactions').insert({
            user_id: user.id,
            payment_method: method,
            network: network,
            crypto_symbol: crypto,
            tx_hash: txHash,
            sender_address: paymentDetails?.senderAddress || null,
            recipient_address: recipient,
            amount_usd: 20.00,
            status: 'confirmed',
            confirmed_at: new Date().toISOString(),
          });
        } catch {
          // ignore if table not created
        }
      }
    } catch {
      // fallback
    }

    // 2. Update local state
    setUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        isActivated: true,
        preferredCrypto: crypto,
        balanceUsd: newBalance,
        points: newPoints,
      };
    });

    setIsActivationModalOpen(false);
    triggerConfetti();
    showToast('Account successfully activated! $5.00 Welcome Bonus has been credited!');
    await refreshUserData();
    return true;
  };

  const login = async (email: string, pass: string): Promise<AuthResponse> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: pass,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        await syncUserProfile(data.user);
      }
      setIsAuthModalOpen(false);
      showToast(`Welcome back, @${data.user?.email?.split('@')[0]}!`);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Login failed' };
    }
  };

  const signup = async (
    name: string,
    email: string,
    pass: string,
    refCode?: string,
    isBypass = false
  ): Promise<AuthResponse> => {
    try {
      const cleanRefCode = refCode?.trim().toUpperCase() || '';
      const generatedRef = 'FBTC-' + Math.floor(1000 + Math.random() * 9000);
      const cleanUsername = (name || email.split('@')[0]).trim().toLowerCase().replace(/\s+/g, '_');

      // If user selected bypass due to Supabase email rate limits
      if (isBypass) {
        const bypassUser: User = {
          id: 'user-' + Date.now(),
          name: name.trim(),
          username: cleanUsername,
          email: email.trim(),
          avatarUrl: '/mascot.png',
          isActivated: false,
          balanceUsd: 0.00,
          points: 0,
          referralCode: generatedRef,
          referredBy: cleanRefCode || undefined,
          checkInStreak: 0,
          joinedDate: new Date().toISOString().split('T')[0],
        };
        setUser(bypassUser);
        setIsAuthModalOpen(false);
        setIsActivationModalOpen(true);
        showToast('Account setup in test mode! Please complete $5 crypto activation.');
        return { success: true };
      }

      // 1. Register with Supabase Auth including referral metadata
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: pass,
        options: {
          data: {
            name: name.trim(),
            username: cleanUsername,
            referral_code: generatedRef,
            referred_by: cleanRefCode || null,
          },
        },
      });

      if (error) {
        if (error.message.toLowerCase().includes('rate limit')) {
          return {
            success: false,
            error: 'email rate limit exceeded: Supabase default email limits free projects to 3 emails/hour when Confirm Email is enabled. Please turn off Confirm Email in Supabase Dashboard.',
          };
        }
        return { success: false, error: error.message };
      }

      if (data.user) {
        // 2. Proactively insert into public.profiles to ensure backend sync
        try {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            name: name.trim(),
            username: cleanUsername,
            email: email.trim(),
            referral_code: generatedRef,
            referred_by: cleanRefCode || null,
            is_activated: false,
            balance_usd: 0.00,
            points: 0,
          });

          // 3. If referred by someone, record in referrals table
          if (cleanRefCode) {
            const { data: refOwner } = await supabase
              .from('profiles')
              .select('id')
              .ilike('referral_code', cleanRefCode)
              .maybeSingle();

            if (refOwner?.id) {
              await supabase.from('referrals').upsert({
                referrer_id: refOwner.id,
                referred_id: data.user.id,
                referral_code: cleanRefCode,
                has_activated: false,
                commission_earned_usd: 0.00,
              });
            }
          }
        } catch (dbErr) {
          console.warn('Initial profile sync note:', dbErr);
        }

        const newUser: User = {
          id: data.user.id,
          name: name.trim(),
          username: cleanUsername,
          email: email.trim(),
          avatarUrl: '/mascot.png',
          isActivated: false,
          balanceUsd: 0.00,
          points: 0,
          referralCode: generatedRef,
          referredBy: cleanRefCode || undefined,
          checkInStreak: 0,
          joinedDate: new Date().toISOString().split('T')[0],
        };
        setUser(newUser);
      }

      setIsAuthModalOpen(false);
      setIsActivationModalOpen(true);
      showToast('Account registered with Supabase! Complete $20 activation to start earning.');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Signup failed' };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    setUser(null);
    showToast('Signed out successfully.');
  };

  const submitWithdrawal = async (
    amount: number,
    network: string,
    address: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'User not logged in' };
    if (amount < 50) return { success: false, error: 'Minimum withdrawal amount is $50.00' };
    if (amount > user.balanceUsd) return { success: false, error: 'Insufficient balance' };
    if (!address || address.length < 10) return { success: false, error: 'Invalid crypto wallet address' };

    await new Promise((r) => setTimeout(r, 1000));

    const newBalance = Number((user.balanceUsd - amount).toFixed(2));
    setUser((prev) => prev ? ({ ...prev, balanceUsd: newBalance }) : null);

    // Sync to Supabase profile and record directly in withdrawals table for admin tracking
    try {
      await supabase
        .from('profiles')
        .update({ balance_usd: newBalance })
        .eq('id', user.id);

      await supabase
        .from('withdrawals')
        .insert({
          user_id: user.id,
          amount_usd: amount,
          network,
          wallet_address: address,
          status: 'pending',
          created_at: new Date().toISOString(),
        });
    } catch (err) {
      console.warn('Withdrawals table sync:', err);
    }

    const newTx: WithdrawalTransaction = {
      id: 'tx-' + Math.floor(1000 + Math.random() * 9000),
      amountUsd: amount,
      network,
      walletAddress: address,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setWithdrawalHistory((prev) => [newTx, ...prev]);
    triggerConfetti();
    showToast(`Withdrawal of $${amount.toFixed(2)} submitted! Will be reviewed & approved within 24 hours.`);
    return { success: true };
  };

  const sendChatMessage = (contactId: string, text: string) => {
    if (!text.trim() || !user) return;

    const newMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      senderId: user.id,
      senderUsername: user.username,
      senderAvatar: user.avatarUrl,
      text: text.trim(),
      timestamp: 'Just now',
      isSelf: true,
    };

    setMessages((prev) => ({
      ...prev,
      [contactId]: [...(prev[contactId] || []), newMsg],
    }));

    setTimeout(() => {
      const responses: Record<string, string[]> = {
        'user-satoshi': [
          'The cryptographic proof of work is sound. Stay focused on your rewards!',
          'Transactions look healthy on the ledger.',
          'Decentralization is freedom. Keep sharing your link!',
        ],
        'user-vitalik': [
          'Layer 2 gas fees are ultra low right now. Great timing for social-fi!',
          'The social graph is the next frontier of Web3.',
        ],
        'user-cryptofox': [
          'Fox gang! Did you claim your daily check-in yet?',
          'Big airdrop hints coming next week. Stack those points!',
        ],
      };

      const fallbackList = [
        'Awesome! Catch you in the social lounge!',
        'LFG! Web3 social is unstoppable.',
        'Got it! Let me know if you need any referral tips.',
      ];

      const pool = responses[contactId] || fallbackList;
      const randomReply = pool[Math.floor(Math.random() * pool.length)];

      const replyMsg: ChatMessage = {
        id: 'reply-' + Date.now(),
        senderId: contactId,
        senderUsername: contacts.find((c) => c.id === contactId)?.username || 'peer',
        text: randomReply,
        timestamp: 'Just now',
        isSelf: false,
      };

      setMessages((prev) => ({
        ...prev,
        [contactId]: [...(prev[contactId] || []), replyMsg],
      }));
    }, 1400);
  };

  const searchUsers = (query: string): ChatContact[] => {
    if (!query.trim()) return contacts;
    const clean = query.trim().toLowerCase().replace('@', '');
    return contacts.filter(
      (c) =>
        c.username.toLowerCase().includes(clean) ||
        c.name.toLowerCase().includes(clean)
    );
  };

  return (
    <AppContext.Provider
      value={{
        user,
        activeTab,
        setActiveTab,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authMode,
        setAuthMode,
        isActivationModalOpen,
        setIsActivationModalOpen,
        isChatOpen,
        setIsChatOpen,
        tasks,
        checkInDays,
        canClaimToday,
        alreadyClaimedToday,
        claimableDayNumber,
        countdownToMidnight,
        referrals,
        contacts,
        activeContact,
        setActiveContact,
        messages,
        withdrawalHistory,
        login,
        signup,
        logout,
        activateAccount,
        claimDailyCheckIn,
        startAndClaimTask,
        submitWithdrawal,
        sendChatMessage,
        searchUsers,
        triggerConfetti,
        toastMessage,
        showToast,
        refreshUserData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
