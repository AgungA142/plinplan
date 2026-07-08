import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import * as routineService from '../services/routineService';
import { createRoutineSchema, updateRoutineSchema } from '../validators/routineValidator';

type AuthUser = { id: string; couple_id: string };

function getUser(req: Request): AuthUser {
  return req.user as AuthUser;
}

function handleZodError(err: ZodError, res: Response): void {
  const details = err.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
  res.status(400).json({ error: 'Validation error', details });
}

function notPaired(res: Response): void {
  res.status(403).json({ error: 'Belum paired' });
}

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: userId, couple_id } = getUser(req);
    if (!couple_id) { notPaired(res); return; }
    const routines = await routineService.listRoutines(couple_id, userId);
    res.json(routines);
  } catch (err) { next(err); }
}

export async function today(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: userId, couple_id } = getUser(req);
    if (!couple_id) { notPaired(res); return; }
    const data = await routineService.getToday(couple_id, userId);
    res.json(data);
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: userId, couple_id } = getUser(req);
    if (!couple_id) { notPaired(res); return; }
    const data = createRoutineSchema.parse(req.body);
    const routine = await routineService.createRoutine(userId, couple_id, data);
    res.status(201).json(routine);
  } catch (err) {
    if (err instanceof ZodError) { handleZodError(err, res); return; }
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { couple_id } = getUser(req);
    if (!couple_id) { notPaired(res); return; }
    const data = updateRoutineSchema.parse(req.body);
    const routine = await routineService.updateRoutine(req.params.id as string, couple_id, data);
    res.json(routine);
  } catch (err) {
    if (err instanceof ZodError) { handleZodError(err, res); return; }
    const e = err as Error & { status?: number };
    if (e.status) { res.status(e.status).json({ error: e.message }); return; }
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { couple_id } = getUser(req);
    if (!couple_id) { notPaired(res); return; }
    await routineService.deactivateRoutine(req.params.id as string, couple_id);
    res.status(204).send();
  } catch (err) {
    const e = err as Error & { status?: number };
    if (e.status) { res.status(e.status).json({ error: e.message }); return; }
    next(err);
  }
}

export async function complete(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: userId, couple_id } = getUser(req);
    if (!couple_id) { notPaired(res); return; }
    const log = await routineService.completeRoutine(req.params.id as string, userId, couple_id);
    res.status(201).json(log);
  } catch (err) {
    const e = err as Error & { status?: number };
    if (e.status) { res.status(e.status).json({ error: e.message }); return; }
    next(err);
  }
}

export async function uncomplete(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: userId, couple_id } = getUser(req);
    if (!couple_id) { notPaired(res); return; }
    await routineService.uncompleteRoutine(req.params.id as string, userId, couple_id);
    res.status(204).send();
  } catch (err) {
    const e = err as Error & { status?: number };
    if (e.status) { res.status(e.status).json({ error: e.message }); return; }
    next(err);
  }
}

export async function streaks(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: userId, couple_id } = getUser(req);
    if (!couple_id) { notPaired(res); return; }
    const data = await routineService.getStreaks(couple_id, userId);
    res.json(data);
  } catch (err) { next(err); }
}

export async function logs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: userId, couple_id } = getUser(req);
    if (!couple_id) { notPaired(res); return; }
    const { start, end } = req.query as Record<string, string>;
    if (!start || !end) { res.status(400).json({ error: 'Parameter start dan end wajib diisi' }); return; }
    const data = await routineService.getLogs(couple_id, userId, start, end);
    res.json(data);
  } catch (err) { next(err); }
}
