import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, ProgressBar } from "@/components/AppShell";
import { contentBranch, useProfile } from "@/lib/profile";
import { useSkillProgress } from "@/lib/skill-progress";
import { biggestGap, computeReadiness, recommendNext } from "@/lib/readiness";
import { useLessonProgress } from "@/lib/lesson-progress";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "My Dashboard — Placement Readiness | B.Tech Skills" },
      {
        name: "description",
        content:
          "Track your placement readiness score, skill-by-skill progress, today's goal and the next topic you should learn.",
      },
      { property: "og:title", content: "My Dashboard — Placement Readiness" },
      {
        property: "og:description",
        content:
          "Your live placement readiness score, per-skill progress bars, weekly study stats and next recommended topic.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { profile, hydrated } = useProfile();
  const { state, hydrated: progressReady } = useSkillProgress();
  const { state: lessons } = useLessonProgress();

  const branch = profile ? contentBranch(profile.branch) : "CSE";
  const { rows, overall, totalTopics, completedTopics } = computeReadiness(branch, state);
  const next = recommendNext(rows);
  const gap = biggestGap(rows);
  const ready = hydrated && progressReady;

  return (
    <AppShell>
      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:py-10">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
          <div>
            <h1 className="text-3xl font-black tracking-tighter sm:text-4xl">
              {profile ? `Hi ${profile.name}` : "My dashboard"}
            </h1>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              {profile
                ? `${profile.branch} · ${profile.year} · ${profile.targetRole} · ${profile.weeklyHours}h/week`
                : "Create a profile to personalise this"}
            </p>
          </div>
          <Link
            to="/profile"
            className="rounded-sm border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest hover:border-primary/50 hover:text-primary"
          >
            {profile ? "Edit profile" : "Create profile"}
          </Link>
        </header>

        <section className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          <div className="rounded-sm border border-border bg-card p-6">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Placement readiness
            </span>
            <div className="mt-3 flex items-end gap-3">
              <span className="text-6xl font-black tracking-tighter text-primary">
                {ready ? overall : 0}%
              </span>
              <span className="pb-2 text-xs text-muted-foreground">
                {completedTopics}/{totalTopics} topics done
              </span>
            </div>
            <ProgressBar value={ready ? overall : 0} className="mt-4" />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {overall === 0
                ? "Mark topics as in-progress or completed inside any skill and this score starts moving."
                : gap
                  ? `Your biggest gap right now is ${gap.skill.name}.`
                  : ""}
            </p>
          </div>

          <div className="rounded-sm border border-border bg-card p-6">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Skill breakdown
            </span>
            <ul className="mt-4 space-y-3">
              {rows.slice(0, 8).map((row) => (
                <li key={row.skill.slug}>
                  <Link
                    to="/skills/$slug"
                    params={{ slug: row.skill.slug }}
                    className="group block"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="truncate text-sm font-semibold group-hover:text-primary">
                        {row.skill.name}
                      </span>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {ready ? row.percent : 0}%
                      </span>
                    </div>
                    <ProgressBar value={ready ? row.percent : 0} className="mt-1.5 h-1.5" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-sm border border-border bg-card p-6">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Today's goal
            </span>
            <p className="mt-3 text-lg font-bold tracking-tight">
              {next
                ? `Work through "${next.topic.name}"`
                : "Revise a completed skill and solve 3 problems"}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              About {Math.max(1, Math.round((profile?.weeklyHours ?? 10) / 5))} focused hours today
              keeps you on track.
            </p>
            {next && (
              <Link
                to="/skills/$slug"
                params={{ slug: next.skill.slug }}
                className="mt-4 inline-block rounded-sm bg-primary px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary-foreground hover:bg-primary/90"
              >
                Continue learning
              </Link>
            )}
          </div>

          <div className="rounded-sm border border-border bg-card p-6">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Recommended next skill
            </span>
            <p className="mt-3 text-lg font-bold tracking-tight">
              {next ? next.topic.name : "All caught up"}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {next ? next.reason : "Every tracked topic is complete — move on to mock interviews."}
            </p>
            {next && (
              <Link
                to="/skills/$slug"
                params={{ slug: next.skill.slug }}
                className="mt-4 inline-block font-mono text-[10px] uppercase tracking-widest text-primary hover:underline"
              >
                Start learning ↗
              </Link>
            )}
          </div>
        </section>

        <section>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Your progress so far
          </span>
          <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label="Topics completed" value={completedTopics} />
            <Stat label="DSA lessons done" value={lessons.topics.length} />
            <Stat label="Problems solved" value={lessons.problems.length} />
            <Stat
              label="Hours planned / week"
              value={profile?.weeklyHours ?? 0}
            />
          </div>
        </section>
      </main>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-sm border border-border bg-card p-4">
      <div className="text-3xl font-black tracking-tighter">{value}</div>
      <div className="mt-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
    </div>
  );
}
