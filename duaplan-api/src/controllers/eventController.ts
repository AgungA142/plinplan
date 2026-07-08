// duaplan-api/src/controllers/eventController.ts
import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import * as eventService from '../services/eventService';
import { createEventSchema, updateEventSchema } from '../validators/eventValidator';

type AuthUser = { id: string; couple_id: string };

function getUser(req: Request): AuthUser {
  return req.user as AuthUser;
}

function handleZodError(err: ZodError, res: Response): void {
  const details = err.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
  res.status(400).json({ error: 'Validation error', details });
}

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { couple_id, id: user_id } = getUser(req);
    if (!couple_id) { res.status(403).json({ error: 'Belum paired' }); return; }
    const { start, end, category } = req.query as Record<string, string>;
    if (!start || !end) { res.status(400).json({ error: 'Parameter start dan end wajib diisi' }); return; }
    const events = await eventService.getEvents(couple_id, user_id, start, end, category);
    res.json(events);
  } catch (err) { next(err); }
}

export async function upcoming(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { couple_id } = getUser(req);
    if (!couple_id) { res.status(403).json({ error: 'Belum paired' }); return; }
    const limit = Math.min(Number(req.query.limit) || 5, 20);
    const events = await eventService.getUpcomingEvents(couple_id, limit);
    res.json(events);
  } catch (err) { next(err); }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { couple_id } = getUser(req);
    if (!couple_id) { res.status(403).json({ error: 'Belum paired' }); return; }
    const event = await eventService.getEventById(req.params.id as string, couple_id);
    res.json(event);
  } catch (err) {
    const e = err as Error & { status?: number };
    if (e.status) { res.status(e.status).json({ error: e.message }); return; }
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: userId, couple_id } = getUser(req);
    if (!couple_id) { res.status(403).json({ error: 'Belum paired' }); return; }
    const data = createEventSchema.parse(req.body);
    const event = await eventService.createEvent(userId, couple_id, data);
    res.status(201).json(event);
  } catch (err) {
    if (err instanceof ZodError) { handleZodError(err, res); return; }
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { couple_id } = getUser(req);
    if (!couple_id) { res.status(403).json({ error: 'Belum paired' }); return; }
    const data = updateEventSchema.parse(req.body);
    const scope = req.query.scope as 'this' | 'all' | undefined;
    const instanceDate = req.query.instance_date as string | undefined;
    const event = await eventService.updateEvent(req.params.id as string, couple_id, data, scope, instanceDate);
    res.json(event);
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
    if (!couple_id) { res.status(403).json({ error: 'Belum paired' }); return; }
    const scope = req.query.scope as 'this' | 'all' | undefined;
    const instanceDate = req.query.instance_date as string | undefined;
    await eventService.deleteEvent(req.params.id as string, couple_id, scope, instanceDate);
    res.status(204).send();
  } catch (err) {
    const e = err as Error & { status?: number };
    if (e.status) { res.status(e.status).json({ error: e.message }); return; }
    next(err);
  }
}
