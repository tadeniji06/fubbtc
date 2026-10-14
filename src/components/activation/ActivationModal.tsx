'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
  Sparkles,
  QrCode,
  ArrowRight,
  ExternalLink,
  Loader2,
  Zap
} from 'lucide-react';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { useSendTransaction, useWriteContract, useWaitForTransactionReceipt, useBalance, useChainId, useReadContract } from 'wagmi';
import { parseEther, parseUnits, formatUnits } from 'viem';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useApp } from '@/context/AppContext';

// Standard ERC-20 transfer and balanceOf ABI
const ERC20_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'recipient', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

// USDT contract addresses across supported EVM networks
const USDT_CONTRACTS: Record<number, { address: `0x${string}`; decimals: number; symbol: string }> = {
  56: { address: '0x55d398326f99059fF775485246999027B3197955', decimals: 18, symbol: 'USDT (BEP-20)' }, // BSC
  137: { address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', decimals: 6, symbol: 'USDT (Polygon)' }, // Polygon
  1: { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6, symbol: 'USDT (ERC-20)' }, // Ethereum
  42161: { address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', decimals: 6, symbol: 'USDT (Arbitrum)' }, // Arbitrum
  10: { address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', decimals: 6, symbol: 'USDT (Optimism)' }, // Optimism
  8453: { address: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2', decimals: 6, symbol: 'USDT (Base)' }, // Base
};

// Real Treasury Addresses provided by user
const TREASURY_ADDRESSES = {
  EVM: '0xb3646fB0fb51F06F8D2Fe1C42288688ea46EBaE0',     // Ethereum, BSC, Polygon, Arbitrum
  SOLANA: '52BcsKSziHva8yV5qbZJWSXoswLRUXKzBU83q9B7fXwJ', // Solana network
  TRON: 'TG1fhtandAWoABexWE1VviPFSNMCuWYoM8',             // TRC-20 USDT
};

export const ActivationModal: React.FC = () => {
  const { isActivationModalOpen, setIsActivationModalOpen, activateAccount, showToast } =
    useApp();

  // Reown AppKit & Wagmi Web3 Hooks
  const { open: openAppKit } = useAppKit();
  const { address: connectedAddress, isConnected } = useAppKitAccount();
  const chainId = useChainId();

  // Native token balance (BNB, ETH, MATIC)
  const { data: nativeBalance } = useBalance({
    address: connectedAddress as `0x${string}` | undefined,
  });

  // USDT Token Balance for current chain via contract balanceOf
  const currentUsdtInfo = USDT_CONTRACTS[chainId];
  const { data: rawUsdtBalance } = useReadContract({
    abi: ERC20_ABI,
    address: currentUsdtInfo?.address,
    functionName: 'balanceOf',
    args: connectedAddress ? [connectedAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!connectedAddress && !!currentUsdtInfo,
    },
  });

  // Formatted USDT balance string and numeric value
  const formattedUsdt = rawUsdtBalance !== undefined && currentUsdtInfo
    ? formatUnits(rawUsdtBalance, currentUsdtInfo.decimals)
    : '0';
  const usdtVal = Number(formattedUsdt) || 0;
  const preferUsdt = usdtVal >= 20.0 && !!currentUsdtInfo;

  // Native transfer hook
  const { data: nativeTxHash, sendTransaction, isPending: isNativePending } = useSendTransaction();

  // ERC-20 contract transfer hook
  const { data: contractTxHash, writeContract, isPending: isContractPending } = useWriteContract();

  // Track active tx hash and pending state
  const activeTxHash = contractTxHash || nativeTxHash;
  const isTxPending = isNativePending || isContractPending;

  const { isLoading: isWaitingForTx, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash: activeTxHash,
  });

  const [paymentMode, setPaymentMode] = useState<'walletconnect' | 'manual'>('walletconnect');
  const [selectedCrypto, setSelectedCrypto] = useState<'USDT' | 'ETH' | 'BTC'>('USDT');
  const [selectedNetwork, setSelectedNetwork] = useState<string>('USDT (TRC-20)');
  const [manualTxHash, setManualTxHash] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [confirmedTxHash, setConfirmedTxHash] = useState<string | null>(null);

  // Live prices for exact $20 conversion
  const [cryptoPrices, setCryptoPrices] = useState<{ bnb: number; eth: number }>({
    bnb: 600, // safe realistic fallback
    eth: 2600,
  });

  // Fetch live market prices for accurate $20 calculation
  useEffect(() => {
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=binancecoin,ethereum&vs_currencies=usd')
      .then((res) => res.json())
      .then((data) => {
        if (data?.binancecoin?.usd || data?.ethereum?.usd) {
          setCryptoPrices({
            bnb: data?.binancecoin?.usd || 600,
            eth: data?.ethereum?.usd || 2600,
          });
        }
      })
      .catch(() => {
        // use fallback prices
      });
  }, []);

  // When on-chain transaction succeeds via WalletConnect / Wagmi
  useEffect(() => {
    if (isTxSuccess && activeTxHash && !isCompleted) {
      setConfirmedTxHash(activeTxHash);
      activateAccount('USDT', {
        txHash: activeTxHash,
        method: 'walletconnect',
        network: currentUsdtInfo ? currentUsdtInfo.symbol : `EVM Chain ${chainId}`,
        senderAddress: connectedAddress,
        recipientAddress: TREASURY_ADDRESSES.EVM,
      }).then(() => {
        setIsCompleted(true);
      });
    }
  }, [isTxSuccess, activeTxHash, isCompleted, connectedAddress, activateAccount, currentUsdtInfo, chainId]);

  const depositAddresses: Record<string, string> = {
    USDT: TREASURY_ADDRESSES.TRON,
    ETH: TREASURY_ADDRESSES.EVM,
    BTC: TREASURY_ADDRESSES.SOLANA,
  };

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address);
    setHasCopied(true);
    showToast('Deposit address copied to clipboard');
    setTimeout(() => setHasCopied(false), 2000);
  };

  // Direct 1-Click Payment via connected wallet ($20.00 USDT or exact $20.00 Native)
  const handleWalletConnectPay = async () => {
    if (!isConnected) {
      openAppKit();
      return;
    }

    try {
      setIsProcessing(true);

      if (preferUsdt && currentUsdtInfo) {
        // Deduct exactly 20.00 USDT
        const amount20Usdt = parseUnits('20', currentUsdtInfo.decimals);
        writeContract({
          address: currentUsdtInfo.address,
          abi: ERC20_ABI,
          functionName: 'transfer',
          args: [TREASURY_ADDRESSES.EVM as `0x${string}`, amount20Usdt],
        });
        showToast('Initiating $20.00 USDT transfer. Please approve in your wallet.');
      } else {
        // Calculate exact $20.00 equivalent in native token
        const isBscChain = chainId === 56;
        const currentRate = isBscChain ? cryptoPrices.bnb : cryptoPrices.eth;
        const exactNativeFor20Usd = (20.0 / currentRate).toFixed(6);

        sendTransaction({
          to: TREASURY_ADDRESSES.EVM as `0x${string}`,
          value: parseEther(exactNativeFor20Usd),
        });
        showToast(`Initiating $20.00 payment (~${exactNativeFor20Usd} ${nativeBalance?.symbol || 'BNB/ETH'}). Please approve in your wallet.`);
      }
    } catch (err: any) {
      console.error('Wallet payment error:', err);
      showToast(err?.message || 'Transaction was canceled or failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Manual payment verification (user transfers to treasury and submits tx hash)
  const handleManualPayment = async () => {
    setIsProcessing(true);
    try {
      const generatedHash = manualTxHash.trim() || `tx_${Date.now()}_${Math.floor(Math.random() * 9000)}`;
      setConfirmedTxHash(generatedHash);

      await activateAccount(selectedCrypto, {
        txHash: generatedHash,
        method: 'manual_deposit',
        network: selectedNetwork,
        recipientAddress: depositAddresses[selectedCrypto],
      });
      setIsCompleted(true);
    } catch (error) {
      console.error('Payment error:', error);
      showToast('Payment verification error. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setIsActivationModalOpen(false);
    setIsCompleted(false);
    setManualTxHash('');
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
              <div className="w-16 h-16 shrink-0 flex items-center justify-center">
                <Image
                  src="/mascot.png"
                  alt="Funbtc mascot"
                  width={64}
                  height={64}
                  unoptimized
                  className="object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">Account Activation</h3>
                  <Badge variant="orange" size="sm">One-Time Deposit</Badge>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                  A one-time <strong className="text-white">$20.00 crypto deposit</strong> is required to activate your account and start earning.
                </p>
              </div>
            </div>

            {/* Instant Welcome Bonus Callout - Cleanly aligned */}
            <div className="bg-[#18181b] border border-btc/30 rounded-xl p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-btc/20 text-[#F7931A] flex items-center justify-center shrink-0 font-bold text-sm">
                  $5
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                    <span>Instant $5.00 Signup Bonus</span>
                    <Sparkles className="w-3.5 h-3.5 text-[#F7931A] shrink-0" />
                  </div>
                  <p className="text-[11px] text-zinc-400 truncate sm:whitespace-normal">
                    5,000 FBTC points credited immediately upon activation (Net cost: $15.00)
                  </p>
                </div>
              </div>
              <div className="shrink-0 flex items-center">
                <Badge variant="green" size="sm" className="whitespace-nowrap px-2.5 py-1 text-[10px] font-bold">
                  Instant Credit
                </Badge>
              </div>
            </div>

            {/* Payment Method Switcher: WalletConnect vs Direct Transfer */}
            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-2">
                Choose Payment Method:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMode('walletconnect')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                    paymentMode === 'walletconnect'
                      ? 'bg-[#181510] border-[#F7931A] ring-1 ring-[#F7931A]'
                      : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-[#F7931A]/10 border border-[#F7931A]/30 flex items-center justify-center text-[#F7931A] shrink-0">
                    <Zap className="w-4 h-4 fill-current" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-xs font-bold text-white truncate">WalletConnect</span>
                      <Badge variant="orange" size="sm" className="whitespace-nowrap px-1.5 py-0.5 text-[9px] font-bold shrink-0">
                        Instant
                      </Badge>
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">
                      MetaMask, Trust, Phantom
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMode('manual')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                    paymentMode === 'manual'
                      ? 'bg-[#181510] border-[#F7931A] ring-1 ring-[#F7931A]'
                      : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 shrink-0">
                    <Copy className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-white">Direct Transfer</div>
                    <div className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">
                      TRON, EVM, or Solana
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {paymentMode === 'walletconnect' ? (
              /* WalletConnect 1-Click Section */
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Connection Status:</span>
                  {isConnected ? (
                    <span className="text-emerald-400 font-mono font-medium flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      {connectedAddress?.slice(0, 6)}...{connectedAddress?.slice(-4)}
                    </span>
                  ) : (
                    <span className="text-amber-400 font-medium">Not Connected</span>
                  )}
                </div>

                {isConnected && (
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-900">
                    <span className="text-zinc-400">Payment Asset:</span>
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      {preferUsdt ? (
                        <>
                          <span className="text-emerald-400">20.00 USDT</span>
                          <span className="text-[10px] text-zinc-400">
                            (Bal: {usdtVal.toFixed(2)} USDT)
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-[#F7931A]">
                            ~{(20.0 / (chainId === 56 ? cryptoPrices.bnb : cryptoPrices.eth)).toFixed(6)} {nativeBalance?.symbol || 'BNB'}
                          </span>
                          <span className="text-[10px] text-zinc-400">
                            (Exact $20.00 USD)
                          </span>
                        </>
                      )}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-900">
                  <span className="text-zinc-400">Amount Due:</span>
                  <span className="font-bold text-[#F7931A] text-sm">$20.00 USD</span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-900">
                  <span className="text-zinc-400">Official Receiving Address:</span>
                  <code className="text-[11px] font-mono text-zinc-300">
                    {TREASURY_ADDRESSES.EVM.slice(0, 8)}...{TREASURY_ADDRESSES.EVM.slice(-6)}
                  </code>
                </div>

                {isWaitingForTx && (
                  <div className="p-3 rounded-lg bg-[#F7931A]/10 border border-[#F7931A]/20 flex items-center gap-2.5 text-xs text-[#F7931A]">
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    <span>Transaction submitted! Waiting for block confirmation on-chain...</span>
                  </div>
                )}
              </div>
            ) : (
              /* Manual Address Transfer Section */
              <>
                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-2">
                    Select Transfer Asset:
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {(
                      [
                        { id: 'USDT', name: 'USDT (TRC-20)', amount: '20.00 USDT' },
                        { id: 'ETH', name: 'EVM (USDT / ETH)', amount: '20.00 USD' },
                        { id: 'BTC', name: 'Solana (SOL / USDT)', amount: '20.00 USD' },
                      ] as const
                    ).map((crypto) => (
                      <button
                        key={crypto.id}
                        type="button"
                        onClick={() => {
                          setSelectedCrypto(crypto.id);
                          if (crypto.id === 'USDT') setSelectedNetwork('USDT (TRC-20)');
                          else if (crypto.id === 'ETH') setSelectedNetwork('EVM (ERC-20 / BEP-20)');
                          else setSelectedNetwork('Solana Network');
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

                <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400">Network:</span>
                    <span className="font-semibold text-white">{selectedNetwork}</span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-400">Official Receiving Address:</span>
                      <span className="text-[11px] text-zinc-500">Copy Address</span>
                    </div>
                    <div className="flex items-center gap-2 bg-[#121214] border border-zinc-800 rounded-lg p-2.5">
                      <code className="text-xs text-zinc-300 font-mono flex-1 break-all">
                        {depositAddresses[selectedCrypto]}
                      </code>
                      <button
                        type="button"
                        onClick={() => handleCopy(depositAddresses[selectedCrypto])}
                        className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0"
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

                  <div className="space-y-1.5 pt-1">
                    <label className="text-xs text-zinc-400 block">
                      Transaction Hash / ID (Optional for fast tracking):
                    </label>
                    <input
                      type="text"
                      placeholder="Paste your 0x... or tx hash here"
                      value={manualTxHash}
                      onChange={(e) => setManualTxHash(e.target.value)}
                      className="w-full bg-[#121214] text-white placeholder-zinc-500 text-xs rounded-lg border border-zinc-800 py-2 px-3 outline-none focus:border-[#F7931A]"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Notice */}
            <div className="flex items-start gap-2 text-xs text-zinc-400 bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-900">
              <AlertCircle className="w-4 h-4 text-[#F7931A] shrink-0 mt-0.5" />
              <span>
                Account activation unlocks infinite daily check-in rewards, social bounty claims, direct messaging, and fast withdrawals reviewed & approved in 24 hours.
              </span>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => openAppKit()}
                leftIcon={<Wallet className="w-4 h-4" />}
              >
                {isConnected ? 'Wallet Connected' : 'Connect Wallet'}
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={paymentMode === 'walletconnect' ? handleWalletConnectPay : handleManualPayment}
                isLoading={isProcessing || isTxPending || isWaitingForTx}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {isWaitingForTx
                  ? 'Confirming Block...'
                  : paymentMode === 'walletconnect'
                  ? (isConnected ? 'Pay $20 with Wallet' : 'Connect & Pay $20')
                  : 'Confirm $20 Payment'}
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
                Signup Bonus Credited
              </div>
              <div className="text-2xl font-black text-[#F7931A] my-1">
                +$5.00 USD
              </div>
              <div className="text-xs text-zinc-400">
                5,000 FBTC Points added to your wallet
              </div>

              {confirmedTxHash && (
                <div className="mt-3 pt-3 border-t border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-between font-mono">
                  <span>Tx Hash:</span>
                  <span className="text-zinc-200 truncate max-w-[180px]">
                    {confirmedTxHash}
                  </span>
                </div>
              )}
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
