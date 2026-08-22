'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api-client';
import { useAuthStore } from '@/stores/authStore';

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
    <div className="min-h-screen grid-bg flex flex-col justify-center items-center p-4 bg-[#0a0f1e]">
      <div className="w-full max-w-md bg-[#111624] border border-[#2d3748] p-8 shadow-none">
        <div className="text-center mb-8">
          <div className="font-mono text-sm font-bold text-[#dfff00] tracking-tighter mb-1">
            TRADER_LOG_V1
          </div>
          <span className="font-sans text-[10px] font-bold text-[#8b949e] uppercase tracking-widest">
            SECURE_TERMINAL_AUTHENTICATION
          </span>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 bg-[#ff6b6b]/10 border border-[#ff6b6b] text-[#ff6b6b] font-mono text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="form-label">EMAIL ADDRESS</label>
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
            <label className="form-label">ACCESS KEY / PASSWORD</label>
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
            className="w-full py-3 bg-[#dfff00] text-[#0a0f1e] font-sans font-bold text-xs uppercase tracking-wider hover:bg-[#c8e600] transition-colors border border-transparent disabled:opacity-50"
          >
            {loading ? 'CONNECTING...' : isSignUp ? 'CREATE ACCOUNT' : 'CONNECT TERMINAL'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-[#2d3748] flex justify-between items-center font-mono text-xs">
          <span className="text-[#8b949e]">
            {isSignUp ? 'Already registered?' : 'Need an account?'}
          </span>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg(null);
            }}
            className="text-[#dfff00] hover:underline uppercase font-bold"
          >
            {isSignUp ? 'SWITCH TO LOGIN' : 'CREATE ACCOUNT'}
          </button>
        </div>
      </div>
    </div>
  );
}
