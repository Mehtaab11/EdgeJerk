import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/utils/response';
import { parseDateFilter } from '@/lib/utils/analytics-filter';
import { ExitReason } from '@/types/database.types';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorizedResponse();

    const { startDate, endDate } = parseDateFilter(request);

    let query = supabase
      .from('trades')
      .select('exit_reason, pnl_currency');

    if (startDate) query = query.gte('entry_time', startDate);
    if (endDate) query = query.lte('entry_time', endDate);

    const { data: trades, error } = await query;
    if (error) return errorResponse(error.message, 400);

    const grouped: Record<
      string,
      { exit_reason: ExitReason; count: number; wins: number; total_pnl: number }
    > = {};

    ((trades as any[]) || []).forEach((t) => {

      const reason = t.exit_reason as ExitReason;
      if (!grouped[reason]) {
        grouped[reason] = { exit_reason: reason, count: 0, wins: 0, total_pnl: 0 };
      }
      grouped[reason].count += 1;
      const pnl = Number(t.pnl_currency);
      grouped[reason].total_pnl += pnl;
      if (pnl > 0) grouped[reason].wins += 1;
    });

    const breakdown = Object.values(grouped).map((g) => ({
      exit_reason: g.exit_reason,
      total_trades: g.count,
      wins: g.wins,
      win_rate_percent: Number(((g.wins / g.count) * 100).toFixed(2)),
      avg_pnl_currency: Number((g.total_pnl / g.count).toFixed(2)),
      total_pnl_currency: Number(g.total_pnl.toFixed(2)),
    }));

    return successResponse(breakdown);
  } catch (err: any) {
    return errorResponse(err);
  }
}
