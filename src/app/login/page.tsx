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
    <div className="min-h-screen bg-[#070a14] flex flex-col justify-center items-center p-4 relative font-sans pb-12">
      {/* BRAND LOGO HEADER */}
      <div className="text-center mb-8 flex flex-col items-center">
        <div className="w-12 h-12 rounded-2xl bg-[#dfff00] flex items-center justify-center text-black font-bold shadow-[0_0_20px_rgba(223,255,0,0.3)] mb-3">
          <Terminal className="w-6 h-6 stroke-[2.5]" />
        </div>
        <h1 className="text-2xl font-black text-white tracking-wider uppercase font-mono">
          TRADER_LOG_V1
        </h1>
        <p className="text-xs font-semibold text-slate-400 tracking-widest mt-1 uppercase font-mono">
          SECURE_CONNECTION_REQUIRED
        </p>
      </div>

      {/* SOFT ROUNDED CARD CONTAINER */}
      <div className="w-full max-w-md bg-[#0d1322] border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-xl relative">
        <div className="text-sm font-bold text-white tracking-wider pb-3 border-b border-slate-800 mb-6 uppercase flex justify-between items-center font-mono">
          <span>{isSignUp ? 'TERMINAL_REGISTER' : 'TERMINAL_LOGIN'}</span>
          <span className="text-xs text-slate-500 font-mono">AUTH_STAGE_01</span>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="form-label text-xs">EMAIL_ADDRESS</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@terminal.sys"
                required
                className="form-input pl-10 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="form-label text-xs">ACCESS_KEY</label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="form-input pl-10 text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#dfff00] text-black font-extrabold text-xs uppercase tracking-wider hover:bg-[#c8e600] transition-all flex items-center justify-center gap-2 border border-transparent shadow-[0_0_15px_rgba(223,255,0,0.2)] disabled:opacity-50 mt-4 cursor-pointer"
          >
            <span>{loading ? 'CONNECTING...' : isSignUp ? 'CREATE ACCOUNT' : 'CONNECT'}</span>
            {!loading && <ArrowRight className="w-4 h-4 stroke-[3]" />}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span>{isSignUp ? 'Existing user?' : 'New user?'}</span>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg(null);
            }}
            className="text-[#dfff00] font-bold hover:underline uppercase font-mono"
          >
            {isSignUp ? 'SWITCH TO LOGIN' : 'CREATE ACCOUNT'}
          </button>
        </div>
      </div>

      {/* CARD SUB-STATUS BAR */}
      <div className="w-full max-w-md flex justify-between items-center mt-4 text-xs font-mono text-slate-400">
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
