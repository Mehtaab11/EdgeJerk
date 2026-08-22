import { Database, TradeDirection, EmotionalState, ExitReason, TradeSession } from './database.types';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface TradeFilterParams {
  startDate?: string;
  endDate?: string;
  asset?: string;
  setupName?: string;
  direction?: TradeDirection;
  emotionalState?: EmotionalState;
  mistakeTagId?: string;
  session?: TradeSession;
  exitReason?: ExitReason;
  page?: number;
  limit?: number;
  sortBy?: 'entry_time' | 'pnl_currency' | 'r_multiple' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

export type TradeWithRelations = Database['public']['Tables']['trades']['Row'] & {
  screenshots: Database['public']['Tables']['screenshots']['Row'][];
  mistake_tags: Database['public']['Tables']['mistake_tags']['Row'][];
  trade_plan?: Database['public']['Tables']['trade_plans']['Row'] | null;
  slippage?: {
    entry_slippage: number;
    exit_slippage: number;
    total_slippage: number;
  } | null;
};
