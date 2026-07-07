import { z } from 'zod';

export const pairSchema = z.object({
  pair_code: z.string().length(8, 'Kode harus 8 karakter'),
});

export type PairInput = z.infer<typeof pairSchema>;
