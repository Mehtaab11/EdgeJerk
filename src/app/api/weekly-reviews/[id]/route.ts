import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse } from '@/lib/utils/response';
import { updateWeeklyReviewSchema } from '@/lib/validations/weekly-review';

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

    const { data: review, error } = await supabase
      .from('weekly_reviews')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !review) return notFoundResponse('Weekly review not found');

    return successResponse(review);
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
    const parsed = updateWeeklyReviewSchema.parse(body);

    const { data: updatedReview, error } = await (supabase.from('weekly_reviews') as any)
      .update(parsed)
      .eq('id', params.id)
      .select()
      .single();



    if (error || !updatedReview) return errorResponse(error?.message || 'Failed to update weekly review', 400);

    return successResponse(updatedReview, 'Weekly review updated successfully');
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
      .from('weekly_reviews')
      .delete()
      .eq('id', params.id);

    if (error) return errorResponse(error.message, 400);

    return successResponse(null, 'Weekly review deleted successfully');
  } catch (err: any) {
    return errorResponse(err);
  }
}
