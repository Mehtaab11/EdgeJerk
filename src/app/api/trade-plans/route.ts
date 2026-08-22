import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/utils/response';
import { createTradePlanSchema } from '@/lib/validations/trade-plan';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return unauthorizedResponse();

    const { data: plans, error } = await supabase
      .from('trade_plans')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return errorResponse(error.message, 400);

    return successResponse(plans);
  } catch (err: any) {
    return errorResponse(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return unauthorizedResponse();

    const body = await request.json();
    const parsed = createTradePlanSchema.parse(body);

    const { data: plan, error } = await supabase
      .from('trade_plans')
      .insert({
        user_id: user.id,
        asset: parsed.asset,
        planned_entry_price: parsed.planned_entry_price,
        planned_stop_loss: parsed.planned_stop_loss,
        planned_take_profit: parsed.planned_take_profit,
        setup_name: parsed.setup_name,
        thesis: parsed.thesis,
      } as any)

      .select()
      .single();

    if (error) return errorResponse(error.message, 400);

    return successResponse(plan, 'Trade plan created successfully', undefined, 201);
  } catch (err: any) {
    return errorResponse(err);
  }
}
