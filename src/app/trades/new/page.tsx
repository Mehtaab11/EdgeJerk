"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { TopHeaderBar } from "@/components/layout/TopHeaderBar";
import { BottomFooterBar } from "@/components/layout/BottomFooterBar";
import { SegmentedToggle } from "@/components/ui/SegmentedToggle";
import { EmotionSelect } from "@/components/ui/EmotionSelect";
import { TradeGradeDial } from "@/components/ui/TradeGradeDial";
import { TagChipSelect } from "@/components/ui/TagChipSelect";
import { ScreenshotDropzone } from "@/components/ui/ScreenshotDropzone";
import { TimeInput } from "@/components/ui/TimeInput";
import { fetchApi } from "@/lib/api-client";
import { calculateTradeMetrics } from "@/lib/utils/trade-calculations";
import {
  TradeDirection,
  ExitReason,
  TradeSession,
} from "@/types/database.types";
import {
  FileText,
  Compass,
  DollarSign,
  Target,
  CheckCircle2,
  HeartHandshake,
  Save,
  Clock,
  RotateCcw,
  AlertCircle,
  Globe,
} from "lucide-react";

const DRAFT_STORAGE_KEY = "edgejerk_new_trade_draft";

const STRATEGY_PRESETS = [
  "Liquidity Sweep",
  "Order Block",
  "Fair Value Gap",
  "Break of Structure",
  "Change of Character",
  "Supply and Demand Zone",
  "Support/Resistance Flip",
  "Trendline Break and Retest",
  "Double Top/Bottom",
  "Inside Bar Breakout",
];

const TIMEZONE_OPTIONS = [
  { value: "America/New_York", label: "New York (EST/EDT - UTC-5/-4)" },
  { value: "America/Chicago", label: "Chicago (CST/CDT - UTC-6/-5)" },
  { value: "America/Los_Angeles", label: "Los Angeles (PST/PDT - UTC-8/-7)" },
  { value: "Europe/London", label: "London (GMT/BST - UTC+0/+1)" },
  { value: "Europe/Frankfurt", label: "Frankfurt/CET (UTC+1/+2)" },
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "Asia/Kolkata", label: "India (IST - UTC+5:30)" },
  { value: "Asia/Singapore", label: "Singapore / HK (SGT - UTC+8)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST - UTC+9)" },
  { value: "Australia/Sydney", label: "Sydney (AEST - UTC+10/+11)" },
];

