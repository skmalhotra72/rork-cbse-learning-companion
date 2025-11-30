-- Fix RLS policies to allow health check queries
-- This allows the anon key to read from subjects table for health checks

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Anyone can view active subjects" ON public.subjects;
DROP POLICY IF EXISTS "Public can read subjects" ON public.subjects;
DROP POLICY IF EXISTS "Anon can read subjects for health check" ON public.subjects;

-- Create a policy that allows anonymous users to read subjects
CREATE POLICY "Anon can read subjects for health check" 
  ON public.subjects
  FOR SELECT 
  TO anon, authenticated
  USING (true);

-- Also ensure the table has RLS enabled
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

-- Similarly for chapters (used in some health checks)
DROP POLICY IF EXISTS "Anyone can view active chapters" ON public.chapters;
DROP POLICY IF EXISTS "Public can read chapters" ON public.chapters;
DROP POLICY IF EXISTS "Anon can read chapters for health check" ON public.chapters;

CREATE POLICY "Anon can read chapters for health check" 
  ON public.chapters
  FOR SELECT 
  TO anon, authenticated
  USING (true);

ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
