import { supabaseAdmin } from '../lib/supabase';

function generatePairCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

async function uniquePairCode(): Promise<string> {
  let code = generatePairCode();
  let exists = true;
  while (exists) {
    const { data } = await supabaseAdmin.from('couples').select('id').eq('pair_code', code).maybeSingle();
    if (!data) { exists = false; } else { code = generatePairCode(); }
  }
  return code;
}

export async function pairWithPartner(userId: string, pair_code: string) {
  const upperCode = pair_code.toUpperCase();

  const { data: couple } = await supabaseAdmin
    .from('couples')
    .select('*')
    .eq('pair_code', upperCode)
    .eq('pair_status', 'pending')
    .maybeSingle();

  if (!couple) {
    const err = new Error('Kode tidak valid atau sudah digunakan') as Error & { status: number };
    err.status = 404;
    throw err;
  }
  if (couple.user_a_id === userId) {
    const err = new Error('Tidak bisa pairing dengan akun sendiri') as Error & { status: number };
    err.status = 400;
    throw err;
  }

  // Cek apakah user sudah dalam couple aktif
  const { data: userRecord } = await supabaseAdmin
    .from('users')
    .select('couple_id')
    .eq('id', userId)
    .single();

  if (userRecord?.couple_id) {
    const { data: existing } = await supabaseAdmin
      .from('couples')
      .select('pair_status')
      .eq('id', userRecord.couple_id)
      .single();
    if (existing?.pair_status === 'active') {
      const err = new Error('Kamu sudah dalam couple yang aktif') as Error & { status: number };
      err.status = 400;
      throw err;
    }
  }

  const { data: updated } = await supabaseAdmin
    .from('couples')
    .update({ user_b_id: userId, pair_status: 'active', paired_at: new Date().toISOString() })
    .eq('id', couple.id)
    .select()
    .single();

  await supabaseAdmin.from('users').update({ couple_id: couple.id }).eq('id', userId);

  const [{ data: userA }, { data: userB }] = await Promise.all([
    supabaseAdmin.from('users').select('id, display_name, avatar_url').eq('id', couple.user_a_id).single(),
    supabaseAdmin.from('users').select('id, display_name, avatar_url').eq('id', userId).single(),
  ]);

  return { ...updated, user_a: userA, user_b: userB, partner: userA };
}

export async function getMe(userId: string) {
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('couple_id')
    .eq('id', userId)
    .single();

  if (!user?.couple_id) return null;

  const { data: couple } = await supabaseAdmin
    .from('couples')
    .select('*')
    .eq('id', user.couple_id)
    .single();

  if (!couple) return null;

  const [{ data: userA }, userBResult] = await Promise.all([
    supabaseAdmin.from('users').select('id, display_name, avatar_url').eq('id', couple.user_a_id).single(),
    couple.user_b_id
      ? supabaseAdmin.from('users').select('id, display_name, avatar_url').eq('id', couple.user_b_id).single()
      : Promise.resolve({ data: null }),
  ]);

  const userB = userBResult.data;
  const partner = couple.user_a_id === userId ? userB : userA;

  return { ...couple, user_a: userA, user_b: userB, partner };
}

export async function generateNewCode(userId: string) {
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('couple_id')
    .eq('id', userId)
    .single();

  if (!user?.couple_id) {
    const err = new Error('Couple tidak ditemukan') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  const pair_code = await uniquePairCode();
  await supabaseAdmin.from('couples').update({ pair_code }).eq('id', user.couple_id);
  return pair_code;
}

export async function unpair(userId: string) {
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('couple_id')
    .eq('id', userId)
    .single();

  if (!user?.couple_id) {
    const err = new Error('Couple tidak ditemukan') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  const { data: couple } = await supabaseAdmin
    .from('couples')
    .select('user_a_id, user_b_id')
    .eq('id', user.couple_id)
    .single();

  if (!couple) {
    const err = new Error('Couple tidak ditemukan') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  await supabaseAdmin
    .from('couples')
    .update({ pair_status: 'dissolved' })
    .eq('id', user.couple_id);

  const userIds = [couple.user_a_id, couple.user_b_id].filter(Boolean) as string[];
  await supabaseAdmin.from('users').update({ couple_id: null }).in('id', userIds);
}