export default function NewTradePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [draftRestored, setDraftRestored] = useState(false);

  // Helper for today's ISO date (YYYY-MM-DD)
  const getTodayDate = () => new Date().toISOString().split("T")[0];

  // Section 0: Plan state
  const [hasPlan, setHasPlan] = useState(false);
  const [plannedEntry, setPlannedEntry] = useState("");
  const [plannedStop, setPlannedStop] = useState("");
  const [plannedTarget, setPlannedTarget] = useState("");
  const [planThesis, setPlanThesis] = useState("");

  // Section 1: Trade Basics
  const [asset, setAsset] = useState("");
  const [direction, setDirection] = useState<TradeDirection>("long");
  const [positionSize, setPositionSize] = useState("");
  const [positionUnit, setPositionUnit] = useState("shares");
  const [brokerPlatform, setBrokerPlatform] = useState("");
  const [manualSession, setManualSession] = useState<TradeSession | "">("");

  // Timezone & Date/Time inputs
  const [timezone, setTimezone] = useState("America/New_York");
  const [entryDate, setEntryDate] = useState(getTodayDate());
  const [entryTime, setEntryTime] = useState("09:30");
  const [exitDate, setExitDate] = useState(getTodayDate());
  const [exitTime, setExitTime] = useState("10:30");

  // Section 2: Price & Risk
  const [entryPrice, setEntryPrice] = useState("");
  const [exitPrice, setExitPrice] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [fees, setFees] = useState("");
  const [accountBalance, setAccountBalance] = useState("10000");
  const [leverage, setLeverage] = useState("1");

  // Section 3: Strategy & Context
  const [setupName, setSetupName] = useState("Liquidity Sweep");
  const [customSetup, setCustomSetup] = useState("");
  const [isCustomSetup, setIsCustomSetup] = useState(false);
  const [marketConditions, setMarketConditions] = useState<string[]>([]);
  const [newsEventTag, setNewsEventTag] = useState("");
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);

  // Section 4: Exit & Execution
  const [exitReason, setExitReason] = useState<ExitReason>("manual_close");
  const [tradeGrade, setTradeGrade] = useState(4);

  // Section 5: Psychology (Multi-select)
  const [emotionalState, setEmotionalState] = useState<string[]>(["Calm"]);
  const [followedPlan, setFollowedPlan] = useState(true);
  const [mistakeTags, setMistakeTags] = useState<string[]>([]);
  const [lessonsLearned, setLessonsLearned] = useState("");

  // Detect local timezone on mount
  useEffect(() => {
    try {
      const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (localTz) {
        // If local timezone is in our list or valid, use it
        const exists = TIMEZONE_OPTIONS.some((t) => t.value === localTz);
        if (exists) {
          setTimezone(localTz);
        } else {
          // Default to America/New_York
          setTimezone("America/New_York");
        }
      }
    } catch {
      // Ignored
    }
  }, []);

  // Load User Profile / Running Balance & Draft on Mount
  useEffect(() => {
    async function initUserAndDraft() {
      // 1. Fetch current running balance
      try {
        const res = await fetchApi("/api/auth/me");
        if (res.success && res.data?.profile) {
          const balance =
            res.data.profile.current_account_balance ||
            res.data.profile.default_account_size;
          if (balance) {
            setAccountBalance(String(balance));
          }
        }
      } catch {
        // Fallback default
      }

      // 2. Check localStorage for draft
      try {
        const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (saved) {
          const draft = JSON.parse(saved);
          if (draft.asset) setAsset(draft.asset);
          if (draft.direction) setDirection(draft.direction);
          if (draft.positionSize) setPositionSize(draft.positionSize);
          if (draft.positionUnit) setPositionUnit(draft.positionUnit);
          if (draft.brokerPlatform) setBrokerPlatform(draft.brokerPlatform);
          if (draft.timezone) setTimezone(draft.timezone);
          if (draft.entryDate) setEntryDate(draft.entryDate);
          if (draft.entryTime) setEntryTime(draft.entryTime);
          if (draft.exitDate) setExitDate(draft.exitDate);
          if (draft.exitTime) setExitTime(draft.exitTime);
          if (draft.entryPrice) setEntryPrice(draft.entryPrice);
          if (draft.exitPrice) setExitPrice(draft.exitPrice);
          if (draft.stopLoss) setStopLoss(draft.stopLoss);
          if (draft.takeProfit) setTakeProfit(draft.takeProfit);
          if (draft.fees) setFees(draft.fees);
          if (draft.accountBalance) setAccountBalance(draft.accountBalance);
          if (draft.setupName) {
            if (STRATEGY_PRESETS.includes(draft.setupName)) {
              setSetupName(draft.setupName);
              setIsCustomSetup(false);
            } else {
              setSetupName("Custom");
              setCustomSetup(draft.setupName);
              setIsCustomSetup(true);
            }
          }
          if (draft.marketConditions)
            setMarketConditions(draft.marketConditions);
          if (draft.emotionalState) setEmotionalState(draft.emotionalState);
          if (draft.mistakeTags) setMistakeTags(draft.mistakeTags);
          if (draft.lessonsLearned) setLessonsLearned(draft.lessonsLearned);
          if (draft.hasPlan !== undefined) setHasPlan(draft.hasPlan);
          if (draft.plannedEntry) setPlannedEntry(draft.plannedEntry);
          if (draft.plannedStop) setPlannedStop(draft.plannedStop);
          if (draft.plannedTarget) setPlannedTarget(draft.plannedTarget);
          if (draft.planThesis) setPlanThesis(draft.planThesis);
          setDraftRestored(true);
        }
      } catch {
        // Ignored
      }
    }

    initUserAndDraft();
  }, []);

  // Auto-Save Draft to LocalStorage
  useEffect(() => {
    const draftData = {
      asset,
      direction,
      positionSize,
      positionUnit,
      brokerPlatform,
      timezone,
      entryDate,
      entryTime,
      exitDate,
      exitTime,
      entryPrice,
      exitPrice,
      stopLoss,
      takeProfit,
      fees,
      accountBalance,
      setupName: isCustomSetup ? customSetup : setupName,
      marketConditions,
      emotionalState,
      mistakeTags,
      lessonsLearned,
      hasPlan,
      plannedEntry,
      plannedStop,
      plannedTarget,
      planThesis,
    };

    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
    } catch {
      // Ignored
    }
  }, [
    asset,
    direction,
    positionSize,
    positionUnit,
    brokerPlatform,
    timezone,
    entryDate,
    entryTime,
    exitDate,
    exitTime,
    entryPrice,
    exitPrice,
    stopLoss,
    takeProfit,
    fees,
    accountBalance,
    setupName,
    customSetup,
    isCustomSetup,
    marketConditions,
    emotionalState,
    mistakeTags,
    lessonsLearned,
    hasPlan,
    plannedEntry,
    plannedStop,
    plannedTarget,
    planThesis,
  ]);

  const clearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // Ignored
    }
    setAsset("");
    setPositionSize("");
    setEntryPrice("");
    setExitPrice("");
    setStopLoss("");
    setTakeProfit("");
    setFees("");
    setLessonsLearned("");
    setMistakeTags([]);
    setEmotionalState(["Calm"]);
    setDraftRestored(false);
  };

  // Date & Time Validation: Exit Time >= Entry Time
  const { fullEntryIso, fullExitIso, timeError } = useMemo(() => {
    try {
      const entryIso = `${entryDate}T${entryTime}:00`;
      const exitIso = `${exitDate}T${exitTime}:00`;
      const entryTimestamp = new Date(entryIso).getTime();
      const exitTimestamp = new Date(exitIso).getTime();

      let err: string | null = null;
      if (
        !isNaN(entryTimestamp) &&
        !isNaN(exitTimestamp) &&
        exitTimestamp < entryTimestamp
      ) {
        err = "Exit time cannot be earlier than entry time";
      }

      return {
        fullEntryIso: !isNaN(entryTimestamp)
          ? new Date(entryIso).toISOString()
          : new Date().toISOString(),
        fullExitIso: !isNaN(exitTimestamp)
          ? new Date(exitIso).toISOString()
          : new Date().toISOString(),
        timeError: err,
      };
    } catch {
      return {
        fullEntryIso: new Date().toISOString(),
        fullExitIso: new Date().toISOString(),
        timeError: null,
      };
    }
  }, [entryDate, entryTime, exitDate, exitTime]);

  // Duration Readout
  const durationReadout = useMemo(() => {
    try {
      const start = new Date(`${entryDate}T${entryTime}:00`).getTime();
      const end = new Date(`${exitDate}T${exitTime}:00`).getTime();
      if (isNaN(start) || isNaN(end) || end < start) return "0m";
      const diffMinutes = Math.floor((end - start) / 60000);
      const hours = Math.floor(diffMinutes / 60);
      const mins = diffMinutes % 60;
      return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    } catch {
      return "0m";
    }
  }, [entryDate, entryTime, exitDate, exitTime]);

  // Metrics readout
  const [metricsReadout, setMetricsReadout] = useState({
    pnl_currency: 0,
    pnl_percent: 0,
    r_multiple: 0,
    risk_percent_of_account: 0,
    session: "overlap" as TradeSession,
  });

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
          entry_time: fullEntryIso,
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
  }, [
    direction,
    entryPrice,
    exitPrice,
    positionSize,
    stopLoss,
    takeProfit,
    fees,
    accountBalance,
    fullEntryIso,
    manualSession,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (timeError) return;

    setErrorMsg(null);
    setLoading(true);

    try {
      let linkedPlanId = null;
      const finalStrategy =
        (isCustomSetup ? customSetup : setupName) || "Liquidity Sweep";

      if (hasPlan && plannedEntry && plannedStop && plannedTarget) {
        const planRes = await fetchApi("/api/trade-plans", {
          method: "POST",
          body: JSON.stringify({
            asset,
            planned_entry_price: parseFloat(plannedEntry),
            planned_stop_loss: parseFloat(plannedStop),
            planned_take_profit: parseFloat(plannedTarget),
            setup_name: finalStrategy,
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
        entry_time: fullEntryIso,
        exit_time: fullExitIso,
        session: manualSession || undefined,
        fees_commissions: parseFloat(fees) || 0,
        account_balance_at_trade: parseFloat(accountBalance),
        leverage_used: parseFloat(leverage) || 1,
        broker_platform: brokerPlatform || "Default",
        exit_reason: exitReason,
        trade_grade: tradeGrade,
        setup_name: finalStrategy,
        market_conditions: marketConditions,
        news_event_tag: newsEventTag || null,
        emotional_state:
          emotionalState.length > 0 ? emotionalState.join(", ") : "Calm",
        followed_plan: followedPlan,
        lessons_learned: lessonsLearned,
        mistake_tag_names: mistakeTags,
      };

      const tradeRes = await fetchApi("/api/trades", {
        method: "POST",
        body: JSON.stringify(tradePayload),
      });

      if (!tradeRes.success || !tradeRes.data) {
        setErrorMsg(tradeRes.error || "Could not save trade");
        setLoading(false);
        return;
      }

      const tradeId = tradeRes.data.id;

      if (beforeFile) {
        const formData = new FormData();
        formData.append("trade_id", tradeId);
        formData.append("label", "BEFORE");
        formData.append("file", beforeFile);
        await fetch("/api/screenshots/upload", {
          method: "POST",
          body: formData,
        });
      }

      if (afterFile) {
        const formData = new FormData();
        formData.append("trade_id", tradeId);
        formData.append("label", "AFTER");
        formData.append("file", afterFile);
        await fetch("/api/screenshots/upload", {
          method: "POST",
          body: formData,
        });
      }

      // Clear draft on success
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {
        // Ignored
      }

      setLoading(false);
      router.push(`/trades/${tradeId}`);
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f3fa] dark:bg-[#070a14] flex flex-col font-sans text-slate-900 dark:text-slate-200">
      <TopHeaderBar />
      <SidebarNav />

      <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-5xl mx-auto w-full pb-64 sm:pb-72">
        {/* DRAFT RESTORED ALERT */}
        {draftRestored && (
          <div className="mb-6 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs font-mono flex items-center justify-between">
            <span className="text-[#2962ff] dark:text-[#388bfd] font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Restored unsaved draft
            </span>
            <button
              type="button"
              onClick={clearDraft}
              className="text-slate-500 hover:text-rose-500 underline cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Discard Draft
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-mono text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* SECTION 0: PRE-TRADE PLAN */}
          <section className="bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#2962ff]" />
                <span className="font-sans text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">
                  Pre-Trade Plan
                </span>
                <span className="text-[10px] text-slate-400 hidden sm:inline">
                  What you planned before entering
                </span>
              </div>
              <button
                type="button"
                onClick={() => setHasPlan(!hasPlan)}
                className={`text-xs font-mono px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  hasPlan
                    ? "bg-[#2962ff] text-white border-transparent font-bold"
                    : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-700"
                }`}
              >
                {hasPlan ? "✓ Added" : "+ Add Plan"}
              </button>
            </div>

            {hasPlan && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <div className="min-h-[38px] flex flex-col justify-end mb-2">
                    <label className="form-label">Planned Entry</label>
                  </div>
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
                  <div className="min-h-[38px] flex flex-col justify-end mb-2">
                    <label className="form-label">Planned Stop</label>
                    <p className="text-[9px] text-slate-400">
                      Where you'd cut losses
                    </p>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={plannedStop}
                    onChange={(e) => setPlannedStop(e.target.value)}
                    placeholder="0.00"
                    className="form-input text-rose-600 dark:text-rose-400"
                  />
                </div>
                <div>
                  <div className="min-h-[38px] flex flex-col justify-end mb-2">
                    <label className="form-label">Planned Target</label>
                    <p className="text-[9px] text-slate-400">
                      Where you'd take profit
                    </p>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={plannedTarget}
                    onChange={(e) => setPlannedTarget(e.target.value)}
                    placeholder="0.00"
                    className="form-input text-[#2962ff]"
                  />
                </div>
                <div>
                  <div className="min-h-[38px] flex flex-col justify-end mb-2">
                    <label className="form-label">Why this trade?</label>
                    <p className="text-[9px] text-slate-400">One-line thesis</p>
                  </div>
                  <input
                    type="text"
                    value={planThesis}
                    onChange={(e) => setPlanThesis(e.target.value)}
                    placeholder="e.g. S&D bounce"
                    className="form-input"
                  />
                </div>
              </div>
            )}
          </section>

          {/* SECTION 1: WHAT DID YOU TRADE? (With Timezone Selector) */}
          <section className="bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 sm:p-6 shadow-xs space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Compass className="w-4 h-4 text-[#2962ff]" />
              <span className="font-sans text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">
                What did you trade?
              </span>
            </div>

            {/* ROW 1: INSTRUMENT DETAILS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-4 items-end">
              {/* TICKER */}
              <div className="md:col-span-3">
                <div className="min-h-[38px] flex flex-col justify-end mb-2">
                  <label className="form-label">Ticker</label>
                </div>
                <input
                  type="text"
                  value={asset}
                  onChange={(e) => setAsset(e.target.value.toUpperCase())}
                  className="form-input font-bold uppercase"
                  placeholder="BTC"
                  required
                />
              </div>

              {/* DIRECTION */}
              <div className="md:col-span-3">
                <div className="min-h-[38px] flex flex-col justify-end mb-2">
                  <label className="form-label">Direction</label>
                  <p className="text-[9px] text-slate-400">
                    Bought (long) or sold (short)?
                  </p>
                </div>
                <SegmentedToggle
                  name="direction"
                  value={direction}
                  onChange={(val) => setDirection(val as TradeDirection)}
                  options={[
                    { value: "long", label: "LONG" },
                    { value: "short", label: "SHORT" },
                  ]}
                />
              </div>

              {/* HOW MUCH / POSITION SIZE */}
              <div className="md:col-span-3">
                <div className="min-h-[38px] flex flex-col justify-end mb-2">
                  <label className="form-label">How much?</label>
                  <p className="text-[9px] text-slate-400">
                    Position size & unit
                  </p>
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="any"
                    value={positionSize}
                    onChange={(e) => setPositionSize(e.target.value)}
                    className="form-input text-right"
                    placeholder="10"
                    required
                  />
                  <select
                    value={positionUnit}
                    onChange={(e) => setPositionUnit(e.target.value)}
                    className="form-input bg-slate-100 dark:bg-slate-900 text-xs w-32 shrink-0 cursor-pointer"
                  >
                    <option value="shares">Shares</option>
                    <option value="lots">Lots</option>
                    <option value="contracts">Contracts</option>
                    <option value="units">Units</option>
                  </select>
                </div>
              </div>

              {/* BROKER */}
              <div className="md:col-span-3">
                <div className="min-h-[38px] flex flex-col justify-end mb-2">
                  <label className="form-label">Broker / Platform</label>
                </div>
                <input
                  type="text"
                  value={brokerPlatform}
                  onChange={(e) => setBrokerPlatform(e.target.value)}
                  className="form-input"
                  placeholder="e.g. IBKR, Binance"
                />
              </div>
            </div>

            {/* ROW 2: TIMING, TIMEZONE & DURATION */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800/60">
              {/* TIMEZONE SELECTOR */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-[#2962ff]" />
                  <label className="form-label mb-0">Trading Timezone</label>
                </div>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="form-input bg-slate-50 dark:bg-slate-900/80 text-xs w-full sm:w-80 cursor-pointer font-sans"
                >
                  {TIMEZONE_OPTIONS.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                {/* ENTRY TIME */}
                <div className="md:col-span-5">
                  <div className="min-h-[38px] flex flex-col justify-end mb-2">
                    <label className="form-label">
                      Entry Date & Time (24H)
                    </label>
                    <p className="text-[9px] text-slate-400">
                      When did you enter?
                    </p>
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    <input
                      type="date"
                      value={entryDate}
                      onChange={(e) => setEntryDate(e.target.value)}
                      className="form-input col-span-4 text-xs"
                      required
                    />
                    <div className="col-span-3">
                      <TimeInput value={entryTime} onChange={setEntryTime} />
                    </div>
                  </div>
                </div>

                {/* EXIT TIME */}
                <div className="md:col-span-5">
                  <div className="min-h-[38px] flex flex-col justify-end mb-2">
                    <label className="form-label">Exit Date & Time (24H)</label>
                    <p className="text-[9px] text-slate-400">
                      When did you exit?
                    </p>
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    <input
                      type="date"
                      value={exitDate}
                      onChange={(e) => setExitDate(e.target.value)}
                      className={`form-input col-span-4 text-xs ${timeError ? "border-rose-500" : ""}`}
                      required
                    />
                    <div className="col-span-3">
                      <TimeInput
                        value={exitTime}
                        onChange={setExitTime}
                        hasError={Boolean(timeError)}
                      />
                    </div>
                  </div>
                </div>

                {/* DURATION BADGE */}
                <div className="md:col-span-2">
                  <div className="min-h-[38px] flex flex-col justify-end mb-2">
                    <label className="form-label">Duration</label>
                  </div>
                  <div className="form-input bg-slate-50 dark:bg-slate-900/60 text-center text-slate-600 dark:text-slate-400 flex items-center justify-center gap-1.5 font-mono text-xs">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{durationReadout}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* INLINE TIME ERROR */}
            {timeError && (
              <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{timeError}</span>
              </div>
            )}
          </section>

          {/* SECTION 2: PRICES & RISK */}
          <section className="bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 sm:p-6 shadow-xs space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <DollarSign className="w-4 h-4 text-[#2962ff]" />
              <span className="font-sans text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">
                Prices & Risk
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* LEFT 3-COLUMN INPUTS */}
              <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <div className="min-h-[38px] flex flex-col justify-end mb-2">
                    <label className="form-label">Entry Price</label>
                  </div>
                  <input
                    type="number"
                    step="any"
                    value={entryPrice}
                    onChange={(e) => setEntryPrice(e.target.value)}
                    className="form-input text-right"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <div className="min-h-[38px] flex flex-col justify-end mb-2">
                    <label className="form-label">Exit Price</label>
                  </div>
                  <input
                    type="number"
                    step="any"
                    value={exitPrice}
                    onChange={(e) => setExitPrice(e.target.value)}
                    className="form-input text-right"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <div className="min-h-[38px] flex flex-col justify-end mb-2">
                    <label className="form-label">Stop Loss</label>
                    <p className="text-[9px] text-slate-400">Max loss price</p>
                  </div>
                  <input
                    type="number"
                    step="any"
                    value={stopLoss}
                    onChange={(e) => setStopLoss(e.target.value)}
                    className="form-input text-right text-rose-600 dark:text-rose-400"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <div className="min-h-[38px] flex flex-col justify-end mb-2">
                    <label className="form-label">Take Profit</label>
                    <p className="text-[9px] text-slate-400">Target price</p>
                  </div>
                  <input
                    type="number"
                    step="any"
                    value={takeProfit}
                    onChange={(e) => setTakeProfit(e.target.value)}
                    className="form-input text-right text-[#2962ff]"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <div className="min-h-[38px] flex flex-col justify-end mb-2">
                    <label className="form-label">Fees ($)</label>
                  </div>
                  <input
                    type="number"
                    step="any"
                    value={fees}
                    onChange={(e) => setFees(e.target.value)}
                    className="form-input text-right"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <div className="min-h-[38px] flex flex-col justify-end mb-2">
                    <label className="form-label">Account Size ($)</label>
                    <p className="text-[9px] text-slate-400">
                      Your total capital
                    </p>
                  </div>
                  <input
                    type="number"
                    step="any"
                    value={accountBalance}
                    onChange={(e) => setAccountBalance(e.target.value)}
                    className="form-input text-right font-mono"
                    required
                  />
                </div>
              </div>

              {/* RIGHT LIVE READOUT PANEL */}
              <div className="md:col-span-4 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-5 rounded-xl flex flex-col justify-center items-end self-stretch min-h-[148px]">
                <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                  R-Multiple:{" "}
                  <span className="text-[#2962ff] dark:text-[#388bfd] font-bold">
                    {metricsReadout.r_multiple}R
                  </span>
                </span>
                <p className="text-[9px] text-slate-400">
                  Risk-to-reward ratio
                </p>
                <div
                  className={`font-mono text-3xl font-bold mt-2 tracking-tight ${
                    metricsReadout.pnl_currency >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {metricsReadout.pnl_currency >= 0
                    ? `+$${metricsReadout.pnl_currency.toFixed(2)}`
                    : `-$${Math.abs(metricsReadout.pnl_currency).toFixed(2)}`}
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 3: STRATEGY & CONTEXT */}
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
                  <div className="min-h-[38px] flex flex-col justify-end mb-2">
                    <label className="form-label">Strategy / Setup</label>
                    <p className="text-[9px] text-slate-400">
                      Select preset or type custom
                    </p>
                  </div>

                  {!isCustomSetup ? (
                    <div className="space-y-2">
                      <select
                        value={setupName}
                        onChange={(e) => {
                          if (e.target.value === "__custom__") {
                            setIsCustomSetup(true);
                            setCustomSetup("");
                          } else {
                            setSetupName(e.target.value);
                          }
                        }}
                        className="form-input cursor-pointer font-sans"
                      >
                        {STRATEGY_PRESETS.map((preset) => (
                          <option key={preset} value={preset}>
                            {preset}
                          </option>
                        ))}
                        <option value="__custom__">+ Custom Strategy...</option>
                      </select>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customSetup}
                        onChange={(e) => setCustomSetup(e.target.value)}
                        placeholder="Type custom strategy name..."
                        className="form-input"
                        autoFocus
                        required
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomSetup(false);
                          setSetupName("Liquidity Sweep");
                        }}
                        className="px-3 py-2 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-500 rounded-lg hover:border-slate-400"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <div className="min-h-[38px] flex flex-col justify-end mb-2">
                    <label className="form-label">Market Conditions</label>
                  </div>
                  <TagChipSelect
                    availableTags={[
                      "Trending",
                      "Choppy",
                      "High Volatility",
                      "Range Bound",
                    ]}
                    selectedTags={marketConditions}
                    onChange={setMarketConditions}
                  />
                </div>
              </div>

              <div>
                <div className="min-h-[38px] flex flex-col justify-end mb-2">
                  <label className="form-label">Screenshots</label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <ScreenshotDropzone
                    label="BEFORE"
                    onFileSelect={setBeforeFile}
                  />
                  <ScreenshotDropzone
                    label="AFTER"
                    onFileSelect={setAfterFile}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 4: EXIT & EXECUTION */}
          <section className="bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 sm:p-6 shadow-xs space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <CheckCircle2 className="w-4 h-4 text-[#2962ff]" />
              <span className="font-sans text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">
                How did it end?
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="min-h-[38px] flex flex-col justify-end mb-2">
                  <label className="form-label">Why did you exit?</label>
                </div>
                <SegmentedToggle
                  name="exit_reason"
                  value={exitReason}
                  onChange={(val) => setExitReason(val as ExitReason)}
                  options={[
                    { value: "stop_hit", label: "STOP" },
                    { value: "target_hit", label: "TARGET" },
                    { value: "manual_close", label: "MANUAL" },
                    { value: "time_based", label: "TIME" },
                    { value: "other", label: "OTHER" },
                  ]}
                />
              </div>
              <div>
                <div className="min-h-[38px] flex flex-col justify-end mb-2">
                  <label className="form-label">Rate your execution</label>
                  <p className="text-[9px] text-slate-400">
                    1 = poor, 5 = perfect
                  </p>
                </div>
                <TradeGradeDial value={tradeGrade} onChange={setTradeGrade} />
              </div>
            </div>
          </section>

          {/* SECTION 5: MINDSET & DISCIPLINE */}
          <section className="bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 sm:p-6 shadow-xs space-y-6 mb-12">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <HeartHandshake className="w-4 h-4 text-[#2962ff]" />
              <span className="font-sans text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">
                Mindset & Discipline
              </span>
            </div>

            <div className="space-y-6">
              <div>
                <div className="min-h-[38px] flex flex-col justify-end mb-2">
                  <label className="form-label">
                    How were you feeling? (Multi-Select)
                  </label>
                </div>
                <EmotionSelect
                  value={emotionalState}
                  onChange={setEmotionalState}
                />
              </div>

              <div>
                <div className="min-h-[38px] flex flex-col justify-end mb-2">
                  <label className="form-label">
                    Did you follow your plan?
                  </label>
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setFollowedPlan(true)}
                    className={`px-5 py-2 rounded-lg font-mono text-xs font-bold border transition-all cursor-pointer ${
                      followedPlan
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-700"
                    }`}
                  >
                    ✓ Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setFollowedPlan(false)}
                    className={`px-5 py-2 rounded-lg font-mono text-xs font-bold border transition-all cursor-pointer ${
                      !followedPlan
                        ? "bg-rose-600 text-white border-rose-600"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-700"
                    }`}
                  >
                    ✗ No
                  </button>
                </div>
              </div>

              <div>
                <div className="min-h-[38px] flex flex-col justify-end mb-2">
                  <label className="form-label">Mistakes</label>
                  <p className="text-[9px] text-slate-400">
                    Tag what went wrong (if anything)
                  </p>
                </div>
                <TagChipSelect
                  availableTags={[
                    "Chased Entry",
                    "Moved Stop",
                    "FOMO Entry",
                    "Early Exit",
                    "Too Much Size",
                  ]}
                  selectedTags={mistakeTags}
                  onChange={setMistakeTags}
                />
              </div>

              <div>
                <div className="min-h-[38px] flex flex-col justify-end mb-2">
                  <label className="form-label">What did you learn?</label>
                </div>
                <textarea
                  value={lessonsLearned}
                  onChange={(e) => setLessonsLearned(e.target.value)}
                  placeholder="What went well? What would you change?"
                  rows={4}
                  className="form-input resize-none h-auto py-3"
                />
              </div>
            </div>
          </section>

          {/* STICKY BOTTOM SAVE BAR */}
          <div className="fixed bottom-0 left-0 w-full bg-white/95 dark:bg-[#070a14]/95 border-t border-slate-200 dark:border-slate-800 p-3 sm:p-4 z-40">
            <div className="max-w-5xl mx-auto w-full flex justify-between items-center">
              <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Autosave draft on
              </span>
              <button
                type="submit"
                disabled={loading || Boolean(timeError)}
                className="bg-[#2962ff] hover:bg-[#1e4bd8] text-white font-sans font-bold text-xs px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg transition-all disabled:opacity-50 uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? "Saving..." : "Save Trade"}</span>
              </button>
            </div>
          </div>
        </form>
      </main>

      <BottomFooterBar />
    </div>
  );
}
