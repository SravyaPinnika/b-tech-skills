import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell, ProgressBar } from "@/components/AppShell";
import { findLearnBranch, subTopicKey, type SubjectDifficulty } from "@/data/branch-courses";
import { listProgress } from "@/lib/profile.functions";

export const Route = createFileRoute("/_authenticated/learn/$branch/")({
  head: ({ params }) => {
    const branch = findLearnBranch(params.branch);
    const name = branch?.short ?? "Branch";
    return {
      meta: [
        { title: `${name} subjects | B.Tech Skills` },
        {
          name: "description",
          content: `All ${name} subjects with sub-topics, difficulty, learning time and progress tracking for placements.`,
        },
        { property: "og:title", content: `${name} — subject-wise learning path` },
        {
          property: "og:description",
          content: `Open any ${name} subject and learn its sub-topics with lessons, practice, quizzes and interview questions.`,
        },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  loader: ({ params }) => {
    if (!findLearnBranch(params.branch)) throw notFound();
    return null;
  },
  component: BranchPage,
});

const DIFF_TONE: Record<SubjectDifficulty, string> = {
  Beginner: "border-primary/40 text-primary",
  Intermediate: "border-border text-foreground",
  Advanced: "border-destructive/40 text-destructive",
};

function BranchPage() {
  const { branch: branchId } = Route.useParams();
  const branch = findLearnBranch(branchId)!;
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<"all" | SubjectDifficulty>("all");

  const progress = useQuery({ queryKey: ["progress"], queryFn: () => listProgress() });
  const doneSet = useMemo(
    () =>
      new Set(
        (progress.data ?? [])
          .filter((p) => p.item_kind === "learn-subtopic" && p.done)
          .map((p) => p.item_id),
      ),
    [progress.data],
  );

  const courses = useMemo(() => {
    const q = query.trim().toLowerCase();
    return branch.courses.filter((c) => {
      if (level !== "all" && c.difficulty !== level) return false;
      if (!q) return true;
      return `${c.name} ${c.description} ${c.subtopics.map((s) => s.name).join(" ")}`
        .toLowerCase()
        .includes(q);
    });
  }, [branch, query, level]);

  return (
    <AppShell>
      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:py-10">
        <nav className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <Link to="/learn" className="hover:text-primary">
            Learn
          </Link>{" "}
          / <span className="text-foreground">{branch.label}</span>
        </nav>

        <header>
          <h1 className="text-3xl font-black tracking-tighter sm:text-4xl">{branch.short}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {branch.courses.length} main subjects. Pick one and work through its sub-topics.
          </p>
          <Link
            to="/learn"
            className="mt-4 inline-block rounded-sm border border-border px-4 py-2 font-mono text-[10px] uppercase tracking-widest hover:border-primary/50 hover:text-primary"
          >
            ← Back to branches
          </Link>
        </header>

        <div className="flex flex-wrap items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search subjects and sub-topics"
            className="min-w-[220px] flex-1 rounded-sm border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary/60"
          />
          {(["all", "Beginner", "Intermediate", "Advanced"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={`rounded-sm border px-3 py-2 font-mono text-[10px] uppercase tracking-widest ${
                level === l
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {l === "all" ? "All levels" : l}
            </button>
          ))}
        </div>

        {courses.length === 0 ? (
          <p className="rounded-sm border border-border bg-card p-6 text-sm text-muted-foreground">
            No subject matches this search or level.
          </p>
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => {
              const done = course.subtopics.filter((s) =>
                doneSet.has(subTopicKey(branch.id, course.slug, s.slug)),
              ).length;
              const pct = course.subtopics.length
                ? Math.round((done / course.subtopics.length) * 100)
                : 0;
              const minutes = course.subtopics.reduce((n, s) => n + s.minutes, 0);
              return (
                <Link
                  key={course.slug}
                  to="/learn/$branch/$course"
                  params={{ branch: branch.id, course: course.slug }}
                  className="group flex flex-col rounded-sm border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/50"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`rounded-sm border px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest ${DIFF_TONE[course.difficulty]}`}
                    >
                      {course.difficulty}
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                      {Math.round(minutes / 60)} h
                    </span>
                  </div>
                  <h2 className="mt-3 text-base font-bold leading-snug">{course.name}</h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {course.description}
                  </p>
                  <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {course.subtopics.length} sub-topics · {done} done
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <ProgressBar value={pct} />
                    <span className="font-mono text-xs font-bold text-primary">{pct}%</span>
                  </div>
                  <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground group-hover:text-primary">
                    Open subject →
                  </p>
                </Link>
              );
            })}
          </section>
        )}
      </main>
    </AppShell>
  );
}
