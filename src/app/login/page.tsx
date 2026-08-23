'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchApi } from '@/lib/api-client';
import { useAuthStore } from '@/stores/authStore';
import { createClient } from '@/lib/supabase/client';
import { Terminal, Mail, Key, ArrowRight, User, DollarSign } from 'lucide-react';
import { BottomFooterBar } from '@/components/layout/BottomFooterBar';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { checkSession } = useAuthStore();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [accountSize, setAccountSize] = useState('10000');
  const [errorMsg, setErrorMsg] = useState<string | null>(
    searchParams.get('error') ? 'Something went wrong. Try again.' : null
  );
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    if (isSignUp) {
      const res = await fetchApi('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          display_name: displayName || undefined,
          default_account_size: parseFloat(accountSize) || 10000,
        }),
      });

      setLoading(false);

      if (res.success) {
        await checkSession();
        router.push('/');
      } else {
        setErrorMsg(res.error || 'Could not create account');
      }
    } else {
      const res = await fetchApi('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      setLoading(false);

      if (res.success) {
        await checkSession();
        router.push('/');
      } else {
        setErrorMsg(res.error || 'Wrong email or password');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setErrorMsg(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (error) {
        setErrorMsg(error.message);
        setGoogleLoading(false);
      }
    } catch {
      setErrorMsg('Google sign-in failed');
      setGoogleLoading(false);
    }
  };

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
          Your trading journal
        </p>
      </div>

      {/* FORM CARD */}
      <div className="w-full max-w-md bg-[#0d1322] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
        <div className="text-sm font-bold text-white tracking-wider pb-3 border-b border-slate-800 mb-5 uppercase flex justify-between items-center font-mono">
          <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
            {errorMsg}
          </div>
        )}

        {/* GOOGLE BUTTON */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="w-full py-3 rounded-xl bg-white/5 border border-slate-700 text-white font-semibold text-xs uppercase tracking-wider hover:bg-white/10 transition-all flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          <span>{googleLoading ? 'Redirecting...' : 'Continue with Google'}</span>
        </button>

        {/* DIVIDER */}
        <div className="flex items-center gap-4 my-5">
          <div className="flex-1 h-px bg-slate-800"></div>
          <span className="text-xs text-slate-500 font-mono">or</span>
          <div className="flex-1 h-px bg-slate-800"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* SIGNUP-ONLY FIELDS */}
          {isSignUp && (
            <>
              <div>
                <label className="form-label">Your Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Sahil"
                    className="form-input pl-10 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Account Size ($)</label>
                <p className="text-[10px] text-slate-500 mb-1.5">Your total trading capital</p>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    value={accountSize}
                    onChange={(e) => setAccountSize(e.target.value)}
                    placeholder="10000"
                    min="1"
                    step="0.01"
                    className="form-input pl-10 text-xs"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="form-label">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                required
                className="form-input pl-10 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="form-label">Password</label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="form-input pl-10 text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#dfff00] text-black font-extrabold text-xs uppercase tracking-wider hover:bg-[#c8e600] transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(223,255,0,0.2)] disabled:opacity-50 mt-2 cursor-pointer"
          >
            <span>{loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}</span>
            {!loading && <ArrowRight className="w-4 h-4 stroke-[3]" />}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span>{isSignUp ? 'Have an account?' : 'No account yet?'}</span>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg(null);
            }}
            className="text-[#dfff00] font-bold hover:underline font-mono"
          >
            {isSignUp ? 'Sign In' : 'Create Account'}
          </button>
        </div>
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#070a14] flex items-center justify-center">
        <div className="text-slate-400 font-mono text-xs animate-pulse">Loading...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
