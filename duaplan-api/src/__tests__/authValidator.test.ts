import { describe, it, expect } from 'vitest';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/authValidator';

describe('registerSchema', () => {
  it('valid input', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: 'password123',
      display_name: 'Agung',
    });
    expect(result.success).toBe(true);
  });

  it('email tidak valid', () => {
    const result = registerSchema.safeParse({ email: 'bukan-email', password: 'pass1234', display_name: 'Agung' });
    expect(result.success).toBe(false);
  });

  it('password terlalu pendek', () => {
    const result = registerSchema.safeParse({ email: 'a@b.com', password: 'short', display_name: 'Agung' });
    expect(result.success).toBe(false);
  });

  it('display_name terlalu pendek', () => {
    const result = registerSchema.safeParse({ email: 'a@b.com', password: 'pass1234', display_name: 'A' });
    expect(result.success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('valid input', () => {
    const result = loginSchema.safeParse({ email: 'test@example.com', password: 'anypass' });
    expect(result.success).toBe(true);
  });

  it('password kosong', () => {
    const result = loginSchema.safeParse({ email: 'a@b.com', password: '' });
    expect(result.success).toBe(false);
  });
});

describe('forgotPasswordSchema', () => {
  it('valid email', () => {
    const result = forgotPasswordSchema.safeParse({ email: 'test@example.com' });
    expect(result.success).toBe(true);
  });

  it('email tidak valid', () => {
    const result = forgotPasswordSchema.safeParse({ email: 'bukan-email' });
    expect(result.success).toBe(false);
  });
});

describe('resetPasswordSchema', () => {
  it('valid input', () => {
    const result = resetPasswordSchema.safeParse({ access_token: 'token123', new_password: 'newpass123' });
    expect(result.success).toBe(true);
  });

  it('access_token kosong', () => {
    const result = resetPasswordSchema.safeParse({ access_token: '', new_password: 'newpass123' });
    expect(result.success).toBe(false);
  });

  it('password baru terlalu pendek', () => {
    const result = resetPasswordSchema.safeParse({ access_token: 'tok', new_password: 'short' });
    expect(result.success).toBe(false);
  });
});
