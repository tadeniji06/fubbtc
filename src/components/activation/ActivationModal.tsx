'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Wallet,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
  Sparkles,
  QrCode,
  ArrowRight
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useApp } from '@/context/AppContext';

export const ActivationModal: React.FC = () => {
  const { isActivationModalOpen, setIsActivationModalOpen, activateAccount, showToast } =
    useApp();

  const [selectedCrypto, setSelectedCrypto] = useState<'USDT' | 'ETH' | 'BTC'>('USDT');
  const [selectedNetwork, setSelectedNetwork] = useState<string>('USDT (TRC-20)');
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Mock deposit addresses
  const depositAddresses: Record<string, string> = {
    USDT: 'TYD2v9kHqP6W8R4eF1mK8zLa9sWpXv2Xk',
    ETH: '0x71C...b299e8B8d4c1f9301A',
    BTC: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  };

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address);
    setHasCopied(true);
    showToast('Deposit address copied to clipboard');
    setTimeout(() => setHasCopied(false), 2000);
  };

  /**
   * PLACEHOLDER FUNCTION FOR REAL CRYPTO PAYMENT API:
   * 
   * async function handleRealCryptoPayment(cryptoType: string, txHash: string) {
   *   // 1. Trigger Web3 provider (e.g. wagmi, ethers.js, or Solana wallet-adapter)
   *   // const tx = await signer.sendTransaction({ to: PROTOCOL_TREASURY, value: parseEther("0.002") });
   *   // 2. Or call backend payment verification API (e.g., NowPayments, Coinbase Commerce, Binance Pay):
   *   // const response = await fetch('/api/payments/verify-activation', {
   *   //   method: 'POST',
   *   //   headers: { 'Content-Type': 'application/json' },
   *   //   body: JSON.stringify({ userId, cryptoType, txHash }),
   *   // });
   *   // return await response.json();
   * }
   */
  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      await activateAccount(selectedCrypto);
      setIsCompleted(true);
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setIsActivationModalOpen(false);
    setIsCompleted(false);
  };

  return (
    <Modal
      isOpen={isActivationModalOpen}
      onClose={handleClose}
      maxWidth="lg"
    >
      <AnimatePresence mode="wait">
        {!isCompleted ? (
          <motion.div
            key="checkout"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-5"
          >
            {/* Header info */}
            <div className="flex items-start gap-3.5 pb-2">
              <div className="w-12 h-12 rounded-2xl bg-black border border-zinc-800 p-1 flex-shrink-0 flex items-center justify-center">
                <Image
                  src="/mascot.png"
                  alt="Funbtc mascot"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">Account Activation</h3>
                  <Badge variant="orange" size="sm">One-Time Fee</Badge>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                  A one-time <strong className="text-white">$5.00 crypto fee</strong> is required to activate your account and start earning.
                </p>
              </div>
            </div>

            {/* Instant Welcome Bonus Callout */}
            <div className="bg-[#18181b] border border-[#F7931A]/30 rounded-xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#F7931A]/20 text-[#F7931A] flex items-center justify-center flex-shrink-0 font-bold text-sm">
                  $2
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                    <span>Instant $2.00 Welcome Bonus</span>
                    <Sparkles className="w-3.5 h-3.5 text-[#F7931A]" />
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Immediately credited upon account activation (Net cost: $3.00)
                  </p>
                </div>
              </div>
              <Badge variant="green" size="sm">Instant Credit</Badge>
            </div>

            {/* Crypto Selection tabs */}
            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-2">
                Select Payment Asset:
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {(
                  [
                    { id: 'USDT', name: 'Tether (USDT)', amount: '5.00 USDT' },
                    { id: 'ETH', name: 'Ethereum', amount: '0.0019 ETH' },
                    { id: 'BTC', name: 'Bitcoin', amount: '0.000075 BTC' },
                  ] as const
                ).map((crypto) => (
                  <button
                    key={crypto.id}
                    type="button"
                    onClick={() => {
                      setSelectedCrypto(crypto.id);
                      if (crypto.id === 'USDT') setSelectedNetwork('USDT (TRC-20)');
                      else if (crypto.id === 'ETH') setSelectedNetwork('Ethereum (ERC-20)');
                      else setSelectedNetwork('Bitcoin Native');
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedCrypto === crypto.id
                        ? 'bg-[#181510] border-[#F7931A] ring-1 ring-[#F7931A]'
                        : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="text-xs font-semibold text-white">{crypto.id}</div>
                    <div className="text-[11px] text-[#F7931A] font-medium mt-0.5">{crypto.amount}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Network selector & Address */}
            <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400">Network:</span>
                <span className="font-semibold text-white">{selectedNetwork}</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Deposit Address:</span>
                  <span className="text-[11px] text-zinc-500">Scan QR or Copy</span>
                </div>
                <div className="flex items-center gap-2 bg-[#121214] border border-zinc-800 rounded-lg p-2.5">
                  <code className="text-xs text-zinc-300 font-mono flex-1 truncate">
                    {depositAddresses[selectedCrypto]}
                  </code>
                  <button
                    type="button"
                    onClick={() => handleCopy(depositAddresses[selectedCrypto])}
                    className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    title="Copy address"
                  >
                    {hasCopied ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* QR Mock preview banner */}
              <div className="pt-1 flex items-center justify-between text-xs text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-[#F7931A]" />
                  <span>Compatible with Trust Wallet, Phantom, Metamask</span>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">0 confirmations needed</span>
              </div>
            </div>

            {/* Notice */}
            <div className="flex items-start gap-2 text-xs text-zinc-500 bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-900">
              <AlertCircle className="w-4 h-4 text-zinc-400 flex-shrink-0 mt-0.5" />
              <span>
                Account activation unlocks infinite daily check-in rewards, social bounty claims, direct messaging, and instant withdrawals.
              </span>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => handlePayment()}
                isLoading={isProcessing}
                leftIcon={<Wallet className="w-4 h-4" />}
              >
                Connect Wallet
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handlePayment}
                isLoading={isProcessing}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {isProcessing ? 'Verifying Block...' : 'Pay $5 Now'}
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4 space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">Account Activated!</h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                Welcome to the Funbtc circle. Your account is fully unlocked and ready to earn.
              </p>
            </div>

            {/* Credited Bonus Card */}
            <div className="bg-[#181510] border border-[#F7931A]/40 rounded-xl p-4 max-w-sm mx-auto">
              <div className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">
                Welcome Bonus Credited
              </div>
              <div className="text-2xl font-black text-[#F7931A] my-1">
                +$2.00 USD
              </div>
              <div className="text-xs text-zinc-400">
                2,000 FBTC Points added to your wallet
              </div>
            </div>

            <Button
              type="button"
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleClose}
            >
              Enter Dashboard
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
};
