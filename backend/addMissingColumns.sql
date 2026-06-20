-- Add missing columns and constraints for Supabase
-- 1. Add grade column to students
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS grade VARCHAR(50);

-- 4. Make date_of_birth nullable (so Add Family works without a DOB value)
ALTER TABLE students
  ALTER COLUMN date_of_birth DROP NOT NULL;

-- 2. Add grade column to fee_structures
ALTER TABLE fee_structures
  ADD COLUMN IF NOT EXISTS grade VARCHAR(100);

-- 3. Ensure email is unique in parents table
CREATE UNIQUE INDEX IF NOT EXISTS idx_parents_email
  ON parents (email);

-- Optional: add extra parent fields if not present
ALTER TABLE parents
  ADD COLUMN IF NOT EXISTS alternative_mobile VARCHAR(20),
  ADD COLUMN IF NOT EXISTS address TEXT;

-- Optional: trigger to update updated_at on leave_applications
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_leave_applications_updated_at ON leave_applications;
CREATE TRIGGER update_leave_applications_updated_at
BEFORE UPDATE ON leave_applications
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
