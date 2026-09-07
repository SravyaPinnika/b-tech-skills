import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, ProgressBar } from "@/components/AppShell";
import { COURSES } from "@/data/curriculum";
import { topicPercent, useCurriculumProgress } from "@/lib/curriculum-progress";
import { Badge } from "./courses.index";

export const Route = createFileRoute("/_authenticated/interview-prep")({
  head: () => ({
    meta: [
      { title: "Interview Preparation — Every Critical Topic in One Place | B.Tech Skills" },
      {
        name: "description",
        content:
          "All interview-important topics across DSA, SQL, OOP, OS, Networks, projects and HR rounds, with progress tracking so you know what is left.",
      },
      { property: "og:title", content: "Interview Preparation Hub for B.Tech Students" },
      {
        property: "og:description",
        content:
          "The interview-critical topics from every course, grouped by subject with live completion tracking.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InterviewPrepPage,
});

function InterviewPrepPage() {
  const { state, hydrated } = useCurriculumProgress();

  const groups = COURSES.map((course) => ({
    course,
    topics: course.topics.filter((t) => t.interviewImportant),
  })).filter((g) => g.topics.length > 0);

  const all = groups.flatMap((g) => g.topics.map((t) => ({ c: g.course, t })));
  const total = all.reduce((a, x) => a + x.t.subtopics.length, 0);
  const done = all.reduce(
    (a, x) =>
      a +
      x.t.subtopics.filter((_, i) => state.done.includes(`${x.c.slug}/${x.t.slug}/${i}`)).length,
    0,
  );
  const pct = hydrated && total ? Math.round((done / total) * 100) : 0;

  return (
    <AppShell>
      <main className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:py-10">
        <header className="border-b border-border pb-5">
          <span className="font-mono text-[10px] uppercase tracking-widest text-primary">
            Everything panels actually ask
          </span>
          <h1 className="mt-2 text-3xl font-black tracking-tighter sm:text-4xl">
            Interview preparation
          </h1>
          <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-muted-foreground">
            These are the interview-critical topics pulled from every course. Finish these before a
            drive and you can walk into technical, coding and HR rounds without guessing.
          </p>
          <div className="mt-5 max-w-md">
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Interview readiness
              </span>
              <span className="font-mono text-xs font-bold text-primary">{pct}%</span>
            </div>
            <ProgressBar value={pct} className="mt-2" />
            <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {done}/{total} concepts done
            </p>
          </div>
        </header>

        {groups.map(({ course, topics }) => (
          <section key={course.slug}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-mono text-xs uppercase tracking-widest text-primary">
                {course.title}
              </h2>
              <Link
                to="/courses/$course"
                params={{ course: course.slug }}
                className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary"
              >
                Open course ↗
              </Link>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {topics.map((t) => {
                const tp = hydrated
                  ? topicPercent(state, course.slug, t.slug, t.subtopics.length)
                  : 0;
                return (
                  <Link
                    key={t.slug}
                    to="/courses/$course/$topic"
                    params={{ course: course.slug, topic: t.slug }}
                    className="group rounded-sm border border-border bg-card p-4 transition-colors hover:border-primary/40"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold tracking-tight group-hover:text-primary">
                        {t.title}
                      </h3>
                      {tp === 100 && <Badge tone="primary">Done</Badge>}
                    </div>
                    <ProgressBar value={tp} className="mt-3 h-1.5" />
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </main>
    </AppShell>
  );
}
