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
      .select('entry_time, pnl_currency')
      .order('entry_time', { ascending: true });

    if (startDate) query = query.gte('entry_time', startDate);
    if (endDate) query = query.lte('entry_time', endDate);

    const { data: trades, error } = await query;
    if (error) return errorResponse(error.message, 400);

    const dailyMap: Record<string, { date: string; total_pnl: number; trade_count: number; win_count: number }> = {};

    ((trades as any[]) || []).forEach((t) => {

      const dateStr = t.entry_time.split('T')[0];
      if (!dailyMap[dateStr]) {
        dailyMap[dateStr] = {
          date: dateStr,
          total_pnl: 0,
          trade_count: 0,
          win_count: 0,
        };
      }
      const pnl = Number(t.pnl_currency);
      dailyMap[dateStr].total_pnl += pnl;
      dailyMap[dateStr].trade_count += 1;
      if (pnl > 0) dailyMap[dateStr].win_count += 1;
    });

    const heatmap = Object.values(dailyMap).map((d) => ({
      date: d.date,
      total_pnl: Number(d.total_pnl.toFixed(2)),
      trade_count: d.trade_count,
      win_count: d.win_count,
      is_profitable: d.total_pnl > 0,
    }));

    return successResponse(heatmap);
  } catch (err: any) {
    return errorResponse(err);
  }
}
