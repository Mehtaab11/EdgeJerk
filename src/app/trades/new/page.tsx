'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { NavigationHeader } from '@/components/layout/NavigationHeader';
import { SegmentedToggle } from '@/components/ui/SegmentedToggle';
import { EmotionSelect } from '@/components/ui/EmotionSelect';
import { TradeGradeDial } from '@/components/ui/TradeGradeDial';
import { TagChipSelect } from '@/components/ui/TagChipSelect';
import { ScreenshotDropzone } from '@/components/ui/ScreenshotDropzone';
import { fetchApi } from '@/lib/api-client';
import { calculateTradeMetrics } from '@/lib/utils/trade-calculations';
import { TradeDirection, ExitReason, EmotionalState, TradeSession } from '@/types/database.types';

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
  const [asset, setAsset] = useState('AAPL');
  const [direction, setDirection] = useState<TradeDirection>('long');
  const [positionSize, setPositionSize] = useState('100');
  const [positionUnit, setPositionUnit] = useState('shares');
  const [entryTime, setEntryTime] = useState('2026-08-22T14:30');
  const [exitTime, setExitTime] = useState('2026-08-22T15:45');
  const [brokerPlatform, setBrokerPlatform] = useState('Interactive Brokers');
  const [manualSession, setManualSession] = useState<TradeSession | ''>('');

  // Section 2: Price & Risk
  const [entryPrice, setEntryPrice] = useState('175.50');
  const [exitPrice, setExitPrice] = useState('180.00');
  const [stopLoss, setStopLoss] = useState('173.00');
  const [takeProfit, setTakeProfit] = useState('182.00');
  const [fees, setFees] = useState('2.50');
  const [accountBalance, setAccountBalance] = useState('50000');
  const [leverage, setLeverage] = useState('1');

  // Section 3: Strategy & Context
  const [setupName, setSetupName] = useState('Breakout Bounce');
  const [marketConditions, setMarketConditions] = useState<string[]>(['Trending']);
  const [correlatedPositions, setCorrelatedPositions] = useState('QQQ, SPY');
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

  // Auto-calculated trade metrics readout
  const [metricsReadout, setMetricsReadout] = useState({
    pnl_currency: 0,
    pnl_percent: 0,
    r_multiple: 0,
    risk_percent_of_account: 0,
    session: 'overlap' as TradeSession,
  });

  // Calculate Duration
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

  // Recalculate metrics on input change
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
          entry_time: new Date(entryTime).toISOString(),
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
      // Ignore intermediate parse errors
    }
  }, [direction, entryPrice, exitPrice, positionSize, stopLoss, takeProfit, fees, accountBalance, entryTime, manualSession]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      let linkedPlanId = null;

      // 1. Create Pre-Trade Plan if user entered plan details
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

      // 2. Log Trade Record
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
        setErrorMsg(tradeRes.error || 'Failed to log trade');
        setLoading(false);
        return;
      }

      const tradeId = tradeRes.data.id;

      // 3. Upload Before Screenshot if attached
      if (beforeFile) {
        const formData = new FormData();
        formData.append('trade_id', tradeId);
        formData.append('label', 'before');
        formData.append('file', beforeFile);
        await fetch('/api/screenshots/upload', { method: 'POST', body: formData });
      }

      // 4. Upload After Screenshot if attached
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
      setErrorMsg(err.message || 'Error creating trade');
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen pb-24">
      <NavigationHeader />

      <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">
        {errorMsg && (
          <div className="mb-6 p-3 bg-[#ff6b6b]/10 border border-[#ff6b6b] text-[#ff6b6b] font-mono text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* SECTION 0: PRE-TRADE PLAN */}
          <section className="bg-[#111624] border border-[#2d3748] p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="font-sans text-[11px] font-bold text-[#8b949e] uppercase tracking-wider">
                00 — PRE-TRADE PLAN (TIMESTAMPED BEFORE EXECUTION)
              </span>
              <button
                type="button"
                onClick={() => setHasPlan(!hasPlan)}
                className={`font-mono text-xs px-3 py-1 border transition-colors ${
                  hasPlan ? 'bg-[#dfff00] text-[#0a0f1e] border-[#dfff00] font-bold' : 'border-[#2d3748] text-[#8b949e]'
                }`}
              >
                {hasPlan ? 'PLAN LINKED' : '+ LINK PRE-TRADE PLAN'}
              </button>
            </div>

            {hasPlan && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <label className="form-label">PLANNED ENTRY</label>
                  <input
                    type="number"
                    step="0.01"
                    value={plannedEntry}
                    onChange={(e) => setPlannedEntry(e.target.value)}
                    placeholder="0.00"
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">PLANNED STOP LOSS</label>
                  <input
                    type="number"
                    step="0.01"
                    value={plannedStop}
                    onChange={(e) => setPlannedStop(e.target.value)}
                    placeholder="0.00"
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">PLANNED TAKE PROFIT</label>
                  <input
                    type="number"
                    step="0.01"
                    value={plannedTarget}
                    onChange={(e) => setPlannedTarget(e.target.value)}
                    placeholder="0.00"
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">ONE-LINE THESIS</label>
                  <input
                    type="text"
                    value={planThesis}
                    onChange={(e) => setPlanThesis(e.target.value)}
                    placeholder="Key thesis..."
                    className="form-input"
                  />
                </div>
              </div>
            )}
          </section>

          {/* SECTION 1: TRADE BASICS */}
          <section>
            <div className="panel-title">01 — TRADE BASICS</div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-3">
                <label className="form-label">TICKER / ASSET</label>
                <input
                  type="text"
                  value={asset}
                  onChange={(e) => setAsset(e.target.value.toUpperCase())}
                  className="form-input uppercase"
                  required
                />
              </div>

              <div className="md:col-span-3">
                <label className="form-label">DIRECTION</label>
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
                <label className="form-label">POSITION SIZE</label>
                <div className="flex">
                  <input
                    type="number"
                    value={positionSize}
                    onChange={(e) => setPositionSize(e.target.value)}
                    className="form-input text-right"
                    required
                  />
                  <select
                    value={positionUnit}
                    onChange={(e) => setPositionUnit(e.target.value)}
                    className="form-input bg-[#1a1f2f] text-xs font-mono border-l-0 w-24"
                  >
                    <option value="shares">SHARES</option>
                    <option value="lots">LOTS</option>
                    <option value="contracts">CONTRACTS</option>
                  </select>
                </div>
              </div>

              <div className="md:col-span-3">
                <label className="form-label">BROKER / PLATFORM</label>
                <input
                  type="text"
                  value={brokerPlatform}
                  onChange={(e) => setBrokerPlatform(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-4">
              <div className="md:col-span-5">
                <label className="form-label">ENTRY TIME (UTC)</label>
                <input
                  type="datetime-local"
                  value={entryTime}
                  onChange={(e) => setEntryTime(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              <div className="md:col-span-5">
                <label className="form-label">EXIT TIME (UTC)</label>
                <input
                  type="datetime-local"
                  value={exitTime}
                  onChange={(e) => setExitTime(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="form-label">DURATION</label>
                <div className="form-input bg-[#111624] text-center text-[#8b949e]">
                  {getDuration()}
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: PRICE & RISK */}
          <section>
            <div className="panel-title">02 — PRICE & RISK</div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              <div className="md:col-span-8 grid grid-cols-3 gap-4">
                <div>
                  <label className="form-label">ENTRY PRICE</label>
                  <input
                    type="number"
                    step="0.01"
                    value={entryPrice}
                    onChange={(e) => setEntryPrice(e.target.value)}
                    className="form-input text-right"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">EXIT PRICE</label>
                  <input
                    type="number"
                    step="0.01"
                    value={exitPrice}
                    onChange={(e) => setExitPrice(e.target.value)}
                    className="form-input text-right"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">STOP LOSS</label>
                  <input
                    type="number"
                    step="0.01"
                    value={stopLoss}
                    onChange={(e) => setStopLoss(e.target.value)}
                    className="form-input text-right text-[#ff6b6b]"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">TAKE PROFIT</label>
                  <input
                    type="number"
                    step="0.01"
                    value={takeProfit}
                    onChange={(e) => setTakeProfit(e.target.value)}
                    className="form-input text-right text-[#dfff00]"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">FEES / COMMISSIONS ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={fees}
                    onChange={(e) => setFees(e.target.value)}
                    className="form-input text-right"
                  />
                </div>
                <div>
                  <label className="form-label">ACCOUNT BALANCE ($)</label>
                  <input
                    type="number"
                    value={accountBalance}
                    onChange={(e) => setAccountBalance(e.target.value)}
                    className="form-input text-right"
                    required
                  />
                </div>
              </div>

              {/* LIVE P&L BOLD READOUT */}
              <div className="md:col-span-4 border border-[#2d3748] bg-[#111624] p-6 flex flex-col justify-center items-end">
                <span className="font-mono text-xs text-[#8b949e]">
                  R-MULTIPLE:{' '}
                  <span className="text-[#dfff00] font-bold">
                    {metricsReadout.r_multiple}R
                  </span>
                </span>
                <div
                  className={`font-mono text-3xl font-bold mt-2 ${
                    metricsReadout.pnl_currency >= 0 ? 'text-[#40e56c]' : 'text-[#ff6b6b]'
                  }`}
                >
                  {metricsReadout.pnl_currency >= 0
                    ? `+$${metricsReadout.pnl_currency.toFixed(2)}`
                    : `-$${Math.abs(metricsReadout.pnl_currency).toFixed(2)}`}
                </div>
                <span className="font-mono text-xs text-[#8b949e] mt-1">
                  {metricsReadout.pnl_percent >= 0
                    ? `+${metricsReadout.pnl_percent}%`
                    : `${metricsReadout.pnl_percent}%`}{' '}
                  OF ACCOUNT
                </span>
              </div>
            </div>
          </section>

          {/* SECTION 3: STRATEGY & CONTEXT */}
          <section>
            <div className="panel-title">03 — STRATEGY & CONTEXT</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="form-label">STRATEGY / SETUP NAME</label>
                  <input
                    type="text"
                    value={setupName}
                    onChange={(e) => setSetupName(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">CORRELATED POSITIONS</label>
                  <input
                    type="text"
                    value={correlatedPositions}
                    onChange={(e) => setCorrelatedPositions(e.target.value)}
                    placeholder="e.g. QQQ, SPY"
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">MARKET CONDITIONS</label>
                  <TagChipSelect
                    availableTags={['Trending', 'Choppy', 'High Volatility', 'Range Bound']}
                    selectedTags={marketConditions}
                    onChange={setMarketConditions}
                  />
                </div>
              </div>

              <div>
                <label className="form-label mb-2">CHART EVIDENCE</label>
                <div className="grid grid-cols-2 gap-4">
                  <ScreenshotDropzone label="BEFORE" onFileSelect={setBeforeFile} />
                  <ScreenshotDropzone label="AFTER" onFileSelect={setAfterFile} />
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 4: EXIT & EXECUTION REVIEW */}
          <section>
            <div className="panel-title">04 — EXIT & EXECUTION REVIEW</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label mb-2">EXIT REASON</label>
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
                <label className="form-label mb-2">TRADE GRADE (EXECUTION QUALITY)</label>
                <TradeGradeDial value={tradeGrade} onChange={setTradeGrade} />
              </div>
            </div>
          </section>

          {/* SECTION 5: PSYCHOLOGY & REVIEW */}
          <section>
            <div className="panel-title">05 — PSYCHOLOGY & REVIEW</div>
            <div className="space-y-6">
              <div>
                <label className="form-label mb-2">EMOTIONAL STATE</label>
                <EmotionSelect value={emotionalState} onChange={setEmotionalState} />
              </div>

              <div>
                <label className="form-label mb-2">RULE COMPLIANCE</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setFollowedPlan(true)}
                    className={`px-4 py-2 font-mono text-xs font-bold border transition-colors ${
                      followedPlan ? 'bg-[#40e56c] text-[#0a0f1e] border-[#40e56c]' : 'border-[#2d3748] text-[#8b949e]'
                    }`}
                  >
                    FOLLOWED MY PLAN
                  </button>
                  <button
                    type="button"
                    onClick={() => setFollowedPlan(false)}
                    className={`px-4 py-2 font-mono text-xs font-bold border transition-colors ${
                      !followedPlan ? 'bg-[#ff6b6b] text-[#ffffff] border-[#ff6b6b]' : 'border-[#2d3748] text-[#8b949e]'
                    }`}
                  >
                    BROKE MY PLAN
                  </button>
                </div>
              </div>

              <div>
                <label className="form-label mb-2">MISTAKE TAGS</label>
                <TagChipSelect
                  availableTags={['Chased Entry', 'Moved Stop Loss', 'FOMO Entry', 'Early Exit', 'Overleveraged']}
                  selectedTags={mistakeTags}
                  onChange={setMistakeTags}
                />
              </div>

              <div>
                <label className="form-label">LESSONS LEARNED / NOTES</label>
                <textarea
                  value={lessonsLearned}
                  onChange={(e) => setLessonsLearned(e.target.value)}
                  placeholder="What went well? What could be improved?"
                  rows={4}
                  className="form-input resize-none"
                />
              </div>
            </div>
          </section>

          {/* STICKY SAVE BAR */}
          <div className="fixed bottom-0 left-0 w-full bg-[#0a0f1e]/95 border-t border-[#2d3748] p-4 z-50 flex justify-end">
            <div className="max-w-5xl mx-auto w-full flex justify-between items-center">
              <span className="font-mono text-xs text-[#8b949e]">
                AUTOSAVE_ACTIVE
              </span>
              <button
                type="submit"
                disabled={loading}
                className="bg-[#dfff00] text-[#0a0f1e] font-sans font-bold text-sm px-8 py-3 hover:bg-[#c8e600] transition-colors border border-transparent disabled:opacity-50 uppercase tracking-wider"
              >
                {loading ? 'SAVING TRADE...' : 'SAVE TRADE'}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
