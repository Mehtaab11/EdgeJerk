'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api-client';
import { useAuthStore } from '@/stores/authStore';
import { Terminal, Lock, Mail, ArrowRight } from 'lucide-react';

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
    <div className="min-h-screen bg-[#070a12] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute w-[500px] h-[500px] bg-[#dfff00]/5 rounded-full blur-[120px] pointer-events-none -top-40 -left-40"></div>
      <div className="absolute w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none -bottom-20 -right-20"></div>

      <div className="w-full max-w-md bg-[#0d1322]/90 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-xl relative z-10">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-12 h-12 rounded-xl bg-[#dfff00] flex items-center justify-center text-black font-bold shadow-[0_0_20px_rgba(223,255,0,0.3)] mb-3">
            <Terminal className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h1 className="font-mono text-xl font-bold text-white tracking-tight">
            EDGEJERK <span className="text-xs bg-slate-800 text-[#dfff00] px-2 py-0.5 rounded border border-slate-700 font-mono">v1.0</span>
          </h1>
          <p className="text-xs font-medium text-slate-400 mt-1">
            Quantitative Performance & Trading Journal
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono text-xs leading-relaxed">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="form-label flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="trader@terminal.sys"
              required
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              Access Key / Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="form-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#dfff00] text-black font-semibold text-xs uppercase tracking-wider hover:bg-[#c8e600] transition-all shadow-[0_0_15px_rgba(223,255,0,0.25)] flex items-center justify-center gap-2 border border-transparent disabled:opacity-50 mt-2"
          >
            <span>{loading ? 'Connecting...' : isSignUp ? 'Create Account' : 'Connect Terminal'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-800/80 flex justify-between items-center text-xs">
          <span className="text-slate-400">
            {isSignUp ? 'Already registered?' : 'Need an account?'}
          </span>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg(null);
            }}
            className="text-[#dfff00] font-semibold hover:underline uppercase"
          >
            {isSignUp ? 'Switch to Login' : 'Create Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
