import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/utils/response';
import { parseDateFilter } from '@/lib/utils/analytics-filter';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorizedResponse();

    const { startDate, endDate } = parseDateFilter(request);

    let query = supabase
      .from('trades')
      .select('r_multiple');

    if (startDate) query = query.gte('entry_time', startDate);
    if (endDate) query = query.lte('entry_time', endDate);

    const { data: trades, error } = await query;
    if (error) return errorResponse(error.message, 400);

    const buckets = {
      '<-2R': 0,
      '-2R to -1R': 0,
      '-1R to 0R': 0,
      '0R to 1R': 0,
      '1R to 2R': 0,
      '2R to 3R': 0,
      '>3R': 0,
    };

    ((trades as any[]) || []).forEach((t) => {

      const r = Number(t.r_multiple);
      if (r < -2) buckets['<-2R']++;
      else if (r >= -2 && r < -1) buckets['-2R to -1R']++;
      else if (r >= -1 && r < 0) buckets['-1R to 0R']++;
      else if (r >= 0 && r < 1) buckets['0R to 1R']++;
      else if (r >= 1 && r < 2) buckets['1R to 2R']++;
      else if (r >= 2 && r <= 3) buckets['2R to 3R']++;
      else if (r > 3) buckets['>3R']++;
    });

    const distribution = Object.entries(buckets).map(([range, count]) => ({
      range,
      count,
      percentage: (trades || []).length > 0
        ? Number(((count / (trades || []).length) * 100).toFixed(2))
        : 0,
    }));

    return successResponse(distribution);
  } catch (err: any) {
    return errorResponse(err);
  }
}
