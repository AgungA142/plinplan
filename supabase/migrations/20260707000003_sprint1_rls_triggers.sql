-- Enable RLS on new tables
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_logs ENABLE ROW LEVEL SECURITY;

-- RLS: events - hanya couple yang sama
CREATE POLICY "events_couple_access" ON events
  FOR ALL USING (couple_id = (SELECT couple_id FROM users WHERE id = auth.uid()));

-- RLS: routines - hanya couple yang sama
CREATE POLICY "routines_couple_access" ON routines
  FOR ALL USING (couple_id = (SELECT couple_id FROM users WHERE id = auth.uid()));

-- RLS: routine_logs - melalui routines yang dimiliki couple
CREATE POLICY "routine_logs_couple_access" ON routine_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM routines r
      JOIN users u ON u.couple_id = r.couple_id
      WHERE r.id = routine_logs.routine_id AND u.id = auth.uid()
    )
  );

-- Trigger: set updated_at otomatis saat row di-update
CREATE TRIGGER set_updated_at_events
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_routines
  BEFORE UPDATE ON routines
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
