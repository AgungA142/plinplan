import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import * as coupleService from '../services/coupleService';
import { pairSchema } from '../validators/coupleValidator';

function handleZodError(err: ZodError, res: Response): void {
  const details = err.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
  res.status(400).json({ error: 'Validation error', details });
}

export async function pair(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { pair_code } = pairSchema.parse(req.body);
    const result = await coupleService.pairWithPartner(req.userId!, pair_code);
    res.json(result);
  } catch (err) {
    if (err instanceof ZodError) { handleZodError(err, res); return; }
    const e = err as Error & { status?: number };
    if (e.status) { res.status(e.status).json({ error: e.message }); return; }
    next(err);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await coupleService.getMe(req.userId!);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function generateCode(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const pair_code = await coupleService.generateNewCode(req.userId!);
    res.json({ pair_code });
  } catch (err) {
    const e = err as Error & { status?: number };
    if (e.status) { res.status(e.status).json({ error: e.message }); return; }
    next(err);
  }
}

export async function unpair(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await coupleService.unpair(req.userId!);
    res.status(204).send();
  } catch (err) {
    const e = err as Error & { status?: number };
    if (e.status) { res.status(e.status).json({ error: e.message }); return; }
    next(err);
  }
}
