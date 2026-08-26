import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { lessonBySlug, lessonNeighbours, DSA_LESSONS } from "@/data/lessons";
import { useLessonProgress } from "@/lib/lesson-progress";
import type { Lesson, Problem } from "@/data/lessons/types";

export const Route = createFileRoute("/_authenticated/dsa/$topic")({
  loader: ({ params }) => {
    const lesson = lessonBySlug(params.topic);
    if (!lesson) throw notFound();
    return { lesson, nav: lessonNeighbours(params.topic) };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Topic not found" }, { name: "robots", content: "noindex" }] };
    }
    const { lesson } = loaderData;
    const title = `${lesson.title} — DSA Lesson in Java`;
    return {
      meta: [
        { title },
        { name: "description", content: lesson.blurb },
        { property: "og:title", content: title },
        { property: "og:description", content: lesson.blurb },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: LessonPage,
  notFoundComponent: LessonNotFound,
});

function LessonNotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold tracking-tight">Topic not found</h1>
      <Link
        to="/skills/$slug"
        params={{ slug: "data-structures-algorithms" }}
        className="mt-4 inline-block font-mono text-xs uppercase tracking-widest text-primary"
      >
        Back to DSA topics
      </Link>
    </div>
  );
}

function SectionTitle({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="font-mono text-xs text-primary">{String(n).padStart(2, "0")}</span>
      <h2 className="text-xl font-extrabold tracking-tighter sm:text-2xl">{children}</h2>
    </div>
  );
}

