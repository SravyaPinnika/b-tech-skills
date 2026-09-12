import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BRANCHES } from "@/data/branches";
import { BRANCH_SUBJECTS, type BranchSubject } from "@/data/branch-subjects";
import { AppShell } from "@/components/AppShell";

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
  const [branch, setBranch] = useState<BranchSelection>("all");
  const [subjectQuery, setSubjectQuery] = useState("");
  const active = BRANCHES.find((b) => b.id === branch);

  const q = subjectQuery.trim().toLowerCase();
  const matchSubject = (s: BranchSubject) =>
    !q ||
    s.name.toLowerCase().includes(q) ||
    s.description.toLowerCase().includes(q) ||
    s.topics.some((t) => t.toLowerCase().includes(q));

  return (
    <AppShell>
      <main>
        <section className="border-b border-border">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
            <div className="rise">
              <span className="font-mono text-[10px] uppercase tracking-widest text-primary">
                For B.Tech CSE · IT · AIML · Data Science
              </span>
              <h1 className="mt-3 text-4xl font-black tracking-tighter text-balance sm:text-5xl lg:text-6xl">
                B.tech  skills  &   career  hub
              </h1>
              <p className="mt-4 max-w-[52ch] text-sm leading-relaxed text-muted-foreground sm:text-base">
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
                <Link
                  to="/courses"
                  className="rounded-sm border border-border px-6 py-3 text-center text-sm font-bold uppercase tracking-widest transition-colors hover:border-primary/50 hover:text-primary"
                >
                  Browse courses
                </Link>
              </div>
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
              <h2 className="text-2xl font-black tracking-tighter sm:text-3xl">
                Choose your branch
              </h2>
              <p className="mt-1 max-w-[60ch] text-sm text-muted-foreground">
                {active
                  ? active.blurb
                  : "All 13 B.Tech branches, with every course in the catalogue."}
              </p>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-primary">
              Ranked by placement weightage
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            <BranchTile active={branch === "all"} onClick={() => setBranch("all")} title="All Courses" subtitle="Every course in the catalogue" />
            {BRANCHES.map((b) => (
              <BranchTile
                key={b.id}
                active={branch === b.id}
                onClick={() => setBranch(b.id)}
                title={b.label}
                subtitle={b.short}
              />
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {skills.map((skill, i) => (
              <SkillCard key={skill.slug} skill={skill} index={i} />
            ))}
          </div>

          <div className="rounded-sm border border-border bg-card p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h3 className="text-lg font-black tracking-tighter">
                {active ? `Courses for ${active.label}` : "All courses"}
              </h3>
              <Link
                to="/courses"
                search={{ branch }}
                className="font-mono text-[10px] uppercase tracking-widest text-primary hover:underline"
              >
                Open courses ↗
              </Link>
            </div>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <li key={course.slug}>
                  <Link
                    to="/courses/$course"
                    params={{ course: course.slug }}
                    className="flex items-center justify-between gap-2 rounded-sm border border-border bg-surface/60 px-3 py-2.5 text-xs font-semibold transition-colors hover:border-primary/50 hover:text-primary"
                  >
                    <span className="truncate">{course.title}</span>
                    <span className="shrink-0 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                      {course.topics.length} topics
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
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

function BranchTile({
  active,
  onClick,
  title,
  subtitle,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`h-full rounded-sm border p-3 text-left transition-colors ${
        active
          ? "border-primary bg-primary/10"
          : "border-border bg-card hover:border-primary/50"
      }`}
    >
      <span
        className={`block text-sm font-bold tracking-tight ${active ? "text-primary" : ""}`}
      >
        {title}
      </span>
      <span className="mt-1 block text-[11px] leading-snug text-muted-foreground">
        {subtitle}
      </span>
    </button>
  );
}
