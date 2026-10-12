import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import {
  findLearnBranch,
  findLearnCourse,
  findLearnSubTopic,
  subTopicKey,
} from "@/data/branch-courses";
import { getSubTopicLesson, getSubTopicQuiz, submitSubTopicQuiz } from "@/lib/learn.functions";
import { listProgress, setProgress } from "@/lib/profile.functions";

export const Route = createFileRoute("/_authenticated/learn/$branch/$course/$sub")({
  head: ({ params }) => {
    const sub = findLearnSubTopic(params.branch, params.course, params.sub);
    const course = findLearnCourse(params.branch, params.course);
    const name = sub?.name ?? "Topic";
    const title = `${name} — ${course?.name ?? "Learning"} | B.Tech Skills`;
    const description = `Learn ${name}: simple explanation, key concepts, worked example, practice questions, quiz, interview questions and a mini project.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  loader: ({ params }) => {
    if (!findLearnSubTopic(params.branch, params.course, params.sub)) throw notFound();
    return null;
  },
  component: SubTopicPage,
  errorComponent: () => (
    <AppShell>
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-black tracking-tighter">This topic could not be opened</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Please go back and try again in a moment.
        </p>
        <Link
          to="/learn"
          className="mt-6 inline-block rounded-sm border border-border px-4 py-2 font-mono text-[10px] uppercase tracking-widest hover:border-primary/50 hover:text-primary"
        >
          ← Back to learning
        </Link>
      </main>
    </AppShell>
  ),
  notFoundComponent: () => (
    <AppShell>
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-black tracking-tighter">Topic not found</h1>
        <Link
          to="/learn"
          className="mt-6 inline-block rounded-sm border border-border px-4 py-2 font-mono text-[10px] uppercase tracking-widest hover:border-primary/50 hover:text-primary"
        >
          ← Back to learning
        </Link>
      </main>
    </AppShell>
  ),
});

const TABS = ["Learn", "Practice", "Quiz", "Interview", "Project"] as const;
type Tab = (typeof TABS)[number];

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-sm border border-border bg-card p-5">
      <h2 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed">{children}</div>
    </section>
  );
}

function SubTopicPage() {
  const { branch: branchId, course: courseSlug, sub: subSlug } = Route.useParams();
  const branch = findLearnBranch(branchId)!;
  const course = findLearnCourse(branchId, courseSlug)!;
  const sub = findLearnSubTopic(branchId, courseSlug, subSlug)!;
  const index = course.subtopics.findIndex((s) => s.slug === sub.slug);
  const prev = index > 0 ? course.subtopics[index - 1] : undefined;
  const next = index < course.subtopics.length - 1 ? course.subtopics[index + 1] : undefined;

  const [tab, setTab] = useState<Tab>("Learn");
  const qc = useQueryClient();
  const key = subTopicKey(branch.id, course.slug, sub.slug);

  const lesson = useQuery({
    queryKey: ["learn-lesson", key],
    queryFn: () => getSubTopicLesson({ data: { branch: branch.id, course: course.slug, sub: sub.slug } }),
    staleTime: Infinity,
  });

  const progress = useQuery({ queryKey: ["progress"], queryFn: () => listProgress() });
  const rows = progress.data ?? [];
  const done = rows.some((p) => p.item_kind === "learn-subtopic" && p.item_id === key && p.done);
  const bookmarked = rows.some(
    (p) => p.item_kind === "learn-bookmark" && p.item_id === key && p.done,
  );

  const mark = useMutation({
    mutationFn: (v: { kind: string; done: boolean }) =>
      setProgress({ data: { item_kind: v.kind, item_id: key, done: v.done } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["progress"] }),
  });

  return (
    <AppShell>
      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:py-10">
        <nav className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <Link to="/learn" className="hover:text-primary">
            Learn
          </Link>{" "}
          /{" "}
          <Link to="/learn/$branch" params={{ branch: branch.id }} className="hover:text-primary">
            {branch.short}
          </Link>{" "}
          /{" "}
          <Link
            to="/learn/$branch/$course"
            params={{ branch: branch.id, course: course.slug }}
            className="hover:text-primary"
          >
            {course.name}
          </Link>{" "}
          / <span className="text-foreground">{sub.name}</span>
        </nav>

        <header className="border-b border-border pb-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-sm border border-border px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest">
              {sub.difficulty}
            </span>
            <span className="rounded-sm border border-border px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest">
              {sub.minutes} min
            </span>
            {sub.tags.map((t) => (
              <span
                key={t}
                className="rounded-sm bg-secondary px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
          <h1 className="mt-3 text-3xl font-black tracking-tighter sm:text-4xl">{sub.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{sub.description}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => mark.mutate({ kind: "learn-subtopic", done: !done })}
              disabled={mark.isPending}
              className={`rounded-sm px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors ${
                done
                  ? "border border-primary/40 bg-primary/10 text-primary"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
            >
              {done ? "Completed ✓ — undo" : "Mark as complete"}
            </button>
            <button
              type="button"
              onClick={() => mark.mutate({ kind: "learn-bookmark", done: !bookmarked })}
              disabled={mark.isPending}
              className="rounded-sm border border-border px-4 py-2 font-mono text-[10px] uppercase tracking-widest hover:border-primary/50 hover:text-primary"
            >
              {bookmarked ? "Bookmarked ★" : "Bookmark ☆"}
            </button>
          </div>
        </header>

        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-sm border px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors ${
                tab === t
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {lesson.isPending && (
          <div className="rounded-sm border border-border bg-card p-6 text-sm text-muted-foreground">
            Preparing this topic for you… this takes a few seconds the first time.
          </div>
        )}
        {lesson.isError && (
          <div className="rounded-sm border border-destructive/40 bg-destructive/5 p-6 text-sm">
            <p>We could not prepare this topic right now.</p>
            <button
              type="button"
              onClick={() => lesson.refetch()}
              className="mt-3 rounded-sm border border-border px-4 py-2 font-mono text-[10px] uppercase tracking-widest hover:border-primary/50 hover:text-primary"
            >
              Try again
            </button>
          </div>
        )}

        {lesson.data && tab === "Learn" && <LearnTab lesson={lesson.data} />}
        {lesson.data && tab === "Practice" && <PracticeTab lesson={lesson.data} />}
        {tab === "Quiz" && (
          <QuizTab branch={branch.id} course={course.slug} sub={sub.slug} subName={sub.name} />
        )}
        {lesson.data && tab === "Interview" && (
          <Card title="Likely interview questions">
            <ol className="space-y-4">
              {lesson.data.interview.map((it, i) => (
                <li key={i}>
                  <p className="font-semibold">
                    {i + 1}. {it.question}
                  </p>
                  <p className="mt-1 text-muted-foreground">{it.answer}</p>
                </li>
              ))}
            </ol>
          </Card>
        )}
        {lesson.data && tab === "Project" && (
          <Card title="Mini project">
            <p className="text-base font-bold">{lesson.data.project.title}</p>
            <p className="text-muted-foreground">{lesson.data.project.goal}</p>
            <ol className="list-decimal space-y-1.5 pl-5 text-muted-foreground">
              {lesson.data.project.steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </Card>
        )}

        <nav className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-5">
          {prev ? (
            <Link
              to="/learn/$branch/$course/$sub"
              params={{ branch: branch.id, course: course.slug, sub: prev.slug }}
              className="rounded-sm border border-border px-4 py-2 font-mono text-[10px] uppercase tracking-widest hover:border-primary/50 hover:text-primary"
            >
              ← {prev.name}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              to="/learn/$branch/$course/$sub"
              params={{ branch: branch.id, course: course.slug, sub: next.slug }}
              className="rounded-sm border border-border px-4 py-2 font-mono text-[10px] uppercase tracking-widest hover:border-primary/50 hover:text-primary"
            >
              {next.name} →
            </Link>
          ) : (
            <Link
              to="/learn/$branch/$course"
              params={{ branch: branch.id, course: course.slug }}
              className="rounded-sm border border-border px-4 py-2 font-mono text-[10px] uppercase tracking-widest hover:border-primary/50 hover:text-primary"
            >
              Back to all sub-topics →
            </Link>
          )}
        </nav>
      </main>
    </AppShell>
  );
}

type Lesson = Awaited<ReturnType<typeof getSubTopicLesson>>;

function LearnTab({ lesson }: { lesson: Lesson }) {
  return (
    <div className="space-y-4">
      <Card title="Simple explanation">
        <p>{lesson.summary}</p>
      </Card>
      {lesson.why.length > 0 && (
        <Card title="Why it matters">
          <ul className="list-disc space-y-1.5 pl-5 text-muted-foreground">
            {lesson.why.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </Card>
      )}
      {lesson.concepts.map((c, i) => (
        <Card key={i} title={`Key concept ${i + 1}`}>
          <p className="text-base font-bold">{c.heading}</p>
          <p className="text-muted-foreground">{c.body}</p>
        </Card>
      ))}
      {lesson.formulas.length > 0 && (
        <Card title="Important formulas & rules">
          <ul className="space-y-2">
            {lesson.formulas.map((f, i) => (
              <li key={i} className="rounded-sm bg-secondary px-3 py-2 font-mono text-xs">
                {f}
              </li>
            ))}
          </ul>
        </Card>
      )}
      {lesson.example.steps.length > 0 && (
        <Card title="Worked example">
          <p className="text-base font-bold">{lesson.example.title}</p>
          <ol className="list-decimal space-y-1.5 pl-5 text-muted-foreground">
            {lesson.example.steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
          {lesson.example.result && (
            <p className="rounded-sm border border-primary/30 bg-primary/5 px-3 py-2 font-mono text-xs text-primary">
              {lesson.example.result}
            </p>
          )}
        </Card>
      )}
      {lesson.diagram && (
        <Card title="Diagram">
          <pre className="overflow-x-auto rounded-sm bg-secondary p-4 font-mono text-[11px] leading-relaxed">
            {lesson.diagram}
          </pre>
        </Card>
      )}
      {lesson.realWorld.length > 0 && (
        <Card title="Real-world uses">
          <ul className="list-disc space-y-1.5 pl-5 text-muted-foreground">
            {lesson.realWorld.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </Card>
      )}
      {lesson.quickRevision.length > 0 && (
        <Card title="Quick revision">
          <ul className="space-y-1.5">
            {lesson.quickRevision.map((r, i) => (
              <li key={i} className="text-muted-foreground">
                • {r}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function PracticeTab({ lesson }: { lesson: Lesson }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-4">
      <Card title="Practice questions">
        <ol className="space-y-4">
          {lesson.practice.map((p, i) => (
            <li key={i}>
              <p className="font-semibold">
                {i + 1}. {p.question}
              </p>
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                className="mt-1.5 font-mono text-[10px] uppercase tracking-widest text-primary hover:underline"
              >
                {open === i ? "Hide solution" : "Show solution"}
              </button>
              {open === i && (
                <p className="mt-2 rounded-sm bg-secondary p-3 text-muted-foreground">
                  {p.solution}
                </p>
              )}
            </li>
          ))}
        </ol>
      </Card>
      {lesson.coding && (
        <Card title={`Coding problem (${lesson.coding.language})`}>
          <p className="text-base font-bold">{lesson.coding.title}</p>
          <p className="text-muted-foreground">{lesson.coding.statement}</p>
          {lesson.coding.starterCode && (
            <pre className="overflow-x-auto rounded-sm bg-secondary p-4 font-mono text-[11px] leading-relaxed">
              {lesson.coding.starterCode}
            </pre>
          )}
        </Card>
      )}
    </div>
  );
}

function QuizTab({
  branch,
  course,
  sub,
  subName,
}: {
  branch: string;
  course: string;
  sub: string;
  subName: string;
}) {
  const quiz = useQuery({
    queryKey: ["learn-quiz", branch, course, sub],
    queryFn: () => getSubTopicQuiz({ data: { branch, course, sub } }),
    staleTime: Infinity,
  });
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const qc = useQueryClient();
  const submit = useMutation({
    mutationFn: (payload: number[]) =>
      submitSubTopicQuiz({ data: { branch, course, sub, answers: payload } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attempts"] }),
  });

  const list = quiz.data ?? [];
  const payload = useMemo(
    () => list.map((_, i) => (answers[i] === undefined ? -1 : answers[i]!)),
    [list, answers],
  );
  const result = submit.data;

  if (quiz.isPending)
    return (
      <div className="rounded-sm border border-border bg-card p-6 text-sm text-muted-foreground">
        Building your {subName} quiz…
      </div>
    );
  if (quiz.isError)
    return (
      <div className="rounded-sm border border-destructive/40 bg-destructive/5 p-6 text-sm">
        <p>The quiz could not be built right now.</p>
        <button
          type="button"
          onClick={() => quiz.refetch()}
          className="mt-3 rounded-sm border border-border px-4 py-2 font-mono text-[10px] uppercase tracking-widest hover:border-primary/50 hover:text-primary"
        >
          Try again
        </button>
      </div>
    );

  return (
    <div className="space-y-4">
      {result && (
        <div className="rounded-sm border border-primary/40 bg-primary/5 p-5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Your score
          </p>
          <p className="mt-1 text-2xl font-black tracking-tighter text-primary">
            {result.score} / {result.total}
          </p>
        </div>
      )}

      {list.map((q, i) => {
        const review = result?.review[i];
        return (
          <div key={i} className="rounded-sm border border-border bg-card p-5">
            <p className="font-semibold">
              {i + 1}. {q.q}
            </p>
            <div className="mt-3 space-y-2">
              {q.options.map((opt, oi) => {
                const chosen = answers[i] === oi;
                const isCorrect = review && review.correct === oi;
                const isWrong = review && review.chosen === oi && review.correct !== oi;
                return (
                  <label
                    key={oi}
                    className={`flex cursor-pointer items-start gap-2 rounded-sm border px-3 py-2 text-sm transition-colors ${
                      isCorrect
                        ? "border-primary/50 bg-primary/10"
                        : isWrong
                          ? "border-destructive/50 bg-destructive/5"
                          : chosen
                            ? "border-primary/40"
                            : "border-border hover:border-primary/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q-${i}`}
                      checked={chosen}
                      disabled={!!result}
                      onChange={() => setAnswers((a) => ({ ...a, [i]: oi }))}
                      className="mt-1"
                    />
                    <span>{opt}</span>
                  </label>
                );
              })}
            </div>
            {review?.why && (
              <p className="mt-3 rounded-sm bg-secondary p-3 text-xs text-muted-foreground">
                {review.why}
              </p>
            )}
          </div>
        );
      })}

      {!result ? (
        <button
          type="button"
          onClick={() => submit.mutate(payload)}
          disabled={submit.isPending}
          className="rounded-sm bg-primary px-5 py-2.5 font-mono text-[10px] uppercase tracking-widest text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {submit.isPending ? "Checking…" : "Submit quiz"}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => {
            submit.reset();
            setAnswers({});
          }}
          className="rounded-sm border border-border px-5 py-2.5 font-mono text-[10px] uppercase tracking-widest hover:border-primary/50 hover:text-primary"
        >
          Retake quiz
        </button>
      )}
      {submit.isError && (
        <p className="text-sm text-destructive">Could not save your quiz. Please try again.</p>
      )}
    </div>
  );
}
