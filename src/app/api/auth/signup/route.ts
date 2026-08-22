import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { z } from 'zod';

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = signupSchema.parse(body);

    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase.auth.signUp({
      email: parsed.email,
      password: parsed.password,
    });

    if (error) {
      return errorResponse(error.message, 400);
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
