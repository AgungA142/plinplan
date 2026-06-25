import type { Request, Response, NextFunction } from 'express';
import { supabaseWithToken } from '../lib/supabase';

export async function validateJWT(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization header' });
    return;
  }

  const token = authHeader.slice(7);
  const { data: { user }, error } = await supabaseWithToken(token).auth.getUser();

  if (error || !user) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }

  req.userId = user.id;
  req.userEmail = user.email ?? null;
  next();
}
