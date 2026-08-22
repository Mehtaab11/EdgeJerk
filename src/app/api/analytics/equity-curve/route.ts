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
      .select('id, entry_time, exit_time, pnl_currency, pnl_percent, asset, direction')
      .order('entry_time', { ascending: true });

    if (startDate) query = query.gte('entry_time', startDate);
    if (endDate) query = query.lte('entry_time', endDate);

    const { data: trades, error } = await query;
    if (error) return errorResponse(error.message, 400);

    let cumulativePnl = 0;
    let cumulativePnlPercent = 0;

    const equityCurve = ((trades as any[]) || []).map((trade) => {

      cumulativePnl += Number(trade.pnl_currency);
      cumulativePnlPercent += Number(trade.pnl_percent);
      return {
        trade_id: trade.id,
        entry_time: trade.entry_time,
        exit_time: trade.exit_time,
        asset: trade.asset,
        direction: trade.direction,
        pnl_currency: Number(trade.pnl_currency),
        cumulative_pnl: Number(cumulativePnl.toFixed(2)),
        cumulative_pnl_percent: Number(cumulativePnlPercent.toFixed(2)),
      };
    });

    return successResponse(equityCurve);
  } catch (err: any) {
    return errorResponse(err);
  }
}
