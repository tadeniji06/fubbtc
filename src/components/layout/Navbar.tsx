'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Wallet,
  LayoutDashboard,
  Users,
  MessageSquare,
  Sparkles,
  LogOut,
  User,
  Menu,
  X,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useApp } from '@/context/AppContext';

export const Navbar: React.FC = () => {
  const {
    user,
    activeTab,
    setActiveTab,
    setIsAuthModalOpen,
    setAuthMode,
    setIsActivationModalOpen,
    logout,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'referrals', label: 'Referrals', icon: Users },
    { id: 'chat', label: 'Social Chat', icon: MessageSquare },
  ] as const;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#080808]/90 backdrop-blur-md border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand & Mascot */}
        <div className="flex items-center gap-6">
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-12 h-12 flex items-center justify-center transition-transform group-hover:scale-105 flex-shrink-0">
              <Image
                src="/mascot.png"
                alt="Funbtc mascot"
                width={48}
                height={48}
                priority
                unoptimized
                className="object-contain select-none"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-tight text-white">Funbtc</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#F7931A]" />
              </div>
              <div className="text-[10px] text-zinc-400 font-mono tracking-wider -mt-0.5">
                earn.play.socialize
              </div>
            </div>
          </div>

          {/* Desktop Nav Items */}
          {user && (
            <nav className="hidden md:flex items-center gap-1 ml-4 bg-[#121214] border border-zinc-800/80 p-1 rounded-xl">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#1e1e24] text-white shadow-sm border border-zinc-700/60'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#F7931A]' : 'text-zinc-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          )}
        </div>

        {/* Right Action / Profile */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2.5">
              {/* Live Balance Pill */}
              <button
                onClick={() => setActiveTab('wallet')}
                className="hidden sm:flex items-center gap-2 bg-[#121214] hover:bg-zinc-800/60 border border-zinc-800 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
              >
                <div className="w-2 h-2 rounded-full bg-[#F7931A]" />
                <span className="text-xs font-bold text-white">${user.balanceUsd.toFixed(2)}</span>
                <span className="text-[11px] text-zinc-400 font-medium">({user.points.toLocaleString()} pts)</span>
              </button>

              {/* Activation Status */}
              {!user.isActivated ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsActivationModalOpen(true)}
                  leftIcon={<AlertCircle className="w-3.5 h-3.5 text-black" />}
                >
                  Activate ($20)
                </Button>
              ) : (
                <Badge variant="orange" size="sm" className="hidden lg:inline-flex">
                  Tier 1
                </Badge>
              )}

              {/* User Dropdown / Logout */}
              <div className="flex items-center gap-1.5 pl-1">
                <button
                  onClick={logout}
                  title="Sign Out"
                  aria-label="Sign Out"
                  className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800/80 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Open mobile menu"
                className="md:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setAuthMode('login');
                  setIsAuthModalOpen(true);
                }}
              >
                Log In
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setAuthMode('signup');
                  setIsAuthModalOpen(true);
                }}
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      {user && mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-800/80 bg-[#0c0c0e] px-4 py-3 space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-900 text-xs">
            <span className="text-zinc-400">Balance:</span>
            <span className="font-bold text-white">${user.balanceUsd.toFixed(2)} USD</span>
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-[#18181b] text-white border border-zinc-700/60'
                    : 'text-zinc-400 hover:bg-zinc-900 text-left'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#F7931A]' : 'text-zinc-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
