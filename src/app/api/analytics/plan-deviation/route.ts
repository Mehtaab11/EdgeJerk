import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/utils/response';
import { parseDateFilter } from '@/lib/utils/analytics-filter';
import { calculateSlippage } from '@/lib/utils/trade-calculations';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorizedResponse();

    const { startDate, endDate } = parseDateFilter(request);

    let query = supabase
      .from('trades')
      .select(`
        id,
        direction,
        entry_price,
        exit_price,
        followed_plan,
        trade_plan:trade_plans(planned_entry_price, planned_take_profit, planned_stop_loss)
      `);

    if (startDate) query = query.gte('entry_time', startDate);
    if (endDate) query = query.lte('entry_time', endDate);

    const { data: trades, error } = await query;
    if (error) return errorResponse(error.message, 400);

    let totalTrades = ((trades as any[]) || []).length;
    let followedPlanCount = 0;
    let plannedTradesCount = 0;

    let totalEntrySlippage = 0;
    let totalExitSlippage = 0;

    ((trades as any[]) || []).forEach((t) => {

      if (t.followed_plan) followedPlanCount += 1;

      if (t.trade_plan) {
        plannedTradesCount += 1;
        const sl = calculateSlippage(
          t.direction,
          t.entry_price,
          t.exit_price,
          t.trade_plan.planned_entry_price,
          t.trade_plan.planned_take_profit
        );
        totalEntrySlippage += sl.entry_slippage;
        totalExitSlippage += sl.exit_slippage;
      }
    });

    const compliancePercent = totalTrades > 0
      ? Number(((followedPlanCount / totalTrades) * 100).toFixed(2))
      : 0;

    const deviationPercent = Number((100 - compliancePercent).toFixed(2));

    const avgEntrySlippage = plannedTradesCount > 0
      ? Number((totalEntrySlippage / plannedTradesCount).toFixed(4))
      : 0;

    const avgExitSlippage = plannedTradesCount > 0
      ? Number((totalExitSlippage / plannedTradesCount).toFixed(4))
      : 0;

    return successResponse({
      total_trades: totalTrades,
      followed_plan_count: followedPlanCount,
      plan_compliance_percent: compliancePercent,
      plan_deviation_percent: deviationPercent,
      linked_plans_count: plannedTradesCount,
      avg_entry_slippage: avgEntrySlippage,
      avg_exit_slippage: avgExitSlippage,
      avg_total_slippage: Number((avgEntrySlippage + avgExitSlippage).toFixed(4)),
    });
  } catch (err: any) {
    return errorResponse(err);
  }
}
