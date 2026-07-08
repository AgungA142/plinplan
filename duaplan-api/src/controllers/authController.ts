import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import * as authService from '../services/authService';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/authValidator';

function handleZodError(err: ZodError, res: Response): void {
  const details = err.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
  res.status(400).json({ error: 'Validation error', details });
}

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = registerSchema.parse(req.body);
    const result = await authService.register(input);
    res.status(201).json(result);
  } catch (err) {
    if (err instanceof ZodError) { handleZodError(err, res); return; }
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = loginSchema.parse(req.body);
    const result = await authService.login(input);
    res.json(result);
  } catch (err) {
    if (err instanceof ZodError) { handleZodError(err, res); return; }
    const e = err as { message?: string; status?: number };
    if (e.message?.includes('Invalid login credentials') || e.message?.includes('Email not confirmed')) {
      res.status(401).json({ error: 'Email atau password salah' });
      return;
    }
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.headers.authorization!.slice(7);
    await authService.logout(token);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response): Promise<void> {
  res.json({ user: req.user });
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = forgotPasswordSchema.parse(req.body);
    await authService.forgotPassword(input);
    res.json({ message: 'Email reset password telah dikirim' });
  } catch (err) {
    if (err instanceof ZodError) { handleZodError(err, res); return; }
    next(err);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = resetPasswordSchema.parse(req.body);
    await authService.resetPassword(input);
    res.json({ message: 'Password berhasil diperbarui' });
  } catch (err) {
    if (err instanceof ZodError) { handleZodError(err, res); return; }
    next(err);
  }
}