function Code({ code }: { code: string }) {
  return (
    <pre className="overflow-x-auto rounded border border-border bg-surface-strong/60 p-3 font-mono text-[11px] leading-relaxed sm:text-xs">
      <code>{code}</code>
    </pre>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border border-border bg-surface/60 p-4 ${className}`}>{children}</div>
  );
}

function ProblemBlock({
  p,
  done,
  onToggle,
}: {
  p: Problem;
  done: boolean;
  onToggle: () => void;
}) {
  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-primary">
            {p.level}
          </span>
          <h3 className="text-base font-bold tracking-tight">{p.title}</h3>
        </div>
        <button
          onClick={onToggle}
          className={`shrink-0 rounded border px-2 py-1 font-mono text-[10px] uppercase tracking-widest transition-colors ${
            done
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border text-muted-foreground hover:border-primary hover:text-primary"
          }`}
        >
          {done ? "Solved ✓" : "Mark solved"}
        </button>
      </div>

      <p className="mt-3 text-sm leading-relaxed">{p.statement}</p>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Input
          </p>
          <Code code={p.input} />
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Output
          </p>
          <Code code={p.output} />
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed">
        <span className="font-semibold">Approach: </span>
        {p.approach}
      </p>
      <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
        {p.steps.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
      <div className="mt-3">
        <Code code={p.code} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-widest">
        <span className="rounded border border-border px-2 py-1">Time {p.time}</span>
        <span className="rounded border border-border px-2 py-1">Space {p.space}</span>
      </div>
    </Card>
  );
}

function LessonPage() {
  const { lesson, nav } = Route.useLoaderData();
  const { state, toggleTopic, toggleConcept, toggleProblem } = useLessonProgress();

  const topicDone = state.topics.includes(lesson.slug);
  const conceptsDone = lesson.coreConcepts.filter((_, i) =>
    state.concepts.includes(`${lesson.slug}::${i}`),
  ).length;
  const problemsDone = lesson.problems.filter((p) =>
    state.problems.includes(`${lesson.slug}::${p.id}`),
  ).length;
  const totalUnits = lesson.coreConcepts.length + lesson.problems.length;
  const pct = totalUnits ? Math.round(((conceptsDone + problemsDone) / totalUnits) * 100) : 0;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2 px-4 py-3">
          <Link
            to="/skills/$slug"
            params={{ slug: "data-structures-algorithms" }}
            className="font-mono text-xs uppercase tracking-tighter text-muted-foreground hover:text-foreground"
          >
            ← DSA topics
          </Link>
          <span className="font-mono text-[10px] uppercase tracking-widest text-primary">
            Topic {nav.index + 1} / {nav.total}
          </span>
        </div>
        <div className="h-1 w-full bg-surface-strong">
          <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-12 px-4 py-8">
        {/* Title + progress */}
        <section className="rise space-y-4">
          <h1 className="text-3xl font-extrabold tracking-tighter text-balance sm:text-4xl">
            {lesson.title}
          </h1>
          <p className="text-sm text-muted-foreground">{lesson.blurb}</p>
          <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-widest">
            <span className="rounded border border-border px-2 py-1">
              Concepts {conceptsDone}/{lesson.coreConcepts.length}
            </span>
            <span className="rounded border border-border px-2 py-1">
              Problems {problemsDone}/{lesson.problems.length}
            </span>
            <span className="rounded border border-border px-2 py-1">{pct}% done</span>
            <button
              onClick={() => toggleTopic(lesson.slug)}
              className={`rounded border px-3 py-1 uppercase tracking-widest transition-colors ${
                topicDone
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-primary hover:text-primary"
              }`}
            >
              {topicDone ? "Topic completed ✓" : "Mark as completed"}
            </button>
          </div>
        </section>

        {/* 1. Overview */}
        <section className="space-y-4">
          <SectionTitle n={1}>Overview</SectionTitle>
          {lesson.overview.simple.map((p) => (
            <p key={p} className="text-sm leading-relaxed">
              {p}
            </p>
          ))}
          <Card>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Why you must learn it
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {lesson.overview.whyLearn.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </Card>
          <Card>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Real-world uses
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {lesson.overview.realWorld.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </Card>
        </section>

        {/* 2. Core concepts */}
        <section className="space-y-4">
          <SectionTitle n={2}>Core Concepts</SectionTitle>
          {lesson.coreConcepts.map((c, i) => {
            const id = `${lesson.slug}::${i}`;
            const done = state.concepts.includes(id);
            return (
              <Card key={c.heading}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h3 className="text-base font-bold tracking-tight">
                    <span className="mr-2 font-mono text-xs text-primary">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {c.heading}
                  </h3>
                  <button
                    onClick={() => toggleConcept(id)}
                    className={`shrink-0 rounded border px-2 py-1 font-mono text-[10px] uppercase tracking-widest transition-colors ${
                      done
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                    }`}
                  >
                    {done ? "Learned ✓" : "Mark learned"}
                  </button>
                </div>
                {c.body.map((p) => (
                  <p key={p} className="mt-2 text-sm leading-relaxed">
                    {p}
                  </p>
                ))}
                {c.diagram && (
                  <pre className="mt-3 overflow-x-auto rounded border border-border bg-surface-strong/60 p-3 font-mono text-[11px] leading-relaxed">
                    <code>{c.diagram}</code>
                  </pre>
                )}
                {c.code && (
                  <div className="mt-3 space-y-2">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {c.code.title}
                    </p>
                    <Code code={c.code.code} />
                    <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                      {c.code.explain.map((e) => (
                        <li key={e}>{e}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            );
          })}
        </section>

        {/* 3. Java syntax */}
        <section className="space-y-4">
          <SectionTitle n={3}>Syntax / Implementation in Java</SectionTitle>
          {lesson.javaSyntax.map((b) => (
            <Card key={b.title}>
              <h3 className="text-base font-bold tracking-tight">{b.title}</h3>
              <div className="mt-3">
                <Code code={b.code} />
              </div>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                {b.explain.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </Card>
          ))}
        </section>

        {/* 4. Patterns */}
        <section className="space-y-4">
          <SectionTitle n={4}>Important Patterns &amp; Techniques</SectionTitle>
          {lesson.patterns.map((p) => (
            <Card key={p.name}>
              <h3 className="text-base font-bold tracking-tight">{p.name}</h3>
              <dl className="mt-3 space-y-2 text-sm">
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    What it is
                  </dt>
                  <dd>{p.what}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    When to use
                  </dt>
                  <dd>{p.when}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    How to spot it
                  </dt>
                  <dd>{p.identify}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Example
                  </dt>
                  <dd>{p.example}</dd>
                </div>
              </dl>
              <div className="mt-3">
                <Code code={p.code} />
              </div>
            </Card>
          ))}
        </section>

        {/* 5. Examples */}
        <section className="space-y-4">
          <SectionTitle n={5}>Worked Examples</SectionTitle>
          {lesson.examples.map((e) => (
            <Card key={e.title}>
              <h3 className="text-base font-bold tracking-tight">{e.title}</h3>
              <p className="mt-2 font-mono text-xs text-muted-foreground">Input: {e.input}</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
                {e.steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
              <p className="mt-2 font-mono text-xs text-primary">Output: {e.output}</p>
            </Card>
          ))}
        </section>

        {/* 6. Problems */}
        <section className="space-y-4">
          <SectionTitle n={6}>Important Problems</SectionTitle>
          {(["Beginner", "Intermediate", "Interview"] as const).map((level) => {
            const items = lesson.problems.filter((p) => p.level === level);
            if (!items.length) return null;
            return (
              <div key={level} className="space-y-3">
                <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  {level} level
                </h3>
                {items.map((p) => (
                  <ProblemBlock
                    key={p.id}
                    p={p}
                    done={state.problems.includes(`${lesson.slug}::${p.id}`)}
                    onToggle={() => toggleProblem(`${lesson.slug}::${p.id}`)}
                  />
                ))}
              </div>
            );
          })}
        </section>

        {/* 7. Mistakes */}
        <section className="space-y-4">
          <SectionTitle n={7}>Common Mistakes</SectionTitle>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-strong/60 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Mistake</th>
                  <th className="px-3 py-2">How to avoid it</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {lesson.mistakes.map((m) => (
                  <tr key={m.mistake}>
                    <td className="px-3 py-2 align-top">{m.mistake}</td>
                    <td className="px-3 py-2 align-top text-muted-foreground">{m.fix}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 8. Interview questions */}
        <section className="space-y-4">
          <SectionTitle n={8}>Interview Questions</SectionTitle>
          <div className="divide-y divide-border rounded-lg border border-border">
            {lesson.interviewQuestions.map((qa) => (
              <div key={qa.q} className="p-4">
                <p className="text-sm font-semibold">{qa.q}</p>
                <p className="mt-1 text-sm text-muted-foreground">{qa.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 9. Practice */}
        <section className="space-y-4">
          <SectionTitle n={9}>Practice Checklist</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-3">
            {(
              [
                ["Easy", lesson.practice.easy],
                ["Medium", lesson.practice.medium],
                ["Hard", lesson.practice.hard],
              ] as const
            ).map(([label, items]) => (
              <Card key={label}>
                <p className="font-mono text-[10px] uppercase tracking-widest text-primary">
                  {label}
                </p>
                <ul className="mt-2 space-y-1 text-sm">
                  {items.map((it) => (
                    <li key={it} className="flex gap-2">
                      <span className="text-muted-foreground">□</span>
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </section>

        {/* 10. Complexity */}
        <section className="space-y-4">
          <SectionTitle n={10}>Complexity</SectionTitle>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-strong/60 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Operation / Algorithm</th>
                  <th className="px-3 py-2">Time</th>
                  <th className="px-3 py-2">Space</th>
                  <th className="px-3 py-2">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {lesson.complexity.map((r) => (
                  <tr key={r.operation}>
                    <td className="px-3 py-2 align-top">{r.operation}</td>
                    <td className="px-3 py-2 align-top font-mono text-xs">{r.time}</td>
                    <td className="px-3 py-2 align-top font-mono text-xs">{r.space}</td>
                    <td className="px-3 py-2 align-top text-muted-foreground">{r.note ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 11. Quick revision */}
        <section className="space-y-4">
          <SectionTitle n={11}>Quick Revision</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                ["Concepts", lesson.revision.concepts],
                ["Rules & formulas", lesson.revision.rules],
                ["Patterns", lesson.revision.patterns],
                ["Java syntax", lesson.revision.syntax],
                ["Problems to remember", lesson.revision.problems],
              ] as const
            ).map(([label, items]) => (
              <Card key={label}>
                <p className="font-mono text-[10px] uppercase tracking-widest text-primary">
                  {label}
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                  {items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </section>

        {/* Prev / next */}
        <nav className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:justify-between">
          {nav.prev ? (
            <Link
              to="/dsa/$topic"
              params={{ topic: nav.prev.slug }}
              className="rounded border border-border px-4 py-3 text-sm hover:border-primary"
            >
              <span className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                ← Previous topic
              </span>
              {nav.prev.title}
            </Link>
          ) : (
            <span />
          )}
          {nav.next && (
            <Link
              to="/dsa/$topic"
              params={{ topic: nav.next.slug }}
              className="rounded border border-border px-4 py-3 text-sm hover:border-primary sm:text-right"
            >
              <span className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Next topic →
              </span>
              {nav.next.title}
            </Link>
          )}
        </nav>

        <section className="space-y-2">
          <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            All DSA lessons
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {DSA_LESSONS.map((l: Lesson) => (
              <Link
                key={l.slug}
                to="/dsa/$topic"
                params={{ topic: l.slug }}
                className={`rounded border px-3 py-2 text-sm hover:border-primary ${
                  l.slug === lesson.slug ? "border-primary" : "border-border"
                }`}
              >
                {state.topics.includes(l.slug) ? "✓ " : ""}
                {l.title}
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
