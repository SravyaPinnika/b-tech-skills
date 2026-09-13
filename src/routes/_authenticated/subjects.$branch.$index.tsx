import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { BRANCHES } from "@/data/branches";
import { BRANCH_SUBJECTS } from "@/data/branch-subjects";
import { AppShell } from "@/components/AppShell";
import { getSubjectLesson } from "@/lib/subject.functions";

function lookup(branchId: string, index: number) {
  const branch = BRANCHES.find((b) => b.id === branchId);
  const subject = branch ? BRANCH_SUBJECTS[branch.id]?.[index] : undefined;
  return branch && subject ? { branch, subject } : null;
}

export const Route = createFileRoute("/_authenticated/subjects/$branch/$index")({
  head: ({ params }) => {
    const found = lookup(params.branch, Number(params.index));
    const name = found?.subject.name ?? "Subject";
    const branchName = found?.branch.label ?? "B.Tech";
    return {
      meta: [
        { title: `${name} — ${branchName} Subject Guide | B.Tech Skills` },
        {
          name: "description",
          content: found
            ? `${found.subject.description} Important topics: ${found.subject.topics.join(", ")}.`
            : "Branch subject learning guide with explanations, examples and interview questions.",
        },
        { property: "og:title", content: `${name} — ${branchName} Subject Guide` },
        {
          property: "og:description",
          content: `Student-friendly ${name} lessons: topic explanations, examples, mistakes to avoid and interview Q&A.`,
        },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  loader: ({ params }) => {
    const index = Number(params.index);
    if (!lookup(params.branch, index)) throw notFound();
    return null;
  },
  component: SubjectPage,
});

function SubjectPage() {
  const { branch: branchId, index: indexParam } = Route.useParams();
  const index = Number(indexParam);
  const found = lookup(branchId, index)!;
  const fetchLesson = useServerFn(getSubjectLesson);
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["subject-lesson", branchId, index],
    queryFn: () => fetchLesson({ data: { branch: branchId, index } }),
    staleTime: Infinity,
  });

  return (
    <AppShell>
      <main className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:py-10">
        <nav className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <Link to="/" className="hover:text-primary">
            Home
          </Link>{" "}
          / <span>{found.branch.short}</span> /{" "}
          <span className="text-foreground">{found.subject.name}</span>
        </nav>

        <header className="border-b border-border pb-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-sm border border-primary/40 bg-primary/10 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-primary">
              {found.subject.difficulty}
            </span>
            <span className="rounded-sm border border-border px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
              {found.branch.label}
            </span>
          </div>
          <h1 className="mt-3 text-3xl font-black tracking-tighter sm:text-4xl">
            {found.subject.name}
          </h1>
          <p className="mt-3 max-w-[62ch] text-sm leading-relaxed text-muted-foreground">
            {found.subject.description}
          </p>
        </header>

        {isLoading && (
          <div className="rounded-sm border border-border bg-card p-8 text-center">
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Preparing your {found.subject.name} study material…
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              This takes a few seconds the first time. It is saved afterwards and opens instantly.
            </p>
          </div>
        )}

        {isError && !isLoading && (
          <div className="rounded-sm border border-border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">
              The study material could not be loaded right now.
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="mt-4 rounded-sm bg-primary px-5 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isFetching ? "Retrying…" : "Try again"}
            </button>
          </div>
        )}

        {data && (
          <>
            <section className="space-y-3">
              <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Overview
              </h2>
              {data.overview.split(/\n+/).filter(Boolean).map((para, i) => (
                <p key={i} className="text-sm leading-relaxed text-foreground/90">
                  {para}
                </p>
              ))}
            </section>

            <section className="space-y-3">
              <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Important topics
              </h2>
              <div className="space-y-3">
                {data.topics.map((t, i) => (
                  <article
                    key={t.topic}
                    className="rounded-sm border border-border bg-card p-5"
                  >
                    <h3 className="text-sm font-bold tracking-tight">
                      <span className="mr-2 font-mono text-xs text-primary">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {t.topic}
                    </h3>
                    {t.explanation && (
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {t.explanation}
                      </p>
                    )}
                    {t.example && (
                      <p className="mt-3 border-l-2 border-primary/50 pl-3 text-xs leading-relaxed text-foreground/80">
                        <span className="font-mono text-[9px] uppercase tracking-widest text-primary">
                          Example —{" "}
                        </span>
                        {t.example}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </section>

            {data.keyConcepts.length > 0 && (
              <section className="space-y-3">
                <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Key concepts to remember
                </h2>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {data.keyConcepts.map((c) => (
                    <li
                      key={c}
                      className="rounded-sm border border-border bg-card px-3 py-2 text-xs leading-relaxed text-foreground/90"
                    >
                      {c}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {data.commonMistakes.length > 0 && (
              <section className="space-y-3">
                <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Common mistakes to avoid
                </h2>
                <ul className="space-y-1.5">
                  {data.commonMistakes.map((m) => (
                    <li key={m} className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
                      <span className="text-primary">✕</span> {m}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {data.interviewQuestions.length > 0 && (
              <section className="space-y-3">
                <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Interview questions
                </h2>
                <div className="space-y-2">
                  {data.interviewQuestions.map((qa) => (
                    <details
                      key={qa.q}
                      className="group rounded-sm border border-border bg-card px-4 py-3"
                    >
                      <summary className="cursor-pointer text-sm font-semibold tracking-tight group-open:text-primary">
                        {qa.q}
                      </summary>
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{qa.a}</p>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {data.practiceTasks.length > 0 && (
              <section className="space-y-3">
                <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Practice tasks
                </h2>
                <ul className="space-y-1.5">
                  {data.practiceTasks.map((t, i) => (
                    <li key={t} className="flex gap-2 text-xs leading-relaxed text-foreground/90">
                      <span className="font-mono text-primary">{i + 1}.</span> {t}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div className="flex flex-wrap gap-2 border-t border-border pt-5">
              <Link
                to="/courses"
                search={{ branch: found.branch.id }}
                className="rounded-sm border border-border px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest transition-colors hover:border-primary/50 hover:text-primary"
              >
                ← More {found.branch.short} subjects
              </Link>
              <Link
                to="/courses"
                className="rounded-sm bg-primary px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Full course catalogue ↗
              </Link>
            </div>
          </>
        )}
      </main>
    </AppShell>
  );
}
