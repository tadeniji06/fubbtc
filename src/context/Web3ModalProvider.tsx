'use client';

import React, { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createAppKit } from '@reown/appkit/react';
import { mainnet, bsc, polygon, arbitrum, optimism, base } from '@reown/appkit/networks';
import { WagmiProvider, type Config } from 'wagmi';
import { wagmiAdapter, projectId } from '@/config/wagmi';

// Initialize React Query client with 1-minute stale time
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000,
    },
  },
});

// Suppress benign telemetry network block errors in dev / client (e.g., adblock / Brave Shields)
if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Analytics SDK') || args[0].includes('AnalyticsSDKApiError'))
    ) {
      return;
    }
    if (args[1]?.context === 'AnalyticsSDKApiError' || args[0]?.context === 'AnalyticsSDKApiError') {
      return;
    }
    originalError.apply(console, args);
  };
}

// Reown AppKit Metadata
const metadata = {
  name: 'Funbtc',
  description: 'Web3 Social-Fi Platform — Earn, Play, Socialize',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://funbtc.io',
  icons: ['https://funbtc.io/mascot.png'],
};

// Initialize Reown AppKit modal singleton
createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [mainnet, bsc, polygon, arbitrum, optimism, base],
  defaultNetwork: bsc, // BSC or Mainnet for low gas USDT fees
  metadata,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#F7931A',
    '--w3m-border-radius-master': '12px',
  },
  features: {
    analytics: false, // Prevents AnalyticsSDKApiError when telemetry calls fail or are blocked
    swaps: false,
    onramp: false,
    email: false,
    socials: [],
  },
});

export function Web3ModalProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
