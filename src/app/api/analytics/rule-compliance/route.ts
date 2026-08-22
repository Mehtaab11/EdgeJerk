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
      .select('entry_time, followed_plan, pnl_currency')
      .order('entry_time', { ascending: true });

    if (startDate) query = query.gte('entry_time', startDate);
    if (endDate) query = query.lte('entry_time', endDate);

    const { data: trades, error } = await query;
    if (error) return errorResponse(error.message, 400);

    const monthlyBuckets: Record<
      string,
      { month: string; total_trades: number; followed_count: number; followed_pnl: number; broken_pnl: number }
    > = {};

    ((trades as any[]) || []).forEach((t) => {

      const date = new Date(t.entry_time);
      const monthKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;

      if (!monthlyBuckets[monthKey]) {
        monthlyBuckets[monthKey] = {
          month: monthKey,
          total_trades: 0,
          followed_count: 0,
          followed_pnl: 0,
          broken_pnl: 0,
        };
      }

      monthlyBuckets[monthKey].total_trades += 1;
      const pnl = Number(t.pnl_currency);

      if (t.followed_plan) {
        monthlyBuckets[monthKey].followed_count += 1;
        monthlyBuckets[monthKey].followed_pnl += pnl;
      } else {
        monthlyBuckets[monthKey].broken_pnl += pnl;
      }
    });

    const series = Object.values(monthlyBuckets).map((b) => ({
      month: b.month,
      total_trades: b.total_trades,
      followed_count: b.followed_count,
      broken_count: b.total_trades - b.followed_count,
      compliance_percent: Number(((b.followed_count / b.total_trades) * 100).toFixed(2)),
      followed_total_pnl: Number(b.followed_pnl.toFixed(2)),
      broken_total_pnl: Number(b.broken_pnl.toFixed(2)),
    }));

    return successResponse(series);
  } catch (err: any) {
    return errorResponse(err);
  }
}
