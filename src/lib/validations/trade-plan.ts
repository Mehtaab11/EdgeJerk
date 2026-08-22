import { z } from 'zod';

export const createTradePlanSchema = z.object({
  asset: z.string().min(1, 'Asset ticker is required').transform((val) => val.toUpperCase().trim()),
  planned_entry_price: z.number().gt(0, 'Planned entry price must be greater than 0'),
  planned_stop_loss: z.number().gt(0, 'Planned stop loss must be greater than 0'),
  planned_take_profit: z.number().gt(0, 'Planned take profit must be greater than 0'),
  setup_name: z.string().min(1, 'Setup name is required').transform((val) => val.trim()),
  thesis: z.string().optional().default(''),
});

export const updateTradePlanSchema = createTradePlanSchema.partial();

export type CreateTradePlanInput = z.infer<typeof createTradePlanSchema>;
export type UpdateTradePlanInput = z.infer<typeof updateTradePlanSchema>;
