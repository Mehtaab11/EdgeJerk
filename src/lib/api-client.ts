import { ApiResponse, TradeFilterParams } from '@/types/api.types';

export async function fetchApi<T = any>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data.error || `HTTP ${res.status}: ${res.statusText}`,
      };
    }
    return data;
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network request failed',
    };
  }
}

export function buildTradeQueryString(params: TradeFilterParams): string {
  const query = new URLSearchParams();
  if (params.startDate) query.append('startDate', params.startDate);
  if (params.endDate) query.append('endDate', params.endDate);
  if (params.asset) query.append('asset', params.asset);
  if (params.setupName) query.append('setupName', params.setupName);
  if (params.direction) query.append('direction', params.direction);
  if (params.emotionalState) query.append('emotionalState', params.emotionalState);
  if (params.mistakeTagId) query.append('mistakeTagId', params.mistakeTagId);
  if (params.session) query.append('session', params.session);
  if (params.exitReason) query.append('exitReason', params.exitReason);
  if (params.page) query.append('page', params.page.toString());
  if (params.limit) query.append('limit', params.limit.toString());
  if (params.sortBy) query.append('sortBy', params.sortBy);
  if (params.sortOrder) query.append('sortOrder', params.sortOrder);
  const str = query.toString();
  return str ? `?${str}` : '';
}
