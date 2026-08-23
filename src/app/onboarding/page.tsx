'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api-client';
import { useAuthStore } from '@/stores/authStore';
import { Terminal, User, DollarSign, ArrowRight, CheckCircle2 } from 'lucide-react';
import { BottomFooterBar } from '@/components/layout/BottomFooterBar';

export default function OnboardingPage() {
  const router = useRouter();
  const { checkSession, isAuthenticated, isLoading: authLoading } = useAuthStore();
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
      <div className="min-h-screen bg-[#070a14] flex items-center justify-center">
        <div className="text-slate-400 font-mono text-xs animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070a14] flex flex-col justify-center items-center px-4 py-12 relative font-sans">
      {/* LOGO */}
      <div className="text-center mb-8 flex flex-col items-center">
        <div className="w-12 h-12 rounded-2xl bg-[#dfff00] flex items-center justify-center text-black font-bold shadow-[0_0_20px_rgba(223,255,0,0.3)] mb-3">
          <Terminal className="w-6 h-6 stroke-[2.5]" />
        </div>
        <h1 className="text-2xl font-black text-white tracking-wider uppercase font-mono">
          EdgeJerk
        </h1>
        <p className="text-xs font-semibold text-slate-400 tracking-widest mt-1 uppercase font-mono">
          Quick Setup
        </p>
      </div>

      {/* CARD */}
      <div className="w-full max-w-md bg-[#0d1322] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
        <div className="text-sm font-bold text-white tracking-wider pb-3 border-b border-slate-800 mb-5 uppercase font-mono">
          Finish Your Profile
        </div>

        {/* SUCCESS MESSAGE */}
        <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          <span>Account created! Two quick things before you start.</span>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="form-label">Your Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Sahil"
                required
                className="form-input pl-10 text-xs"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1.5">Shown in your sidebar</p>
          </div>

          <div>
            <label className="form-label">Account Size ($)</label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
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
            <p className="text-[10px] text-slate-500 mt-1.5">Your total trading capital, used for risk % math</p>
          </div>

          <button
            type="submit"
            disabled={loading || !displayName.trim()}
            className="w-full py-3 rounded-xl bg-[#dfff00] text-black font-extrabold text-xs uppercase tracking-wider hover:bg-[#c8e600] transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(223,255,0,0.2)] disabled:opacity-50 mt-2 cursor-pointer"
          >
            <span>{loading ? 'Saving...' : 'Get Started'}</span>
            {!loading && <ArrowRight className="w-4 h-4 stroke-[3]" />}
          </button>
        </form>
      </div>

      {/* STATUS */}
      <div className="w-full max-w-md flex justify-between items-center mt-4 text-xs font-mono text-slate-400">
        <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Online
        </span>
        <span className="text-slate-500">v2.4.1</span>
      </div>

      <BottomFooterBar />
    </div>
  );
}
