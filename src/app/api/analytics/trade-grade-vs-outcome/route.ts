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
      .select('id, asset, trade_grade, r_multiple, pnl_currency, pnl_percent, followed_plan, entry_time')
      .order('entry_time', { ascending: true });

    if (startDate) query = query.gte('entry_time', startDate);
    if (endDate) query = query.lte('entry_time', endDate);

    const { data: trades, error } = await query;
    if (error) return errorResponse(error.message, 400);

    const points = ((trades as any[]) || []).map((t) => ({

      trade_id: t.id,
      asset: t.asset,
      trade_grade: t.trade_grade,
      r_multiple: Number(t.r_multiple),
      pnl_currency: Number(t.pnl_currency),
      pnl_percent: Number(t.pnl_percent),
      followed_plan: t.followed_plan,
      entry_time: t.entry_time,
    }));

    // Also calculate average outcome per grade (1 to 5)
    const gradeSummary: Record<number, { count: number; total_pnl: number; total_r: number }> = {
      1: { count: 0, total_pnl: 0, total_r: 0 },
      2: { count: 0, total_pnl: 0, total_r: 0 },
      3: { count: 0, total_pnl: 0, total_r: 0 },
      4: { count: 0, total_pnl: 0, total_r: 0 },
      5: { count: 0, total_pnl: 0, total_r: 0 },
    };

    points.forEach((p) => {
      if (gradeSummary[p.trade_grade]) {
        gradeSummary[p.trade_grade].count += 1;
        gradeSummary[p.trade_grade].total_pnl += p.pnl_currency;
        gradeSummary[p.trade_grade].total_r += p.r_multiple;
      }
    });

    const summary = Object.entries(gradeSummary).map(([grade, data]) => ({
      grade: Number(grade),
      trade_count: data.count,
      avg_pnl: data.count > 0 ? Number((data.total_pnl / data.count).toFixed(2)) : 0,
      avg_r_multiple: data.count > 0 ? Number((data.total_r / data.count).toFixed(2)) : 0,
    }));

    return successResponse({
      data_points: points,
      grade_summary: summary,
    });
  } catch (err: any) {
    return errorResponse(err);
  }
}
