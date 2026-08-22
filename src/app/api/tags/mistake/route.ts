import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/utils/response';
import { createTagSchema } from '@/lib/validations/tags';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorizedResponse();

    const { data: tags, error } = await supabase
      .from('mistake_tags')
      .select('*')
      .order('name', { ascending: true });

    if (error) return errorResponse(error.message, 400);

    return successResponse(tags);
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
    const parsed = createTagSchema.parse(body);

    // Create if not exists logic
    const { data: existing } = await supabase
      .from('mistake_tags')
      .select('*')
      .eq('user_id', user.id)
      .ilike('name', parsed.name)
      .maybeSingle();

    if (existing) {
      return successResponse(existing, 'Mistake tag already exists');
    }

    const { data: tag, error } = await supabase
      .from('mistake_tags')
      .insert({
        user_id: user.id,
        name: parsed.name,
      } as any)
      .select()
      .single();


    if (error) return errorResponse(error.message, 400);

    return successResponse(tag, 'Mistake tag created successfully', undefined, 201);
  } catch (err: any) {
    return errorResponse(err);
  }
}
