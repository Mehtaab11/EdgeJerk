export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type TradeDirection = 'long' | 'short';
export type TradeSession = 'london' | 'new_york' | 'asia' | 'overlap';
export type ExitReason = 'stop_hit' | 'target_hit' | 'manual_close' | 'time_based' | 'other';
export type EmotionalState = 'Confident' | 'Calm' | 'Anxious' | 'FOMO' | 'Revenge' | 'Bored' | 'Hesitant';
export type ScreenshotLabel = 'before' | 'after';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          default_account_size: number | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          default_account_size?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          default_account_size?: number | null;
          created_at?: string;
        };
      };
      trade_plans: {
        Row: {
          id: string;
          user_id: string;
          asset: string;
          planned_entry_price: number;
          planned_stop_loss: number;
          planned_take_profit: number;
          setup_name: string;
          thesis: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          asset: string;
          planned_entry_price: number;
          planned_stop_loss: number;
          planned_take_profit: number;
          setup_name: string;
          thesis?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          asset?: string;
          planned_entry_price?: number;
          planned_stop_loss?: number;
          planned_take_profit?: number;
          setup_name?: string;
          thesis?: string;
          created_at?: string;
        };
      };
      trades: {
        Row: {
          id: string;
          user_id: string;
          trade_plan_id: string | null;
          asset: string;
          direction: TradeDirection;
          position_size: number;
          position_size_unit: string;
          entry_price: number;
          exit_price: number;
          stop_loss: number;
          take_profit: number;
          entry_time: string;
          exit_time: string;
          session: TradeSession;
          fees_commissions: number;
          account_balance_at_trade: number;
          leverage_used: number | null;
          broker_platform: string;
          pnl_currency: number;
          pnl_percent: number;
          risk_percent_of_account: number;
          r_multiple: number;
          exit_reason: ExitReason;
          trade_grade: number;
          setup_name: string;
          market_conditions: string[];
          correlated_positions: string[];
          news_event_tag: string | null;
          emotional_state: EmotionalState;
          followed_plan: boolean;
          lessons_learned: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          trade_plan_id?: string | null;
          asset: string;
          direction: TradeDirection;
          position_size: number;
          position_size_unit?: string;
          entry_price: number;
          exit_price: number;
          stop_loss: number;
          take_profit: number;
          entry_time: string;
          exit_time: string;
          session: TradeSession;
          fees_commissions?: number;
          account_balance_at_trade: number;
          leverage_used?: number | null;
          broker_platform?: string;
          pnl_currency: number;
          pnl_percent: number;
          risk_percent_of_account: number;
          r_multiple: number;
          exit_reason: ExitReason;
          trade_grade: number;
          setup_name: string;
          market_conditions?: string[];
          correlated_positions?: string[];
          news_event_tag?: string | null;
          emotional_state: EmotionalState;
          followed_plan?: boolean;
          lessons_learned?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          trade_plan_id?: string | null;
          asset?: string;
          direction?: TradeDirection;
          position_size?: number;
          position_size_unit?: string;
          entry_price?: number;
          exit_price?: number;
          stop_loss?: number;
          take_profit?: number;
          entry_time?: string;
          exit_time?: string;
          session?: TradeSession;
          fees_commissions?: number;
          account_balance_at_trade?: number;
          leverage_used?: number | null;
          broker_platform?: string;
          pnl_currency?: number;
          pnl_percent?: number;
          risk_percent_of_account?: number;
          r_multiple?: number;
          exit_reason?: ExitReason;
          trade_grade?: number;
          setup_name?: string;
          market_conditions?: string[];
          correlated_positions?: string[];
          news_event_tag?: string | null;
          emotional_state?: EmotionalState;
          followed_plan?: boolean;
          lessons_learned?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      screenshots: {
        Row: {
          id: string;
          trade_id: string;
          storage_url: string;
          label: ScreenshotLabel;
          created_at: string;
        };
        Insert: {
          id?: string;
          trade_id: string;
          storage_url: string;
          label: ScreenshotLabel;
          created_at?: string;
        };
        Update: {
          id?: string;
          trade_id?: string;
          storage_url?: string;
          label?: ScreenshotLabel;
          created_at?: string;
        };
      };
      strategy_tags: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          created_at?: string;
        };
      };
      mistake_tags: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          created_at?: string;
        };
      };
      trade_mistake_tags: {
        Row: {
          trade_id: string;
          mistake_tag_id: string;
        };
        Insert: {
          trade_id: string;
          mistake_tag_id: string;
        };
        Update: {
          trade_id?: string;
          mistake_tag_id?: string;
        };
      };
      weekly_reviews: {
        Row: {
          id: string;
          user_id: string;
          week_start_date: string;
          summary_notes: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          week_start_date: string;
          summary_notes?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          week_start_date?: string;
          summary_notes?: string;
          created_at?: string;
        };
      };
    };
  };
}
