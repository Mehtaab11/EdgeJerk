'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { NavigationHeader } from '@/components/layout/NavigationHeader';
import { fetchApi } from '@/lib/api-client';

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
      <div className="min-h-screen flex flex-col bg-[#0a0f1e]">
        <NavigationHeader />
        <div className="flex-1 flex items-center justify-center font-mono text-xs text-[#8b949e]">
          LOADING TRADE RECORD #{params.id}...
        </div>
      </div>
    );
  }

  if (errorMsg || !trade) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0a0f1e]">
        <NavigationHeader />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="p-4 bg-[#ff6b6b]/10 border border-[#ff6b6b] text-[#ff6b6b] font-mono text-xs mb-4">
            {errorMsg || 'Trade record not found'}
          </div>
          <Link href="/trades" className="font-mono text-xs text-[#dfff00] underline">
            ← BACK TO TRADE LOG
          </Link>
        </div>
      </div>
    );
  }

  const pnl = Number(trade.pnl_currency);
  const isWin = pnl >= 0;

  return (
    <div className="flex-1 flex flex-col min-h-screen pb-12">
      <NavigationHeader />

      <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full space-y-8">
        {/* HEADER BAR */}
        <div className="flex justify-between items-start border-b border-[#2d3748] pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-2xl font-bold text-white">{trade.asset}</span>
              <span
                className={`font-mono text-xs font-bold uppercase px-2 py-0.5 ${
                  trade.direction === 'long' ? 'bg-[#40e56c] text-[#0a0f1e]' : 'bg-[#ff6b6b] text-white'
                }`}
              >
                {trade.direction}
              </span>
              <span className="font-mono text-xs text-[#8b949e]">
                {trade.entry_time?.replace('T', ' ').slice(0, 16)} UTC
              </span>
            </div>
            <div className="flex gap-4 font-mono text-xs text-[#8b949e]">
              <span>SETUP: <strong className="text-white">{trade.setup_name}</strong></span>
              <span>SESSION: <strong className="text-white uppercase">{trade.session}</strong></span>
              <span>BROKER: <strong className="text-white">{trade.broker_platform}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div
                className={`font-mono text-3xl font-bold ${
                  isWin ? 'text-[#40e56c]' : 'text-[#ff6b6b]'
                }`}
              >
                {isWin ? `+$${pnl.toFixed(2)}` : `-$${Math.abs(pnl).toFixed(2)}`}
              </div>
              <div className="font-mono text-xs text-[#8b949e]">
                {Number(trade.r_multiple).toFixed(2)}R ({trade.pnl_percent}%)
              </div>
            </div>
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 border border-[#ff6b6b] text-[#ff6b6b] font-mono text-xs font-bold hover:bg-[#ff6b6b]/10"
            >
              DELETE
            </button>
          </div>
        </div>

        {/* PRICE & RISK SUMMARY GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
          <div className="bg-[#111624] border border-[#2d3748] p-3">
            <span className="form-label">ENTRY PRICE</span>
            <span className="font-mono text-sm text-white">${trade.entry_price}</span>
          </div>
          <div className="bg-[#111624] border border-[#2d3748] p-3">
            <span className="form-label">EXIT PRICE</span>
            <span className="font-mono text-sm text-white">${trade.exit_price}</span>
          </div>
          <div className="bg-[#111624] border border-[#2d3748] p-3">
            <span className="form-label">STOP LOSS</span>
            <span className="font-mono text-sm text-[#ff6b6b]">${trade.stop_loss}</span>
          </div>
          <div className="bg-[#111624] border border-[#2d3748] p-3">
            <span className="form-label">TAKE PROFIT</span>
            <span className="font-mono text-sm text-[#dfff00]">${trade.take_profit}</span>
          </div>
          <div className="bg-[#111624] border border-[#2d3748] p-3">
            <span className="form-label">POSITION SIZE</span>
            <span className="font-mono text-sm text-white">{trade.position_size} {trade.position_size_unit}</span>
          </div>
          <div className="bg-[#111624] border border-[#2d3748] p-3">
            <span className="form-label">RISK % OF ACCT</span>
            <span className="font-mono text-sm text-[#dfff00]">{trade.risk_percent_of_account}%</span>
          </div>
        </div>

        {/* SLIPPAGE METRICS VS LINKED PLAN */}
        {trade.slippage && (
          <div className="bg-[#111624] border border-[#2d3748] p-4">
            <span className="font-sans text-[11px] font-bold text-[#8b949e] uppercase tracking-wider block mb-3">
              PRE-TRADE PLAN SLIPPAGE DEVIATION
            </span>
            <div className="grid grid-cols-3 gap-4 font-mono text-xs">
              <div>
                <span className="text-[#8b949e]">ENTRY SLIPPAGE:</span>{' '}
                <strong className={trade.slippage.entry_slippage > 0 ? 'text-[#ff6b6b]' : 'text-[#40e56c]'}>
                  ${trade.slippage.entry_slippage}
                </strong>
              </div>
              <div>
                <span className="text-[#8b949e]">EXIT SLIPPAGE:</span>{' '}
                <strong className={trade.slippage.exit_slippage > 0 ? 'text-[#ff6b6b]' : 'text-[#40e56c]'}>
                  ${trade.slippage.exit_slippage}
                </strong>
              </div>
              <div>
                <span className="text-[#8b949e]">TOTAL SLIPPAGE:</span>{' '}
                <strong className={trade.slippage.total_slippage > 0 ? 'text-[#ff6b6b]' : 'text-[#40e56c]'}>
                  ${trade.slippage.total_slippage}
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* CHART SCREENSHOTS */}
        <div className="space-y-3">
          <span className="font-sans text-[11px] font-bold text-[#8b949e] uppercase tracking-wider block">
            CHART SCREENSHOT EVIDENCE
          </span>
          {trade.screenshots && trade.screenshots.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trade.screenshots.map((s: any) => (
                <div key={s.id} className="border border-[#2d3748] bg-[#111624] p-2 space-y-2">
                  <div className="flex justify-between items-center font-mono text-[10px] text-[#8b949e]">
                    <span className="font-bold uppercase text-[#dfff00]">{s.label} CHART</span>
                    <span>{s.created_at?.slice(0, 10)}</span>
                  </div>
                  <img src={s.storage_url} alt={`${s.label} Chart`} className="w-full h-64 object-cover border border-[#2d3748]" />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 border border-dashed border-[#2d3748] bg-[#111624] text-center font-mono text-xs text-[#8b949e]">
              NO CHART SCREENSHOTS ATTACHED
            </div>
          )}
        </div>

        {/* PSYCHOLOGY & EXECUTION REVIEW */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#111624] border border-[#2d3748] p-6 font-mono text-xs">
          <div className="space-y-4">
            <div>
              <span className="form-label">EXIT REASON</span>
              <span className="text-white uppercase font-bold">{trade.exit_reason?.replace('_', ' ')}</span>
            </div>
            <div>
              <span className="form-label">TRADE GRADE</span>
              <span className="text-[#dfff00] font-bold">{trade.trade_grade} / 5</span>
            </div>
            <div>
              <span className="form-label">EMOTIONAL STATE</span>
              <span className="text-white font-bold">{trade.emotional_state}</span>
            </div>
            <div>
              <span className="form-label">RULE COMPLIANCE</span>
              <span className={trade.followed_plan ? 'text-[#40e56c] font-bold' : 'text-[#ff6b6b] font-bold'}>
                {trade.followed_plan ? 'FOLLOWED PLAN' : 'BROKE PLAN'}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <span className="form-label">MISTAKE TAGS</span>
              {trade.mistake_tags && trade.mistake_tags.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-1">
                  {trade.mistake_tags.map((t: any) => (
                    <span key={t.id} className="px-2 py-0.5 border border-[#ff6b6b] text-[#ff6b6b] bg-[#ff6b6b]/10 text-xs">
                      {t.name}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-[#8b949e]">None</span>
              )}
            </div>
            <div>
              <span className="form-label">LESSONS LEARNED</span>
              <p className="text-[#e5e7eb] font-sans text-xs mt-1 leading-relaxed">
                {trade.lessons_learned || 'No lessons notes recorded.'}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
