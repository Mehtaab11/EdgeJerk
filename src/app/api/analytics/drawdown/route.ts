import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/utils/response';
import { parseDateFilter } from '@/lib/utils/analytics-filter';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorizedResponse();

    const { startDate, endDate } = parseDateFilter(request);

    let query = supabase
      .from('trades')
      .select('id, entry_time, exit_time, pnl_currency, account_balance_at_trade')
      .order('entry_time', { ascending: true });

    if (startDate) query = query.gte('entry_time', startDate);
    if (endDate) query = query.lte('entry_time', endDate);

    const { data: trades, error } = await query;
    if (error) return errorResponse(error.message, 400);

    let cumulativePnl = 0;
    let peakPnl = 0;
    let maxDrawdownPnl = 0;
    let maxDrawdownPercent = 0;

    const drawdownSeries = ((trades as any[]) || []).map((trade) => {

      cumulativePnl += Number(trade.pnl_currency);
      if (cumulativePnl > peakPnl) {
        peakPnl = cumulativePnl;
      }
      const drawdownAmount = peakPnl - cumulativePnl;
      const initialBalance = Number(trade.account_balance_at_trade) || 10000;
      const peakEquity = initialBalance + peakPnl;
      const drawdownPercent = peakEquity > 0 ? (drawdownAmount / peakEquity) * 100 : 0;

      if (drawdownAmount > maxDrawdownPnl) maxDrawdownPnl = drawdownAmount;
      if (drawdownPercent > maxDrawdownPercent) maxDrawdownPercent = drawdownPercent;

      return {
        trade_id: trade.id,
        entry_time: trade.entry_time,
        cumulative_pnl: Number(cumulativePnl.toFixed(2)),
        peak_pnl: Number(peakPnl.toFixed(2)),
        drawdown_amount: Number(drawdownAmount.toFixed(2)),
        drawdown_percent: Number(drawdownPercent.toFixed(2)),
      };
    });

    return successResponse({
      max_drawdown_amount: Number(maxDrawdownPnl.toFixed(2)),
      max_drawdown_percent: Number(maxDrawdownPercent.toFixed(2)),
      drawdown_series: drawdownSeries,
    });
  } catch (err: any) {
    return errorResponse(err);
  }
}
