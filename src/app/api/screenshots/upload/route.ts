import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/utils/response';
import { uploadScreenshotSchema } from '@/lib/validations/screenshot';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorizedResponse();

    const formData = await request.formData();
    const trade_id = formData.get('trade_id') as string;
    const label = formData.get('label') as string;
    const file = formData.get('file') as File;

    if (!file) {
      return errorResponse('File is required for upload', 400);
    }

    const parsed = uploadScreenshotSchema.parse({ trade_id, label });

    // Verify user owns the trade
    const { data: trade, error: tradeErr } = await supabase
      .from('trades')
      .select('id')
      .eq('id', parsed.trade_id)
      .single();

    if (tradeErr || !trade) {
      return errorResponse('Trade not found or access denied', 404);
    }

    const fileExt = file.name.split('.').pop() || 'png';
    const fileName = `${user.id}/${parsed.trade_id}_${parsed.label}_${Date.now()}.${fileExt}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload file to Supabase Storage bucket 'trade-screenshots'
    const { error: uploadError } = await supabase.storage
      .from('trade-screenshots')
      .upload(fileName, buffer, {
        contentType: file.type || 'image/png',
        upsert: true,
      });

    if (uploadError) {
      return errorResponse(`Storage upload failed: ${uploadError.message}`, 400);
    }

    // Get public/signed URL
    const { data: urlData } = supabase.storage
      .from('trade-screenshots')
      .getPublicUrl(fileName);

    const storage_url = urlData.publicUrl;

    // Insert database record
    const { data: screenshotRecord, error: dbError } = await supabase
      .from('screenshots')
      .insert({
        trade_id: parsed.trade_id,
        storage_url,
        label: parsed.label,
      } as any)
      .select()
      .single();


    if (dbError) {
      return errorResponse(dbError.message, 400);
    }

    return successResponse(screenshotRecord, 'Screenshot uploaded and attached to trade successfully', undefined, 201);
  } catch (err: any) {
    return errorResponse(err);
  }
}
