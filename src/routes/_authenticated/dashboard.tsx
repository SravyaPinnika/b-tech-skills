import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, ProgressBar } from "@/components/AppShell";
import { useProfile } from "@/lib/profile";
import { COURSES } from "@/data/curriculum";
import {
  coursePercent,
  overallCurriculumPercent,
  useCurriculumProgress,
} from "@/lib/curriculum-progress";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "My Dashboard — Course Completion | B.Tech Skills" },
      {
        name: "description",
        content:
          "See your saved student profile and the completion percentage of every course you are learning.",
      },
      { property: "og:title", content: "My Dashboard — Course Completion" },
      {
        property: "og:description",
        content: "Your student profile and per-course completion percentages in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { profile, hydrated } = useProfile();
  const { state, hydrated: progressReady } = useCurriculumProgress();

  const overall = progressReady ? overallCurriculumPercent(state) : 0;

  return (
    <AppShell>
      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:py-10">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
          <div>
            <h1 className="text-3xl font-black tracking-tighter sm:text-4xl">
              {profile ? `Hi ${profile.name}` : "My dashboard"}
            </h1>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              Course completion overview
            </p>
          </div>
          <Link
            to="/profile"
            className="rounded-sm border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest hover:border-primary/50 hover:text-primary"
          >
            {profile ? "Edit profile" : "Create profile"}
          </Link>
        </header>

        <section className="rounded-sm border border-border bg-card p-6">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            My profile
          </span>
          {!hydrated ? (
            <p className="mt-3 text-sm text-muted-foreground">Loading…</p>
          ) : profile ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Info label="Name" value={profile.name} />
              <Info label="Branch" value={profile.branch} />
              <Info label="Year" value={profile.year} />
              <Info label="Target role" value={profile.targetRole} />
              <Info label="Weekly study time" value={`${profile.weeklyHours} hours`} />
              <Info
                label="Languages"
                value={profile.languages.length ? profile.languages.join(", ") : "—"}
              />
              <div className="sm:col-span-2 lg:col-span-3">
                <Info
                  label="Skills you already have"
                  value={profile.skills.length ? profile.skills.join(", ") : "—"}
                />
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              You have not created a profile yet.{" "}
              <Link to="/profile" className="text-primary hover:underline">
                Create one
              </Link>
              .
            </p>
          )}
        </section>

        <section className="rounded-sm border border-border bg-card p-6">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Overall completion
          </span>
          <div className="mt-3 flex items-end gap-3">
            <span className="text-6xl font-black tracking-tighter text-primary">{overall}%</span>
            <span className="pb-2 text-xs text-muted-foreground">across all courses</span>
          </div>
          <ProgressBar value={overall} className="mt-4" />
        </section>

        <section>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Course completion
          </span>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {COURSES.map((course) => {
              const pct = progressReady ? coursePercent(state, course) : 0;
              return (
                <Link
                  key={course.slug}
                  to="/courses/$course"
                  params={{ course: course.slug }}
                  className="group rounded-sm border border-border bg-card p-4 transition-colors hover:border-primary/40"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <h2 className="truncate text-sm font-bold tracking-tight group-hover:text-primary">
                      {course.title}
                    </h2>
                    <span className="font-mono text-[11px] text-muted-foreground">{pct}%</span>
                  </div>
                  <ProgressBar value={pct} className="mt-2 h-1.5" />
                </Link>
              );
            })}
          </div>
        </section>
      </main>
    </AppShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}
