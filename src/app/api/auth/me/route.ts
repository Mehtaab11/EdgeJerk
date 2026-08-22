import { createServerSupabaseClient } from '@/lib/supabase/server';
import { successResponse, unauthorizedResponse, errorResponse } from '@/lib/utils/response';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return unauthorizedResponse('User is not authenticated');
    }

    // Fetch profile info
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return successResponse({
      user,
      profile,
    });
  } catch (err: any) {
    return errorResponse(err);
  }
}
