import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BRANCHES, skillsForBranch, type Branch } from "@/data/skills";
import { SkillCard } from "@/components/SkillCard";
import { AppShell, ProgressBar } from "@/components/AppShell";
import { useSkillProgress } from "@/lib/skill-progress";
import { computeReadiness } from "@/lib/readiness";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "B.Tech Skills — Personalised Placement Roadmap for CSE, IT, AIML, DS" },
      {
        name: "description",
        content:
          "Build your skills, track your progress and become placement ready. Personalised B.Tech roadmap covering DSA, SQL, development, projects and interviews.",
      },
      { property: "og:title", content: "B.Tech Skills — Personalised Placement Roadmap" },
      {
        property: "og:description",
        content:
          "Branch-wise skill roadmap with progress tracking, project guidance, interview prep and a weekly tools feed for B.Tech students.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const PILLARS = [
  {
    title: "Personalised learning",
    body: "Your branch, year and target role decide the order you learn things in.",
  },
  {
    title: "Skill tracking",
    body: "Mark every topic not started, in progress or done — your score updates live.",
  },
  {
    title: "Project guidance",
    body: "Know which projects actually impress the companies hiring your branch.",
  },
  {
    title: "Interview preparation",
    body: "Topic-wise interview questions with model answers and common mistakes.",
  },
  {
    title: "Placement readiness",
    body: "One number that tells you how close you are to clearing a real drive.",
  },
];

const STEPS = [
  { n: "01", title: "Create your profile", body: "Branch, year, target role and study time." },
  { n: "02", title: "See your roadmap", body: "Skills ranked by how much they decide your offer." },
  { n: "03", title: "Learn and track", body: "Read the topic, practise, then mark it complete." },
  { n: "04", title: "Get placement ready", body: "Projects, interview rounds and live hiring feed." },
];

const GOALS = [
  "Software Developer",
  "Full Stack Developer",
  "Data Analyst",
  "Data Scientist",
  "AI/ML Engineer",
  "Cloud/DevOps Engineer",
];

