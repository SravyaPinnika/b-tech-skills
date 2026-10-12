import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { COURSE_MAP } from "@/data/curriculum";
import {
  CODING_LANGUAGES,
  codingTestKind,
  getCodingTest,
  getTopicExam,
  gradeCodingTest,
  listTopicAttempts,
  submitTopicExam,
  type CodingGrade,
} from "@/lib/learning.functions";

export const Route = createFileRoute("/_authenticated/courses/$course/$topic/exam")({
  head: ({ params }) => {
    const course = COURSE_MAP[params.course];
    const topic = course?.topics.find((t) => t.slug === params.topic);
    const name = topic?.title ?? "Topic";
    return {
      meta: [
        { title: `${name} Exam — ${course?.title ?? "Course"} | B.Tech Skills` },
        {
          name: "description",
          content: `Take a 10-question exam and coding test on ${name} and get instant feedback.`,
        },
        { property: "og:title", content: `${name} — exam & coding test` },
        { property: "og:description", content: `Test your ${name} knowledge with MCQs and coding problems.` },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  loader: ({ params }) => {
    const course = COURSE_MAP[params.course];
    if (!course || !course.topics.some((t) => t.slug === params.topic)) throw notFound();
    return null;
  },
  component: ExamPage,
});

type Tab = "mcq" | "coding";

function ExamPage() {
  const { course: courseSlug, topic: topicSlug } = Route.useParams();
  const course = COURSE_MAP[courseSlug]!;
  const topic = course.topics.find((t) => t.slug === topicSlug)!;
  const kind = codingTestKind(course);
  const [tab, setTab] = useState<Tab>("mcq");

  const fetchAttempts = useServerFn(listTopicAttempts);
  const attempts = useQuery({
    queryKey: ["attempts", courseSlug, topicSlug],
    queryFn: () => fetchAttempts({ data: { course: courseSlug, topic: topicSlug } }),
  });

  return (
    <AppShell>
      <main className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:py-10">
        <nav className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <Link to="/courses" className="hover:text-primary">
            Courses
          </Link>{" "}
          /{" "}
          <Link to="/courses/$course" params={{ course: course.slug }} className="hover:text-primary">
            {course.title}
          </Link>{" "}
          /{" "}
          <Link
            to="/courses/$course/$topic"
            params={{ course: course.slug, topic: topic.slug }}
            className="hover:text-primary"
          >
            {topic.title}
          </Link>{" "}
          / <span className="text-foreground">Exam</span>
        </nav>

        <header className="border-b border-border pb-5">
          <h1 className="text-3xl font-black tracking-tighter sm:text-4xl">{topic.title} — Exam</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Answer without notes. You can retake as many times as you like — every attempt is saved.
          </p>
          {attempts.data && attempts.data.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {attempts.data.slice(0, 6).map((a) => (
                <span
                  key={a.id}
                  className="rounded-sm border border-border px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
                >
                  {a.kind === "mcq" ? "Quiz" : "Coding"} {a.score}/{a.total} ·{" "}
                  {new Date(a.created_at).toLocaleDateString()}
                </span>
              ))}
            </div>
          )}
        </header>

        {kind && (
          <div className="flex gap-1">
            {(["mcq", "coding"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-sm px-4 py-1.5 text-xs font-bold tracking-tight transition-colors ${
                  tab === t
                    ? "bg-foreground text-background"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "mcq" ? "Topic exam" : kind === "sql" ? "SQL query test" : "Coding test"}
              </button>
            ))}
          </div>
        )}

        {tab === "mcq" ? (
          <McqExam course={courseSlug} topic={topicSlug} />
        ) : (
          <CodingExam course={courseSlug} topic={topicSlug} sql={kind === "sql"} />
        )}
      </main>
    </AppShell>
  );
}

/* ---------------------------------- MCQ ---------------------------------- */

function McqExam({ course, topic }: { course: string; topic: string }) {
  const qc = useQueryClient();
  const fetchExam = useServerFn(getTopicExam);
  const submit = useServerFn(submitTopicExam);
  const exam = useQuery({
    queryKey: ["exam", course, topic],
    queryFn: () => fetchExam({ data: { course, topic } }),
    staleTime: Infinity,
    retry: 1,
  });
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const grade = useMutation({
    mutationFn: () =>
      submit({
        data: {
          course,
          topic,
          answers: (exam.data?.questions ?? []).map((_, i) => answers[i] ?? -1),
        },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attempts", course, topic] }),
  });

  if (exam.isPending)
    return <p className="animate-pulse text-sm text-muted-foreground">Setting your question paper…</p>;
  if (exam.isError)
    return (
      <p className="text-sm text-destructive">
        {(exam.error as Error).message}{" "}
        <button onClick={() => exam.refetch()} className="underline">
          Retry
        </button>
      </p>
    );

  const qs = exam.data.questions;
  const result = grade.data;
  const answered = Object.keys(answers).length;

  return (
    <section className="space-y-4">
      {result && (
        <div className="rounded-sm border border-primary/40 bg-primary/10 p-5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-primary">Result</p>
          <p className="mt-1 text-3xl font-black tracking-tighter">
            {result.score}/{result.total}{" "}
            <span className="text-base font-semibold text-muted-foreground">
              ({Math.round((result.score / result.total) * 100)}%)
            </span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {result.score / result.total >= 0.8
              ? "Interview ready on this topic. Move to the next one."
              : result.score / result.total >= 0.5
                ? "Decent — revise the concepts you missed below and retake."
                : "Go back to the lesson, re-read each concept, then try again."}
          </p>
        </div>
      )}

      <ol className="space-y-4">
        {qs.map((q, i) => {
          const rev = result?.review[i];
          return (
            <li key={i} className="rounded-sm border border-border bg-card p-4">
              <p className="text-sm font-semibold">
                <span className="mr-2 font-mono text-primary">Q{i + 1}.</span>
                {q.q}
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {q.options.map((opt, oi) => {
                  const chosen = answers[i] === oi;
                  let tone = "border-border hover:border-primary/40";
                  if (rev) {
                    if (oi === rev.correct) tone = "border-primary bg-primary/10";
                    else if (chosen) tone = "border-destructive bg-destructive/10";
                  } else if (chosen) tone = "border-primary bg-primary/10";
                  return (
                    <button
                      key={oi}
                      disabled={!!result}
                      onClick={() => setAnswers((a) => ({ ...a, [i]: oi }))}
                      className={`rounded-sm border px-3 py-2 text-left text-sm transition-colors ${tone}`}
                    >
                      <span className="mr-2 font-mono text-[10px] text-muted-foreground">
                        {String.fromCharCode(65 + oi)}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>
              {rev && (
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  <span className={rev.chosen === rev.correct ? "text-primary" : "text-destructive"}>
                    {rev.chosen === rev.correct ? "Correct. " : "Incorrect. "}
                  </span>
                  {rev.why}
                </p>
              )}
            </li>
          );
        })}
      </ol>

      {!result ? (
        <div className="flex flex-wrap items-center gap-3">
          <button
            disabled={grade.isPending || answered === 0}
            onClick={() => grade.mutate()}
            className="rounded-sm bg-primary px-5 py-2.5 font-mono text-[10px] uppercase tracking-widest text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {grade.isPending ? "Checking…" : "Submit answers"}
          </button>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {answered}/{qs.length} answered
          </span>
          {grade.isError && (
            <span className="text-xs text-destructive">{(grade.error as Error).message}</span>
          )}
        </div>
      ) : (
        <button
          onClick={() => {
            setAnswers({});
            grade.reset();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="rounded-sm border border-border px-5 py-2.5 font-mono text-[10px] uppercase tracking-widest hover:border-primary/50 hover:text-primary"
        >
          Retake exam
        </button>
      )}
    </section>
  );
}

/* --------------------------------- Coding -------------------------------- */

function CodingExam({ course, topic, sql }: { course: string; topic: string; sql: boolean }) {
  const qc = useQueryClient();
  const [language, setLanguage] = useState<string>(sql ? "SQL" : "C");
  const [started, setStarted] = useState(false);
  const [code, setCode] = useState<string[]>([]);
  const fetchTest = useServerFn(getCodingTest);
  const gradeFn = useServerFn(gradeCodingTest);

  const test = useQuery({
    queryKey: ["coding-test", course, topic, language],
    queryFn: () => fetchTest({ data: { course, topic, language } }),
    enabled: started,
    staleTime: Infinity,
    retry: 1,
  });
  const grade = useMutation({
    mutationFn: () =>
      gradeFn({
        data: {
          course,
          topic,
          language,
          solutions: (test.data?.tasks ?? []).map((t, i) => code[i] ?? t.starterCode),
        },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attempts", course, topic] }),
  });

  if (!started) {
    return (
      <section className="rounded-sm border border-border bg-card p-5">
        <h2 className="text-lg font-black tracking-tight">
          {sql ? "SQL query round" : "Coding round"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          3 problems (easy → hard). Write your solution in the editor; it is reviewed like a real
          interviewer would — correctness, edge cases and complexity.
        </p>
        {!sql && (
          <div className="mt-4 flex flex-wrap gap-2">
            {CODING_LANGUAGES.map((l) => (
              <button
                key={l}
                onClick={() => setLanguage(l)}
                className={`rounded-sm px-3 py-1.5 text-xs font-bold ${
                  language === l
                    ? "bg-foreground text-background"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        )}
        <button
          onClick={() => setStarted(true)}
          className="mt-5 rounded-sm bg-primary px-5 py-2.5 font-mono text-[10px] uppercase tracking-widest text-primary-foreground hover:bg-primary/90"
        >
          Start {sql ? "SQL" : language} test →
        </button>
      </section>
    );
  }

  if (test.isPending)
    return <p className="animate-pulse text-sm text-muted-foreground">Preparing your problems…</p>;
  if (test.isError)
    return (
      <p className="text-sm text-destructive">
        {(test.error as Error).message}{" "}
        <button onClick={() => test.refetch()} className="underline">
          Retry
        </button>
      </p>
    );

  const result: CodingGrade | undefined = grade.data;

  return (
    <section className="space-y-5">
      {result && (
        <div className="rounded-sm border border-primary/40 bg-primary/10 p-5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-primary">Result</p>
          <p className="mt-1 text-3xl font-black tracking-tighter">
            {result.score}/{result.total} passed
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{result.overall}</p>
        </div>
      )}

      {test.data.tasks.map((t, i) => {
        const v = result?.verdicts[i];
        return (
          <article key={i} className="rounded-sm border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-bold">
                <span className="mr-2 font-mono text-primary">{i + 1}.</span>
                {t.title}
              </h3>
              {v && (
                <span
                  className={`rounded-sm px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest ${
                    v.passed ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"
                  }`}
                >
                  {v.passed ? "Passed" : "Failed"}
                </span>
              )}
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {t.statement}
            </p>
            {t.schema && (
              <pre className="mt-3 overflow-x-auto rounded-sm border border-border bg-background p-3 font-mono text-[11px] leading-snug">
                {t.schema}
              </pre>
            )}
            {(t.inputFormat || t.outputFormat) && (
              <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                {t.inputFormat && (
                  <p>
                    <span className="font-semibold text-foreground">Input: </span>
                    {t.inputFormat}
                  </p>
                )}
                {t.outputFormat && (
                  <p>
                    <span className="font-semibold text-foreground">Output: </span>
                    {t.outputFormat}
                  </p>
                )}
              </div>
            )}
            {t.examples.length > 0 && (
              <div className="mt-3 space-y-2">
                {t.examples.map((e, ei) => (
                  <div
                    key={ei}
                    className="rounded-sm border border-border bg-background p-3 font-mono text-[11px] leading-snug"
                  >
                    <div>
                      <span className="text-muted-foreground">Input: </span>
                      {e.input}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Output: </span>
                      {e.output}
                    </div>
                    {e.explanation && (
                      <div className="mt-1 font-sans text-muted-foreground">{e.explanation}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {t.constraints.length > 0 && (
              <ul className="mt-3 list-disc pl-5 text-xs text-muted-foreground">
                {t.constraints.map((c, ci) => (
                  <li key={ci}>{c}</li>
                ))}
              </ul>
            )}
            <textarea
              value={code[i] ?? t.starterCode}
              onChange={(e) =>
                setCode((c) => {
                  const n = [...c];
                  n[i] = e.target.value;
                  return n;
                })
              }
              disabled={!!result}
              rows={12}
              spellCheck={false}
              className="mt-3 w-full rounded-sm border border-border bg-background p-3 font-mono text-xs leading-snug outline-none focus:border-primary/60 disabled:opacity-70"
            />
            {v && (
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                <span className="font-semibold text-foreground">Feedback: </span>
                {v.feedback}
              </p>
            )}
          </article>
        );
      })}

      {!result ? (
        <div className="flex flex-wrap items-center gap-3">
          <button
            disabled={grade.isPending}
            onClick={() => grade.mutate()}
            className="rounded-sm bg-primary px-5 py-2.5 font-mono text-[10px] uppercase tracking-widest text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {grade.isPending ? "Reviewing your code…" : "Submit all solutions"}
          </button>
          {grade.isError && (
            <span className="text-xs text-destructive">{(grade.error as Error).message}</span>
          )}
        </div>
      ) : (
        <button
          onClick={() => {
            setCode([]);
            grade.reset();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="rounded-sm border border-border px-5 py-2.5 font-mono text-[10px] uppercase tracking-widest hover:border-primary/50 hover:text-primary"
        >
          Try again
        </button>
      )}
    </section>
  );
}
