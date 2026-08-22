import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/utils/response';
import { createWeeklyReviewSchema } from '@/lib/validations/weekly-review';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorizedResponse();

    const { data: reviews, error } = await supabase
      .from('weekly_reviews')
      .select('*')
      .order('week_start_date', { ascending: false });

    if (error) return errorResponse(error.message, 400);

    return successResponse(reviews);
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
    const parsed = createWeeklyReviewSchema.parse(body);

    const { data: review, error } = await supabase
      .from('weekly_reviews')
      .insert({
        user_id: user.id,
        week_start_date: parsed.week_start_date,
        summary_notes: parsed.summary_notes,
      } as any)
      .select()
      .single();


    if (error) return errorResponse(error.message, 400);

    return successResponse(review, 'Weekly review logged successfully', undefined, 201);
  } catch (err: any) {
    return errorResponse(err);
  }
}
