'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Users,
  Copy,
  Check,
  Share2,
  TrendingUp,
  Award,
  Sparkles,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useApp } from '@/context/AppContext';

export const ReferralView: React.FC = () => {
  const { user, referrals, showToast } = useApp();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const referralCode = user?.referralCode || 'FBTC-FOX-7721';
  const referralLink = `https://funbtc.io/join?ref=${referralCode}`;

  const copyToClipboard = (text: string, type: 'code' | 'link') => {
    navigator.clipboard.writeText(text);
    if (type === 'code') {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
    showToast(`${type === 'code' ? 'Referral code' : 'Invite link'} copied to clipboard!`);
  };

  const totalReferred = referrals.length;
  const activatedCount = referrals.filter((r) => r.hasActivated).length;
  const totalEarnedUsd = referrals.reduce((sum, r) => sum + r.commissionEarnedUsd, 0);

  return (
    <div className="space-y-6">
      {/* Referral Program Banner */}
      <Card
        variant="default"
        className="p-6 md:p-8 bg-gradient-to-r from-[#14120e] via-[#121214] to-[#121214] border-zinc-800 relative overflow-hidden"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="orange" size="sm">
                Viral Squad Program
              </Badge>
              <span className="text-xs text-zinc-400 font-medium">Earn $1.50 Per Activation</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Invite Friends & Earn Instant Commissions
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
              Share your referral link with crypto degens, friends, and community members. Earn <strong className="text-white">$1.50 instant cash</strong> on every friend that completes their $5 account activation, plus a lifetime 10% bonus on their daily task points!
            </p>
          </div>

          <div className="flex-shrink-0 w-28 h-28 relative hidden md:block">
            <Image
              src="/mascot.png"
              alt="Funbtc mascot"
              width={112}
              height={112}
              unoptimized
              className="object-contain"
            />
          </div>
        </div>

        {/* Share Boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-zinc-800/80">
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
              Your Unique Referral Code
            </label>
            <div className="flex items-center gap-2 bg-[#161618] border border-zinc-800 rounded-xl p-2.5">
              <span className="font-mono text-sm font-bold text-[#F7931A] px-2 flex-1 tracking-wider">
                {referralCode}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => copyToClipboard(referralCode, 'code')}
                leftIcon={copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              >
                {copiedCode ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
              Your Direct Invite Link
            </label>
            <div className="flex items-center gap-2 bg-[#161618] border border-zinc-800 rounded-xl p-2.5">
              <span className="text-xs text-zinc-400 truncate px-2 flex-1 font-mono">
                {referralLink}
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={() => copyToClipboard(referralLink, 'link')}
                leftIcon={copiedLink ? <Check className="w-3.5 h-3.5 text-black" /> : <Share2 className="w-3.5 h-3.5 text-black" />}
              >
                {copiedLink ? 'Copied' : 'Share Link'}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Referral Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="default" className="p-5 border-zinc-800 bg-[#121214]">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase">
            <span>Total Friends Invited</span>
            <Users className="w-4 h-4 text-[#F7931A]" />
          </div>
          <div className="text-3xl font-black text-white mt-2">
            {totalReferred}
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 inline-block">
            Registered with your code
          </span>
        </Card>

        <Card variant="default" className="p-5 border-zinc-800 bg-[#121214]">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase">
            <span>Activated Members</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400 mt-2">
            {activatedCount}
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 inline-block">
            Paid $5 activation
          </span>
        </Card>

        <Card variant="default" className="p-5 border-zinc-800 bg-[#121214]">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase">
            <span>Commissions Earned</span>
            <TrendingUp className="w-4 h-4 text-[#F7931A]" />
          </div>
          <div className="text-3xl font-black text-white mt-2">
            ${totalEarnedUsd.toFixed(2)}
          </div>
          <span className="text-[11px] text-emerald-400 mt-1 inline-block font-medium">
            Credited directly to wallet
          </span>
        </Card>
      </div>

      {/* Referral Breakdown Table */}
      <Card variant="default" className="p-6 border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-[#F7931A]" />
            <span>Your Referral Squad Members</span>
          </h3>
          <Badge variant="neutral" size="sm">
            {referrals.length} Members
          </Badge>
        </div>

        <div className="overflow-x-auto">
          {referrals.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-3 text-zinc-500">
                <Users className="w-6 h-6 text-[#F7931A]" />
              </div>
              <h4 className="text-sm font-semibold text-white">No referrals yet</h4>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                Share your invite code or link above with friends to start earning $1.50 instant commissions on each activation.
              </p>
            </div>
          ) : (
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 font-semibold uppercase tracking-wider">
                  <th className="pb-3">Username</th>
                  <th className="pb-3">Joined Date</th>
                  <th className="pb-3">Account Status</th>
                  <th className="pb-3 text-right">Commission Earned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {referrals.map((ref) => (
                  <tr key={ref.id} className="text-zinc-300">
                    <td className="py-3 font-semibold text-white flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] text-[#F7931A]">
                        {ref.username.charAt(0).toUpperCase()}
                      </div>
                      <span>@{ref.username}</span>
                    </td>
                    <td className="py-3 text-zinc-500">{ref.joinedDate}</td>
                    <td className="py-3">
                      <Badge
                        variant={ref.hasActivated ? 'green' : 'neutral'}
                        size="sm"
                      >
                        {ref.hasActivated ? 'Activated' : 'Pending Activation'}
                      </Badge>
                    </td>
                    <td className="py-3 text-right font-bold text-[#F7931A]">
                      {ref.hasActivated ? `+$${ref.commissionEarnedUsd.toFixed(2)}` : '$0.00'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
};
