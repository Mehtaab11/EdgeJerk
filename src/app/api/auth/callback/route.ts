import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * OAuth callback handler.
 * Supabase redirects here after Google (or any OAuth) sign-in.
 * Exchanges the auth code for a session, then redirects the user.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Check if profile exists and has display_name populated
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('display_name')
        .eq('id', data.user.id)
        .single();

      // If no profile or no display_name, redirect to onboarding
      if (!profile || !profile.display_name) {
        // Ensure a bare-minimum profile row exists
        const profileData: any = {
          id: data.user.id,
          email: data.user.email || '',
        };
        await (supabase as any).from('profiles').upsert(profileData, { onConflict: 'id' });

        return NextResponse.redirect(`${origin}/onboarding`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If code exchange failed, redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
