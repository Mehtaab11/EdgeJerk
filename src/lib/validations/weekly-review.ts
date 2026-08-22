import { z } from 'zod';

export const createWeeklyReviewSchema = z.object({
  week_start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Week start date must be in YYYY-MM-DD format'),
  summary_notes: z.string().min(1, 'Summary notes are required').transform((val) => val.trim()),
});

export const updateWeeklyReviewSchema = createWeeklyReviewSchema.partial();

export type CreateWeeklyReviewInput = z.infer<typeof createWeeklyReviewSchema>;
export type UpdateWeeklyReviewInput = z.infer<typeof updateWeeklyReviewSchema>;
