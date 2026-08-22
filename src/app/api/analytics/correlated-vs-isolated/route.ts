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
      .select('correlated_positions, pnl_currency, r_multiple');

    if (startDate) query = query.gte('entry_time', startDate);
    if (endDate) query = query.lte('entry_time', endDate);

    const { data: trades, error } = await query;
    if (error) return errorResponse(error.message, 400);

    const stats = {
      correlated: { count: 0, wins: 0, total_pnl: 0, total_r: 0 },
      isolated: { count: 0, wins: 0, total_pnl: 0, total_r: 0 },
    };

    ((trades as any[]) || []).forEach((t) => {

      const isCorrelated = Array.isArray(t.correlated_positions) && t.correlated_positions.length > 0;
      const key = isCorrelated ? 'correlated' : 'isolated';
      const pnl = Number(t.pnl_currency);
      const r = Number(t.r_multiple);

      stats[key].count += 1;
      stats[key].total_pnl += pnl;
      stats[key].total_r += r;
      if (pnl > 0) stats[key].wins += 1;
    });

    const formatGroup = (g: typeof stats['correlated'], type: 'correlated' | 'isolated') => ({
      type,
      total_trades: g.count,
      wins: g.wins,
      win_rate_percent: g.count > 0 ? Number(((g.wins / g.count) * 100).toFixed(2)) : 0,
      total_pnl_currency: Number(g.total_pnl.toFixed(2)),
      avg_pnl_currency: g.count > 0 ? Number((g.total_pnl / g.count).toFixed(2)) : 0,
      avg_r_multiple: g.count > 0 ? Number((g.total_r / g.count).toFixed(2)) : 0,
    });

    return successResponse({
      correlated: formatGroup(stats.correlated, 'correlated'),
      isolated: formatGroup(stats.isolated, 'isolated'),
    });
  } catch (err: any) {
    return errorResponse(err);
  }
}
