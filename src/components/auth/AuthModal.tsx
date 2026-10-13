'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Mail, Lock, User, Gift, ArrowRight, AlertCircle, Zap } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/context/AppContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, authMode, setAuthMode, login, signup } =
    useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (authMode === 'signup' && !name.trim()) {
      errs.name = 'Please enter your username';
    }
    if (!email.trim() || !email.includes('@')) {
      errs.email = 'Please provide a valid email address';
    }
    if (!password || password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;

    setIsLoading(true);
    try {
      if (authMode === 'signup') {
        const res = await signup(name, email, password, referralCode);
        if (!res.success && res.error) {
          setServerError(res.error);
        }
      } else {
        const res = await login(email, password);
        if (!res.success && res.error) {
          setServerError(res.error);
        }
      }
    } catch (err: any) {
      setServerError(err?.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isAuthModalOpen}
      onClose={() => {
        setIsAuthModalOpen(false);
        setServerError(null);
      }}
      maxWidth="md"
    >
      <div className="text-center mb-6">
        <div className="w-24 h-24 mx-auto mb-3 relative flex items-center justify-center">
          <Image
            src="/mascot.png"
            alt="Funbtc Fox Mascot"
            width={96}
            height={96}
            unoptimized
            className="object-contain"
          />
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          {authMode === 'signup' ? 'Create your Funbtc Account' : 'Welcome back to Funbtc'}
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          {authMode === 'signup'
            ? 'Sign up with email to start earning and socializing'
            : 'Access your rewards dashboard and social network'}
        </p>
      </div>

      {serverError && (
        <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 space-y-2">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <strong className="block text-white font-semibold">
                {serverError.toLowerCase().includes('rate limit')
                  ? 'Supabase Email Rate Limit Exceeded'
                  : 'Authentication Error'}
              </strong>
              <p className="mt-0.5 text-zinc-300 leading-relaxed">
                {serverError.toLowerCase().includes('rate limit')
                  ? "Supabase's built-in email provider limits free projects to 3-4 signup emails/hour when 'Confirm email' is enabled."
                  : serverError}
              </p>
            </div>
          </div>

          {serverError.toLowerCase().includes('rate limit') && (
            <div className="pt-2 border-t border-red-500/20 space-y-2">
              <div className="text-[11px] text-zinc-400 bg-black/40 p-2.5 rounded-lg border border-white/5 space-y-1">
                <p className="font-semibold text-white">How to fix permanently (takes 10 seconds):</p>
                <ol className="list-decimal list-inside space-y-0.5 text-zinc-300">
                  <li>Go to <strong>Supabase Dashboard &gt; Authentication &gt; Providers &gt; Email</strong></li>
                  <li>Turn off / uncheck <strong>Confirm email</strong> and click <strong>Save</strong></li>
                </ol>
              </div>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-full text-xs"
                leftIcon={<Zap className="w-3.5 h-3.5 text-[#F7931A]" />}
                onClick={async () => {
                  const bypassUsername = name.trim() || email.split('@')[0] || 'test_fox';
                  await signup(bypassUsername, email, password, referralCode, true);
                }}
              >
                Continue in Test Mode (Bypass Cooldown)
              </Button>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {authMode === 'signup' && (
          <Input
            label="Username"
            placeholder="e.g. satoshi_fox"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setServerError(null);
            }}
            error={errors.name}
            leftIcon={<User className="w-4 h-4" />}
          />
        )}

        <Input
          label="Email Address"
          type="email"
          placeholder="you@domain.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setServerError(null);
          }}
          error={errors.email}
          leftIcon={<Mail className="w-4 h-4" />}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setServerError(null);
          }}
          error={errors.password}
          leftIcon={<Lock className="w-4 h-4" />}
        />

        {authMode === 'signup' && (
          <Input
            label="Referral Code (Optional)"
            placeholder="e.g. FBTC-FOX-7721"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value)}
            helperText="Enter a referral code to join a friend's squad"
            leftIcon={<Gift className="w-4 h-4 text-[#F7931A]" />}
          />
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2"
          isLoading={isLoading}
          rightIcon={<ArrowRight className="w-4 h-4 text-black" />}
        >
          {authMode === 'signup' ? 'Create Account' : 'Sign In'}
        </Button>
      </form>

      <div className="mt-5 text-center text-xs text-zinc-400">
        {authMode === 'signup' ? (
          <p>
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => {
                setErrors({});
                setServerError(null);
                setAuthMode('login');
              }}
              className="text-[#F7931A] font-semibold hover:underline ml-1 cursor-pointer"
            >
              Sign In
            </button>
          </p>
        ) : (
          <p>
            Don't have an account yet?{' '}
            <button
              type="button"
              onClick={() => {
                setErrors({});
                setServerError(null);
                setAuthMode('signup');
              }}
              className="text-[#F7931A] font-semibold hover:underline ml-1 cursor-pointer"
            >
              Sign Up
            </button>
          </p>
        )}
      </div>
    </Modal>
  );
};
