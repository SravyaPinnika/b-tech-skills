# Branch → Course → Sub-topic learning platform

Your site already has branches, courses, exams, projects, interviews and jobs. This plan adds the full
learning structure you listed — every branch, every course, every sub-topic — as a proper guided flow:
pick a branch, pick a course, open a sub-topic, learn it, practise it, take a quiz, see your progress.
Nothing that works today is removed.

## Stage 1 — The full course map (data foundation)

- One structured catalogue containing all 13 branches, each with the courses you listed, and each course
  with its exact sub-topics (Programming in C/C++ → pointers, STL, file handling … Quantum Applications →
  quantum chemistry, optimisation, quantum ML …).
- Every sub-topic carries: short description, difficulty (Beginner / Intermediate / Advanced), estimated
  learning time, and tags (Theory, Practical, Interview, Coding, Project).
- Adding a new branch or course later means adding one entry to this catalogue — no page rewrites.
- Existing courses, lessons and exams stay linked so current material is reused, not duplicated.

## Stage 2 — Navigation flow

New pages that follow your flow exactly:

- Branch list: clean card grid of the 13 branches with course count and progress.
- Branch page: that branch's courses as cards (description, difficulty, duration, sub-topic count, progress).
- Course page: sub-topics as cards — name, short description, difficulty, time, progress, "Start learning".
- Sub-topic page: the dedicated learning page (Stage 3), with Previous / Next topic and Mark as complete.

Home page keeps its current look and gains a clear "Start your learning path" entry into this flow.

## Stage 3 — The sub-topic learning page

Each sub-topic page shows, in tabs so the screen never feels crowded:

- Learn: simple explanation, why it matters, key concepts, formulas where relevant, worked examples,
  a diagram where it helps, beginner-friendly summary and real-world uses.
- Practice: practice questions with worked solutions, plus coding problems for programming sub-topics.
- Quiz: multiple-choice quiz with scoring, correct answers and per-question explanations; score saved.
- Interview: likely interview questions with model answers.
- Project: a mini project idea with steps.

Content is written by the platform's own AI content service (already used for concept lessons and exams)
and then saved, so a topic is generated once and afterwards loads instantly — real content, kept out of
the frontend code.

## Stage 4 — Search, filters, progress and dashboard

- Search bar that matches branches, courses, sub-topics, skills, technologies and interview topics.
- Filters: branch, course, Beginner / Intermediate / Advanced, and Theory / Practical / Interview /
  Coding / Project.
- Bookmarks, completion ticks, quiz scores, recently viewed and learning streak stored in your account,
  so progress follows you across devices.
- Dashboard rebuilt around: selected branch, courses started, topics completed, overall progress, quiz
  scores, bookmarks, recently viewed, recommended next topics, streak and skills completed.

## Stage 5 — Design and polish pass

- Light professional education theme: rounded cards, soft shadows, clear hierarchy, restrained colour,
  icons where they help, subtle hover and transition animations.
- Consistent spacing and layout across Dashboard, Courses, Roadmap, Projects, Interviews and Jobs.
- Mobile and desktop pass, plus loading, empty and error states on every new page.
- Every new route opened and checked before finishing.

## Technical notes

- New `src/data/branch-courses.ts` holds the typed catalogue: Branch → Course → SubTopic, with slugs
  generated from names so routes stay stable.
- New routes under `src/routes/_authenticated/learn.*` for branch / course / sub-topic, using the existing
  route conventions and `AppShell`.
- Sub-topic content, quizzes, practice and interview sets come from server functions in
  `src/lib/learning.functions.ts` (extended), cached in the existing `generated_content` table keyed by
  branch/course/sub-topic.
- Progress, bookmarks, quiz attempts, recently viewed and streak use the existing `user_progress` and
  `practice_attempts` tables plus one small additions migration where needed, all with row-level security.
- Existing routes (`/courses`, `/roadmap`, `/projects`, `/interviews`, `/jobs`, `/tools`, exams) keep
  working unchanged.

## Order of delivery

Stage 1 and 2 first (structure you can click through), then 3, then 4, then 5 — each verified in the
running app before moving on.
