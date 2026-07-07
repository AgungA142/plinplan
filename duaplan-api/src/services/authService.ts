import { supabaseAdmin, supabaseWithToken } from '../lib/supabase';
import type { RegisterInput, LoginInput, ForgotPasswordInput, ResetPasswordInput } from '../validators/authValidator';

function generatePairCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Hindari 0,O,1,I (mirip)
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export async function register({ email, password, display_name }: RegisterInput) {
  // Buat auth user — trigger handle_new_user otomatis insert ke public.users
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name },
  });
  if (authError) throw authError;

  const userId = authData.user.id;

  // Generate pair_code unik
  let pair_code = generatePairCode();
  let codeExists = true;
  while (codeExists) {
    const { data } = await supabaseAdmin.from('couples').select('id').eq('pair_code', pair_code).maybeSingle();
    if (!data) { codeExists = false; } else { pair_code = generatePairCode(); }
  }

  // Buat couple record
  const { data: couple, error: coupleError } = await supabaseAdmin
    .from('couples')
    .insert({ user_a_id: userId, pair_code })
    .select()
    .single();
  if (coupleError) throw coupleError;

  // Update user couple_id
  await supabaseAdmin.from('users').update({ couple_id: couple.id }).eq('id', userId);

  // Sign in untuk dapat access_token
  const { data: session, error: sessionError } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password,
  });
  if (sessionError) throw sessionError;

  return {
    user: { id: userId, email, display_name, couple_id: couple.id },
    couple,
    access_token: session.session!.access_token,
  };
}

export async function login({ email, password }: LoginInput) {
  const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password });
  if (error) throw error;

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .single();

  const { data: couple } = await supabaseAdmin
    .from('couples')
    .select('*')
    .eq('id', user?.couple_id)
    .maybeSingle();

  return {
    user,
    couple,
    access_token: data.session!.access_token,
    refresh_token: data.session!.refresh_token,
  };
}

export async function logout(token: string) {
  const { error } = await supabaseWithToken(token).auth.signOut();
  if (error) throw error;
}

export async function forgotPassword({ email }: ForgotPasswordInput) {
  const redirectTo = `${process.env.FRONTEND_URL ?? 'http://localhost:5173'}/reset-password`;
  await supabaseAdmin.auth.resetPasswordForEmail(email, { redirectTo });
  // Tidak throw error jika email tidak terdaftar (keamanan)
}

export async function resetPassword({ access_token, new_password }: ResetPasswordInput) {
  const { error } = await supabaseWithToken(access_token).auth.updateUser({ password: new_password });
  if (error) throw error;
}
