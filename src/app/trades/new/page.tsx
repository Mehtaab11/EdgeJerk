'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarNav } from '@/components/layout/SidebarNav';
import { TopHeaderBar } from '@/components/layout/TopHeaderBar';
import { BottomFooterBar } from '@/components/layout/BottomFooterBar';
import { SegmentedToggle } from '@/components/ui/SegmentedToggle';
import { EmotionSelect } from '@/components/ui/EmotionSelect';
import { TradeGradeDial } from '@/components/ui/TradeGradeDial';
import { TagChipSelect } from '@/components/ui/TagChipSelect';
import { ScreenshotDropzone } from '@/components/ui/ScreenshotDropzone';
import { fetchApi } from '@/lib/api-client';
import { calculateTradeMetrics } from '@/lib/utils/trade-calculations';
import { TradeDirection, ExitReason, EmotionalState, TradeSession } from '@/types/database.types';
import { FileText, Compass, DollarSign, Target, CheckCircle2, HeartHandshake, Save, Clock } from 'lucide-react';

export default function NewTradePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Section 0: Plan state
  const [hasPlan, setHasPlan] = useState(false);
  const [plannedEntry, setPlannedEntry] = useState('');
  const [plannedStop, setPlannedStop] = useState('');
  const [plannedTarget, setPlannedTarget] = useState('');
  const [planThesis, setPlanThesis] = useState('');

  // Section 1: Trade Basics
  const [asset, setAsset] = useState('');
  const [direction, setDirection] = useState<TradeDirection>('long');
  const [positionSize, setPositionSize] = useState('');
  const [positionUnit, setPositionUnit] = useState('shares');
  const [entryTime, setEntryTime] = useState('');
  const [exitTime, setExitTime] = useState('');
  const [brokerPlatform, setBrokerPlatform] = useState('');
  const [manualSession, setManualSession] = useState<TradeSession | ''>('');

  // Section 2: Price & Risk
  const [entryPrice, setEntryPrice] = useState('');
  const [exitPrice, setExitPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [fees, setFees] = useState('');
  const [accountBalance, setAccountBalance] = useState('50000');
  const [leverage, setLeverage] = useState('1');

  // Section 3: Strategy & Context
  const [setupName, setSetupName] = useState('');
  const [marketConditions, setMarketConditions] = useState<string[]>([]);
  const [correlatedPositions, setCorrelatedPositions] = useState('');
  const [newsEventTag, setNewsEventTag] = useState('');
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);

  // Section 4: Exit & Execution
  const [exitReason, setExitReason] = useState<ExitReason>('manual_close');
  const [tradeGrade, setTradeGrade] = useState(4);

  // Section 5: Psychology
  const [emotionalState, setEmotionalState] = useState<EmotionalState>('Calm');
  const [followedPlan, setFollowedPlan] = useState(true);
  const [mistakeTags, setMistakeTags] = useState<string[]>([]);
  const [lessonsLearned, setLessonsLearned] = useState('');

  // Metrics readout
  const [metricsReadout, setMetricsReadout] = useState({
    pnl_currency: 0,
    pnl_percent: 0,
    r_multiple: 0,
    risk_percent_of_account: 0,
    session: 'overlap' as TradeSession,
  });

  const getDuration = () => {
    try {
      const start = new Date(entryTime).getTime();
      const end = new Date(exitTime).getTime();
      if (isNaN(start) || isNaN(end) || end < start) return '0m';
      const diffMinutes = Math.floor((end - start) / 60000);
      const hours = Math.floor(diffMinutes / 60);
      const mins = diffMinutes % 60;
      return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    } catch {
      return '0m';
    }
  };

  useEffect(() => {
    try {
      const numEntry = parseFloat(entryPrice) || 0;
      const numExit = parseFloat(exitPrice) || 0;
      const numSize = parseFloat(positionSize) || 0;
      const numStop = parseFloat(stopLoss) || 0;
      const numFees = parseFloat(fees) || 0;
      const numBalance = parseFloat(accountBalance) || 10000;

      if (numEntry > 0 && numExit > 0 && numSize > 0) {
        const result = calculateTradeMetrics({
          direction,
          position_size: numSize,
          entry_price: numEntry,
          exit_price: numExit,
          stop_loss: numStop,
          take_profit: parseFloat(takeProfit) || 0,
          fees_commissions: numFees,
          account_balance_at_trade: numBalance,
          entry_time: entryTime ? new Date(entryTime).toISOString() : new Date().toISOString(),
          session: manualSession || undefined,
        });

        setMetricsReadout({
          pnl_currency: result.pnl_currency,
          pnl_percent: result.pnl_percent,
          r_multiple: result.r_multiple,
          risk_percent_of_account: result.risk_percent_of_account,
          session: result.session,
        });
      }
    } catch {
      // Ignore parse errors
    }
  }, [direction, entryPrice, exitPrice, positionSize, stopLoss, takeProfit, fees, accountBalance, entryTime, manualSession]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      let linkedPlanId = null;

      if (hasPlan && plannedEntry && plannedStop && plannedTarget) {
        const planRes = await fetchApi('/api/trade-plans', {
          method: 'POST',
          body: JSON.stringify({
            asset,
            planned_entry_price: parseFloat(plannedEntry),
            planned_stop_loss: parseFloat(plannedStop),
            planned_take_profit: parseFloat(plannedTarget),
            setup_name: setupName,
            thesis: planThesis,
          }),
        });

        if (planRes.success && planRes.data) {
          linkedPlanId = planRes.data.id;
        }
      }

      const tradePayload = {
        trade_plan_id: linkedPlanId,
        asset,
        direction,
        position_size: parseFloat(positionSize),
        position_size_unit: positionUnit,
        entry_price: parseFloat(entryPrice),
        exit_price: parseFloat(exitPrice),
        stop_loss: parseFloat(stopLoss),
        take_profit: parseFloat(takeProfit),
        entry_time: new Date(entryTime).toISOString(),
        exit_time: new Date(exitTime).toISOString(),
        session: manualSession || undefined,
        fees_commissions: parseFloat(fees) || 0,
        account_balance_at_trade: parseFloat(accountBalance),
        leverage_used: parseFloat(leverage) || 1,
        broker_platform: brokerPlatform,
        exit_reason: exitReason,
        trade_grade: tradeGrade,
        setup_name: setupName,
        market_conditions: marketConditions,
        correlated_positions: correlatedPositions ? correlatedPositions.split(',').map((s) => s.trim()) : [],
        news_event_tag: newsEventTag || null,
        emotional_state: emotionalState,
        followed_plan: followedPlan,
        lessons_learned: lessonsLearned,
        mistake_tag_names: mistakeTags,
      };

      const tradeRes = await fetchApi('/api/trades', {
        method: 'POST',
        body: JSON.stringify(tradePayload),
      });

      if (!tradeRes.success || !tradeRes.data) {
        setErrorMsg(tradeRes.error || 'Could not save trade');
        setLoading(false);
        return;
      }

      const tradeId = tradeRes.data.id;

      if (beforeFile) {
        const formData = new FormData();
        formData.append('trade_id', tradeId);
        formData.append('label', 'before');
        formData.append('file', beforeFile);
        await fetch('/api/screenshots/upload', { method: 'POST', body: formData });
      }

      if (afterFile) {
        const formData = new FormData();
        formData.append('trade_id', tradeId);
        formData.append('label', 'after');
        formData.append('file', afterFile);
        await fetch('/api/screenshots/upload', { method: 'POST', body: formData });
      }

      setLoading(false);
      router.push(`/trades/${tradeId}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f3fa] dark:bg-[#070a14] flex flex-col font-sans text-slate-900 dark:text-slate-200">
      <TopHeaderBar />
      <SidebarNav />

      <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-5xl mx-auto w-full pb-20">
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-mono text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* PRE-TRADE PLAN */}
          <section className="bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#2962ff]" />
                <span className="font-sans text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">
                  Pre-Trade Plan
                </span>
                <span className="text-[10px] text-slate-400 hidden sm:inline">What you planned before entering</span>
              </div>
              <button
                type="button"
                onClick={() => setHasPlan(!hasPlan)}
                className={`text-xs font-mono px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  hasPlan
                    ? 'bg-[#2962ff] text-white border-transparent font-bold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-700'
                }`}
              >
                {hasPlan ? '✓ Added' : '+ Add Plan'}
              </button>
            </div>

            {hasPlan && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="form-label">Planned Entry</label>
                  <input type="number" step="0.01" value={plannedEntry} onChange={(e) => setPlannedEntry(e.target.value)} placeholder="0.00" className="form-input" />
                </div>
                <div>
                  <label className="form-label">Planned Stop</label>
                  <p className="text-[9px] text-slate-400 mb-1">Where you'd cut losses</p>
                  <input type="number" step="0.01" value={plannedStop} onChange={(e) => setPlannedStop(e.target.value)} placeholder="0.00" className="form-input text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <label className="form-label">Planned Target</label>
                  <p className="text-[9px] text-slate-400 mb-1">Where you'd take profit</p>
                  <input type="number" step="0.01" value={plannedTarget} onChange={(e) => setPlannedTarget(e.target.value)} placeholder="0.00" className="form-input text-[#2962ff]" />
                </div>
                <div>
                  <label className="form-label">Why this trade?</label>
                  <input type="text" value={planThesis} onChange={(e) => setPlanThesis(e.target.value)} placeholder="One-line reason" className="form-input" />
                </div>
              </div>
            )}
          </section>

          {/* BASICS */}
          <section className="bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 sm:p-6 shadow-xs space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Compass className="w-4 h-4 text-[#2962ff]" />
              <span className="font-sans text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">
                What did you trade?
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-3">
                <label className="form-label">Ticker</label>
                <input type="text" value={asset} onChange={(e) => setAsset(e.target.value.toUpperCase())} className="form-input font-bold uppercase" placeholder="AAPL" required />
              </div>

              <div className="md:col-span-3">
                <label className="form-label">Direction</label>
                <p className="text-[9px] text-slate-400 mb-1">Bought (long) or sold (short)?</p>
                <SegmentedToggle
                  name="direction"
                  value={direction}
                  onChange={(val) => setDirection(val as TradeDirection)}
                  options={[
                    { value: 'long', label: 'LONG' },
                    { value: 'short', label: 'SHORT' },
                  ]}
                />
              </div>

              <div className="md:col-span-3">
                <label className="form-label">How much?</label>
                <div className="flex gap-2">
                  <input type="number" value={positionSize} onChange={(e) => setPositionSize(e.target.value)} className="form-input text-right" placeholder="100" required />
                  <select value={positionUnit} onChange={(e) => setPositionUnit(e.target.value)} className="form-input bg-slate-100 dark:bg-slate-900 text-xs w-28">
                    <option value="shares">Shares</option>
                    <option value="lots">Lots</option>
                    <option value="contracts">Contracts</option>
                  </select>
                </div>
              </div>

              <div className="md:col-span-3">
                <label className="form-label">Broker</label>
                <input type="text" value={brokerPlatform} onChange={(e) => setBrokerPlatform(e.target.value)} className="form-input" placeholder="e.g. IBKR" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-5">
                <label className="form-label">Entry Time</label>
                <input type="datetime-local" value={entryTime} onChange={(e) => setEntryTime(e.target.value)} className="form-input" required />
              </div>
              <div className="md:col-span-5">
                <label className="form-label">Exit Time</label>
                <input type="datetime-local" value={exitTime} onChange={(e) => setExitTime(e.target.value)} className="form-input" required />
              </div>
              <div className="md:col-span-2">
                <label className="form-label">Duration</label>
                <div className="form-input bg-slate-50 dark:bg-slate-900/60 text-center text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{getDuration()}</span>
                </div>
              </div>
            </div>
          </section>

          {/* PRICES */}
          <section className="bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 sm:p-6 shadow-xs space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <DollarSign className="w-4 h-4 text-[#2962ff]" />
              <span className="font-sans text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">
                Prices & Risk
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label className="form-label">Entry Price</label>
                  <input type="number" step="0.01" value={entryPrice} onChange={(e) => setEntryPrice(e.target.value)} className="form-input text-right" placeholder="0.00" required />
                </div>
                <div>
                  <label className="form-label">Exit Price</label>
                  <input type="number" step="0.01" value={exitPrice} onChange={(e) => setExitPrice(e.target.value)} className="form-input text-right" placeholder="0.00" required />
                </div>
                <div>
                  <label className="form-label">Stop Loss</label>
                  <p className="text-[9px] text-slate-400 mb-1">Max loss price</p>
                  <input type="number" step="0.01" value={stopLoss} onChange={(e) => setStopLoss(e.target.value)} className="form-input text-right text-rose-600 dark:text-rose-400" placeholder="0.00" required />
                </div>
                <div>
                  <label className="form-label">Take Profit</label>
                  <p className="text-[9px] text-slate-400 mb-1">Target price</p>
                  <input type="number" step="0.01" value={takeProfit} onChange={(e) => setTakeProfit(e.target.value)} className="form-input text-right text-[#2962ff]" placeholder="0.00" required />
                </div>
                <div>
                  <label className="form-label">Fees ($)</label>
                  <input type="number" step="0.01" value={fees} onChange={(e) => setFees(e.target.value)} className="form-input text-right" placeholder="0.00" />
                </div>
                <div>
                  <label className="form-label">Account Size ($)</label>
                  <p className="text-[9px] text-slate-400 mb-1">Your total capital</p>
                  <input type="number" value={accountBalance} onChange={(e) => setAccountBalance(e.target.value)} className="form-input text-right" required />
                </div>
              </div>

              <div className="md:col-span-4 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-5 rounded-xl flex flex-col justify-center items-end">
                <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                  R-Multiple: <span className="text-[#2962ff] dark:text-[#388bfd] font-bold">{metricsReadout.r_multiple}R</span>
                </span>
                <p className="text-[9px] text-slate-400">Risk-to-reward ratio</p>
                <div className={`font-mono text-3xl font-bold mt-2 tracking-tight ${metricsReadout.pnl_currency >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {metricsReadout.pnl_currency >= 0 ? `+$${metricsReadout.pnl_currency.toFixed(2)}` : `-$${Math.abs(metricsReadout.pnl_currency).toFixed(2)}`}
                </div>
              </div>
            </div>
          </section>

          {/* STRATEGY */}
          <section className="bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 sm:p-6 shadow-xs space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Target className="w-4 h-4 text-[#2962ff]" />
              <span className="font-sans text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">
                Strategy & Context
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="form-label">Strategy Name</label>
                  <input type="text" value={setupName} onChange={(e) => setSetupName(e.target.value)} className="form-input" placeholder="e.g. Breakout" required />
                </div>
                <div>
                  <label className="form-label">Related Positions</label>
                  <p className="text-[9px] text-slate-400 mb-1">Other tickers you had open</p>
                  <input type="text" value={correlatedPositions} onChange={(e) => setCorrelatedPositions(e.target.value)} placeholder="QQQ, SPY" className="form-input" />
                </div>
                <div>
                  <label className="form-label">Market Conditions</label>
                  <TagChipSelect
                    availableTags={['Trending', 'Choppy', 'High Volatility', 'Range Bound']}
                    selectedTags={marketConditions}
                    onChange={setMarketConditions}
                  />
                </div>
              </div>

              <div>
                <label className="form-label mb-2">Screenshots</label>
                <div className="grid grid-cols-2 gap-4">
                  <ScreenshotDropzone label="BEFORE" onFileSelect={setBeforeFile} />
                  <ScreenshotDropzone label="AFTER" onFileSelect={setAfterFile} />
                </div>
              </div>
            </div>
          </section>

          {/* EXIT */}
          <section className="bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 sm:p-6 shadow-xs space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <CheckCircle2 className="w-4 h-4 text-[#2962ff]" />
              <span className="font-sans text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">
                How did it end?
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label mb-2">Why did you exit?</label>
                <SegmentedToggle
                  name="exit_reason"
                  value={exitReason}
                  onChange={(val) => setExitReason(val as ExitReason)}
                  options={[
                    { value: 'stop_hit', label: 'STOP' },
                    { value: 'target_hit', label: 'TARGET' },
                    { value: 'manual_close', label: 'MANUAL' },
                    { value: 'time_based', label: 'TIME' },
                    { value: 'other', label: 'OTHER' },
                  ]}
                />
              </div>
              <div>
                <label className="form-label mb-2">Rate your execution</label>
                <p className="text-[9px] text-slate-400 mb-2">1 = poor, 5 = perfect</p>
                <TradeGradeDial value={tradeGrade} onChange={setTradeGrade} />
              </div>
            </div>
          </section>

          {/* MINDSET */}
          <section className="bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 sm:p-6 shadow-xs space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <HeartHandshake className="w-4 h-4 text-[#2962ff]" />
              <span className="font-sans text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">
                Mindset & Discipline
              </span>
            </div>

            <div className="space-y-6">
              <div>
                <label className="form-label mb-2">How were you feeling?</label>
                <EmotionSelect value={emotionalState} onChange={setEmotionalState} />
              </div>

              <div>
                <label className="form-label mb-2">Did you follow your plan?</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setFollowedPlan(true)}
                    className={`px-5 py-2 rounded-lg font-mono text-xs font-bold border transition-all cursor-pointer ${
                      followedPlan
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-700'
                    }`}
                  >
                    ✓ Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setFollowedPlan(false)}
                    className={`px-5 py-2 rounded-lg font-mono text-xs font-bold border transition-all cursor-pointer ${
                      !followedPlan
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-700'
                    }`}
                  >
                    ✗ No
                  </button>
                </div>
              </div>

              <div>
                <label className="form-label mb-2">Mistakes</label>
                <p className="text-[9px] text-slate-400 mb-2">Tag what went wrong (if anything)</p>
                <TagChipSelect
                  availableTags={['Chased Entry', 'Moved Stop', 'FOMO Entry', 'Early Exit', 'Too Much Size']}
                  selectedTags={mistakeTags}
                  onChange={setMistakeTags}
                />
              </div>

              <div>
                <label className="form-label">What did you learn?</label>
                <textarea
                  value={lessonsLearned}
                  onChange={(e) => setLessonsLearned(e.target.value)}
                  placeholder="What went well? What would you change?"
                  rows={4}
                  className="form-input resize-none"
                />
              </div>
            </div>
          </section>

          {/* SAVE BAR */}
          <div className="fixed bottom-0 left-0 w-full bg-white/95 dark:bg-[#070a14]/95 border-t border-slate-200 dark:border-slate-800 p-3 sm:p-4 z-40">
            <div className="max-w-5xl mx-auto w-full flex justify-between items-center">
              <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Autosave on
              </span>
              <button
                type="submit"
                disabled={loading}
                className="bg-[#2962ff] hover:bg-[#1e4bd8] text-white font-sans font-bold text-xs px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg transition-all disabled:opacity-50 uppercase tracking-wider flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Saving...' : 'Save Trade'}</span>
              </button>
            </div>
          </div>
        </form>
      </main>

      <BottomFooterBar />
    </div>
  );
}
