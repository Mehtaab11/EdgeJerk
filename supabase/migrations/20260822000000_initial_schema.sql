-- EdgeJerk Trading Journal Database Migration Schema
-- Target: Supabase Postgres with Row Level Security (RLS)

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Automatic Profile Creation Trigger on Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. TRADE PLANS TABLE
CREATE TABLE IF NOT EXISTS public.trade_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset TEXT NOT NULL,
  planned_entry_price NUMERIC NOT NULL,
  planned_stop_loss NUMERIC NOT NULL,
  planned_take_profit NUMERIC NOT NULL,
  setup_name TEXT NOT NULL,
  thesis TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TRADES TABLE
CREATE TABLE IF NOT EXISTS public.trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trade_plan_id UUID REFERENCES public.trade_plans(id) ON DELETE SET NULL,
  asset TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('long', 'short')),
  position_size NUMERIC NOT NULL CHECK (position_size > 0),
  position_size_unit TEXT NOT NULL DEFAULT 'shares',
  entry_price NUMERIC NOT NULL CHECK (entry_price > 0),
  exit_price NUMERIC NOT NULL CHECK (exit_price > 0),
  stop_loss NUMERIC NOT NULL CHECK (stop_loss > 0),
  take_profit NUMERIC NOT NULL CHECK (take_profit > 0),
  entry_time TIMESTAMPTZ NOT NULL,
  exit_time TIMESTAMPTZ NOT NULL,
  session TEXT NOT NULL CHECK (session IN ('london', 'new_york', 'asia', 'overlap')),
  fees_commissions NUMERIC NOT NULL DEFAULT 0,
  account_balance_at_trade NUMERIC NOT NULL CHECK (account_balance_at_trade > 0),
  leverage_used NUMERIC DEFAULT 1,
  broker_platform TEXT NOT NULL DEFAULT 'Default',
  
  -- Server-side calculated stored fields for fast querying/analytics
  pnl_currency NUMERIC NOT NULL,
  pnl_percent NUMERIC NOT NULL,
  risk_percent_of_account NUMERIC NOT NULL,
  r_multiple NUMERIC NOT NULL,
  
  exit_reason TEXT NOT NULL CHECK (exit_reason IN ('stop_hit', 'target_hit', 'manual_close', 'time_based', 'other')),
  trade_grade INTEGER NOT NULL CHECK (trade_grade >= 1 AND trade_grade <= 5),
  setup_name TEXT NOT NULL,
  market_conditions TEXT[] NOT NULL DEFAULT '{}',
  correlated_positions TEXT[] NOT NULL DEFAULT '{}',
  news_event_tag TEXT,
  emotional_state TEXT NOT NULL CHECK (emotional_state IN ('Confident', 'Calm', 'Anxious', 'FOMO', 'Revenge', 'Bored', 'Hesitant')),
  followed_plan BOOLEAN NOT NULL DEFAULT TRUE,
  lessons_learned TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Updated_at trigger for trades
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_trades_updated_at ON public.trades;
CREATE TRIGGER trigger_trades_updated_at
  BEFORE UPDATE ON public.trades
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. SCREENSHOTS TABLE
CREATE TABLE IF NOT EXISTS public.screenshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id UUID NOT NULL REFERENCES public.trades(id) ON DELETE CASCADE,
  storage_url TEXT NOT NULL,
  label TEXT NOT NULL CHECK (label IN ('before', 'after')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. STRATEGY TAGS TABLE
CREATE TABLE IF NOT EXISTS public.strategy_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_strategy_name UNIQUE (user_id, name)
);

-- 6. MISTAKE TAGS TABLE
CREATE TABLE IF NOT EXISTS public.mistake_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_mistake_name UNIQUE (user_id, name)
);

-- 7. TRADE MISTAKE TAGS (MANY-TO-MANY JOIN TABLE)
CREATE TABLE IF NOT EXISTS public.trade_mistake_tags (
  trade_id UUID NOT NULL REFERENCES public.trades(id) ON DELETE CASCADE,
  mistake_tag_id UUID NOT NULL REFERENCES public.mistake_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (trade_id, mistake_tag_id)
);

