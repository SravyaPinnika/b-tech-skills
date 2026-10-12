import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell, ProgressBar } from "@/components/AppShell";
import {
  LEARN_BRANCHES,
  branchTopicCount,
  searchLearn,
  subTopicKey,
} from "@/data/branch-courses";
import { listProgress } from "@/lib/profile.functions";

export const Route = createFileRoute("/_authenticated/learn/")({
  head: () => ({
    meta: [
      { title: "Learning paths by branch | B.Tech Skills" },
      {
        name: "description",
        content:
          "Pick your B.Tech branch, open a subject and learn every sub-topic with explanations, practice, quizzes, interview questions and progress tracking.",
      },
      { property: "og:title", content: "Branch-wise learning paths for B.Tech students" },
      {
        property: "og:description",
        content:
          "13 branches, subject-wise courses and sub-topic learning pages with practice, quizzes and interview preparation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LearnHome,
});

function LearnHome() {
  const [query, setQuery] = useState("");
  const hits = useMemo(() => searchLearn(query), [query]);

  const progress = useQuery({
    queryKey: ["progress"],
    queryFn: () => listProgress(),
  });

  const doneSet = useMemo(
    () =>
      new Set(
        (progress.data ?? [])
          .filter((p) => p.item_kind === "learn-subtopic" && p.done)
          .map((p) => p.item_id),
      ),
    [progress.data],
  );

  return (
    <AppShell>
      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:py-10">
        <header>
          <p className="font-mono text-[10px] uppercase tracking-widest text-primary">
            Learning path
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tighter sm:text-4xl">
            Choose your branch
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Branch → subject → sub-topic. Every sub-topic has a full lesson, practice questions, a
            quiz and interview questions, and your progress is saved to your account.
          </p>
        </header>

        <div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search any subject or sub-topic (e.g. pointers, normalisation, qubits)"
            className="w-full rounded-sm border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary/60"
          />
          {query.trim() !== "" && (
            <div className="mt-3 space-y-1.5">
              {hits.length === 0 ? (
                <p className="text-sm text-muted-foreground">No sub-topic matches “{query}”.</p>
              ) : (
                hits.map((h) => (
                  <Link
                    key={`${h.branch.id}-${h.course.slug}-${h.sub.slug}`}
                    to="/learn/$branch/$course/$sub"
                    params={{ branch: h.branch.id, course: h.course.slug, sub: h.sub.slug }}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-sm border border-border bg-card px-3 py-2 text-sm transition-colors hover:border-primary/50"
                  >
                    <span className="font-semibold">{h.sub.name}</span>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {h.branch.label} · {h.course.name}
                    </span>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LEARN_BRANCHES.map((branch) => {
            const total = branchTopicCount(branch);
            const done = branch.courses.reduce(
              (n, c) =>
                n +
                c.subtopics.filter((s) => doneSet.has(subTopicKey(branch.id, c.slug, s.slug)))
                  .length,
              0,
            );
            const pct = total ? Math.round((done / total) * 100) : 0;
            return (
              <Link
                key={branch.id}
                to="/learn/$branch"
                params={{ branch: branch.id }}
                className="group rounded-sm border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/50"
              >
                <p className="font-mono text-[10px] uppercase tracking-widest text-primary">
                  {branch.label}
                </p>
                <h2 className="mt-1 text-lg font-bold leading-snug">{branch.short}</h2>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {branch.courses.length} subjects · {total} sub-topics
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <ProgressBar value={pct} />
                  <span className="font-mono text-xs font-bold text-primary">{pct}%</span>
                </div>
                <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground group-hover:text-primary">
                  Open branch →
                </p>
              </Link>
            );
          })}
        </section>
      </main>
    </AppShell>
  );
}
