CREATE TABLE public.concept_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_slug text NOT NULL,
  topic_slug text NOT NULL,
  sub_index int NOT NULL,
  title text NOT NULL,
  content jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (course_slug, topic_slug, sub_index)
);
GRANT SELECT ON public.concept_content TO authenticated;
GRANT ALL ON public.concept_content TO service_role;
ALTER TABLE public.concept_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users read concept content" ON public.concept_content FOR SELECT TO authenticated USING (true);

CREATE TABLE public.topic_exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_slug text NOT NULL,
  topic_slug text NOT NULL,
  kind text NOT NULL,
  language text NOT NULL DEFAULT '',
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (course_slug, topic_slug, kind, language)
);
GRANT SELECT ON public.topic_exams TO authenticated;
GRANT ALL ON public.topic_exams TO service_role;
ALTER TABLE public.topic_exams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users read exams" ON public.topic_exams FOR SELECT TO authenticated USING (true);

CREATE TABLE public.exam_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  course_slug text NOT NULL,
  topic_slug text NOT NULL,
  kind text NOT NULL,
  score int NOT NULL,
  total int NOT NULL,
  feedback jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX exam_attempts_user_idx ON public.exam_attempts (user_id, course_slug, topic_slug);
GRANT SELECT, INSERT ON public.exam_attempts TO authenticated;
GRANT ALL ON public.exam_attempts TO service_role;
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own attempts" ON public.exam_attempts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users add own attempts" ON public.exam_attempts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);