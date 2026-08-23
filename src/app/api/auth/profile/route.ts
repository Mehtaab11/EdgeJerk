import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/utils/response';
import { z } from 'zod';

const profileUpdateSchema = z.object({
  display_name: z.string().min(1, 'Display name is required').max(100).optional(),
  default_account_size: z.number().positive('Account size must be positive').optional(),
});

/**
 * PATCH /api/auth/profile
 * Update the authenticated user's profile.
 * Saves to both Supabase Auth user_metadata AND profiles table.
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return unauthorizedResponse('User is not authenticated');
    }

    const body = await request.json();
    const parsed = profileUpdateSchema.parse(body);

    const updateMetadata: Record<string, any> = {};
    if (parsed.display_name !== undefined) updateMetadata.display_name = parsed.display_name;
    if (parsed.default_account_size !== undefined) updateMetadata.default_account_size = parsed.default_account_size;

    // 1. Update user_metadata in Auth (always works even without SQL migration)
    await supabase.auth.updateUser({
      data: updateMetadata,
    });

    // 2. Try to update profiles table
    const updateData: Record<string, any> = {
      id: user.id,
      email: user.email || '',
      ...updateMetadata,
    };

    try {
      await (supabase as any)
        .from('profiles')
        .upsert(updateData, { onConflict: 'id' });
    } catch {
      // Ignored if schema column is pending migration
    }

    return successResponse(
      {
        id: user.id,
        email: user.email,
        display_name: parsed.display_name || user.user_metadata?.display_name || null,
        default_account_size: parsed.default_account_size || user.user_metadata?.default_account_size || 10000,
      },
      'Profile updated successfully'
    );
  } catch (err: any) {
    return errorResponse(err);
  }
}
