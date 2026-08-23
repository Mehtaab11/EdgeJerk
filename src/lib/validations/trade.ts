import { z } from 'zod';

export const baseTradeSchema = z.object({
  trade_plan_id: z.string().uuid().nullable().optional(),
  asset: z.string().min(1, 'Asset ticker is required').transform((val) => val.toUpperCase().trim()),
  direction: z.enum(['long', 'short']),
  position_size: z.number().gt(0, 'Position size must be greater than 0'),
  position_size_unit: z.string().default('shares'),
  entry_price: z.number().gt(0, 'Entry price must be greater than 0'),
  exit_price: z.number().gt(0, 'Exit price must be greater than 0'),
  stop_loss: z.number().gt(0, 'Stop loss must be greater than 0'),
  take_profit: z.number().gt(0, 'Take profit must be greater than 0'),
  entry_time: z.string().datetime({ message: 'Entry time must be a valid ISO timestamp' }),
  exit_time: z.string().datetime({ message: 'Exit time must be a valid ISO timestamp' }),
  session: z.enum(['london', 'new_york', 'asia', 'overlap']).optional(),
  fees_commissions: z.number().gte(0, 'Fees cannot be negative').default(0),
  account_balance_at_trade: z.number().gt(0, 'Account balance must be greater than 0'),
  leverage_used: z.number().gt(0).optional().default(1),
  broker_platform: z.string().default('Default'),
  exit_reason: z.enum(['stop_hit', 'target_hit', 'manual_close', 'time_based', 'other']),
  trade_grade: z.number().int().min(1).max(5),
  setup_name: z.string().min(1, 'Setup name is required').transform((val) => val.trim()),
  market_conditions: z.array(z.string()).optional().default([]),
  correlated_positions: z.array(z.string()).optional().default([]),
  news_event_tag: z.string().nullable().optional(),
  emotional_state: z.union([
    z.string(),
    z.array(z.string()).transform((arr) => arr.join(', ')),
  ]),
  followed_plan: z.boolean().default(true),
  lessons_learned: z.string().optional().default(''),
  mistake_tag_names: z.array(z.string()).optional().default([]),
});

export const createTradeSchema = baseTradeSchema.refine(
  (data) => new Date(data.exit_time) >= new Date(data.entry_time),
  {
    message: 'Exit time cannot be earlier than entry time',
    path: ['exit_time'],
  }
);

export const updateTradeSchema = baseTradeSchema.partial();

export type CreateTradeInput = z.infer<typeof createTradeSchema>;
export type UpdateTradeInput = z.infer<typeof updateTradeSchema>;
