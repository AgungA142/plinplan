import { describe, it, expect, vi, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';

// Mock authService sebelum import router
vi.mock('../services/authService', () => ({
  register: vi.fn().mockResolvedValue({
    user: { id: 'uuid-1', email: 'a@b.com', display_name: 'Agung', couple_id: 'couple-1' },
    pair_code: 'ABCD1234',
    access_token: 'mock-token',
  }),
  login: vi.fn().mockResolvedValue({
    user: { id: 'uuid-1', email: 'a@b.com' },
    couple: null,
    access_token: 'mock-token',
    refresh_token: 'mock-refresh',
  }),
  logout: vi.fn().mockResolvedValue(undefined),
  forgotPassword: vi.fn().mockResolvedValue(undefined),
  resetPassword: vi.fn().mockResolvedValue(undefined),
}));

// Mock middleware agar protected routes tidak butuh token asli
vi.mock('../middleware/validateJWT', () => ({
  validateJWT: (_req: express.Request, _res: express.Response, next: express.NextFunction) => next(),
}));

vi.mock('../middleware/attachUser', () => ({
  attachUser: (req: express.Request, _res: express.Response, next: express.NextFunction) => {
    (req as express.Request & { user: unknown }).user = { id: 'uuid-1', email: 'a@b.com' };
    next();
  },
}));

let app: express.Express;

beforeAll(async () => {
  const { default: authRouter } = await import('../routes/auth');
  app = express();
  app.use(express.json());
  app.use('/v1/auth', authRouter);
});

describe('POST /v1/auth/register', () => {
  it('201 dengan input valid', async () => {
    const res = await request(app)
      .post('/v1/auth/register')
      .send({ email: 'test@example.com', password: 'pass1234', display_name: 'Agung' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('pair_code');
    expect(res.body).toHaveProperty('access_token');
  });

  it('400 dengan input tidak valid', async () => {
    const res = await request(app)
      .post('/v1/auth/register')
      .send({ email: 'bukan-email', password: 'short', display_name: 'A' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Validation error');
  });
});

describe('POST /v1/auth/login', () => {
  it('200 dengan credential valid', async () => {
    const res = await request(app)
      .post('/v1/auth/login')
      .send({ email: 'test@example.com', password: 'pass1234' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('access_token');
  });

  it('400 tanpa password', async () => {
    const res = await request(app)
      .post('/v1/auth/login')
      .send({ email: 'a@b.com', password: '' });
    expect(res.status).toBe(400);
  });
});

describe('POST /v1/auth/forgot-password', () => {
  it('selalu 200 meskipun email tidak terdaftar', async () => {
    const res = await request(app)
      .post('/v1/auth/forgot-password')
      .send({ email: 'siapapun@example.com' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });
});

describe('POST /v1/auth/reset-password', () => {
  it('200 dengan token dan password valid', async () => {
    const res = await request(app)
      .post('/v1/auth/reset-password')
      .send({ access_token: 'valid-token', new_password: 'newpass123' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  it('400 dengan password terlalu pendek', async () => {
    const res = await request(app)
      .post('/v1/auth/reset-password')
      .send({ access_token: 'tok', new_password: 'short' });
    expect(res.status).toBe(400);
  });
});

describe('POST /v1/auth/logout', () => {
  it('204 dengan token valid', async () => {
    const res = await request(app)
      .post('/v1/auth/logout')
      .set('Authorization', 'Bearer mock-token');
    expect(res.status).toBe(204);
  });
});
