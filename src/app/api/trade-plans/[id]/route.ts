import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse } from '@/lib/utils/response';
import { updateTradePlanSchema } from '@/lib/validations/trade-plan';

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

    const { data: plan, error } = await supabase
      .from('trade_plans')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !plan) return notFoundResponse('Trade plan not found');

    return successResponse(plan);
  } catch (err: any) {
    return errorResponse(err);
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorizedResponse();

    const body = await request.json();
    const parsed = updateTradePlanSchema.parse(body);

    const { data: updatedPlan, error } = await (supabase.from('trade_plans') as any)
      .update(parsed)
      .eq('id', params.id)
      .select()
      .single();



    if (error || !updatedPlan) return errorResponse(error?.message || 'Failed to update trade plan', 400);

    return successResponse(updatedPlan, 'Trade plan updated successfully');
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
      .from('trade_plans')
      .delete()
      .eq('id', params.id);

    if (error) return errorResponse(error.message, 400);

    return successResponse(null, 'Trade plan deleted successfully');
  } catch (err: any) {
    return errorResponse(err);
  }
}
