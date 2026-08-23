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

    // Fetch profile info from profiles table if exists
    let profile: any = null;
    try {
      const { data } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      profile = data;
    } catch {
      // Ignored
    }

    // Prioritize user_metadata (which gets updated in realtime via updateUser)
    const displayName =
      user.user_metadata?.display_name ||
      profile?.display_name ||
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      null;

    const defaultAccountSize = Number(
      user.user_metadata?.default_account_size ??
      profile?.default_account_size ??
      10000
    );

    // Calculate running balance based on total trade P&L for THIS user
    let totalPnl = 0;
    try {
      const { data: trades } = await (supabase as any)
        .from('trades')
        .select('pnl_currency')
        .eq('user_id', user.id);

      if (trades && trades.length > 0) {
        totalPnl = trades.reduce((sum: number, t: any) => sum + (Number(t.pnl_currency) || 0), 0);
      }
    } catch {
      // Ignored
    }

    const currentAccountBalance = Number((defaultAccountSize + totalPnl).toFixed(2));

    return successResponse({
      user,
      profile: {
        ...(profile || {}),
        id: user.id,
        email: user.email,
        display_name: displayName,
        default_account_size: defaultAccountSize,
        current_account_balance: currentAccountBalance,
      },
    });
  } catch (err: any) {
    return errorResponse(err);
  }
}
