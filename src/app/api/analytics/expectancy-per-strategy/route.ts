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
      .select('setup_name, pnl_currency, r_multiple');

    if (startDate) query = query.gte('entry_time', startDate);
    if (endDate) query = query.lte('entry_time', endDate);

    const { data: trades, error } = await query;
    if (error) return errorResponse(error.message, 400);

    const grouped: Record<
      string,
      {
        setup_name: string;
        total_trades: number;
        wins: number;
        losses: number;
        total_pnl: number;
        winning_pnl_sum: number;
        losing_pnl_sum: number;
        r_multiple_sum: number;
      }
    > = {};

    ((trades as any[]) || []).forEach((t) => {

      const name = t.setup_name || 'Unspecified';
      if (!grouped[name]) {
        grouped[name] = {
          setup_name: name,
          total_trades: 0,
          wins: 0,
          losses: 0,
          total_pnl: 0,
          winning_pnl_sum: 0,
          losing_pnl_sum: 0,
          r_multiple_sum: 0,
        };
      }

      const pnl = Number(t.pnl_currency);
      const r = Number(t.r_multiple);

      grouped[name].total_trades += 1;
      grouped[name].total_pnl += pnl;
      grouped[name].r_multiple_sum += r;

      if (pnl > 0) {
        grouped[name].wins += 1;
        grouped[name].winning_pnl_sum += pnl;
      } else if (pnl < 0) {
        grouped[name].losses += 1;
        grouped[name].losing_pnl_sum += Math.abs(pnl);
      }
    });

    const result = Object.values(grouped).map((g) => {
      const winRateDecimal = g.total_trades > 0 ? g.wins / g.total_trades : 0;
      const lossRateDecimal = g.total_trades > 0 ? g.losses / g.total_trades : 0;
      const winRatePercent = Number((winRateDecimal * 100).toFixed(2));
      const avgWin = g.wins > 0 ? Number((g.winning_pnl_sum / g.wins).toFixed(2)) : 0;
      const avgLoss = g.losses > 0 ? Number((g.losing_pnl_sum / g.losses).toFixed(2)) : 0;
      const avgR = g.total_trades > 0 ? Number((g.r_multiple_sum / g.total_trades).toFixed(2)) : 0;
      const expectedValue = Number((winRateDecimal * avgWin - lossRateDecimal * avgLoss).toFixed(2));

      return {
        setup_name: g.setup_name,
        total_trades: g.total_trades,
        wins: g.wins,
        losses: g.losses,
        win_rate_percent: winRatePercent,
        avg_r_multiple: avgR,
        avg_win_currency: avgWin,
        avg_loss_currency: avgLoss,
        expected_value: expectedValue,
        total_pnl: Number(g.total_pnl.toFixed(2)),
      };
    });

    return successResponse(result);
  } catch (err: any) {
    return errorResponse(err);
  }
}
