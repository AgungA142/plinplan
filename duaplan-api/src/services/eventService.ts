// duaplan-api/src/services/eventService.ts
import { prisma } from '../lib/prisma';
import type { events } from '@prisma/client';
import type { CreateEventInput, UpdateEventInput } from '../validators/eventValidator';

interface RecurRule {
  freq: 'daily' | 'weekly' | 'monthly';
  interval: number;
  until?: string;
  exceptions?: string[];
}

function expandEvent(event: events, rangeStart: Date, rangeEnd: Date): events[] {
  if (!event.is_recurring || !event.recur_rule) return [event];

  const rule = event.recur_rule as RecurRule;
  const exceptions = new Set(rule.exceptions ?? []);
  const until = rule.until ? new Date(rule.until) : rangeEnd;
  const effectiveEnd = until < rangeEnd ? until : rangeEnd;

  const instances: events[] = [];
  const cursor = new Date(event.start_at);
  const duration =
    event.end_at ? event.end_at.getTime() - event.start_at.getTime() : 0;

  while (cursor <= effectiveEnd) {
    const isoDate = cursor.toISOString().split('T')[0];
    if (cursor >= rangeStart && !exceptions.has(isoDate)) {
      instances.push({
        ...event,
        start_at: new Date(cursor),
        end_at: event.end_at ? new Date(cursor.getTime() + duration) : null,
      });
    }
    if (rule.freq === 'daily') cursor.setDate(cursor.getDate() + rule.interval);
    else if (rule.freq === 'weekly') cursor.setDate(cursor.getDate() + 7 * rule.interval);
    else if (rule.freq === 'monthly') cursor.setMonth(cursor.getMonth() + rule.interval);
    else break;
  }

  return instances;
}

export async function getEvents(
  coupleId: string,
  _userId: string,
  start: string,
  end: string,
  category?: string,
) {
  const rangeStart = new Date(start);
  const rangeEnd = new Date(end);

  const rows = await prisma.events.findMany({
    where: {
      couple_id: coupleId,
      OR: [
        // Non-recurring: start_at falls in range
        { is_recurring: false, start_at: { gte: rangeStart, lte: rangeEnd } },
        // Recurring: started before range ends (expansion handles further filtering)
        { is_recurring: true, start_at: { lte: rangeEnd } },
      ],
      ...(category ? { category } : {}),
    },
    include: {
      users: { select: { id: true, display_name: true, avatar_url: true } },
    },
    orderBy: { start_at: 'asc' },
  });

  return rows.flatMap((e) => expandEvent(e, rangeStart, rangeEnd));
}

export async function getUpcomingEvents(coupleId: string, limit: number) {
  return prisma.events.findMany({
    where: { couple_id: coupleId, start_at: { gte: new Date() } },
    include: {
      users: { select: { id: true, display_name: true, avatar_url: true } },
    },
    orderBy: { start_at: 'asc' },
    take: limit,
  });
}

export async function getEventById(id: string, coupleId: string) {
  const event = await prisma.events.findFirst({
    where: { id, couple_id: coupleId },
    include: {
      users: { select: { id: true, display_name: true, avatar_url: true } },
    },
  });
  if (!event) {
    const err = new Error('Event tidak ditemukan') as Error & { status: number };
    err.status = 404;
    throw err;
  }
  return event;
}

export async function createEvent(
  userId: string,
  coupleId: string,
  data: CreateEventInput,
) {
  return prisma.events.create({
    data: {
      couple_id:    coupleId,
      created_by:   userId,
      title:        data.title,
      start_at:     new Date(data.start_at),
      end_at:       data.end_at ? new Date(data.end_at) : null,
      all_day:      data.all_day ?? false,
      category:     data.category ?? null,
      color:        data.color ?? null,
      description:  data.description ?? null,
      is_recurring: data.is_recurring ?? false,
      recur_rule:   data.recur_rule ?? null,
    },
    include: {
      users: { select: { id: true, display_name: true, avatar_url: true } },
    },
  });
}

export async function updateEvent(
  id: string,
  coupleId: string,
  data: UpdateEventInput,
  scope?: 'this' | 'all',
  instanceDate?: string,
) {
  const existing = await prisma.events.findFirst({ where: { id, couple_id: coupleId } });
  if (!existing) {
    const err = new Error('Event tidak ditemukan') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  // Edit "event ini saja" — tambah exception lalu buat event baru satu kali
  if (existing.is_recurring && scope === 'this' && instanceDate) {
    const rule = (existing.recur_rule ?? {}) as RecurRule;
    const exceptions = [...(rule.exceptions ?? []), instanceDate];
    await prisma.events.update({
      where: { id },
      data: { recur_rule: { ...rule, exceptions } },
    });
    const duration =
      existing.end_at ? existing.end_at.getTime() - existing.start_at.getTime() : 0;
    const newStart = new Date(`${instanceDate}T${existing.start_at.toISOString().split('T')[1]}`);
    return prisma.events.create({
      data: {
        couple_id:    coupleId,
        created_by:   existing.created_by,
        title:        data.title ?? existing.title,
        start_at:     data.start_at ? new Date(data.start_at) : newStart,
        end_at:       data.end_at ? new Date(data.end_at) : (duration ? new Date(newStart.getTime() + duration) : null),
        all_day:      data.all_day ?? existing.all_day ?? false,
        category:     data.category !== undefined ? (data.category ?? null) : existing.category,
        color:        data.color !== undefined ? (data.color ?? null) : existing.color,
        description:  data.description !== undefined ? (data.description ?? null) : existing.description,
        is_recurring: false,
        recur_rule:   null,
      },
      include: { users: { select: { id: true, display_name: true, avatar_url: true } } },
    });
  }

  // Edit semua (atau event non-recurring)
  return prisma.events.update({
    where: { id },
    data: {
      ...(data.title       !== undefined ? { title: data.title } : {}),
      ...(data.start_at    !== undefined ? { start_at: new Date(data.start_at) } : {}),
      ...(data.end_at      !== undefined ? { end_at: data.end_at ? new Date(data.end_at) : null } : {}),
      ...(data.all_day     !== undefined ? { all_day: data.all_day } : {}),
      ...(data.category    !== undefined ? { category: data.category ?? null } : {}),
      ...(data.color       !== undefined ? { color: data.color ?? null } : {}),
      ...(data.description !== undefined ? { description: data.description ?? null } : {}),
      ...(data.recur_rule  !== undefined ? { recur_rule: data.recur_rule ?? null } : {}),
    },
    include: { users: { select: { id: true, display_name: true, avatar_url: true } } },
  });
}

export async function deleteEvent(
  id: string,
  coupleId: string,
  scope?: 'this' | 'all',
  instanceDate?: string,
) {
  const existing = await prisma.events.findFirst({ where: { id, couple_id: coupleId } });
  if (!existing) {
    const err = new Error('Event tidak ditemukan') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  // Hapus "event ini saja" — tambah ke exceptions
  if (existing.is_recurring && scope === 'this' && instanceDate) {
    const rule = (existing.recur_rule ?? {}) as RecurRule;
    const exceptions = [...(rule.exceptions ?? []), instanceDate];
    await prisma.events.update({
      where: { id },
      data: { recur_rule: { ...rule, exceptions } },
    });
    return;
  }

  await prisma.events.delete({ where: { id } });
}
