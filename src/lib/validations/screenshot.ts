import { z } from 'zod';

export const uploadScreenshotSchema = z.object({
  trade_id: z.string().uuid('Invalid trade ID format'),
  label: z.enum(['before', 'after']),
});

export type UploadScreenshotInput = z.infer<typeof uploadScreenshotSchema>;
