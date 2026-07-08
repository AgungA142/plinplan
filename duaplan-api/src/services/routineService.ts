import { prisma } from '../lib/prisma';
import type { CreateRoutineInput, UpdateRoutineInput } from '../validators/routineValidator';

function todayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function notFound(msg: string): never {
  const err = new Error(msg) as Error & { status: number };
  err.status = 404;
  throw err;
}

export async function listRoutines(coupleId: string, userId: string) {
  return prisma.routines.findMany({
    where: {
      couple_id: coupleId,
      is_active: true,
      OR: [{ user_id: userId }, { is_shared: true }],
    },
    include: {
      users: { select: { id: true, display_name: true, avatar_url: true } },
    },
    orderBy: [{ sort_order: 'asc' }, { created_at: 'asc' }],
  });
}

export async function getToday(coupleId: string, userId: string) {
  const today = todayUtc();

  const routines = await prisma.routines.findMany({
    where: {
      couple_id: coupleId,
      is_active: true,
      OR: [{ user_id: userId }, { is_shared: true }],
    },
    include: {
      users: { select: { id: true, display_name: true, avatar_url: true } },
      routine_logs: { where: { user_id: userId, log_date: today } },
    },
    orderBy: [{ sort_order: 'asc' }, { created_at: 'asc' }],
  });

  const result = routines.map((r) => {
    const log = r.routine_logs[0];
    return {
      id:           r.id,
      title:        r.title,
      icon:         r.icon,
      time_of_day:  r.time_of_day,
      is_shared:    r.is_shared,
      sort_order:   r.sort_order,
      owner:        r.users,
      completed:    !!log,
      completed_at: log?.completed_at ?? null,
    };
  });

  const completed = result.filter((r) => r.completed).length;
  return {
    date: today.toISOString().split('T')[0],
    routines: result,
    summary: {
      total:    result.length,
      completed,
      all_done: result.length > 0 && completed === result.length,
    },
  };
}

export async function createRoutine(userId: string, coupleId: string, data: CreateRoutineInput) {
  return prisma.routines.create({
    data: {
      couple_id:   coupleId,
      user_id:     userId,
      title:       data.title,
      icon:        data.icon ?? null,
      category:    data.category ?? null,
      time_of_day: data.time_of_day,
      is_shared:   data.is_shared,
      sort_order:  data.sort_order,
    },
    include: {
      users: { select: { id: true, display_name: true, avatar_url: true } },
    },
  });
}

export async function updateRoutine(id: string, coupleId: string, data: UpdateRoutineInput) {
  const existing = await prisma.routines.findFirst({ where: { id, couple_id: coupleId } });
  if (!existing) notFound('Rutinitas tidak ditemukan');

  return prisma.routines.update({
    where: { id },
    data: {
      ...(data.title       !== undefined ? { title: data.title } : {}),
      ...(data.icon        !== undefined ? { icon: data.icon ?? null } : {}),
      ...(data.category    !== undefined ? { category: data.category ?? null } : {}),
      ...(data.time_of_day !== undefined ? { time_of_day: data.time_of_day } : {}),
      ...(data.is_shared   !== undefined ? { is_shared: data.is_shared } : {}),
      ...(data.sort_order  !== undefined ? { sort_order: data.sort_order } : {}),
    },
    include: {
      users: { select: { id: true, display_name: true, avatar_url: true } },
    },
  });
}

export async function deactivateRoutine(id: string, coupleId: string) {
  const existing = await prisma.routines.findFirst({ where: { id, couple_id: coupleId } });
  if (!existing) notFound('Rutinitas tidak ditemukan');
  await prisma.routines.update({ where: { id }, data: { is_active: false } });
}

export async function completeRoutine(routineId: string, userId: string, coupleId: string) {
  const routine = await prisma.routines.findFirst({ where: { id: routineId, couple_id: coupleId } });
  if (!routine) notFound('Rutinitas tidak ditemukan');

  const today = todayUtc();
  return prisma.routine_logs.upsert({
    where: { routine_id_user_id_log_date: { routine_id: routineId, user_id: userId, log_date: today } },
    create: { routine_id: routineId, user_id: userId, log_date: today, completed_at: new Date() },
    update: { completed_at: new Date() },
  });
}

export async function uncompleteRoutine(routineId: string, userId: string, coupleId: string) {
  const routine = await prisma.routines.findFirst({ where: { id: routineId, couple_id: coupleId } });
  if (!routine) notFound('Rutinitas tidak ditemukan');

  const today = todayUtc();
  await prisma.routine_logs.deleteMany({
    where: { routine_id: routineId, user_id: userId, log_date: today },
  });
}

export async function getStreaks(coupleId: string, userId: string) {
  const couple = await prisma.couples.findUnique({
    where: { id: coupleId },
    select: { user_a_id: true, user_b_id: true },
  });

  const partnerId = couple?.user_a_id === userId ? couple?.user_b_id : couple?.user_a_id;

  const [userStreak, partnerStreak] = await Promise.all([
    calcStreak(userId, coupleId),
    partnerId ? calcStreak(partnerId, coupleId) : Promise.resolve({ current_streak: 0, longest_streak: 0 }),
  ]);

  return { user: userStreak, partner: partnerStreak };
}

async function calcStreak(userId: string, coupleId: string) {
  const userRoutines = await prisma.routines.findMany({
    where: { user_id: userId, couple_id: coupleId, is_active: true },
    select: { id: true },
  });

  if (userRoutines.length === 0) return { current_streak: 0, longest_streak: 0 };

  const routineIds = userRoutines.map((r) => r.id);
  const today = todayUtc();
  const windowStart = new Date(today);
  windowStart.setDate(windowStart.getDate() - 90);

  const logs = await prisma.routine_logs.findMany({
    where: {
      user_id:    userId,
      routine_id: { in: routineIds },
      log_date:   { gte: windowStart, lt: today },
    },
    select: { routine_id: true, log_date: true },
  });

  // Group completed routine IDs per date
  const byDate = new Map<string, Set<string>>();
  for (const log of logs) {
    const key = log.log_date.toISOString().split('T')[0];
    if (!byDate.has(key)) byDate.set(key, new Set());
    byDate.get(key)!.add(log.routine_id);
  }

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let countingCurrent = true;

  for (let i = 1; i <= 90; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];

    const done = byDate.get(key);
    const allDone = !!done && routineIds.every((id) => done.has(id));

    if (allDone) {
      tempStreak++;
      if (countingCurrent) currentStreak = tempStreak;
      if (tempStreak > longestStreak) longestStreak = tempStreak;
    } else {
      countingCurrent = false;
      tempStreak = 0;
    }
  }

  return { current_streak: currentStreak, longest_streak: longestStreak };
}

export async function getLogs(coupleId: string, userId: string, start: string, end: string) {
  const routines = await prisma.routines.findMany({
    where: { couple_id: coupleId, user_id: userId },
    select: { id: true },
  });
  const routineIds = routines.map((r) => r.id);

  return prisma.routine_logs.findMany({
    where: {
      user_id:    userId,
      routine_id: { in: routineIds },
      log_date:   { gte: new Date(start), lte: new Date(end) },
    },
    include: {
      routines: { select: { id: true, title: true, icon: true, time_of_day: true } },
    },
    orderBy: { log_date: 'asc' },
  });
}
