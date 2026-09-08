import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppShell, ProgressBar } from "@/components/AppShell";
import { COURSE_MAP, DIFFICULTY_LABEL } from "@/data/curriculum";
import {
  subKey,
  topicKeyOf,
  topicPercent,
  useCurriculumProgress,
} from "@/lib/curriculum-progress";
import { topicGuide } from "@/lib/topic-template";
import { codingTestKind } from "@/lib/learning.functions";
import { ConceptPanel } from "@/components/ConceptPanel";
import { Badge } from "./courses.index";

export const Route = createFileRoute("/_authenticated/courses/$course/$topic")({
  head: ({ params }) => {
    const course = COURSE_MAP[params.course];
    const topic = course?.topics.find((t) => t.slug === params.topic);
    const name = topic?.title ?? "Topic";
    return {
      meta: [
        { title: `${name} — ${course?.title ?? "Course"} | B.Tech Skills` },
        {
          name: "description",
          content: `Learn ${name}: concepts checklist, deep explanation, common mistakes, practice questions and interview questions with progress tracking.`,
        },
        { property: "og:title", content: `${name} — learn, practise, get interview ready` },
        {
          property: "og:description",
          content: `Full study page for ${name} with concept checklist, mistakes to avoid, practice tasks, interview questions and notes.`,
        },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  loader: ({ params }) => {
    const course = COURSE_MAP[params.course];
    if (!course || !course.topics.some((t) => t.slug === params.topic)) throw notFound();
    return null;
  },
  component: TopicPage,
});

function TopicPage() {
  const { course: courseSlug, topic: topicSlug } = Route.useParams();
  const course = COURSE_MAP[courseSlug]!;
  const index = course.topics.findIndex((t) => t.slug === topicSlug);
  const topic = course.topics[index]!;
  const prev = course.topics[index - 1];
  const next = course.topics[index + 1];
  const guide = topicGuide(course, topic);

  const { state, hydrated, toggleSub, setTopicDone, toggleBookmark, setNote } =
    useCurriculumProgress();
  const key = topicKeyOf(course.slug, topic.slug);
  const pct = hydrated ? topicPercent(state, course.slug, topic.slug, topic.subtopics.length) : 0;
  const complete = pct === 100;
  const bookmarked = state.bookmarks.includes(key);

  return (
    <AppShell>
      <main className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:py-10">
        <nav className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <Link to="/courses" className="hover:text-primary">
            Courses
          </Link>{" "}
          /{" "}
          <Link
            to="/courses/$course"
            params={{ course: course.slug }}
            className="hover:text-primary"
          >
            {course.title}
          </Link>{" "}
          / <span className="text-foreground">{topic.title}</span>
        </nav>

        <header className="border-b border-border pb-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{DIFFICULTY_LABEL[topic.difficulty]}</Badge>
            {topic.interviewImportant && <Badge tone="primary">Interview important</Badge>}
            <Badge>{topic.estMinutes} min</Badge>
          </div>
          <h1 className="mt-3 text-3xl font-black tracking-tighter sm:text-4xl">{topic.title}</h1>
          {topic.prerequisite && (
            <p className="mt-2 text-sm text-muted-foreground">
              Prerequisite: <span className="text-foreground">{topic.prerequisite}</span>
            </p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="min-w-[200px] flex-1">
              <ProgressBar value={pct} />
            </div>
            <span className="font-mono text-xs font-bold text-primary">{pct}%</span>
            <button
              onClick={() => setTopicDone(course.slug, topic.slug, topic.subtopics.length, !complete)}
              className={`rounded-sm px-4 py-2 font-mono text-[10px] uppercase tracking-widest ${
                complete
                  ? "border border-primary/40 bg-primary/10 text-primary"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
            >
              {complete ? "Completed ✓" : "Mark as complete"}
            </button>
            <button
              onClick={() => toggleBookmark(key)}
              className="rounded-sm border border-border px-4 py-2 font-mono text-[10px] uppercase tracking-widest hover:border-primary/50 hover:text-primary"
            >
              {bookmarked ? "Bookmarked ★" : "Bookmark ☆"}
            </button>
          </div>
        </header>

        <Section title="Overview">
          <p className="text-sm leading-relaxed text-muted-foreground">{guide.overview}</p>
        </Section>

        <Section title="How to start (beginner)">
          <p className="text-sm leading-relaxed text-muted-foreground">{guide.beginner}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{guide.deep}</p>
        </Section>

        <Section title={`Concepts to cover (${topic.subtopics.length})`}>
          <p className="mb-3 text-xs text-muted-foreground">
            Tap <span className="font-mono text-primary">Learn</span> on any concept for a full
            lesson, then tick it when you can explain it yourself.
          </p>
          <ul className="space-y-1.5">
            {topic.subtopics.map((sub, i) => {
              const k = subKey(course.slug, topic.slug, i);
              return (
                <ConceptPanel
                  key={k}
                  course={course.slug}
                  topic={topic.slug}
                  index={i}
                  title={sub}
                  done={state.done.includes(k)}
                  onToggle={() => toggleSub(k)}
                />
              );
            })}
          </ul>
        </Section>

        <Section title="Test yourself">
          <div className="flex flex-wrap items-center gap-3 rounded-sm border border-border bg-card p-4">
            <p className="flex-1 text-sm text-muted-foreground">
              A 10-question exam on this topic
              {codingTestKind(course) ? " plus a timed coding / query round" : ""}. Your scores are saved
              to your account.
            </p>
            <Link
              to="/courses/$course/$topic/exam"
              params={{ course: course.slug, topic: topic.slug }}
              className="rounded-sm bg-primary px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-primary-foreground hover:bg-primary/90"
            >
              Start exam →
            </Link>
          </div>
        </Section>

        <Section title="Real-world use">
          <p className="text-sm leading-relaxed text-muted-foreground">{guide.realWorld}</p>
        </Section>

        <Section title="Common mistakes">
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
            {guide.mistakes.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </Section>

        <Section title="Practice questions">
          <ol className="list-decimal space-y-1.5 pl-5 text-sm text-muted-foreground">
            {guide.practice.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ol>
        </Section>

        <Section title="Interview questions">
          <ol className="list-decimal space-y-1.5 pl-5 text-sm text-muted-foreground">
            {guide.interviewQs.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ol>
        </Section>

        <Section title="Challenges">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Mini: </span>
            {guide.miniChallenge}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Advanced: </span>
            {guide.advancedChallenge}
          </p>
        </Section>

        <Section title="My notes">
          <textarea
            value={state.notes[key] ?? ""}
            onChange={(e) => setNote(key, e.target.value)}
            rows={5}
            placeholder="Write your own summary, doubts and formulas here — saved on this device."
            className="w-full rounded-sm border border-border bg-background p-3 text-sm outline-none focus:border-primary/60"
          />
        </Section>

        <nav className="flex flex-wrap justify-between gap-3 border-t border-border pt-5">
          {prev ? (
            <Link
              to="/courses/$course/$topic"
              params={{ course: course.slug, topic: prev.slug }}
              className="rounded-sm border border-border px-4 py-2 font-mono text-[10px] uppercase tracking-widest hover:border-primary/50 hover:text-primary"
            >
              ← {prev.title}
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              to="/courses/$course/$topic"
              params={{ course: course.slug, topic: next.slug }}
              className="rounded-sm border border-border px-4 py-2 font-mono text-[10px] uppercase tracking-widest hover:border-primary/50 hover:text-primary"
            >
              {next.title} →
            </Link>
          )}
        </nav>
      </main>
    </AppShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-mono text-xs uppercase tracking-widest text-primary">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}
