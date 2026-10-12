-- 1. Student profiles
CREATE TABLE public.student_profiles (
  user_id uuid PRIMARY KEY,
  name text NOT NULL DEFAULT '',
  branch text NOT NULL,
  year integer NOT NULL DEFAULT 1,
  semester integer NOT NULL DEFAULT 1,
  career_goal text NOT NULL DEFAULT '',
  target_job text NOT NULL DEFAULT '',
  skills text[] NOT NULL DEFAULT '{}'::text[],
  languages text[] NOT NULL DEFAULT '{}'::text[],
  weekly_hours integer NOT NULL DEFAULT 10,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_profiles TO authenticated;
GRANT ALL ON public.student_profiles TO service_role;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students manage own profile" ON public.student_profiles
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 2. Shared generated content (server-written, read by signed-in students)
CREATE TABLE public.generated_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL,
  cache_key text NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (kind, cache_key)
);
GRANT SELECT ON public.generated_content TO authenticated;
GRANT ALL ON public.generated_content TO service_role;
ALTER TABLE public.generated_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in students read generated content" ON public.generated_content
  FOR SELECT TO authenticated USING (true);

-- 3. Per-student generated content (roadmap, resume, assistant)
CREATE TABLE public.user_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  kind text NOT NULL,
  cache_key text NOT NULL DEFAULT '',
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, kind, cache_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_content TO authenticated;
GRANT ALL ON public.user_content TO service_role;
ALTER TABLE public.user_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students manage own content" ON public.user_content
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4. Generic progress ticks
CREATE TABLE public.user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  item_kind text NOT NULL,
  item_id text NOT NULL,
  done boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, item_kind, item_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_progress TO authenticated;
GRANT ALL ON public.user_progress TO service_role;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students manage own progress" ON public.user_progress
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 5. Practice attempts
CREATE TABLE public.practice_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  branch text NOT NULL DEFAULT '',
  kind text NOT NULL,
  topic text NOT NULL DEFAULT '',
  score integer NOT NULL DEFAULT 0,
  total integer NOT NULL DEFAULT 0,
  seconds_taken integer NOT NULL DEFAULT 0,
  weak_topics text[] NOT NULL DEFAULT '{}'::text[],
  feedback jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.practice_attempts TO authenticated;
GRANT ALL ON public.practice_attempts TO service_role;
ALTER TABLE public.practice_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students manage own practice attempts" ON public.practice_attempts
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 6. Internship / job applications
CREATE TABLE public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  company text NOT NULL,
  role text NOT NULL DEFAULT '',
  kind text NOT NULL DEFAULT 'job',
  status text NOT NULL DEFAULT 'applied',
  applied_on date NOT NULL DEFAULT (now())::date,
  link text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated;
GRANT ALL ON public.applications TO service_role;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students manage own applications" ON public.applications
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- shared updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER touch_student_profiles BEFORE UPDATE ON public.student_profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER touch_user_content BEFORE UPDATE ON public.user_content
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER touch_user_progress BEFORE UPDATE ON public.user_progress
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER touch_applications BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();