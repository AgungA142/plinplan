import { z } from 'zod';

const recurRuleSchema = z.object({
  freq:       z.enum(['daily', 'weekly', 'monthly']),
  interval:   z.number().int().min(1).default(1),
  until:      z.string().datetime().optional(),
  exceptions: z.array(z.string()).optional(),
});

export const createEventSchema = z.object({
  title:        z.string().min(1, 'Judul wajib diisi').max(200),
  start_at:     z.string().datetime({ message: 'Format start_at tidak valid' }),
  end_at:       z.string().datetime({ message: 'Format end_at tidak valid' }).optional(),
  all_day:      z.boolean().default(false),
  category:     z.enum(['date', 'routine', 'financial', 'family', 'health', 'other']).optional(),
  color:        z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Format warna tidak valid').optional(),
  description:  z.string().max(2000).optional(),
  is_recurring: z.boolean().default(false),
  recur_rule:   recurRuleSchema.optional(),
});

export const updateEventSchema = createEventSchema.partial();

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
