'use client';

import React, { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createAppKit } from '@reown/appkit/react';
import { mainnet, bsc, polygon, arbitrum, optimism, base } from '@reown/appkit/networks';
import { WagmiProvider, type Config } from 'wagmi';
import { wagmiAdapter, projectId, networks } from '@/config/wagmi';

// Initialize React Query client with 1-minute stale time
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000,
    },
  },
});

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
    analytics: true,
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
