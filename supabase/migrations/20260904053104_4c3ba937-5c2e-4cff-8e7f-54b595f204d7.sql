ALTER TABLE public.recruiters
  ADD COLUMN IF NOT EXISTS current_stage TEXT,
  ADD COLUMN IF NOT EXISTS apply_by TEXT,
  ADD COLUMN IF NOT EXISTS process_stages TEXT[] NOT NULL DEFAULT '{}';

UPDATE public.recruiters SET current_stage = 'Applications open — online assessment invites rolling out', apply_by = 'Sep 2026 (rolling)', process_stages = ARRAY['Online application / referral','Online assessment (aptitude + coding)','Technical interview 1','Technical interview 2','HR / managerial round','Offer + document verification'] WHERE current_stage IS NULL;

UPDATE public.recruiters SET current_stage = 'SDE-1 hiring challenge live; OA invites being sent', apply_by = '30 Sep 2026', process_stages = ARRAY['Online application','Online assessment: 2 DSA problems + work simulation','Technical interview (DSA + LP)','Technical + Bar Raiser interview','Offer'] WHERE company = 'Amazon';

UPDATE public.recruiters SET current_stage = 'Campus drives in progress; Engage mentorship shortlists out', apply_by = '20 Sep 2026', process_stages = ARRAY['Resume shortlist / Engage program','Online coding round','Technical interview 1 (DSA)','Technical interview 2 (design + projects)','AA (as-appropriate) round','Offer'] WHERE company = 'Microsoft';

UPDATE public.recruiters SET current_stage = 'Interview slots being scheduled for shortlisted profiles', apply_by = 'Rolling', process_stages = ARRAY['Resume screen / referral','Online assessment','Technical phone screen','Onsite loop (3-4 rounds: DSA, design, Googleyness)','Hiring committee review','Team match + offer'] WHERE company = 'Google';

UPDATE public.recruiters SET current_stage = 'Engineering Campus Hiring Programme — final interview rounds', apply_by = '15 Sep 2026', process_stages = ARRAY['Application + HackerRank CoderPad test','Video interview (HireVue)','Technical superday round 1','Technical superday round 2','Offer'] WHERE company = 'Goldman Sachs';

UPDATE public.recruiters SET current_stage = 'NQT registrations open for the Nov window', apply_by = '31 Oct 2026', process_stages = ARRAY['TCS NQT registration','NQT test (aptitude + programming)','Technical interview','Managerial round','HR round','Offer letter'] WHERE company = 'TCS';

UPDATE public.recruiters SET current_stage = 'Elite NLTH test slots live', apply_by = '10 Oct 2026', process_stages = ARRAY['Elite NLTH registration','Online test (aptitude + written communication + coding)','Business discussion / technical interview','HR interview','Offer'] WHERE company = 'Wipro';

UPDATE public.recruiters SET current_stage = 'Systems Engineer drive on; HackWithInfy opens Feb', apply_by = '30 Nov 2026', process_stages = ARRAY['Application / campus shortlist','Online test (reasoning + pseudocode + puzzles)','Technical interview','HR interview','Offer'] WHERE company = 'Infosys';

UPDATE public.recruiters SET current_stage = 'GenC Next assessments scheduled from Oct', apply_by = '15 Oct 2026', process_stages = ARRAY['Registration','Aptitude + coding assessment','Communication assessment','Technical interview','HR round','Offer'] WHERE company = 'Cognizant';

UPDATE public.recruiters SET current_stage = 'Pre-placement talks running on campuses', apply_by = '30 Sep 2026', process_stages = ARRAY['Campus registration','Cognitive + technical assessment','Coding round','Technical interview','HR interview','Offer'] WHERE company = 'Accenture';

UPDATE public.recruiters SET current_stage = 'Off-campus drive announcements expected Nov', apply_by = '30 Nov 2026', process_stages = ARRAY['Registration','Game-based aptitude test','Technical assessment','Technical interview','HR interview','Offer'] WHERE company = 'Capgemini';

UPDATE public.recruiters SET current_stage = 'Analyst interviews in progress for Tech & Data tracks', apply_by = '25 Sep 2026', process_stages = ARRAY['Application / campus shortlist','Online assessment','Group case discussion','Technical interview','Partner / HR round','Offer'] WHERE company = 'Deloitte';

UPDATE public.recruiters SET current_stage = 'Trainee Data Scientist screening tests live', apply_by = '5 Oct 2026', process_stages = ARRAY['Application','Aptitude + statistics + Python test','Case study / take-home','Technical interview (ML depth)','Client-facing / HR round','Offer'] WHERE company = 'Fractal Analytics';

UPDATE public.recruiters SET current_stage = 'Intern shortlists released; interviews through Oct', apply_by = '30 Sep 2026', process_stages = ARRAY['Application + resume screen','Technical screen (C++/Python + DL fundamentals)','Deep-dive technical interview','Team fit interview','Offer'] WHERE company = 'Nvidia';

UPDATE public.recruiters SET current_stage = 'In-person drives running continuously across centres', apply_by = 'Year-round', process_stages = ARRAY['Aptitude round','Basic programming round','Advanced programming round','Technical interview','Managerial + HR round','Offer'] WHERE company = 'Zoho';