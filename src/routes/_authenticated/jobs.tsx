import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthButton } from "@/components/AuthButton";
import { useState } from "react";
import { listRecruiters, type RecruiterRow } from "@/lib/recruiters.functions";

const BRANCH_FILTERS = ["All", "CSE", "IT", "AIML", "DS"] as const;

export const Route = createFileRoute("/_authenticated/jobs")({
  loader: () => listRecruiters(),
  head: () => ({
    meta: [
      { title: "Jobs & Recruiters — Placement Ascent" },
      {
        name: "description",
        content:
          "Which companies are recruiting B.Tech students now, the skills and projects they expect, interview rounds, CTC ranges and eligibility — refreshed weekly.",
      },
      { property: "og:title", content: "Jobs & Recruiters — Placement Ascent" },
      {
        property: "og:description",
        content:
          "Live campus hiring tracker: roles, required skills, project expectations, interview process and CTC by company.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: JobsPage,
  errorComponent: () => (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="text-xl font-bold tracking-tight">The hiring feed didn't load</h1>
      <p className="mt-2 text-sm text-muted-foreground">Refresh the page to try again.</p>
    </div>
  ),
});

function JobsPage() {
  const { recruiters, lastRunAt, currentWeek } = Route.useLoaderData();
  const [branch, setBranch] = useState<(typeof BRANCH_FILTERS)[number]>("All");

  const visible =
    branch === "All" ? recruiters : recruiters.filter((r) => r.branches.includes(branch));
  const newThisWeek = recruiters.filter((r) => r.added_week >= currentWeek).length;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link to="/" className="font-mono text-xs uppercase tracking-tighter text-muted-foreground">
            ← Roadmap
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/tools"
              className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
            >
              Tools
            </Link>
            <div className="flex items-center gap-1.5">
              <span className="size-2 animate-pulse rounded-full bg-primary" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-primary">
                Auto-updated weekly
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-8 px-4 py-8">
        <section className="flex items-end justify-between gap-4 border-b border-border pb-4 rise">
          <div>
            <h1 className="text-4xl font-black tracking-tighter">Hiring Now</h1>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              {lastRunAt
                ? `Last refresh: ${new Date(lastRunAt).toISOString().slice(0, 16).replace("T", " ")} UTC`
                : `Tracking week of ${currentWeek}`}
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-primary/20 bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary">
            {newThisWeek} NEW
          </span>
        </section>

        <nav className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
          {BRANCH_FILTERS.map((b) => (
            <button
              key={b}
              onClick={() => setBranch(b)}
              className={`shrink-0 rounded-sm px-4 py-1.5 text-xs font-bold tracking-tight transition-colors ${
                b === branch
                  ? "bg-foreground text-background"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {b}
            </button>
          ))}
        </nav>

        <div className="space-y-4">
          {visible.map((r) => (
            <RecruiterCard key={r.id} recruiter={r} isNew={r.added_week >= currentWeek} />
          ))}
          {visible.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No recruiters listed for {branch} yet — check back after the weekly refresh.
            </p>
          )}
        </div>

        <footer className="border-t border-border/50 pt-12 pb-8 text-center">
          <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            — Ascent Protocol —
          </div>
        </footer>
      </main>
    </div>
  );
}

function RecruiterCard({ recruiter: r, isNew }: { recruiter: RecruiterRow; isNew: boolean }) {
  return (
    <article className="rounded-sm border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold tracking-tight">{r.company}</h2>
            {isNew && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase text-primary">
                new
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">{r.role}</p>
        </div>
        <div className="text-right">
          <span className="font-mono text-[10px] uppercase tracking-widest text-primary">
            {r.hiring_status}
          </span>
          {r.hiring_window && (
            <p className="font-mono text-[10px] text-muted-foreground">{r.hiring_window}</p>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {r.branches.map((b) => (
          <span
            key={b}
            className="rounded-sm bg-secondary px-2 py-0.5 font-mono text-[10px] uppercase text-muted-foreground"
          >
            {b}
          </span>
        ))}
      </div>

      <dl className="mt-4 space-y-3 text-sm">
        {r.skills.length > 0 && (
          <Row label="Skills they want">
            <span className="flex flex-wrap gap-1.5">
              {r.skills.map((s) => (
                <span
                  key={s}
                  className="rounded-sm border border-primary/20 bg-primary/5 px-2 py-0.5 text-[11px] text-primary"
                >
                  {s}
                </span>
              ))}
            </span>
          </Row>
        )}
        {r.project_expectations && (
          <Row label="Projects they expect">{r.project_expectations}</Row>
        )}
        {r.interview_process && <Row label="Interview process">{r.interview_process}</Row>}
        {r.ctc_range && <Row label="CTC range">{r.ctc_range}</Row>}
        {r.eligibility && <Row label="Eligibility">{r.eligibility}</Row>}
      </dl>

      {r.url && (
        <a
          href={r.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block font-mono text-[10px] uppercase tracking-widest text-primary hover:underline"
        >
          Careers page ↗
        </a>
      )}
    </article>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[10rem_1fr] sm:gap-4">
      <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </dt>
      <dd className="leading-relaxed text-foreground/90">{children}</dd>
    </div>
  );
}
