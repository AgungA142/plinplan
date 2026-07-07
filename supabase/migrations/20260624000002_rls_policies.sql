-- ============================================================
-- Migration 002: Row Level Security Policies
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_self_access" ON users
  FOR ALL USING (id = auth.uid());

CREATE POLICY "couples_member_access" ON couples
  FOR ALL USING (user_a_id = auth.uid() OR user_b_id = auth.uid());
