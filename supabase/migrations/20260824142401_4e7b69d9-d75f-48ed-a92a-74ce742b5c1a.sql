CREATE TABLE public.tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  category text NOT NULL,
  description text NOT NULL,
  why_it_matters text,
  branches text[] NOT NULL DEFAULT '{}',
  url text,
  added_week date NOT NULL DEFAULT date_trunc('week', now())::date,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.tools TO anon;
GRANT SELECT ON public.tools TO authenticated;
GRANT ALL ON public.tools TO service_role;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tools are publicly readable" ON public.tools FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.job_state (
  job_name text PRIMARY KEY,
  last_run_at timestamptz,
  last_status text,
  last_message text,
  paused boolean NOT NULL DEFAULT false,
  lease_until timestamptz
);

GRANT SELECT ON public.job_state TO anon;
GRANT SELECT ON public.job_state TO authenticated;
GRANT ALL ON public.job_state TO service_role;
ALTER TABLE public.job_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Job state is publicly readable" ON public.job_state FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.job_state (job_name) VALUES ('weekly_tools_refresh');

INSERT INTO public.tools (name, category, description, why_it_matters, branches, url) VALUES
('LangChain','AI / LLM','Framework for chaining LLM calls, tools and retrieval into applications.','AIML and DS interviews increasingly ask how you build on top of models, not just train them.','{AIML,DS,CSE}','https://www.langchain.com'),
('Docker','DevOps','Containerises applications so they run identically everywhere.','Almost every backend/full-stack placement round expects basic containerisation literacy.','{CSE,IT,AIML,DS}','https://www.docker.com'),
('Git & GitHub','Version Control','Distributed version control and collaboration platform.','Your GitHub profile is often screened before your resume.','{CSE,IT,AIML,DS}','https://github.com'),
('PostgreSQL','Databases','Powerful open-source relational database with strong SQL support.','SQL queries and schema design are standard technical-round questions.','{CSE,IT,DS}','https://www.postgresql.org'),
('PyTorch','AI / ML','Deep learning framework used for research and production model training.','The default framework named in AIML job descriptions.','{AIML,DS}','https://pytorch.org'),
('Pandas','Data','Data manipulation and analysis library for Python.','Data-science screening tests are usually pandas exercises.','{DS,AIML}','https://pandas.pydata.org'),
('React','Web','Component-based library for building user interfaces.','Most full-stack and frontend roles in campus placements list React.','{CSE,IT}','https://react.dev'),
('Postman','APIs','Client for designing, testing and documenting REST APIs.','Shows you can verify and debug the APIs you build.','{CSE,IT}','https://www.postman.com'),
('scikit-learn','AI / ML','Classical machine learning algorithms and pipelines in Python.','Interviewers probe classical ML before deep learning.','{AIML,DS}','https://scikit-learn.org'),
('Power BI','Analytics','Business intelligence and dashboarding tool.','Analytics roles ask for at least one BI/dashboarding tool.','{DS,IT}','https://powerbi.microsoft.com'),
('Kubernetes','DevOps','Orchestrates containers across clusters at scale.','A strong differentiator for infra and backend roles.','{CSE,IT}','https://kubernetes.io'),
('Hugging Face Transformers','AI / LLM','Library and hub of pretrained transformer models.','Fastest way to demonstrate applied NLP work in a portfolio.','{AIML,DS}','https://huggingface.co');