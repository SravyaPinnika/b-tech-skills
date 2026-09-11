import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpen, BriefcaseBusiness, FolderKanban, Map } from "lucide-react";
import { AppShell, ProgressBar } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { COURSES } from "@/data/curriculum";
import { branchInfo } from "@/data/branches";
import { coursePercent, overallCurriculumPercent, useCurriculumProgress } from "@/lib/curriculum-progress";
import { getMyProfile } from "@/lib/profile.functions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [
    { title: "My Learning Dashboard | B.Tech Skills" },
    { name: "description", content: "View your saved student profile, learning pathway and completion percentage for every B.Tech course." },
    { property: "og:title", content: "My Learning Dashboard — B.Tech Skills" },
    { property: "og:description", content: "Your profile, roadmap and course completion in one personalised dashboard." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: DashboardPage,
});

function DashboardPage() {
  const loadProfile = useServerFn(getMyProfile);
  const profileQuery = useQuery({ queryKey: ["my-profile"], queryFn: () => loadProfile(), retry: false });
  const { state, hydrated: progressReady } = useCurriculumProgress();
  const profile = profileQuery.data;
  const branch = branchInfo(profile?.branch);
  const overall = progressReady ? overallCurriculumPercent(state) : 0;

  return <AppShell><main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:py-10">
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
      <div><p className="font-mono text-[10px] uppercase tracking-widest text-primary">Student workspace</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">{profile ? `Welcome back, ${profile.name}` : "My dashboard"}</h1><p className="mt-2 text-sm text-muted-foreground">Continue your courses and move through your personalised placement plan.</p></div>
      <Button asChild variant="outline"><Link to="/profile">{profile ? "Edit profile" : "Create profile"}</Link></Button>
    </header>

    {profileQuery.isPending && <p className="text-sm text-muted-foreground">Loading your dashboard…</p>}
    {profileQuery.isError && <p role="alert" className="border-l-2 border-destructive pl-3 text-sm text-destructive">Your profile could not be loaded. Please refresh and try again.</p>}

    {profile ? <section className="border border-border bg-card p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">My profile</p><h2 className="mt-1 text-xl font-black">{branch.label} · Year {profile.year} · Semester {profile.semester}</h2><p className="mt-1 text-sm text-muted-foreground">{profile.career_goal || "Placement preparation"} → {profile.target_job || branch.targetJobs[0]}</p></div><span className="font-mono text-[10px] uppercase tracking-widest text-primary">{profile.weekly_hours} study hours / week</span></div><div className="mt-5 grid gap-4 sm:grid-cols-3"><Info label="Languages & tools" value={profile.languages.length ? profile.languages.join(", ") : "Not added yet"} /><Info label="Current skills" value={profile.skills.length ? profile.skills.join(", ") : "Not added yet"} /><Info label="Target companies" value={branch.companies.slice(0, 4).join(", ")} /></div></section> : !profileQuery.isPending && <section className="border border-border bg-card p-6"><h2 className="font-bold">Start with your profile</h2><p className="mt-2 text-sm text-muted-foreground">Choose your branch, semester and target role to unlock personalised sections.</p><Button asChild className="mt-4"><Link to="/profile">Create profile</Link></Button></section>}

    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <QuickLink to="/roadmap" icon={<Map />} title="My roadmap" detail="Semester plan" />
      <QuickLink to="/courses" icon={<BookOpen />} title="Courses" detail={`${overall}% complete`} />
      <QuickLink to="/projects" icon={<FolderKanban />} title="Projects" detail="Build your portfolio" />
      <QuickLink to="/interviews" icon={<BriefcaseBusiness />} title="Interviews" detail="Practice answers" />
    </section>

    <section className="border-t border-border pt-6"><div className="flex items-end justify-between gap-4"><div><p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Overall course completion</p><p className="mt-2 text-5xl font-black text-primary">{overall}%</p></div><Button asChild variant="outline" size="sm"><Link to="/courses">Browse courses <ArrowRight /></Link></Button></div><ProgressBar value={overall} className="mt-4" /></section>

    <section><h2 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Course completion</h2><div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{COURSES.map((course) => { const pct = progressReady ? coursePercent(state, course) : 0; return <Link key={course.slug} to="/courses/$course" params={{ course: course.slug }} className="group border border-border bg-card p-4 hover:border-primary/40"><div className="flex items-baseline justify-between gap-3"><h3 className="truncate text-sm font-bold group-hover:text-primary">{course.title}</h3><span className="font-mono text-[11px] text-primary">{pct}%</span></div><ProgressBar value={pct} className="mt-2 h-1.5" /></Link>; })}</div></section>
  </main></AppShell>;
}

function Info({ label, value }: { label: string; value: string }) { return <div><p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{label}</p><p className="mt-1 text-sm font-semibold leading-relaxed">{value}</p></div>; }
function QuickLink({ to, icon, title, detail }: { to: "/roadmap" | "/courses" | "/projects" | "/interviews"; icon: React.ReactNode; title: string; detail: string }) { return <Link to={to} className="group flex items-center gap-3 border border-border bg-card p-4 hover:border-primary/40"><span className="text-primary [&>svg]:size-5">{icon}</span><span><span className="block text-sm font-bold group-hover:text-primary">{title}</span><span className="block text-xs text-muted-foreground">{detail}</span></span></Link>; }