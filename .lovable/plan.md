# B.Tech Skills — 13-branch personalized platform

Keeping the current design, courses, exams, jobs and tools pages exactly as they are, and building the new platform around them. The work is split into 5 stages so you can review something working after each one.

## Stage 1 — Branches, profile, database foundation

- Replace the current branch list with exactly your 13 branches (CSE, IT, AI & ML, AI & Data Science, CSE–Data Science, CSE–Cyber Security, CSE–IoT, ECE, EEE, Mechanical, Civil, Chemical, Quantum Computing).
- Profile setup grows to: branch, year (1–4), semester (1–8), career goal, target job, current skills, weekly hours.
- Move the profile and all progress out of browser storage into your account in the database, so everything survives refresh and follows you across devices.
- New tables for branches, roadmaps, courses, projects, questions, assessments, attempts and per-student progress, each locked to the signed-in student.

## Stage 2 — Personalized roadmap per branch

- A roadmap generated for the exact combination of branch + year + semester + career goal + target job + current skills.
- Each roadmap shows semester-wise subjects, skills, courses, projects, certifications, interview prep and placement prep, with completion state you can tick off.
- Roadmaps are created once and saved, so they load instantly afterwards and can be regenerated when your profile changes.

## Stage 3 — Learning, practice and assessments

- Branch-specific courses and lessons, built on the existing course/lesson pages so nothing you already have is lost.
- Practice hub: coding practice, aptitude, logical reasoning, technical MCQs and branch-specific tests.
- Timed tests with a countdown, scoring, per-question explanations, full attempt history and a weak-topic breakdown.
- Coding practice uses the language that fits the branch (C/C++/Python/Java/SQL for software branches, C/Python/MATLAB-style for core branches).

## Stage 4 — Projects, interviews, resume and placement

- Projects for every branch at beginner, intermediate, advanced and final-year level, each with problem, skills, technologies, build steps, GitHub guidance, deployment, viva questions and interview questions.
- Interview section: technical, HR, mock interview flow, coding interviews, branch-specific question banks, and company preparation — software companies for CSE/IT/AI/DS/Cyber/IoT, core companies (BEL, ISRO, DRDO, L&T, Siemens, Tata, BHEL, Reliance, etc.) for ECE/EEE/Mechanical/Civil/Chemical.
- ATS resume builder with scoring, GitHub/LinkedIn sections and PDF export.
- Internship and job application tracking plus a branch-specific placement readiness score.

## Stage 5 — Quantum track, AI assistant, dashboard, polish

- Dedicated Quantum Computing track: Python, linear algebra, probability, quantum mechanics basics, qubits, gates, circuits, superposition, entanglement, quantum algorithms, Qiskit, Cirq, PennyLane, quantum cryptography, quantum ML — with beginner→advanced projects and interview questions.
- AI Career Assistant that reads your branch, year, skills, goal, courses, projects and test results to produce a roadmap, daily tasks, skill-gap analysis, project suggestions, interview prep and career advice.
- Dashboard rebuilt as: branch → year → semester → career goal → roadmap → courses → practice → projects → assessments → interviews → resume → placement readiness.
- Loading, empty and error states everywhere, mobile and desktop pass, and every route tested before finishing.

## Technical notes

- Content at this volume is generated on demand by Lovable AI (the same approach already used for concept lessons and exams) and cached in the database keyed by branch/year/topic — so it is real content, not placeholders, and it is not hardcoded in the frontend.
- Roadmaps, questions, projects and assessments are stored server-side with row-level security; a student can only read and write their own progress.
- Admin-only content seeding runs behind a protected server route, not from the browser.
- Existing routes (`/courses`, `/jobs`, `/tools`, `/skills`, exams) keep working unchanged; new sections are added alongside them.

## Order of delivery

Stage 1 first, then 2, 3, 4, 5 in sequence, each verified in the running app before moving on.
