import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell, ProgressBar } from "@/components/AppShell";
import { findLearnBranch, findLearnCourse, subTopicKey } from "@/data/branch-courses";
import { listProgress } from "@/lib/profile.functions";

export const Route = createFileRoute("/_authenticated/learn/$branch/$course/")({
  head: ({ params }) => {
    const course = findLearnCourse(params.branch, params.course);
    const name = course?.name ?? "Subject";
    return {
      meta: [
        { title: `${name} sub-topics | B.Tech Skills` },
        {
          name: "description",
          content: `Learn ${name} sub-topic by sub-topic: explanation, worked example, practice questions, quiz and interview questions.`,
        },
        { property: "og:title", content: `${name} — sub-topic learning plan` },
        {
          property: "og:description",
          content: `Every ${name} sub-topic with difficulty, time needed and saved progress.`,
        },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  loader: ({ params }) => {
    if (!findLearnCourse(params.branch, params.course)) throw notFound();
    return null;
  },
  component: CoursePage,
});

function CoursePage() {
  const { branch: branchId, course: courseSlug } = Route.useParams();
  const branch = findLearnBranch(branchId)!;
  const course = findLearnCourse(branchId, courseSlug)!;

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

  const done = course.subtopics.filter((s) =>
    doneSet.has(subTopicKey(branch.id, course.slug, s.slug)),
  ).length;
  const pct = course.subtopics.length ? Math.round((done / course.subtopics.length) * 100) : 0;

  return (
    <AppShell>
      <main className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:py-10">
        <nav className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <Link to="/learn" className="hover:text-primary">
            Learn
          </Link>{" "}
          /{" "}
          <Link to="/learn/$branch" params={{ branch: branch.id }} className="hover:text-primary">
            {branch.label}
          </Link>{" "}
          / <span className="text-foreground">{course.name}</span>
        </nav>

        <header className="border-b border-border pb-5">
          <h1 className="text-3xl font-black tracking-tighter sm:text-4xl">{course.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{course.description}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="min-w-[200px] flex-1">
              <ProgressBar value={pct} />
            </div>
            <span className="font-mono text-xs font-bold text-primary">
              {done}/{course.subtopics.length} done · {pct}%
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to="/learn/$branch"
              params={{ branch: branch.id }}
              className="rounded-sm border border-border px-4 py-2 font-mono text-[10px] uppercase tracking-widest hover:border-primary/50 hover:text-primary"
            >
              ← Back to subjects
            </Link>
            {course.courseSlug && (
              <Link
                to="/courses/$course"
                params={{ course: course.courseSlug }}
                className="rounded-sm border border-border px-4 py-2 font-mono text-[10px] uppercase tracking-widest hover:border-primary/50 hover:text-primary"
              >
                Related course material ↗
              </Link>
            )}
          </div>
        </header>

        <section className="space-y-3">
          {course.subtopics.map((sub, i) => {
            const isDone = doneSet.has(subTopicKey(branch.id, course.slug, sub.slug));
            return (
              <div
                key={sub.slug}
                className="rounded-sm border border-border bg-card p-5 transition-colors hover:border-primary/40"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Topic {i + 1}
                  </span>
                  <span className="rounded-sm border border-border px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest">
                    {sub.difficulty}
                  </span>
                  <span className="rounded-sm border border-border px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest">
                    {sub.minutes} min
                  </span>
                  {isDone && (
                    <span className="rounded-sm border border-primary/40 bg-primary/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-primary">
                      Completed ✓
                    </span>
                  )}
                </div>
                <h2 className="mt-3 text-lg font-bold">{sub.name}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {sub.description}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {sub.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-sm bg-secondary px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-muted-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <Link
                  to="/learn/$branch/$course/$sub"
                  params={{ branch: branch.id, course: course.slug, sub: sub.slug }}
                  className="mt-4 inline-block rounded-sm bg-primary px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-primary-foreground hover:bg-primary/90"
                >
                  {isDone ? "Revise topic →" : "Start learning →"}
                </Link>
              </div>
            );
          })}
        </section>
      </main>
    </AppShell>
  );
}
