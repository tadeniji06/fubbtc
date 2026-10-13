'use client';

import React from 'react';
import { LayoutDashboard, Wallet, Users, MessageSquare } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export const MobileBottomNav: React.FC = () => {
  const { user, activeTab, setActiveTab } = useApp();

  if (!user) return null;

  const items = [
    { id: 'dashboard', label: 'Earn', icon: LayoutDashboard },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'referrals', label: 'Squad', icon: Users },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
  ] as const;

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0c0c0e]/95 backdrop-blur-lg border-t border-zinc-800/90 px-3 py-2 flex items-center justify-around pb-[calc(0.5rem+env(safe-area-inset-bottom))]"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-xl transition-all cursor-pointer ${
              isActive
                ? 'text-[#F7931A]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <div
              className={`p-1 rounded-lg transition-colors ${
                isActive ? 'bg-[#F7931A]/15 border border-[#F7931A]/30' : ''
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-semibold tracking-tight mt-0.5">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
