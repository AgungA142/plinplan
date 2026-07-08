import { z } from 'zod';

export const createRoutineSchema = z.object({
  title:       z.string().min(1, 'Judul wajib diisi').max(200),
  icon:        z.string().max(50).optional(),
  category:    z.string().max(50).optional(),
  time_of_day: z.enum(['morning', 'afternoon', 'evening', 'anytime']).default('anytime'),
  is_shared:   z.boolean().default(false),
  sort_order:  z.number().int().default(0),
});

export const updateRoutineSchema = createRoutineSchema.partial();

export type CreateRoutineInput = z.infer<typeof createRoutineSchema>;
export type UpdateRoutineInput = z.infer<typeof updateRoutineSchema>;
