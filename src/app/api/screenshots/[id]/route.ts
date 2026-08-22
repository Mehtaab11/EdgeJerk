import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse } from '@/lib/utils/response';

interface Params {
  params: {
    id: string;
  };
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorizedResponse();

    // Verify screenshot ownership
    const { data: screenshot, error: fetchErr } = await supabase
      .from('screenshots')
      .select('*, trades!inner(user_id)')
      .eq('id', params.id)
      .single();

    if (fetchErr || !screenshot) return notFoundResponse('Screenshot not found');

    // Delete record from DB
    const { error: deleteErr } = await supabase
      .from('screenshots')
      .delete()
      .eq('id', params.id);

    if (deleteErr) return errorResponse(deleteErr.message, 400);

    return successResponse(null, 'Screenshot deleted successfully');
  } catch (err: any) {
    return errorResponse(err);
  }
}
