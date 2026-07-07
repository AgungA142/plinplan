import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../index';
import * as coupleService from '../services/coupleService';

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

vi.mock('../middleware/validateJWT', () => ({
  validateJWT: (_req: unknown, _res: unknown, next: () => void) => next(),
}));

vi.mock('../middleware/attachUser', () => ({
  attachUser: (req: { userId?: string }, _res: unknown, next: () => void) => {
    req.userId = 'user-uuid-123';
    next();
  },
}));

const mockCouple = {
  id: 'couple-uuid',
  user_a_id: 'other-user',
  user_b_id: 'user-uuid-123',
  pair_code: 'ABCD1234',
  pair_status: 'active',
  paired_at: '2026-07-07T00:00:00.000Z',
  created_at: '2026-07-07T00:00:00.000Z',
};

const mockPartner = { id: 'other-user', display_name: 'Dewi', avatar_url: null };

beforeEach(() => vi.clearAllMocks());

describe('GET /v1/couples/lookup', () => {
  it('return data pasangan jika kode valid', async () => {
    vi.mocked(coupleService.lookupByCode).mockResolvedValue(mockPartner as never);
    const res = await request(app).get('/v1/couples/lookup?code=ABCD1234');
    expect(res.status).toBe(200);
    expect(res.body.display_name).toBe('Dewi');
  });

  it('gagal jika kode kurang dari 8 karakter', async () => {
    const res = await request(app).get('/v1/couples/lookup?code=SHORT');
    expect(res.status).toBe(400);
  });

  it('gagal jika kode tidak ditemukan', async () => {
    const err = Object.assign(new Error('Kode tidak valid atau sudah digunakan'), { status: 404 });
    vi.mocked(coupleService.lookupByCode).mockRejectedValue(err);
    const res = await request(app).get('/v1/couples/lookup?code=NOTFOUND');
    expect(res.status).toBe(404);
  });
});

describe('POST /v1/couples/pair', () => {
  it('berhasil pair dengan kode valid', async () => {
    vi.mocked(coupleService.pairWithPartner).mockResolvedValue(mockCouple as never);
    const res = await request(app).post('/v1/couples/pair').send({ pair_code: 'ABCD1234' });
    expect(res.status).toBe(200);
    expect(res.body.pair_status).toBe('active');
  });

  it('gagal jika pair_code tidak 8 karakter', async () => {
    const res = await request(app).post('/v1/couples/pair').send({ pair_code: 'SHORT' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation error');
  });

  it('gagal jika kode tidak ditemukan (404 dari service)', async () => {
    const err = Object.assign(new Error('Kode tidak valid atau sudah digunakan'), { status: 404 });
    vi.mocked(coupleService.pairWithPartner).mockRejectedValue(err);
    const res = await request(app).post('/v1/couples/pair').send({ pair_code: 'NOTFOUND' });
    expect(res.status).toBe(404);
  });

  it('gagal jika pairing dengan diri sendiri (400)', async () => {
    const err = Object.assign(new Error('Tidak bisa pairing dengan akun sendiri'), { status: 400 });
    vi.mocked(coupleService.pairWithPartner).mockRejectedValue(err);
    const res = await request(app).post('/v1/couples/pair').send({ pair_code: 'SELFSELF' });
    expect(res.status).toBe(400);
  });
});

describe('GET /v1/couples/me', () => {
  it('return data couple jika ada', async () => {
    vi.mocked(coupleService.getMe).mockResolvedValue(mockCouple as never);
    const res = await request(app).get('/v1/couples/me');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe('couple-uuid');
  });

  it('return null jika belum paired', async () => {
    vi.mocked(coupleService.getMe).mockResolvedValue(null);
    const res = await request(app).get('/v1/couples/me');
    expect(res.status).toBe(200);
    expect(res.body).toBeNull();
  });
});

describe('POST /v1/couples/generate-code', () => {
  it('return pair_code baru', async () => {
    vi.mocked(coupleService.generateNewCode).mockResolvedValue('NEWCODE1');
    const res = await request(app).post('/v1/couples/generate-code').send({});
    expect(res.status).toBe(200);
    expect(res.body.pair_code).toBe('NEWCODE1');
  });
});

describe('DELETE /v1/couples/unpair', () => {
  it('return 204 saat berhasil unpair', async () => {
    vi.mocked(coupleService.unpair).mockResolvedValue(undefined);
    const res = await request(app).delete('/v1/couples/unpair');
    expect(res.status).toBe(204);
  });
});
