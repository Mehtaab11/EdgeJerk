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
      .select('id, asset, entry_time, risk_percent_of_account, account_balance_at_trade, position_size')
      .order('entry_time', { ascending: true });

    if (startDate) query = query.gte('entry_time', startDate);
    if (endDate) query = query.lte('entry_time', endDate);

    const { data: trades, error } = await query;
    if (error) return errorResponse(error.message, 400);

    const riskSeries = ((trades as any[]) || []).map((t) => ({

      trade_id: t.id,
      asset: t.asset,
      entry_time: t.entry_time,
      risk_percent: Number(t.risk_percent_of_account),
      account_balance: Number(t.account_balance_at_trade),
    }));

    const totalRisk = riskSeries.reduce((acc, curr) => acc + curr.risk_percent, 0);
    const avgRiskPercent = riskSeries.length > 0
      ? Number((totalRisk / riskSeries.length).toFixed(2))
      : 0;

    return successResponse({
      average_risk_percent: avgRiskPercent,
      risk_series: riskSeries,
    });
  } catch (err: any) {
    return errorResponse(err);
  }
}
