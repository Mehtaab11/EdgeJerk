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
      .select('emotional_state, pnl_currency, r_multiple')
      .eq('user_id', user.id);

    if (startDate) query = query.gte('entry_time', startDate);
    if (endDate) query = query.lte('entry_time', endDate);

    const { data: trades, error } = await query;
    if (error) return errorResponse(error.message, 400);

    const grouped: Record<
      string,
      { emotion: string; count: number; wins: number; total_pnl: number; total_r: number }
    > = {};

    ((trades as any[]) || []).forEach((t) => {
      let states: string[] = [];
      if (Array.isArray(t.emotional_state)) {
        states = t.emotional_state;
      } else if (typeof t.emotional_state === 'string') {
        states = t.emotional_state.split(',').map((s: string) => s.trim()).filter(Boolean);
      }

      if (states.length === 0) {
        states = ['Calm'];
      }

      const pnl = Number(t.pnl_currency) || 0;
      const r = Number(t.r_multiple) || 0;

      states.forEach((state) => {
        if (!grouped[state]) {
          grouped[state] = { emotion: state, count: 0, wins: 0, total_pnl: 0, total_r: 0 };
        }
        grouped[state].count += 1;
        grouped[state].total_pnl += pnl;
        grouped[state].total_r += r;
        if (pnl > 0) grouped[state].wins += 1;
      });
    });

    const breakdown = Object.values(grouped).map((g) => ({
      emotional_state: g.emotion,
      total_trades: g.count,
      wins: g.wins,
      win_rate_percent: Number(((g.wins / g.count) * 100).toFixed(2)),
      total_pnl_currency: Number(g.total_pnl.toFixed(2)),
      avg_pnl_currency: Number((g.total_pnl / g.count).toFixed(2)),
      avg_r_multiple: Number((g.total_r / g.count).toFixed(2)),
    }));

    return successResponse(breakdown);
  } catch (err: any) {
    return errorResponse(err);
  }
}
