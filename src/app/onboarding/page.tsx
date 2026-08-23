'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api-client';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { Terminal, User, DollarSign, ArrowRight, CheckCircle2, Sun, Moon } from 'lucide-react';
import { BottomFooterBar } from '@/components/layout/BottomFooterBar';

export default function OnboardingPage() {
  const router = useRouter();
  const { checkSession, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [displayName, setDisplayName] = useState('');
  const [accountSize, setAccountSize] = useState('10000');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const res = await fetchApi('/api/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify({
        display_name: displayName,
        default_account_size: parseFloat(accountSize) || 10000,
      }),
    });

    setLoading(false);

    if (res.success) {
      await checkSession();
      router.push('/');
    } else {
      setErrorMsg(res.error || 'Could not save profile');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f0f3fa] dark:bg-[#070a14] flex items-center justify-center">
        <div className="text-slate-400 font-mono text-xs animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f3fa] dark:bg-[#070a14] flex flex-col justify-center items-center px-4 py-12 relative font-sans text-slate-900 dark:text-slate-200">
      {/* THEME SWITCHER */}
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>
      </div>

      {/* LOGO */}
      <div className="text-center mb-6 flex flex-col items-center">
        <div className="w-11 h-11 rounded-xl bg-[#2962ff] dark:bg-[#dfff00] flex items-center justify-center text-white dark:text-black font-bold mb-3 shadow-xs">
          <Terminal className="w-6 h-6 stroke-[2.5]" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-wider uppercase font-mono">
          EdgeJerk
        </h1>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider mt-0.5 uppercase font-mono">
          Quick Setup
        </p>
      </div>

      {/* CARD */}
      <div className="w-full max-w-md bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 shadow-sm">
        <div className="text-sm font-bold text-slate-900 dark:text-white tracking-wider pb-3 border-b border-slate-100 dark:border-slate-800 mb-5 uppercase font-mono">
          Finish Your Profile
        </div>

        {/* SUCCESS MESSAGE */}
        <div className="mb-5 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-mono flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          <span>Account created! Two quick things before you start.</span>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-mono">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Your Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Sahil"
                required
                className="form-input pl-10 text-xs"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Shown in your navigation menu</p>
          </div>

          <div>
            <label className="form-label">Account Size ($)</label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                value={accountSize}
                onChange={(e) => setAccountSize(e.target.value)}
                placeholder="10000"
                min="1"
                step="0.01"
                required
                className="form-input pl-10 text-xs"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Your total trading capital, used for risk % math</p>
          </div>

          <button
            type="submit"
            disabled={loading || !displayName.trim()}
            className="w-full py-2.5 rounded-lg bg-[#2962ff] dark:bg-[#dfff00] text-white dark:text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
          >
            <span>{loading ? 'Saving...' : 'Get Started'}</span>
            {!loading && <ArrowRight className="w-4 h-4 stroke-[3]" />}
          </button>
        </form>
      </div>

      <BottomFooterBar />
    </div>
  );
}