function Home() {
  const [branch, setBranch] = useState<Branch>("CSE");
  const active = BRANCHES.find((b) => b.id === branch)!;
  const skills = skillsForBranch(branch);
  const { state, hydrated } = useSkillProgress();
  const { rows, overall } = computeReadiness(branch, state);

  return (
    <AppShell>
      <main>
        <section className="border-b border-border">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:py-20 lg:grid-cols-[1.15fr_1fr] lg:items-center">
            <div className="rise">
              <span className="font-mono text-[10px] uppercase tracking-widest text-primary">
                For B.Tech CSE · IT · AIML · Data Science
              </span>
              <h1 className="mt-3 text-4xl font-black tracking-tighter text-balance sm:text-5xl lg:text-6xl">
                Build your skills. Track your progress. Become placement ready.
              </h1>
              <p className="mt-4 max-w-[52ch] text-sm leading-relaxed text-muted-foreground sm:text-base">
                Your personalised B.Tech roadmap for skills, projects, interviews and placements.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/dashboard"
                  className="rounded-sm bg-primary px-6 py-3 text-center text-sm font-bold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Start my roadmap
                </Link>
                <Link
                  to="/profile"
                  className="rounded-sm border border-border px-6 py-3 text-center text-sm font-bold uppercase tracking-widest transition-colors hover:border-primary/50 hover:text-primary"
                >
                  Create my profile
                </Link>
              </div>
            </div>

            <div className="rounded-sm border border-border bg-card p-6">
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Placement readiness
                </span>
                <span className="text-3xl font-black tracking-tighter text-primary">
                  {hydrated ? overall : 0}%
                </span>
              </div>
              <ProgressBar value={hydrated ? overall : 0} className="mt-3" />
              <ul className="mt-5 space-y-3">
                {rows.slice(0, 6).map((row) => (
                  <li key={row.skill.slug}>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="truncate text-xs font-semibold">{row.skill.name}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {hydrated ? row.percent : 0}%
                      </span>
                    </div>
                    <ProgressBar value={hydrated ? row.percent : 0} className="mt-1 h-1.5" />
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-[11px] leading-relaxed text-muted-foreground">
                This card fills up from your own tracked topics — nothing here is a demo number.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            What you get
          </h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PILLARS.map((p) => (
              <div
                key={p.title}
                className="rounded-sm border border-border bg-card p-5 transition-colors hover:border-primary/40"
              >
                <h3 className="text-sm font-bold tracking-tight">{p.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-border bg-secondary/30">
          <div className="mx-auto max-w-6xl px-4 py-14">
            <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              How it works
            </h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((s) => (
                <div key={s.n} className="rounded-sm border border-border bg-card p-5">
                  <span className="font-mono text-xs font-bold text-primary">{s.n}</span>
                  <h3 className="mt-2 text-sm font-bold tracking-tight">{s.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-2xl font-black tracking-tighter sm:text-3xl">
            Choose your career goal
          </h2>
          <p className="mt-2 max-w-[52ch] text-sm text-muted-foreground">
            Pick the role you want, and your roadmap reorders itself around it.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {GOALS.map((goal) => (
              <Link
                key={goal}
                to="/profile"
                className="rounded-sm border border-border bg-card px-4 py-2 text-xs font-semibold transition-colors hover:border-primary/50 hover:text-primary"
              >
                {goal}
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl space-y-5 px-4 py-8">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
            <div>
              <h2 className="text-2xl font-black tracking-tighter sm:text-3xl">Explore skills</h2>
              <p className="mt-1 text-sm text-muted-foreground">{active.blurb}</p>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-primary">
              Ranked by placement weightage
            </span>
          </div>

          <nav className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
            {BRANCHES.map((b) => (
              <button
                key={b.id}
                onClick={() => setBranch(b.id)}
                className={`shrink-0 rounded-sm px-4 py-1.5 text-xs font-bold tracking-tight transition-colors ${
                  b.id === branch
                    ? "bg-foreground text-background"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {b.label}
              </button>
            ))}
          </nav>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {skills.map((skill, i) => (
              <SkillCard key={skill.slug} skill={skill} index={i} />
            ))}
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-4 px-4 py-14 md:grid-cols-2">
          <div className="rounded-sm border border-border bg-card p-6">
            <h2 className="text-xl font-black tracking-tighter">Live hiring feed</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Which companies are recruiting freshers right now, the skills and projects they expect,
              their interview rounds, CTC range and eligibility — refreshed every week.
            </p>
            <Link
              to="/jobs"
              className="mt-4 inline-block font-mono text-[10px] uppercase tracking-widest text-primary hover:underline"
            >
              Open jobs & recruiters ↗
            </Link>
          </div>
          <div className="rounded-sm border border-border bg-card p-6">
            <h2 className="text-xl font-black tracking-tighter">Weekly tools</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              The frameworks, libraries and platforms companies started asking about recently, tagged
              by branch and added automatically every week.
            </p>
            <Link
              to="/tools"
              className="mt-4 inline-block font-mono text-[10px] uppercase tracking-widest text-primary hover:underline"
            >
              Open tools feed ↗
            </Link>
          </div>
        </section>

        <section className="border-t border-border bg-secondary/30">
          <div className="mx-auto max-w-3xl px-4 py-16 text-center">
            <h2 className="text-3xl font-black tracking-tighter sm:text-4xl">
              Start building your career today
            </h2>
            <p className="mx-auto mt-3 max-w-[46ch] text-sm text-muted-foreground">
              Ten minutes of setup, then one clear next step every single day.
            </p>
            <Link
              to="/profile"
              className="mt-6 inline-block rounded-sm bg-primary px-7 py-3 text-sm font-bold uppercase tracking-widest text-primary-foreground hover:bg-primary/90"
            >
              Create my roadmap
            </Link>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