-- 8. WEEKLY REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.weekly_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  summary_notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR FAST LOG FILTERING & ANALYTICS QUERY PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_trades_user_entry_time ON public.trades (user_id, entry_time DESC);
CREATE INDEX IF NOT EXISTS idx_trades_user_asset ON public.trades (user_id, asset);
CREATE INDEX IF NOT EXISTS idx_trades_user_setup_name ON public.trades (user_id, setup_name);
CREATE INDEX IF NOT EXISTS idx_trades_user_exit_reason ON public.trades (user_id, exit_reason);
CREATE INDEX IF NOT EXISTS idx_trades_user_emotional_state ON public.trades (user_id, emotional_state);
CREATE INDEX IF NOT EXISTS idx_trade_plans_user_asset ON public.trade_plans (user_id, asset);
CREATE INDEX IF NOT EXISTS idx_weekly_reviews_user_week ON public.weekly_reviews (user_id, week_start_date DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.screenshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategy_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mistake_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_mistake_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_reviews ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Trade Plans Policies
CREATE POLICY "Users can view own trade plans" ON public.trade_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trade plans" ON public.trade_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trade plans" ON public.trade_plans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trade plans" ON public.trade_plans
  FOR DELETE USING (auth.uid() = user_id);

-- Trades Policies
CREATE POLICY "Users can view own trades" ON public.trades
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trades" ON public.trades
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trades" ON public.trades
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trades" ON public.trades
  FOR DELETE USING (auth.uid() = user_id);

-- Screenshots Policies (linked through trades ownership)
CREATE POLICY "Users can view screenshots of own trades" ON public.screenshots
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.trades
      WHERE public.trades.id = screenshots.trade_id
      AND public.trades.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert screenshots to own trades" ON public.screenshots
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trades
      WHERE public.trades.id = screenshots.trade_id
      AND public.trades.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete screenshots of own trades" ON public.screenshots
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.trades
      WHERE public.trades.id = screenshots.trade_id
      AND public.trades.user_id = auth.uid()
    )
  );

-- Strategy Tags Policies
CREATE POLICY "Users can view own strategy tags" ON public.strategy_tags
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own strategy tags" ON public.strategy_tags
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own strategy tags" ON public.strategy_tags
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own strategy tags" ON public.strategy_tags
  FOR DELETE USING (auth.uid() = user_id);

-- Mistake Tags Policies
CREATE POLICY "Users can view own mistake tags" ON public.mistake_tags
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mistake tags" ON public.mistake_tags
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mistake tags" ON public.mistake_tags
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own mistake tags" ON public.mistake_tags
  FOR DELETE USING (auth.uid() = user_id);

-- Trade Mistake Tags Join Table Policies
CREATE POLICY "Users can view trade mistake tags for own trades" ON public.trade_mistake_tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.trades
      WHERE public.trades.id = trade_mistake_tags.trade_id
      AND public.trades.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert trade mistake tags for own trades" ON public.trade_mistake_tags
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trades
      WHERE public.trades.id = trade_mistake_tags.trade_id
      AND public.trades.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete trade mistake tags for own trades" ON public.trade_mistake_tags
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.trades
      WHERE public.trades.id = trade_mistake_tags.trade_id
      AND public.trades.user_id = auth.uid()
    )
  );

-- Weekly Reviews Policies
CREATE POLICY "Users can view own weekly reviews" ON public.weekly_reviews
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weekly reviews" ON public.weekly_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weekly reviews" ON public.weekly_reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own weekly reviews" ON public.weekly_reviews
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- STORAGE BUCKET CONFIGURATION FOR CHART SCREENSHOTS
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('trade-screenshots', 'trade-screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Security Policies
CREATE POLICY "Give users access to own screenshot folder" ON storage.objects
  FOR ALL USING (
    bucket_id = 'trade-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]
  ) WITH CHECK (
    bucket_id = 'trade-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]
  );
