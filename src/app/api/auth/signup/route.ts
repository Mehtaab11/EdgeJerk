import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { z } from 'zod';

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  display_name: z.string().min(1, 'Display name is required').max(100).optional(),
  default_account_size: z.number().positive('Account size must be positive').optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = signupSchema.parse(body);

    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase.auth.signUp({
      email: parsed.email,
      password: parsed.password,
      options: {
        data: {
          display_name: parsed.display_name || null,
          default_account_size: parsed.default_account_size || 10000,
        },
      },
    });

    if (error) {
      return errorResponse(error.message, 400);
    }

    // Upsert profile with display_name and default_account_size
    if (data.user) {
      try {
        const profileData: any = {
          id: data.user.id,
          email: parsed.email,
          display_name: parsed.display_name || null,
          default_account_size: parsed.default_account_size || 10000,
        };

        await (supabase as any).from('profiles').upsert(profileData, { onConflict: 'id' });
      } catch {
        // Ignored if table columns are pending migration
      }
    }

    return successResponse(
      {
        user: data.user,
        session: data.session,
      },
      'User account created successfully'
    );
  } catch (err: any) {
    return errorResponse(err);
  }
}
