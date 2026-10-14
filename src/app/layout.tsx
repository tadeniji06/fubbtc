import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { Web3ModalProvider } from '@/context/Web3ModalProvider';
import { AppProvider } from '@/context/AppContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AuthModal } from '@/components/auth/AuthModal';
import { ActivationModal } from '@/components/activation/ActivationModal';
import { Toast } from '@/components/ui/Toast';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://funbtc.io'),
  title: {
    default: 'Funbtc — Earn Bitcoin & USDT | Web3 Social-Fi Crypto Rewards',
    template: '%s | Funbtc Web3 Social-Fi',
  },
  description:
    'Funbtc is the premier Web3 Social-Fi ecosystem. Earn free Bitcoin and USDT daily streaks, complete high-paying social bounties, unlock instant crypto cash rewards, and build your referral network with automated payouts.',
  keywords: [
    'Funbtc',
    'earn crypto',
    'earn bitcoin',
    'free crypto rewards',
    'web3 social-fi',
    'earn usdt',
    'crypto bounties',
    'daily crypto check-in',
    'bitcoin faucet',
    'crypto referral program',
    'web3 rewards',
    'crypto passive income',
    'play to earn',
    'degen social network',
    'crypto airdrop',
    'reown walletconnect',
    'instant crypto withdrawals',
  ],
  authors: [{ name: 'Funbtc Labs', url: 'https://funbtc.io' }],
  creator: 'Funbtc Labs',
  publisher: 'Funbtc',
  applicationName: 'Funbtc Social-Fi',
  category: 'finance',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://funbtc.io',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://funbtc.io',
    siteName: 'Funbtc',
    title: 'Funbtc — Earn Bitcoin & USDT | Web3 Social-Fi Platform',
    description:
      'Join thousands earning daily Bitcoin & USDT rewards. Complete social tasks, maintain streaks, and claim instant crypto payouts on Funbtc.',
    images: [
      {
        url: '/mascot.png',
        width: 512,
        height: 512,
        alt: 'Funbtc Official Mascot & Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Funbtc — Earn Bitcoin & USDT | Web3 Social-Fi Platform',
    description:
      'Earn real crypto daily. Complete social bounties, climb leaderboards, and get instant payouts in BTC & USDT.',
    images: ['/mascot.png'],
    creator: '@Funbtc',
  },
  icons: {
    icon: [
      { url: '/mascot.png', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    shortcut: '/mascot.png',
    apple: '/mascot.png',
  },
};

export const viewport = {
  themeColor: '#080808',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen flex flex-col bg-[#080808] text-zinc-100 antialiased selection:bg-[#F7931A] selection:text-black">
        <Web3ModalProvider>
          <AppProvider>
            <Navbar />
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-24 md:pb-6">
              {children}
            </main>
            <Footer />
            <MobileBottomNav />
            <AuthModal />
            <ActivationModal />
            <Toast />
          </AppProvider>
        </Web3ModalProvider>
        {/* Structured Data (Schema.org JSON-LD) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'WebSite',
                  '@id': 'https://funbtc.io/#website',
                  url: 'https://funbtc.io',
                  name: 'Funbtc',
                  description:
                    'Premier Web3 Social-Fi platform to earn Bitcoin and USDT rewards daily.',
                  publisher: {
                    '@type': 'Organization',
                    name: 'Funbtc',
                    logo: {
                      '@type': 'ImageObject',
                      url: 'https://funbtc.io/mascot.png',
                    },
                  },
                },
                {
                  '@type': 'Organization',
                  '@id': 'https://funbtc.io/#organization',
                  name: 'Funbtc',
                  url: 'https://funbtc.io',
                  logo: 'https://funbtc.io/mascot.png',
                  sameAs: ['https://x.com/funbtc', 'https://t.me/funbtc'],
                },
              ],
            }),
          }}
        />
        <Script
          id="microsoft-clarity"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "yxa6mqs0v6");
            `,
          }}
        />
      </body>
    </html>
  );
}
