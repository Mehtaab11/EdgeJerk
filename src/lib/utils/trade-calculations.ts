import { TradeDirection, TradeSession } from '@/types/database.types';

export interface CalculationInput {
  direction: TradeDirection;
  position_size: number;
  entry_price: number;
  exit_price: number;
  stop_loss: number;
  take_profit: number;
  entry_time: string;
  fees_commissions?: number;
  account_balance_at_trade: number;
  session?: TradeSession;
}

export interface CalculationResult {
  pnl_currency: number;
  pnl_percent: number;
  risk_amount: number;
  risk_percent_of_account: number;
  r_multiple: number;
  session: TradeSession;
}

/**
 * Auto-derives trading session based on entry timestamp in UTC hour if not provided manually.
 * - Asia: 00:00 - 07:59 UTC
 * - London: 08:00 - 12:59 UTC
 * - Overlap (London + NY): 13:00 - 15:59 UTC
 * - New York: 16:00 - 23:59 UTC
 */
export function deriveSession(entryTimeString: string): TradeSession {
  const entryDate = new Date(entryTimeString);
  const utcHour = entryDate.getUTCHours();

  if (utcHour >= 0 && utcHour < 8) {
    return 'asia';
  } else if (utcHour >= 8 && utcHour < 13) {
    return 'london';
  } else if (utcHour >= 13 && utcHour < 16) {
    return 'overlap';
  } else {
    return 'new_york';
  }
}

/**
 * Computes all derived fields on trade write (server-side).
 */
export function calculateTradeMetrics(input: CalculationInput): CalculationResult {
  const {
    direction,
    position_size,
    entry_price,
    exit_price,
    stop_loss,
    fees_commissions = 0,
    account_balance_at_trade,
    entry_time,
    session: manualSession,
  } = input;

  const isLong = direction === 'long';

  // 1. Calculate Net P&L in Currency
  const rawPnl = isLong
    ? (exit_price - entry_price) * position_size
    : (entry_price - exit_price) * position_size;
  const pnl_currency = Number((rawPnl - fees_commissions).toFixed(4));

  // 2. Calculate Initial Risk Amount ($) based on Stop Loss
  const rawRisk = isLong
    ? (entry_price - stop_loss) * position_size
    : (stop_loss - entry_price) * position_size;
  const risk_amount = Number(Math.max(0, rawRisk).toFixed(4));

  // 3. Calculate P&L % of Account
  const pnl_percent = account_balance_at_trade > 0
    ? Number(((pnl_currency / account_balance_at_trade) * 100).toFixed(4))
    : 0;

  // 4. Calculate Risk % of Account
  const risk_percent_of_account = account_balance_at_trade > 0
    ? Number(((risk_amount / account_balance_at_trade) * 100).toFixed(4))
    : 0;

  // 5. Calculate R-Multiple (P&L / Initial Risk)
  const r_multiple = risk_amount > 0
    ? Number((pnl_currency / risk_amount).toFixed(4))
    : 0;

  // 6. Resolve Session
  const session = manualSession || deriveSession(entry_time);

  return {
    pnl_currency,
    pnl_percent,
    risk_amount,
    risk_percent_of_account,
    r_multiple,
    session,
  };
}

/**
 * Calculates slippage metrics when a linked trade plan exists.
 */
export function calculateSlippage(
  direction: TradeDirection,
  actualEntry: number,
  actualExit: number,
  plannedEntry: number,
  plannedTakeProfit: number
) {
  const isLong = direction === 'long';
  const entry_slippage = isLong
    ? Number((actualEntry - plannedEntry).toFixed(4))
    : Number((plannedEntry - actualEntry).toFixed(4));

  const exit_slippage = isLong
    ? Number((plannedTakeProfit - actualExit).toFixed(4))
    : Number((actualExit - plannedTakeProfit).toFixed(4));

  const total_slippage = Number((entry_slippage + exit_slippage).toFixed(4));

  return {
    entry_slippage,
    exit_slippage,
    total_slippage,
  };
}
