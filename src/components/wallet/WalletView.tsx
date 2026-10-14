'use client';

import React, { useState } from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  AlertCircle,
  Clock,
  ExternalLink,
  Info,
  HelpCircle,
  Zap
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Tooltip } from '@/components/ui/Tooltip';
import { useApp } from '@/context/AppContext';

export const WalletView: React.FC = () => {
  const { user, tasks, referrals, withdrawalHistory, submitWithdrawal, showToast, setIsActivationModalOpen } =
    useApp();

  const [address, setAddress] = useState('');
  const [network, setNetwork] = useState('USDT (TRC-20)');
  const [amount, setAmount] = useState<string>('');
  const [addressError, setAddressError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const balanceUsd = user?.balanceUsd || 0;
  const minThreshold = 50.00;
  const canWithdraw = balanceUsd >= minThreshold && user?.isActivated;

  const handleMax = () => {
    setAmount(balanceUsd.toString());
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.isActivated) {
      setIsActivationModalOpen(true);
      return;
    }

    if (!address.trim() || address.length < 12) {
      setAddressError('Please enter a valid crypto recipient address');
      return;
    }
    setAddressError('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < minThreshold) {
      showToast(`Minimum withdrawal is $${minThreshold.toFixed(2)}`);
      return;
    }
    if (parsedAmount > balanceUsd) {
      showToast('Amount exceeds available balance');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitWithdrawal(parsedAmount, network, address);
      if (res.success) {
        setAmount('');
        setAddress('');
      } else if (res.error) {
        showToast(res.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const taskEarnings = completedTasks.reduce((sum, t) => sum + t.rewardUsd, 0);

  const activatedRefs = referrals.filter((r) => r.hasActivated);
  const refCommissions = referrals.reduce((sum, r) => sum + r.commissionEarnedUsd, 0);

  const welcomeBonus = user?.isActivated ? 5.00 : 0.00;

  return (
    <div className="space-y-6">
      {/* Wallet Header / Balance breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="default" className="p-5 border-zinc-800 bg-[#141416]">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-zinc-400">Total Available</span>
            <Tooltip content="Live withdrawable balance. Reach $50.00 minimum to unlock instant cashouts." position="bottom" iconOnly />
          </div>
          <div className="text-3xl font-black text-white mt-2">
            ${balanceUsd.toFixed(2)}
          </div>
          <span className="text-[11px] text-[#F7931A] font-medium mt-1 inline-block">
            {user?.points.toLocaleString()} Points
          </span>
        </Card>

        <Card variant="default" className="p-5 border-zinc-800 bg-[#141416]">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-zinc-400">Task Earnings</span>
            <Tooltip content="Earnings verified & credited from completing social media bounties." position="bottom" iconOnly />
          </div>
          <div className="text-3xl font-black text-emerald-400 mt-2">
            +${taskEarnings.toFixed(2)}
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 inline-block">
            From {completedTasks.length} completed bounties
          </span>
        </Card>

        <Card variant="default" className="p-5 border-zinc-800 bg-[#141416]">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-zinc-400">Referral Commissions</span>
            <Tooltip content="Earn $1.50 cash instantly whenever a member registers & deposits with your code." position="bottom" iconOnly />
          </div>
          <div className="text-3xl font-black text-white mt-2">
            +${refCommissions.toFixed(2)}
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 inline-block">
            From {activatedRefs.length} activated member{activatedRefs.length === 1 ? '' : 's'}
          </span>
        </Card>

        <Card variant="default" className="p-5 border-zinc-800 bg-[#141416]">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-zinc-400">Signup Bonus</span>
            <Tooltip content="Instant $5.00 USD cash bonus credited back to your balance on $20 activation." position="bottom" iconOnly />
          </div>
          <div className="text-3xl font-black text-[#F7931A] mt-2">
            +${welcomeBonus.toFixed(2)}
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 inline-block">
            {user?.isActivated ? 'Activation credit ($5.00)' : 'Pending activation'}
          </span>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Withdrawal Form */}
        <Card variant="default" className="lg:col-span-2 p-6 border-zinc-800">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-[#F7931A]" />
                <span>Withdraw to Crypto Wallet</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Direct crypto payout to your non-custodial or exchange address. Reviewed within 24 hours.
              </p>
            </div>
            <Badge variant={canWithdraw ? 'green' : 'neutral'} size="sm">
              {canWithdraw ? 'Ready to Withdraw' : 'Locked ($50 Min)'}
            </Badge>
          </div>

          {/* Threshold Progress Bar */}
          <div className="mb-6 p-4 rounded-xl bg-zinc-950/70 border border-zinc-900 space-y-2">
            <ProgressBar
              value={balanceUsd}
              max={minThreshold}
              label="Minimum Withdrawal Threshold"
              sublabel={`$${balanceUsd.toFixed(2)} / $${minThreshold.toFixed(2)}`}
            />
            {!canWithdraw && (
              <div className="flex items-center gap-2 text-xs text-zinc-400 pt-1">
                <Info className="w-3.5 h-3.5 text-zinc-400" />
                <span>
                  You need <strong className="text-[#F7931A]">${Math.max(0, minThreshold - balanceUsd).toFixed(2)} more</strong> in earnings to unlock withdrawals.
                </span>
              </div>
            )}
          </div>

          <form onSubmit={handleWithdraw} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-zinc-300">
                  Select Payout Network
                </label>
                <Tooltip content="USDT on TRC-20 and BEP-20 offers lowest network gas fees and fastest confirmation." position="top" iconOnly />
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { name: 'USDT (TRC-20)', fee: '$0.00 Fee' },
                  { name: 'USDT (BEP-20)', fee: '$0.15 Gas' },
                  { name: 'BTC Native', fee: 'Network Gas' },
                ].map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setNetwork(item.name)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      network === item.name
                        ? 'bg-[#181510] border-[#F7931A] ring-1 ring-[#F7931A]'
                        : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="text-xs font-semibold text-white">{item.name}</div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">{item.fee}</div>
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Recipient Wallet Address"
              placeholder="Paste your TRC20 / BEP20 / BTC address..."
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                setAddressError('');
              }}
              error={addressError}
              leftIcon={<Wallet className="w-4 h-4" />}
            />

            <div>
              <div className="flex justify-between items-center mb-1.5 text-xs">
                <div className="flex items-center gap-1.5">
                  <label className="font-medium text-zinc-300">Withdrawal Amount ($ USD)</label>
                  <Tooltip content="Minimum payout is $50.00 USD. You can withdraw all or part of your balance." position="top" iconOnly />
                </div>
                <button
                  type="button"
                  onClick={handleMax}
                  className="text-[#F7931A] font-semibold hover:underline cursor-pointer"
                >
                  MAX (${balanceUsd.toFixed(2)})
                </button>
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Min $50.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[#141416] text-white placeholder-zinc-500 text-sm rounded-xl border border-zinc-800 focus:border-[#F7931A] focus:ring-1 focus:ring-[#F7931A] py-2.5 px-3.5 outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={!canWithdraw}
                isLoading={isSubmitting}
                rightIcon={<ArrowUpRight className="w-4 h-4" />}
              >
                {canWithdraw ? 'Confirm Withdrawal' : 'Withdrawal Locked (Requires $50.00 Min)'}
              </Button>
            </div>
          </form>
        </Card>

        {/* Withdrawal FAQs & Security Card */}
        <div className="space-y-4">
          <Card variant="default" className="p-5 border-zinc-800 bg-[#121214]">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Withdrawal Policy</span>
            </h4>
            <div className="space-y-3 text-xs text-zinc-400">
              <div className="pb-2 border-b border-zinc-900">
                <div className="flex items-center justify-between mb-0.5">
                  <strong className="text-zinc-200">Minimum Threshold</strong>
                  <Badge variant="orange" size="sm">$50 Min</Badge>
                </div>
                Users can initiate payouts once their balance reaches or exceeds $50.00 USD.
              </div>
              <div className="pb-2 border-b border-zinc-900">
                <div className="flex items-center justify-between mb-0.5">
                  <strong className="text-zinc-200">24-Hour Approval Drop</strong>
                  <Badge variant="green" size="sm">24h Review</Badge>
                </div>
                All withdrawal requests are recorded directly on the platform database and reviewed & approved within 24 hours.
              </div>
              <div>
                <strong className="text-zinc-200 block mb-0.5">Zero Hidden Charges</strong>
                Funbtc does not charge additional platform processing fees for TRC-20 or BEP-20 payouts.
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Transaction History */}
      <Card variant="default" className="p-6 border-zinc-800">
        <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#F7931A]" />
          <span>Withdrawal History</span>
        </h4>

        {withdrawalHistory.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-500">
            No withdrawal transactions recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 font-semibold uppercase tracking-wider">
                  <th className="pb-3">Transaction ID</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Network</th>
                  <th className="pb-3">Recipient Address</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {withdrawalHistory.map((tx) => (
                  <tr key={tx.id} className="text-zinc-300">
                    <td className="py-3 font-mono text-zinc-400">{tx.id}</td>
                    <td className="py-3 font-bold text-white">${tx.amountUsd.toFixed(2)}</td>
                    <td className="py-3">{tx.network}</td>
                    <td className="py-3 font-mono text-zinc-400">{tx.walletAddress}</td>
                    <td className="py-3 text-zinc-500">{tx.createdAt}</td>
                    <td className="py-3 text-right">
                      <Badge
                        variant={tx.status === 'completed' ? 'green' : 'orange'}
                        size="sm"
                      >
                        {tx.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
