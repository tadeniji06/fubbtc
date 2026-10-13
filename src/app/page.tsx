'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
 
  AlertCircle,
  MessageSquare,
  ArrowRight,
 
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { LandingHero } from '@/components/landing/LandingHero';
import { BalanceOverview } from '@/components/dashboard/BalanceOverview';
import { DailyCheckIn } from '@/components/dashboard/DailyCheckIn';
import { SocialTasks } from '@/components/dashboard/SocialTasks';
import { WalletView } from '@/components/wallet/WalletView';
import { ReferralView } from '@/components/referrals/ReferralView';
import { SocialChat } from '@/components/chat/SocialChat';
import { Button } from '@/components/ui/Button';

export default function Home() {
  const {
    user,
    activeTab,
    setActiveTab,
    setIsActivationModalOpen,
    isChatOpen,
    setIsChatOpen,
    setIsAuthModalOpen,
    setAuthMode
  } = useApp();

  return (
    <div className="space-y-8">
      {/* If not authenticated, show the complete Landing View */}
      {!user ? (
        <div className="space-y-12">
          <LandingHero />

          {/* Value Props Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="p-6 rounded-2xl bg-[#121214] border border-zinc-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#F7931A]/10 border border-[#F7931A]/20 flex items-center justify-center text-[#F7931A] font-bold">
                01
              </div>
              <h3 className="text-base font-bold text-white">Daily Streak Engine</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Log in every 24 hours to claim incremental points and cash. Reach Day 7 to unlock the $1.00 jackpot reward.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#121214] border border-zinc-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-btc/10 border border-btc/20 flex items-center justify-center text-[#F7931A] font-bold">
                02
              </div>
              <h3 className="text-base font-bold text-white">Instant Social Bounties</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Connect your social accounts. Follow, retweet, and join verified Web3 spaces to get credited directly to your balance.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#121214] border border-zinc-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#F7931A]/10 border border-[#F7931A]/20 flex items-center justify-center text-[#F7931A] font-bold">
                03
              </div>
              <h3 className="text-base font-bold text-white">Guaranteed Payouts</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Withdraw to USDT (TRC-20, BEP-20) or Native Bitcoin as soon as you hit the modest $15 minimum threshold.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Authenticated Dashboard Core Hub */
        <div className="space-y-6">
          {/* Unactivated Warning Banner */}
          {!user.isActivated && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#18140c] border border-[#F7931A]/50 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_0_20px_rgba(247,147,26,0.08)]"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#F7931A]/20 text-[#F7931A] flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">Account Activation Required</h4>
                    <span className="text-[11px] font-semibold text-[#F7931A] bg-[#F7931A]/15 px-2 py-0.5 rounded-full">
                      $5.00 One-time
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 max-w-xl">
                    A one-time $5 crypto fee is required to activate your account and start earning. You will instantly receive a <strong className="text-white">$2.00 Welcome Bonus</strong> back!
                  </p>
                </div>
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={() => setIsActivationModalOpen(true)}
                rightIcon={<ArrowRight className="w-4 h-4 text-black" />}
                className="flex-shrink-0"
              >
                Activate Account Now
              </Button>
            </motion.div>
          )}

          {/* Navigation Pill Bar on Mobile / Secondary quick bar */}
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white capitalize">
                {activeTab === 'dashboard' && 'Dashboard Overview'}
                {activeTab === 'wallet' && 'Crypto Wallet & Withdrawals'}
                {activeTab === 'referrals' && 'Referral Squad Program'}
                {activeTab === 'chat' && 'Web3 Social Lounge'}
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                {activeTab === 'dashboard' && 'Monitor your live balance, daily streaks, and pending tasks.'}
                {activeTab === 'wallet' && 'Audit your transactions and request crypto payouts.'}
                {activeTab === 'referrals' && 'Grow your network and earn $1.50 on every referral activation.'}
                {activeTab === 'chat' && 'Chat in real-time with other Funbtc members and peers.'}
              </p>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex text-xs font-mono text-zinc-500">
                Logged in as @{user.username}
              </span>
            </div>
          </div>

          {/* Active Tab View */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  <BalanceOverview />
                  <DailyCheckIn />
                  <SocialTasks />
                </div>
              )}

              {activeTab === 'wallet' && <WalletView />}

              {activeTab === 'referrals' && <ReferralView />}

              {activeTab === 'chat' && <SocialChat />}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Floating Chat Trigger Widget (Desktop only, mobile has bottom bar) */}
      {user && activeTab !== 'chat' && (
        <div className="hidden md:block fixed bottom-6 right-6 z-30">
          <Button
            variant="primary"
            size="md"
            onClick={() => setActiveTab('chat')}
            leftIcon={<MessageSquare className="w-4 h-4 text-black" />}
            className="shadow-2xl rounded-full px-5 py-3 border border-black/20"
          >
            Social Chat
          </Button>
        </div>
      )}
    </div>
  );
}
