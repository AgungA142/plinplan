import type { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../lib/supabase';

export async function attachUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = req.userId;

  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !user) {
    res.status(401).json({ error: 'User not found' });
    return;
  }

  req.user = user;
  next();
}
