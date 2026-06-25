-- Admin-only access to donation records
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "donations_admin_all"
  ON donations
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
