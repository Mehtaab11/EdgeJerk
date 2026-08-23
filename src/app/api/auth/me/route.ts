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
    let profile: any = null;
    try {
      const { data } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      profile = data;
    } catch {
      // Ignored
    }

    const displayName =
      profile?.display_name ||
      user.user_metadata?.display_name ||
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      null;

    const defaultAccountSize =
      profile?.default_account_size ||
      user.user_metadata?.default_account_size ||
      10000;

    return successResponse({
      user,
      profile: {
        ...(profile || {}),
        id: user.id,
        email: user.email,
        display_name: displayName,
        default_account_size: defaultAccountSize,
      },
    });
  } catch (err: any) {
    return errorResponse(err);
  }
}
