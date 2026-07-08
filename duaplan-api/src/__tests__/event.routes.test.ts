// duaplan-api/src/__tests__/event.routes.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../index';
import * as eventService from '../services/eventService';

vi.mock('../services/authService', () => ({
  register: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  forgotPassword: vi.fn(),
  resetPassword: vi.fn(),
}));

vi.mock('../services/coupleService', () => ({
  lookupByCode: vi.fn(),
  pairWithPartner: vi.fn(),
  getMe: vi.fn(),
  generateNewCode: vi.fn(),
  unpair: vi.fn(),
}));

vi.mock('../services/eventService', () => ({
  getEvents: vi.fn(),
  getUpcomingEvents: vi.fn(),
  getEventById: vi.fn(),
  createEvent: vi.fn(),
  updateEvent: vi.fn(),
  deleteEvent: vi.fn(),
}));

vi.mock('../middleware/validateJWT', () => ({
  validateJWT: (_req: unknown, _res: unknown, next: () => void) => next(),
}));

vi.mock('../middleware/attachUser', () => ({
  attachUser: (req: { user?: unknown }, _res: unknown, next: () => void) => {
    req.user = { id: 'user-uuid', couple_id: 'couple-uuid' };
    next();
  },
}));

const mockEvent = {
  id: 'event-uuid',
  couple_id: 'couple-uuid',
  created_by: 'user-uuid',
  title: 'Kencan malam',
  start_at: '2026-07-10T18:00:00.000Z',
  end_at: '2026-07-10T21:00:00.000Z',
  all_day: false,
  category: 'date',
  color: '#ff6b6b',
  description: null,
  is_recurring: false,
  recur_rule: null,
  created_at: '2026-07-07T00:00:00.000Z',
  updated_at: '2026-07-07T00:00:00.000Z',
  users: { id: 'user-uuid', display_name: 'Agung', avatar_url: null },
};

beforeEach(() => vi.clearAllMocks());

describe('GET /v1/events', () => {
  it('return list events', async () => {
    vi.mocked(eventService.getEvents).mockResolvedValue([mockEvent] as never);
    const res = await request(app).get('/v1/events?start=2026-07-01T00:00:00Z&end=2026-07-31T23:59:59Z');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('Kencan malam');
  });

  it('gagal jika tanpa start atau end', async () => {
    const res = await request(app).get('/v1/events');
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('start dan end');
  });
});

describe('GET /v1/events/upcoming', () => {
  it('return upcoming events', async () => {
    vi.mocked(eventService.getUpcomingEvents).mockResolvedValue([mockEvent] as never);
    const res = await request(app).get('/v1/events/upcoming?limit=5');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});

describe('GET /v1/events/:id', () => {
  it('return event by id', async () => {
    vi.mocked(eventService.getEventById).mockResolvedValue(mockEvent as never);
    const res = await request(app).get('/v1/events/event-uuid');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe('event-uuid');
  });

  it('return 404 jika tidak ditemukan', async () => {
    const err = Object.assign(new Error('Event tidak ditemukan'), { status: 404 });
    vi.mocked(eventService.getEventById).mockRejectedValue(err);
    const res = await request(app).get('/v1/events/not-found');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Event tidak ditemukan');
  });
});

describe('POST /v1/events', () => {
  it('berhasil buat event', async () => {
    vi.mocked(eventService.createEvent).mockResolvedValue(mockEvent as never);
    const res = await request(app).post('/v1/events').send({
      title: 'Kencan malam',
      start_at: '2026-07-10T18:00:00.000Z',
    });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Kencan malam');
  });

  it('gagal jika title kosong', async () => {
    const res = await request(app).post('/v1/events').send({ start_at: '2026-07-10T18:00:00.000Z' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation error');
  });
});

describe('PUT /v1/events/:id', () => {
  it('berhasil update event', async () => {
    vi.mocked(eventService.updateEvent).mockResolvedValue({ ...mockEvent, title: 'Diubah' } as never);
    const res = await request(app).put('/v1/events/event-uuid').send({ title: 'Diubah' });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Diubah');
  });

  it('return 404 jika tidak ditemukan', async () => {
    const err = Object.assign(new Error('Event tidak ditemukan'), { status: 404 });
    vi.mocked(eventService.updateEvent).mockRejectedValue(err);
    const res = await request(app).put('/v1/events/not-found').send({ title: 'X' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /v1/events/:id', () => {
  it('return 204 saat berhasil hapus', async () => {
    vi.mocked(eventService.deleteEvent).mockResolvedValue(undefined);
    const res = await request(app).delete('/v1/events/event-uuid');
    expect(res.status).toBe(204);
  });

  it('return 404 jika tidak ditemukan', async () => {
    const err = Object.assign(new Error('Event tidak ditemukan'), { status: 404 });
    vi.mocked(eventService.deleteEvent).mockRejectedValue(err);
    const res = await request(app).delete('/v1/events/not-found');
    expect(res.status).toBe(404);
  });
});
