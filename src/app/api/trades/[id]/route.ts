import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse } from '@/lib/utils/response';
import { updateTradeSchema } from '@/lib/validations/trade';
import { calculateTradeMetrics, calculateSlippage } from '@/lib/utils/trade-calculations';

interface Params {
  params: {
    id: string;
  };
}

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorizedResponse();

    const { data: trade, error } = await supabase
      .from('trades')
      .select(`
        *,
        screenshots(*),
        trade_plan:trade_plans(*),
        trade_mistake_tags(
          mistake_tag:mistake_tags(*)
        )
      `)
      .eq('id', params.id)
      .single();

    if (error || !trade) return notFoundResponse('Trade not found');

    const mistake_tags = (trade as any).trade_mistake_tags
      ? (trade as any).trade_mistake_tags.map((tmt: any) => tmt.mistake_tag).filter(Boolean)
      : [];

    let slippage = null;
    if ((trade as any).trade_plan) {
      slippage = calculateSlippage(
        (trade as any).direction,
        (trade as any).entry_price,
        (trade as any).exit_price,
        (trade as any).trade_plan.planned_entry_price,
        (trade as any).trade_plan.planned_take_profit
      );
    }

    const { trade_mistake_tags, ...rest } = trade as any;

    return successResponse({
      ...rest,
      mistake_tags,
      slippage,
    });
  } catch (err: any) {
    return errorResponse(err);
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorizedResponse();

    // Fetch existing trade to merge fields for recalculated metrics
    const { data: existingTrade, error: fetchErr } = await supabase
      .from('trades')
      .select('*')
      .eq('id', params.id)
      .single();

    if (fetchErr || !existingTrade) return notFoundResponse('Trade not found');

    const body = await request.json();
    const parsed = updateTradeSchema.parse(body);

    const merged = {
      ...(existingTrade as any),
      ...parsed,
    };

    // Recalculate metrics on write update
    const metrics = calculateTradeMetrics({
      direction: merged.direction,
      position_size: merged.position_size,
      entry_price: merged.entry_price,
      exit_price: merged.exit_price,
      stop_loss: merged.stop_loss,
      take_profit: merged.take_profit,
      entry_time: merged.entry_time,
      fees_commissions: merged.fees_commissions,
      account_balance_at_trade: merged.account_balance_at_trade,
      session: merged.session,
    });

    const updatePayload: any = {
      ...parsed,
      session: metrics.session,
      pnl_currency: metrics.pnl_currency,
      pnl_percent: metrics.pnl_percent,
      risk_percent_of_account: metrics.risk_percent_of_account,
      r_multiple: metrics.r_multiple,
    };

    // Remove non-table field from update payload
    delete updatePayload.mistake_tag_names;

    const { data: updatedTrade, error: updateErr } = await (supabase.from('trades') as any)
      .update(updatePayload)
      .eq('id', params.id)
      .select()
      .single();


    if (updateErr || !updatedTrade) return errorResponse(updateErr?.message || 'Failed to update trade', 400);

    // Update mistake tag relationships if provided
    if (parsed.mistake_tag_names !== undefined) {
      await supabase.from('trade_mistake_tags').delete().eq('trade_id', params.id);

      const mistakeTagIds: string[] = [];
      for (const tagName of parsed.mistake_tag_names) {
        const cleanName = tagName.trim();
        if (!cleanName) continue;

        const { data: tag } = await supabase
          .from('mistake_tags')
          .select('id')
          .eq('user_id', user.id)
          .ilike('name', cleanName)
          .maybeSingle();

        if (tag) {
          mistakeTagIds.push((tag as any).id);
        } else {
          const { data: newTag } = await supabase
            .from('mistake_tags')
            .insert({ user_id: user.id, name: cleanName } as any)
            .select('id')
            .single();
          if (newTag) mistakeTagIds.push((newTag as any).id);
        }
      }

      if (mistakeTagIds.length > 0) {
        const joinEntries = mistakeTagIds.map((tagId) => ({
          trade_id: params.id,
          mistake_tag_id: tagId,
        }));
        await supabase.from('trade_mistake_tags').insert(joinEntries as any);
      }
    }

    return successResponse(updatedTrade, 'Trade updated successfully');

  } catch (err: any) {
    return errorResponse(err);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorizedResponse();

    const { error } = await supabase
      .from('trades')
      .delete()
      .eq('id', params.id);

    if (error) return errorResponse(error.message, 400);

    return successResponse(null, 'Trade deleted successfully');
  } catch (err: any) {
    return errorResponse(err);
  }
}
