import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell, ProgressBar } from "@/components/AppShell";
import {
  COURSES,
  DIFFICULTIES,
  DIFFICULTY_LABEL,
  IMPORTANCE_LABEL,
  type Difficulty,
} from "@/data/curriculum";
import {
  coursePercent,
  overallCurriculumPercent,
  topicPercent,
  useCurriculumProgress,
} from "@/lib/curriculum-progress";
import { BRANCHES } from "@/data/branches";
import { coursesForBranchId, type BranchSelection } from "@/data/branch-catalog";

export const Route = createFileRoute("/_authenticated/courses/")({
  head: () => ({
    meta: [
      { title: "All Courses — DSA, SQL, OS, Networks, Web & More | B.Tech Skills" },
      {
        name: "description",
        content:
          "Browse 15 structured B.Tech courses from beginner to interview level, with topic checklists, difficulty badges, search and completion tracking.",
      },
      { property: "og:title", content: "All B.Tech Courses — Beginner to Interview Ready" },
      {
        property: "og:description",
        content:
          "Search and filter every course by difficulty, interview importance and completion, then track each topic as you learn it.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CoursesPage,
});

type Completion = "all" | "completed" | "not-completed";

function CoursesPage() {
  const { state, hydrated } = useCurriculumProgress();
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  const [interviewOnly, setInterviewOnly] = useState(false);
  const [completion, setCompletion] = useState<Completion>("all");

  const q = query.trim().toLowerCase();

  const results = useMemo(() => {
    return COURSES.map((course) => {
      const topics = course.topics.filter((topic) => {
        if (difficulty !== "all" && topic.difficulty !== difficulty) return false;
        if (interviewOnly && !topic.interviewImportant) return false;
        const pct = topicPercent(state, course.slug, topic.slug, topic.subtopics.length);
        if (completion === "completed" && pct !== 100) return false;
        if (completion === "not-completed" && pct === 100) return false;
        if (!q) return true;
        return (
          topic.title.toLowerCase().includes(q) ||
          course.title.toLowerCase().includes(q) ||
          topic.subtopics.some((s) => s.toLowerCase().includes(q))
        );
      });
      return { course, topics };
    }).filter((r) => r.topics.length > 0);
  }, [q, difficulty, interviewOnly, completion, state]);

  const overall = hydrated ? overallCurriculumPercent(state) : 0;
  const matchedTopics = results.reduce((a, r) => a + r.topics.length, 0);

  return (
    <AppShell>
      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:py-10">
        <header className="border-b border-border pb-5">
          <span className="font-mono text-[10px] uppercase tracking-widest text-primary">
            Complete B.Tech curriculum
          </span>
          <h1 className="mt-2 text-3xl font-black tracking-tighter sm:text-4xl">All courses</h1>
          <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-muted-foreground">
            {COURSES.length} courses, organised beginner → intermediate → advanced → interview prep.
            Every topic has a concept checklist, practice tasks, interview questions and notes.
          </p>
          <div className="mt-5 max-w-md">
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Curriculum completed
              </span>
              <span className="font-mono text-xs font-bold text-primary">{overall}%</span>
            </div>
            <ProgressBar value={overall} className="mt-2" />
          </div>
        </header>

        <section className="space-y-3 rounded-sm border border-border bg-card p-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses, topics or concepts (e.g. joins, dijkstra, deadlock)"
            className="w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary/60"
          />
          <div className="flex flex-wrap gap-1.5">
            <Chip active={difficulty === "all"} onClick={() => setDifficulty("all")}>
              All levels
            </Chip>
            {DIFFICULTIES.map((d) => (
              <Chip key={d} active={difficulty === d} onClick={() => setDifficulty(d)}>
                {DIFFICULTY_LABEL[d]}
              </Chip>
            ))}
            <Chip active={interviewOnly} onClick={() => setInterviewOnly((v) => !v)}>
              Interview important
            </Chip>
            <Chip
              active={completion === "not-completed"}
              onClick={() =>
                setCompletion((v) => (v === "not-completed" ? "all" : "not-completed"))
              }
            >
              Not completed
            </Chip>
            <Chip
              active={completion === "completed"}
              onClick={() => setCompletion((v) => (v === "completed" ? "all" : "completed"))}
            >
              Completed
            </Chip>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {matchedTopics} topics in {results.length} courses
          </p>
        </section>

        <section className="grid gap-3 md:grid-cols-2">
          {results.map(({ course, topics }) => {
            const pct = hydrated ? coursePercent(state, course) : 0;
            return (
              <article
                key={course.slug}
                className="flex flex-col rounded-sm border border-border bg-card p-5 transition-colors hover:border-primary/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      Course {course.num} · {course.kind}
                    </span>
                    <h2 className="mt-1 text-lg font-black tracking-tighter">{course.title}</h2>
                  </div>
                  <Badge tone={course.importance === "critical" ? "primary" : "muted"}>
                    {IMPORTANCE_LABEL[course.importance]}
                  </Badge>
                </div>

                <div className="mt-3 flex items-baseline justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {course.topics.length} topics
                  </span>
                  <span className="font-mono text-[11px] text-primary">{pct}%</span>
                </div>
                <ProgressBar value={pct} className="mt-1.5 h-1.5" />

                <ul className="mt-4 space-y-1.5">
                  {topics.slice(0, 5).map((t) => (
                    <li key={t.slug}>
                      <Link
                        to="/courses/$course/$topic"
                        params={{ course: course.slug, topic: t.slug }}
                        className="flex items-center justify-between gap-2 text-xs text-muted-foreground hover:text-primary"
                      >
                        <span className="truncate">{t.title}</span>
                        <span className="shrink-0 font-mono text-[9px] uppercase tracking-widest">
                          {DIFFICULTY_LABEL[t.difficulty]}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/courses/$course"
                  params={{ course: course.slug }}
                  className="mt-4 inline-block font-mono text-[10px] uppercase tracking-widest text-primary hover:underline"
                >
                  Open course ↗
                </Link>
              </article>
            );
          })}
        </section>

        {results.length === 0 && (
          <p className="rounded-sm border border-border bg-card p-6 text-sm text-muted-foreground">
            Nothing matches those filters yet. Clear the search or pick a different level.
          </p>
        )}
      </main>
    </AppShell>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-sm px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors ${
        active
          ? "bg-foreground text-background"
          : "bg-secondary text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

export function Badge({
  children,
  tone = "muted",
}: {
  children: React.ReactNode;
  tone?: "primary" | "muted";
}) {
  return (
    <span
      className={`shrink-0 rounded-sm border px-2 py-1 font-mono text-[9px] uppercase tracking-widest ${
        tone === "primary"
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-border text-muted-foreground"
      }`}
    >
      {children}
    </span>
  );
}
