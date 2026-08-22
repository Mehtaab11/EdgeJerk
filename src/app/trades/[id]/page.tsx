'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { NavigationHeader } from '@/components/layout/NavigationHeader';
import { fetchApi } from '@/lib/api-client';
import { ArrowLeft, Trash2, Calendar, Clock, Image as ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react';

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
        setErrorMsg(res.error || 'Trade record not found');
      }
      setLoading(false);
    }

    loadTradeDetail();
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this trade record?')) return;
    const res = await fetchApi(`/api/trades/${params.id}`, { method: 'DELETE' });
    if (res.success) {
      router.push('/trades');
    } else {
      alert(res.error || 'Failed to delete trade');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#070a12]">
        <NavigationHeader />
        <div className="flex-1 flex items-center justify-center font-mono text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-[#dfff00] animate-ping mr-2"></span>
          Loading Trade Record #{params.id}...
        </div>
      </div>
    );
  }

  if (errorMsg || !trade) {
    return (
      <div className="min-h-screen flex flex-col bg-[#070a12]">
        <NavigationHeader />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono text-xs mb-4">
            {errorMsg || 'Trade record not found'}
          </div>
          <Link href="/trades" className="font-mono text-xs text-[#dfff00] hover:underline flex items-center gap-1.5">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Trade Log</span>
          </Link>
        </div>
      </div>
    );
  }

  const pnl = Number(trade.pnl_currency);
  const isWin = pnl >= 0;

  return (
    <div className="flex-1 flex flex-col min-h-screen pb-16 bg-[#070a12]">
      <NavigationHeader />

      <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full space-y-8">
        <Link href="/trades" className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-400 hover:text-[#dfff00] transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Trade Log</span>
        </Link>

        {/* HEADER BAR */}
        <div className="bg-[#0d1322] border border-slate-800/80 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-3xl font-bold text-white tracking-tight">{trade.asset}</span>
              <span
                className={`font-mono text-xs font-bold uppercase px-3 py-1 rounded-lg border ${
                  trade.direction === 'long'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}
              >
                {trade.direction}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 font-mono text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {trade.entry_time?.replace('T', ' ').slice(0, 16)} UTC
              </span>
              <span>SETUP: <strong className="text-white">{trade.setup_name}</strong></span>
              <span>SESSION: <strong className="text-white uppercase">{trade.session}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <div
                className={`font-mono text-3xl md:text-4xl font-bold tracking-tight ${
                  isWin ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isWin ? `+$${pnl.toFixed(2)}` : `-$${Math.abs(pnl).toFixed(2)}`}
              </div>
              <div className="font-mono text-xs text-slate-400 mt-0.5">
                {Number(trade.r_multiple).toFixed(2)}R ({trade.pnl_percent}%)
              </div>
            </div>

            <button
              onClick={handleDelete}
              className="p-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all"
              title="Delete Trade Record"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PRICE & RISK SUMMARY GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          <div className="bg-[#0d1322] border border-slate-800 p-4 rounded-xl">
            <span className="form-label">ENTRY PRICE</span>
            <span className="font-mono text-sm font-bold text-white">${trade.entry_price}</span>
          </div>
          <div className="bg-[#0d1322] border border-slate-800 p-4 rounded-xl">
            <span className="form-label">EXIT PRICE</span>
            <span className="font-mono text-sm font-bold text-white">${trade.exit_price}</span>
          </div>
          <div className="bg-[#0d1322] border border-slate-800 p-4 rounded-xl">
            <span className="form-label">STOP LOSS</span>
            <span className="font-mono text-sm font-bold text-rose-400">${trade.stop_loss}</span>
          </div>
          <div className="bg-[#0d1322] border border-slate-800 p-4 rounded-xl">
            <span className="form-label">TAKE PROFIT</span>
            <span className="font-mono text-sm font-bold text-[#dfff00]">${trade.take_profit}</span>
          </div>
          <div className="bg-[#0d1322] border border-slate-800 p-4 rounded-xl">
            <span className="form-label">POSITION SIZE</span>
            <span className="font-mono text-sm font-bold text-white">{trade.position_size} {trade.position_size_unit}</span>
          </div>
          <div className="bg-[#0d1322] border border-slate-800 p-4 rounded-xl">
            <span className="form-label">RISK % OF ACCT</span>
            <span className="font-mono text-sm font-bold text-[#dfff00]">{trade.risk_percent_of_account}%</span>
          </div>
        </div>

        {/* SLIPPAGE METRICS VS LINKED PLAN */}
        {trade.slippage && (
          <div className="bg-[#0d1322] border border-slate-800/80 rounded-2xl p-6 shadow-xl">
            <span className="font-sans text-xs font-bold text-slate-300 uppercase tracking-wider block mb-3">
              Pre-Trade Plan Slippage Deviation
            </span>
            <div className="grid grid-cols-3 gap-4 font-mono text-xs">
              <div>
                <span className="text-slate-400">ENTRY SLIPPAGE:</span>{' '}
                <strong className={trade.slippage.entry_slippage > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                  ${trade.slippage.entry_slippage}
                </strong>
              </div>
              <div>
                <span className="text-slate-400">EXIT SLIPPAGE:</span>{' '}
                <strong className={trade.slippage.exit_slippage > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                  ${trade.slippage.exit_slippage}
                </strong>
              </div>
              <div>
                <span className="text-slate-400">TOTAL SLIPPAGE:</span>{' '}
                <strong className={trade.slippage.total_slippage > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                  ${trade.slippage.total_slippage}
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* CHART SCREENSHOTS */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-[#dfff00]" />
            <span className="font-sans text-xs font-bold text-slate-300 uppercase tracking-wider">
              Chart Screenshots Evidence
            </span>
          </div>
          {trade.screenshots && trade.screenshots.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {trade.screenshots.map((s: any) => (
                <div key={s.id} className="border border-slate-800 bg-[#0d1322] rounded-2xl p-3 space-y-3 shadow-xl">
                  <div className="flex justify-between items-center font-mono text-xs text-slate-400">
                    <span className="font-bold uppercase text-[#dfff00]">{s.label} CHART</span>
                    <span>{s.created_at?.slice(0, 10)}</span>
                  </div>
                  <img src={s.storage_url} alt={`${s.label} Chart`} className="w-full h-72 object-cover rounded-xl border border-slate-800" />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 border border-dashed border-slate-800 bg-[#0d1322] rounded-2xl text-center font-mono text-xs text-slate-500">
              No chart screenshots attached to this trade.
            </div>
          )}
        </div>

        {/* PSYCHOLOGY & EXECUTION REVIEW */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#0d1322] border border-slate-800/80 rounded-2xl p-6 shadow-xl font-mono text-xs">
          <div className="space-y-4">
            <div>
              <span className="form-label">EXIT REASON</span>
              <span className="text-white uppercase font-bold text-sm">{trade.exit_reason?.replace('_', ' ')}</span>
            </div>
            <div>
              <span className="form-label">TRADE GRADE</span>
              <span className="text-[#dfff00] font-bold text-sm">{trade.trade_grade} / 5</span>
            </div>
            <div>
              <span className="form-label">EMOTIONAL STATE</span>
              <span className="text-white font-bold text-sm">{trade.emotional_state}</span>
            </div>
            <div>
              <span className="form-label">RULE COMPLIANCE</span>
              <span className={trade.followed_plan ? 'text-emerald-400 font-bold text-sm' : 'text-rose-400 font-bold text-sm'}>
                {trade.followed_plan ? '✓ FOLLOWED PLAN' : '✗ BROKE PLAN'}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <span className="form-label">MISTAKE TAGS</span>
              {trade.mistake_tags && trade.mistake_tags.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {trade.mistake_tags.map((t: any) => (
                    <span key={t.id} className="px-2.5 py-1 rounded-lg border border-rose-500/30 text-rose-400 bg-rose-500/10 text-xs font-semibold">
                      {t.name}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-slate-500">None</span>
              )}
            </div>
            <div>
              <span className="form-label">LESSONS LEARNED</span>
              <p className="text-slate-200 font-sans text-xs mt-1 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                {trade.lessons_learned || 'No lessons notes recorded.'}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
