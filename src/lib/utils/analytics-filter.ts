import { NextRequest } from 'next/server';

export interface DateFilter {
  startDate?: string;
  endDate?: string;
}

export function parseDateFilter(request: NextRequest): DateFilter {
  const searchParams = request.nextUrl.searchParams;
  const startDate = searchParams.get('startDate') || undefined;
  const endDate = searchParams.get('endDate') || undefined;
  return { startDate, endDate };
}
