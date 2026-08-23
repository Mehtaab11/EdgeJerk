'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SidebarNav } from '@/components/layout/SidebarNav';
import { TopHeaderBar } from '@/components/layout/TopHeaderBar';
import { BottomFooterBar } from '@/components/layout/BottomFooterBar';
import { fetchApi } from '@/lib/api-client';
import { ArrowLeft, Trash2, Calendar, Image as ImageIcon } from 'lucide-react';

interface Params {
  params: {
    id: string;
  };
}

export default function TradeDetailPage({ params }: Params) {
  const router = useRouter();
  const [trade, setTrade] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadTradeDetail() {
      setLoading(true);
      const res = await fetchApi(`/api/trades/${params.id}`);
      if (res.success && res.data) {
        setTrade(res.data);
      } else {
        setErrorMsg(res.error || 'Trade not found');
      }
      setLoading(false);
    }

    loadTradeDetail();
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this trade?')) return;
    const res = await fetchApi(`/api/trades/${params.id}`, { method: 'DELETE' });
    if (res.success) {
      router.push('/trades');
    } else {
      alert(res.error || 'Could not delete trade');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f0f3fa] dark:bg-[#070a14] text-slate-900 dark:text-slate-200">
        <TopHeaderBar />
        <SidebarNav />
        <div className="flex-1 flex items-center justify-center font-mono text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-[#2962ff] animate-ping mr-2"></span>
          Loading trade #{params.id}...
        </div>
      </div>
    );
  }

  if (errorMsg || !trade) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f0f3fa] dark:bg-[#070a14] text-slate-900 dark:text-slate-200">
        <TopHeaderBar />
        <SidebarNav />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-mono text-xs mb-4">
            {errorMsg || 'Trade not found'}
          </div>
          <Link href="/trades" className="font-mono text-xs text-[#2962ff] hover:underline flex items-center gap-1.5">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Trade Log</span>
          </Link>
        </div>
      </div>
    );
  }

  const pnl = Number(trade.pnl_currency);
  const isWin = pnl >= 0;

  // Parse multi-emotion states
  const emotionList: string[] = Array.isArray(trade.emotional_state)
    ? trade.emotional_state
    : typeof trade.emotional_state === 'string'
    ? trade.emotional_state.split(',').map((s: string) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f3fa] dark:bg-[#070a14] text-slate-900 dark:text-slate-200 pb-36 font-sans">
      <TopHeaderBar />
      <SidebarNav />

      <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-5xl mx-auto w-full space-y-6">
        <Link href="/trades" className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-500 dark:text-slate-400 hover:text-[#2962ff] transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Trade Log</span>
        </Link>

        {/* HEADER CARD */}
        <div className="bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800/80 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{trade.asset}</span>
              <span
                className={`font-mono text-xs font-bold uppercase px-2.5 py-1 rounded-md border ${
                  trade.direction === 'long'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                }`}
              >
                {trade.direction}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 font-mono text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {trade.entry_time?.replace('T', ' ').slice(0, 16)} UTC
              </span>
              <span>Strategy: <strong className="text-slate-900 dark:text-white">{trade.setup_name}</strong></span>
              <span>Session: <strong className="text-slate-900 dark:text-white uppercase">{trade.session}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <div
                className={`font-mono text-3xl md:text-4xl font-bold tracking-tight ${
                  isWin ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {isWin ? `+$${pnl.toFixed(2)}` : `-$${Math.abs(pnl).toFixed(2)}`}
              </div>
              <div className="font-mono text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {Number(trade.r_multiple).toFixed(2)}R ({trade.pnl_percent}%)
              </div>
            </div>

            <button
              onClick={handleDelete}
              className="p-2.5 rounded-lg border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all cursor-pointer"
              title="Delete Trade"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PRICES & RISK GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
          <div className="bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
            <span className="form-label">Entry</span>
            <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">${trade.entry_price}</span>
          </div>
          <div className="bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
            <span className="form-label">Exit</span>
            <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">${trade.exit_price}</span>
          </div>
          <div className="bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
            <span className="form-label">Stop Loss</span>
            <span className="font-mono text-sm font-bold text-rose-600 dark:text-rose-400">${trade.stop_loss}</span>
          </div>
          <div className="bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
            <span className="form-label">Target</span>
            <span className="font-mono text-sm font-bold text-[#2962ff] dark:text-[#388bfd]">${trade.take_profit}</span>
          </div>
          <div className="bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
            <span className="form-label">Size</span>
            <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">{trade.position_size} {trade.position_size_unit}</span>
          </div>
          <div className="bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
            <span className="form-label">Risk %</span>
            <span className="font-mono text-sm font-bold text-[#2962ff] dark:text-[#388bfd]">{trade.risk_percent_of_account}%</span>
          </div>
        </div>

        {/* SCREENSHOTS */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-[#2962ff]" />
            <span className="font-sans text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">
              Screenshots
            </span>
          </div>
          {trade.screenshots && trade.screenshots.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {trade.screenshots.map((s: any) => (
                <div key={s.id} className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1322] rounded-xl p-3 space-y-3 shadow-xs">
                  <div className="flex justify-between items-center font-mono text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-bold uppercase text-[#2962ff]">{s.label}</span>
                    <span>{s.created_at?.slice(0, 10)}</span>
                  </div>
                  <img src={s.storage_url} alt={`${s.label} Chart`} className="w-full h-72 object-cover rounded-lg border border-slate-200 dark:border-slate-800" />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1322] rounded-xl text-center font-mono text-xs text-slate-400">
              No screenshots attached
            </div>
          )}
        </div>

        {/* MINDSET & EXECUTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800/80 rounded-xl p-6 shadow-xs font-mono text-xs">
          <div className="space-y-4">
            <div>
              <span className="form-label">Exit Reason</span>
              <span className="text-slate-900 dark:text-white uppercase font-bold text-sm">{trade.exit_reason?.replace('_', ' ')}</span>
            </div>
            <div>
              <span className="form-label">Execution Rating</span>
              <span className="text-[#2962ff] dark:text-[#388bfd] font-bold text-sm">{trade.trade_grade} / 5</span>
            </div>
            <div>
              <span className="form-label">Mindset / Emotions</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {emotionList.length > 0 ? (
                  emotionList.map((em) => (
                    <span key={em} className="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-[#2962ff] dark:text-[#388bfd] font-semibold text-xs">
                      {em}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-500 font-sans">None recorded</span>
                )}
              </div>
            </div>
            <div>
              <span className="form-label">Followed Plan?</span>
              <span className={trade.followed_plan ? 'text-emerald-600 dark:text-emerald-400 font-bold text-sm' : 'text-rose-600 dark:text-rose-400 font-bold text-sm'}>
                {trade.followed_plan ? '✓ Yes' : '✗ No'}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <span className="form-label">Mistakes</span>
              {trade.mistake_tags && trade.mistake_tags.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {trade.mistake_tags.map((t: any) => (
                    <span key={t.id} className="px-2.5 py-1 rounded-md border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 text-xs font-semibold">
                      {t.name}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-slate-400">None</span>
              )}
            </div>
            <div>
              <span className="form-label">Notes & Lessons</span>
              <p className="text-slate-700 dark:text-slate-200 font-sans text-xs mt-1 leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                {trade.lessons_learned || 'No notes added.'}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
