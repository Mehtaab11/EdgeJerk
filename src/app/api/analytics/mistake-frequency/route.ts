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
      .from('trade_mistake_tags')
      .select(`
        trade_id,
        mistake_tag:mistake_tags(id, name),
        trade:trades(entry_time, pnl_currency)
      `);

    const { data, error } = await query;
    if (error) return errorResponse(error.message, 400);

    const tagStats: Record<
      string,
      { tag_id: string; tag_name: string; count: number; total_pnl_impact: number; negative_pnl_cost: number }
    > = {};

    (data || []).forEach((row: any) => {
      const trade = row.trade;
      if (!trade) return;

      // Filter by date if applicable
      if (startDate && new Date(trade.entry_time) < new Date(startDate)) return;
      if (endDate && new Date(trade.entry_time) > new Date(endDate)) return;

      const tag = row.mistake_tag;
      if (!tag) return;

      if (!tagStats[tag.id]) {
        tagStats[tag.id] = {
          tag_id: tag.id,
          tag_name: tag.name,
          count: 0,
          total_pnl_impact: 0,
          negative_pnl_cost: 0,
        };
      }

      const pnl = Number(trade.pnl_currency);
      tagStats[tag.id].count += 1;
      tagStats[tag.id].total_pnl_impact += pnl;
      if (pnl < 0) {
        tagStats[tag.id].negative_pnl_cost += Math.abs(pnl);
      }
    });

    const frequency = Object.values(tagStats).map((st) => ({
      tag_id: st.tag_id,
      tag_name: st.tag_name,
      frequency_count: st.count,
      total_pnl_impact: Number(st.total_pnl_impact.toFixed(2)),
      total_loss_cost: Number(st.negative_pnl_cost.toFixed(2)),
      avg_pnl_impact: Number((st.total_pnl_impact / st.count).toFixed(2)),
    }));

    return successResponse(frequency);
  } catch (err: any) {
    return errorResponse(err);
  }
}
