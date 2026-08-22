import { createServerSupabaseClient } from '@/lib/supabase/server';
import { successResponse, errorResponse } from '@/lib/utils/response';

export async function POST() {
  try {
    const supabase = createServerSupabaseClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return errorResponse(error.message, 400);
    }

    return successResponse(null, 'Successfully logged out');
  } catch (err: any) {
    return errorResponse(err);
  }
}
