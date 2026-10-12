import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppShell, ProgressBar } from "@/components/AppShell";
import {
  COURSE_MAP,
  DIFFICULTIES,
  DIFFICULTY_LABEL,
  IMPORTANCE_LABEL,
} from "@/data/curriculum";
import {
  coursePercent,
  topicKeyOf,
  topicPercent,
  useCurriculumProgress,
} from "@/lib/curriculum-progress";
import { Badge } from "./courses.index";

export const Route = createFileRoute("/_authenticated/courses/$course/")({
  head: ({ params }) => {
    const course = COURSE_MAP[params.course];
    const name = course?.title ?? "Course";
    return {
      meta: [
        { title: `${name} — Full Syllabus & Progress | B.Tech Skills` },
        {
          name: "description",
          content: `Learn ${name} from beginner to interview level: topic-by-topic concepts, practice tasks, interview questions and completion tracking.`,
        },
        { property: "og:title", content: `${name} — Beginner to Interview Ready` },
        {
          property: "og:description",
          content: `Structured ${name} syllabus with difficulty levels, interview-important badges and per-topic progress.`,
        },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  loader: ({ params }) => {
    if (!COURSE_MAP[params.course]) throw notFound();
    return null;
  },
  component: CoursePage,
});

function CoursePage() {
  const { course: slug } = Route.useParams();
  const course = COURSE_MAP[slug]!;
  const { state, hydrated } = useCurriculumProgress();
  const pct = hydrated ? coursePercent(state, course) : 0;
  const totalMinutes = course.topics.reduce((a, t) => a + t.estMinutes, 0);

  return (
    <AppShell>
      <main className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:py-10">
        <nav className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <Link to="/courses" className="hover:text-primary">
            Courses
          </Link>{" "}
          / <span className="text-foreground">{course.title}</span>
        </nav>

        <header className="border-b border-border pb-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={course.importance === "critical" ? "primary" : "muted"}>
              {IMPORTANCE_LABEL[course.importance]}
            </Badge>
            <Badge>{course.kind}</Badge>
            <Badge>{Math.round(totalMinutes / 60)}h of study</Badge>
          </div>
          <h1 className="mt-3 text-3xl font-black tracking-tighter sm:text-4xl">{course.title}</h1>
          <div className="mt-4 max-w-md">
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Course completed
              </span>
              <span className="font-mono text-xs font-bold text-primary">{pct}%</span>
            </div>
            <ProgressBar value={pct} className="mt-2" />
          </div>
        </header>

        {DIFFICULTIES.map((level) => {
          const topics = course.topics.filter((t) => t.difficulty === level);
          if (topics.length === 0) return null;
          return (
            <section key={level}>
              <h2 className="font-mono text-xs uppercase tracking-widest text-primary">
                {DIFFICULTY_LABEL[level]}
              </h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {topics.map((topic) => {
                  const tp = hydrated
                    ? topicPercent(state, course.slug, topic.slug, topic.subtopics.length)
                    : 0;
                  const marked = state.bookmarks.includes(topicKeyOf(course.slug, topic.slug));
                  return (
                    <Link
                      key={topic.slug}
                      to="/courses/$course/$topic"
                      params={{ course: course.slug, topic: topic.slug }}
                      className="group rounded-sm border border-border bg-card p-4 transition-colors hover:border-primary/40"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-bold tracking-tight group-hover:text-primary">
                          {topic.title}
                        </h3>
                        {topic.interviewImportant && <Badge tone="primary">Interview</Badge>}
                      </div>
                      <p className="mt-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        {topic.subtopics.length} concepts · {topic.estMinutes} min
                        {marked ? " · saved" : ""}
                      </p>
                      {topic.prerequisite && (
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          Prerequisite: {topic.prerequisite}
                        </p>
                      )}
                      <ProgressBar value={tp} className="mt-3 h-1.5" />
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </main>
    </AppShell>
  );
}
