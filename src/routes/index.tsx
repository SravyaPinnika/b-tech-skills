import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BRANCHES, type BranchId } from "@/data/branches";
import { BRANCH_SUBJECTS, type BranchSubject } from "@/data/branch-subjects";
import { skillDemand } from "@/data/branch-skill-demand";
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

function Home() {
  const [branch, setBranch] = useState<BranchId | null>(null);
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

        <section className="mx-auto max-w-6xl space-y-5 px-4 py-8">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
            <div>
              <h2 className="text-2xl font-black tracking-tighter sm:text-3xl">
                Choose your branch
              </h2>
              <p className="mt-1 max-w-[60ch] text-sm text-muted-foreground">
                {active
                  ? `${active.short} — main subjects below.`
                  : "All 13 B.Tech branches. Pick one to see its main subjects."}
              </p>
            </div>
            {active && (
              <button
                type="button"
                onClick={() => {
                  setBranch(null);
                  setSubjectQuery("");
                }}
                className="rounded-sm border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
              >
                ← Back to categories
              </button>
            )}
          </div>

          {!active && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {BRANCHES.map((b) => (
                <BranchTile
                  key={b.id}
                  active={false}
                  onClick={() => {
                    setBranch(b.id);
                    setSubjectQuery("");
                  }}
                  title={b.label}
                  subtitle={b.short}
                />
              ))}
            </div>
          )}

          {active && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setBranch(null)}
                className="rounded-sm border border-primary/40 bg-primary/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-primary"
              >
                {active.label}
              </button>
              <Link
                to="/courses"
                search={{ branch: active.id }}
                className="rounded-sm border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
              >
                Open in course catalogue ↗
              </Link>
            </div>
          )}

          {active && <input
            value={subjectQuery}
            onChange={(e) => setSubjectQuery(e.target.value)}
            placeholder={`Search ${active.label} subjects or topics (e.g. sorting, thermodynamics)`}
            className="w-full rounded-sm border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary/60"
          />}

          {active ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {BRANCH_SUBJECTS[active.id].filter(matchSubject).map((subject, index) => {
                  const demand = demandForSubject(active.id, subject, index);
                  return <SubjectCard key={subject.name} subject={subject} demand={demand} />;
                })}
              </div>
              {BRANCH_SUBJECTS[active.id].filter(matchSubject).length === 0 && (
                <p className="rounded-sm border border-border bg-card p-6 text-sm text-muted-foreground">
                  No subjects match that search. Try a different keyword.
                </p>
              )}
            </>
          ) : null}
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

const DIFFICULTY_TONE: Record<string, string> = {
  Beginner: "border-border text-muted-foreground",
  Intermediate: "border-primary/40 bg-primary/10 text-primary",
  Advanced: "border-primary/40 bg-primary/10 text-primary",
};

function demandForSubject(branch: BranchId, subject: BranchSubject, fallbackIndex: number) {
  const demand = skillDemand(branch);
  const subjectWords = `${subject.name} ${subject.topics.join(" ")}`
    .toLowerCase()
    .split(/[^a-z0-9+#]+/)
    .filter((word) => word.length > 3);
  const match = demand.find((item) => {
    const skill = item.skill.toLowerCase();
    return subjectWords.some((word) => skill.includes(word));
  });
  return match ?? demand[fallbackIndex % demand.length];
}

function SubjectCard({
  subject,
  demand,
  branchId,
}: {
  subject: BranchSubject;
  demand: ReturnType<typeof skillDemand>[number] | undefined;
  branchId: BranchId;
}) {
  return (
    <article className="flex h-full flex-col rounded-sm border border-border bg-card p-5 transition-colors hover:border-primary/40">
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-bold tracking-tight">{subject.name}</h4>
        <span
          className={`shrink-0 rounded-sm border px-2 py-1 font-mono text-[9px] uppercase tracking-widest ${DIFFICULTY_TONE[subject.difficulty]}`}
        >
          {subject.difficulty}
        </span>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        {subject.description}
      </p>
      {demand && (
        <div className="mt-3 border-y border-border py-3">
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
              Company requirement
            </span>
            <span className="font-mono text-base font-bold text-primary">{demand.percent}%</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-primary" style={{ width: `${demand.percent}%` }} />
          </div>
          <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
            Related priority: {demand.skill}. {demand.why}
          </p>
        </div>
      )}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {subject.topics.map((topic) => (
          <span
            key={topic}
            className="rounded-sm bg-secondary px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-muted-foreground"
          >
            {topic}
          </span>
        ))}
      </div>
      <div className="mt-4 pt-1">
        {subject.courseSlug ? (
          <Link
            to="/courses/$course"
            params={{ course: subject.courseSlug }}
            className="inline-block rounded-sm bg-primary px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90"
          >
            View course ↗
          </Link>
        ) : (
          <Link
            to="/courses"
            className="inline-block rounded-sm bg-primary px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90"
          >
            View course ↗
          </Link>
        )}
      </div>
    </article>
  );
}
