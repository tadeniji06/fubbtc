import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
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
  title: 'Funbtc — earn.play.socialize | Web3 Social-Fi Hub',
  description:
    'Sleek Web3 social-fi platform. Earn real crypto rewards, maintain daily streaks, complete bounties, and connect with fellow degens.',
  icons: {
    icon: '/mascot.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen flex flex-col bg-[#080808] text-zinc-100 antialiased selection:bg-[#F7931A] selection:text-black">
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
      </body>
    </html>
  );
}
