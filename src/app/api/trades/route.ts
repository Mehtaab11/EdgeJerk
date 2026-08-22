import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/utils/response';
import { createTradeSchema } from '@/lib/validations/trade';
import { calculateTradeMetrics } from '@/lib/utils/trade-calculations';
import { TradeFilterParams } from '@/types/api.types';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorizedResponse();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = (page - 1) * limit;

    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const asset = searchParams.get('asset');
    const setupName = searchParams.get('setupName');
    const direction = searchParams.get('direction') as TradeFilterParams['direction'];
    const emotionalState = searchParams.get('emotionalState') as TradeFilterParams['emotionalState'];
    const mistakeTagId = searchParams.get('mistakeTagId');
    const session = searchParams.get('session') as TradeFilterParams['session'];
    const exitReason = searchParams.get('exitReason') as TradeFilterParams['exitReason'];
    const sortBy = searchParams.get('sortBy') || 'entry_time';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? true : false;

    let query = supabase
      .from('trades')
      .select(`
        *,
        screenshots(*),
        trade_plan:trade_plans(*),
        trade_mistake_tags!inner(
          mistake_tag:mistake_tags(*)
        )
      `, { count: 'exact' });

    // If mistakeTagId is provided, filter via the join; otherwise do standard select
    if (!mistakeTagId) {
      query = supabase
        .from('trades')
        .select(`
          *,
          screenshots(*),
          trade_plan:trade_plans(*),
          trade_mistake_tags(
            mistake_tag:mistake_tags(*)
          )
        `, { count: 'exact' });
    } else {
      query = query.eq('trade_mistake_tags.mistake_tag_id', mistakeTagId);
    }

    if (startDate) query = query.gte('entry_time', startDate);
    if (endDate) query = query.lte('entry_time', endDate);
    if (asset) query = query.ilike('asset', `%${asset}%`);
    if (setupName) query = query.ilike('setup_name', `%${setupName}%`);
    if (direction) query = query.eq('direction', direction);
    if (emotionalState) query = query.eq('emotional_state', emotionalState);
    if (session) query = query.eq('session', session);
    if (exitReason) query = query.eq('exit_reason', exitReason);

    query = query
      .order(sortBy, { ascending: sortOrder })
      .range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) return errorResponse(error.message, 400);

    // Transform joined mistake tags into a clean array
    const formattedTrades = (data || []).map((trade: any) => {
      const mistake_tags = trade.trade_mistake_tags
        ? trade.trade_mistake_tags.map((tmt: any) => tmt.mistake_tag).filter(Boolean)
        : [];
      const { trade_mistake_tags, ...rest } = trade;
      return {
        ...rest,
        mistake_tags,
      };
    });

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return successResponse(formattedTrades, undefined, {
      total,
      page,
      limit,
      totalPages,
    });
  } catch (err: any) {
    return errorResponse(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorizedResponse();

    const body = await request.json();
    const parsed = createTradeSchema.parse(body);

    // 1. Calculate Server-side write fields
    const metrics = calculateTradeMetrics({
      direction: parsed.direction,
      position_size: parsed.position_size,
      entry_price: parsed.entry_price,
      exit_price: parsed.exit_price,
      stop_loss: parsed.stop_loss,
      take_profit: parsed.take_profit,
      entry_time: parsed.entry_time,
      fees_commissions: parsed.fees_commissions,
      account_balance_at_trade: parsed.account_balance_at_trade,
      session: parsed.session,
    });

    // 2. Ensure Strategy Tag exists in user's strategy_tags list
    await supabase
      .from('strategy_tags')
      .upsert(
        { user_id: user.id, name: parsed.setup_name } as any,
        { onConflict: 'user_id,name', ignoreDuplicates: true }
      );

    // 3. Insert Trade Record
    const { data: trade, error: tradeError } = await supabase
      .from('trades')
      .insert({
        user_id: user.id,
        trade_plan_id: parsed.trade_plan_id || null,
        asset: parsed.asset,
        direction: parsed.direction,
        position_size: parsed.position_size,
        position_size_unit: parsed.position_size_unit,
        entry_price: parsed.entry_price,
        exit_price: parsed.exit_price,
        stop_loss: parsed.stop_loss,
        take_profit: parsed.take_profit,
        entry_time: parsed.entry_time,
        exit_time: parsed.exit_time,
        session: metrics.session,
        fees_commissions: parsed.fees_commissions,
        account_balance_at_trade: parsed.account_balance_at_trade,
        leverage_used: parsed.leverage_used,
        broker_platform: parsed.broker_platform,
        pnl_currency: metrics.pnl_currency,
        pnl_percent: metrics.pnl_percent,
        risk_percent_of_account: metrics.risk_percent_of_account,
        r_multiple: metrics.r_multiple,
        exit_reason: parsed.exit_reason,
        trade_grade: parsed.trade_grade,
        setup_name: parsed.setup_name,
        market_conditions: parsed.market_conditions,
        correlated_positions: parsed.correlated_positions,
        news_event_tag: parsed.news_event_tag || null,
        emotional_state: parsed.emotional_state,
        followed_plan: parsed.followed_plan,
        lessons_learned: parsed.lessons_learned,
      } as any)
      .select()
      .single();

    if (tradeError || !trade) {
      return errorResponse(tradeError?.message || 'Failed to create trade', 400);
    }

    // 4. Resolve/Insert Mistake Tags & create Many-to-Many join entries
    if (parsed.mistake_tag_names && parsed.mistake_tag_names.length > 0) {
      const mistakeTagIds: string[] = [];

      for (const tagName of parsed.mistake_tag_names) {
        const cleanName = tagName.trim();
        if (!cleanName) continue;

        // Upsert tag
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
          trade_id: (trade as any).id,
          mistake_tag_id: tagId,
        }));
        await supabase.from('trade_mistake_tags').insert(joinEntries as any);
      }
    }

    return successResponse(trade, 'Trade logged successfully', undefined, 201);

  } catch (err: any) {
    return errorResponse(err);
  }
}
