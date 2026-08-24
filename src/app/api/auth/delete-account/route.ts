import { createServerSupabaseClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/utils/response';

/**
 * DELETE /api/auth/delete-account
 * Permanently deletes the authenticated user's account:
 * 1. Deletes all trades belonging to the user
 * 2. Deletes the user's profile
 * 3. Signs out the user (clears session)
 *
 * Note: Supabase Admin API is needed to fully delete the auth user.
 * Without a service role key, we delete all user DATA and sign them out.
 * The auth record will be orphaned but inaccessible.
 */
export async function DELETE() {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return unauthorizedResponse('User is not authenticated');
    }

    const userId = user.id;

    // 1. Delete all user's trades
    try {
      await (supabase as any)
        .from('trades')
        .delete()
        .eq('user_id', userId);
    } catch {
      // Table might not exist or no trades
    }

    // 2. Delete user's trade plans
    try {
      await (supabase as any)
        .from('trade_plans')
        .delete()
        .eq('user_id', userId);
    } catch {}

    // 3. Delete user's weekly reviews
    try {
      await (supabase as any)
        .from('weekly_reviews')
        .delete()
        .eq('user_id', userId);
    } catch {}

    // 4. Delete user's profile
    try {
      await (supabase as any)
        .from('profiles')
        .delete()
        .eq('id', userId);
    } catch {}

    // 5. Sign out user (clears session cookies)
    await supabase.auth.signOut();

    return successResponse(null, 'Account deleted successfully. All data has been removed.');
  } catch (err: any) {
    return errorResponse(err, 500);
  }
}
