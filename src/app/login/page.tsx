'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api-client';
import { useAuthStore } from '@/stores/authStore';
import { Terminal, Mail, Key, ArrowRight } from 'lucide-react';
import { BottomFooterBar } from '@/components/layout/BottomFooterBar';

export default function LoginPage() {
  const router = useRouter();
  const { checkSession } = useAuthStore();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const endpoint = isSignUp ? '/api/auth/signup' : '/api/auth/login';
    const res = await fetchApi(endpoint, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);

    if (res.success) {
      await checkSession();
      router.push('/');
    } else {
      setErrorMsg(res.error || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#070a14] grid-bg flex flex-col justify-center items-center p-4 relative font-mono pb-12">
      {/* BRAND LOGO HEADER */}
      <div className="text-center mb-6 flex flex-col items-center">
        <div className="w-10 h-10 rounded bg-[#0f1526] border border-[#1d2640] flex items-center justify-center text-[#dfff00] mb-3">
          <Terminal className="w-5 h-5" />
        </div>
        <h1 className="text-2xl font-black text-[#dfff00] tracking-wider uppercase">
          TRADER_LOG_V1
        </h1>
        <p className="text-[11px] font-bold text-slate-400 tracking-widest mt-1 uppercase">
          SECURE_CONNECTION_REQUIRED
        </p>
      </div>

      {/* CARD CONTAINER WITH LIME CORNER BRACKETS */}
      <div className="w-full max-w-md bg-[#111624] border border-[#1d2640] p-8 corner-brackets shadow-2xl relative">
        <div className="text-sm font-bold text-white tracking-wider pb-3 border-b border-[#1d2640] mb-6 uppercase flex justify-between items-center">
          <span>{isSignUp ? 'TERMINAL_REGISTER' : 'TERMINAL_LOGIN'}</span>
          <span className="text-[10px] text-slate-500 font-mono">AUTH_STAGE_01</span>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500 text-rose-400 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="form-label text-[10px]">EMAIL_ADDRESS</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@terminal.sys"
                required
                className="form-input pl-9 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="form-label text-[10px]">ACCESS_KEY</label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="form-input pl-9 text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#dfff00] text-black font-black text-xs uppercase tracking-wider hover:bg-[#c8e600] transition-all flex items-center justify-center gap-2 border border-transparent disabled:opacity-50 mt-4 cursor-pointer"
          >
            <span>{loading ? 'CONNECTING...' : isSignUp ? 'CREATE ACCOUNT' : 'CONNECT'}</span>
            {!loading && <ArrowRight className="w-4 h-4 stroke-[3]" />}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#1d2640] flex justify-between items-center text-xs text-slate-400">
          <span>{isSignUp ? 'Existing user?' : 'New user?'}</span>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg(null);
            }}
            className="text-[#dfff00] font-bold hover:underline uppercase"
          >
            {isSignUp ? 'SWITCH TO LOGIN' : 'CREATE ACCOUNT'}
          </button>
        </div>
      </div>

      {/* CARD SUB-STATUS BAR */}
      <div className="w-full max-w-md flex justify-between items-center mt-4 text-[11px] font-mono text-slate-400">
        <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          SYS_ONLINE
        </span>
        <span className="text-slate-500">V.2.4.1</span>
      </div>

      {/* BOTTOM FOOTER BAR */}
      <BottomFooterBar />
    </div>
  );
}
