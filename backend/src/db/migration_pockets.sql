-- Migration: Create pockets table
CREATE TABLE IF NOT EXISTS pockets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key VARCHAR(20) NOT NULL,
  allocated NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, key)
);

CREATE INDEX IF NOT EXISTS idx_pockets_user_id ON pockets(user_id);

ALTER TABLE pockets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own pockets"
  ON pockets
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
