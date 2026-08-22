import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/utils/response';
import { parseDateFilter } from '@/lib/utils/analytics-filter';
import { TradeSession } from '@/types/database.types';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorizedResponse();

    const { startDate, endDate } = parseDateFilter(request);

    let query = supabase
      .from('trades')
      .select('session, news_event_tag, pnl_currency, r_multiple');

    if (startDate) query = query.gte('entry_time', startDate);
    if (endDate) query = query.lte('entry_time', endDate);

    const { data: trades, error } = await query;
    if (error) return errorResponse(error.message, 400);

    const sessionStats: Record<string, { session: TradeSession; count: number; wins: number; total_pnl: number; total_r: number }> = {};
    const newsStats: Record<string, { tag: string; count: number; wins: number; total_pnl: number; total_r: number }> = {};

    ((trades as any[]) || []).forEach((t) => {

      const pnl = Number(t.pnl_currency);
      const r = Number(t.r_multiple);

      // Session stats
      const s = t.session as TradeSession;
      if (!sessionStats[s]) {
        sessionStats[s] = { session: s, count: 0, wins: 0, total_pnl: 0, total_r: 0 };
      }
      sessionStats[s].count += 1;
      sessionStats[s].total_pnl += pnl;
      sessionStats[s].total_r += r;
      if (pnl > 0) sessionStats[s].wins += 1;

      // News stats
      const newsTag = t.news_event_tag || 'none';
      if (!newsStats[newsTag]) {
        newsStats[newsTag] = { tag: newsTag, count: 0, wins: 0, total_pnl: 0, total_r: 0 };
      }
      newsStats[newsTag].count += 1;
      newsStats[newsTag].total_pnl += pnl;
      newsStats[newsTag].total_r += r;
      if (pnl > 0) newsStats[newsTag].wins += 1;
    });

    const sessionBreakdown = Object.values(sessionStats).map((s) => ({
      session: s.session,
      total_trades: s.count,
      wins: s.wins,
      win_rate_percent: Number(((s.wins / s.count) * 100).toFixed(2)),
      total_pnl_currency: Number(s.total_pnl.toFixed(2)),
      avg_pnl_currency: Number((s.total_pnl / s.count).toFixed(2)),
      avg_r_multiple: Number((s.total_r / s.count).toFixed(2)),
    }));

    const newsBreakdown = Object.values(newsStats).map((n) => ({
      news_event_tag: n.tag,
      total_trades: n.count,
      wins: n.wins,
      win_rate_percent: Number(((n.wins / n.count) * 100).toFixed(2)),
      total_pnl_currency: Number(n.total_pnl.toFixed(2)),
      avg_pnl_currency: Number((n.total_pnl / n.count).toFixed(2)),
      avg_r_multiple: Number((n.total_r / n.count).toFixed(2)),
    }));

    return successResponse({
      sessions: sessionBreakdown,
      news_events: newsBreakdown,
    });
  } catch (err: any) {
    return errorResponse(err);
  }
}
