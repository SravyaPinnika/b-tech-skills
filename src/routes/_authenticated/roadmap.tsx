import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, RefreshCw } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { getMyRoadmap, type RoadmapSemester } from "@/lib/roadmap.functions";

export const Route = createFileRoute("/_authenticated/roadmap")({
  head: () => ({ meta: [
    { title: "My Personalised Roadmap | B.Tech Skills" },
    { name: "description", content: "A semester-by-semester B.Tech learning, project, certification and placement roadmap." },
    { property: "og:title", content: "My Personalised B.Tech Roadmap" },
    { property: "og:description", content: "A saved semester plan for courses, projects, interviews and placements." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: RoadmapPage,
});

function RoadmapPage() {
  const fetchRoadmap = useServerFn(getMyRoadmap);
  const queryClient = useQueryClient();
  const roadmap = useQuery({ queryKey: ["my-roadmap"], queryFn: () => fetchRoadmap({ data: { regenerate: false } }), retry: false });

  async function regenerate() {
    await fetchRoadmap({ data: { regenerate: true } });
    await queryClient.invalidateQueries({ queryKey: ["my-roadmap"] });
  }

  return <AppShell><main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:py-10">
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
      <div><p className="font-mono text-[10px] uppercase tracking-widest text-primary">Semester plan</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">{roadmap.data?.headline ?? "My roadmap"}</h1>{roadmap.data?.summary && <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">{roadmap.data.summary}</p>}</div>
      {roadmap.data && <Button variant="outline" onClick={regenerate} disabled={roadmap.isFetching}><RefreshCw />{roadmap.isFetching ? "Regenerating…" : "Regenerate"}</Button>}
    </header>
    {roadmap.isPending && <Status title="Building your personalised roadmap…" detail="Your branch, semester, skills and goal are being matched." />}
    {roadmap.isError && <Status title="Your roadmap is not ready" detail={roadmap.error instanceof Error ? roadmap.error.message : "Please complete your profile first."}><Button asChild><Link to="/profile">Complete profile</Link></Button></Status>}
    {roadmap.data && <>
      <section><SectionTitle>Semester roadmap</SectionTitle><div className="mt-4 space-y-4">{roadmap.data.semesters.map((semester) => <SemesterBlock key={semester.semester} semester={semester} />)}</div></section>
      <section className="grid gap-6 md:grid-cols-2"><ListPanel title="Weekly study plan" items={roadmap.data.weeklyPlan} /><ListPanel title="Key milestones" items={roadmap.data.milestones} /></section>
    </>}
  </main></AppShell>;
}

function SemesterBlock({ semester }: { semester: RoadmapSemester }) {
  const groups = [["Subjects", semester.subjects], ["Skills", semester.skills], ["Courses", semester.courses], ["Projects", semester.projects], ["Certifications", semester.certifications], ["Interview preparation", semester.interviewPrep], ["Placement preparation", semester.placementPrep]] as const;
  return <article className="border-l-2 border-primary bg-card p-5"><div className="flex flex-wrap items-baseline justify-between gap-2"><h2 className="text-xl font-black">Semester {semester.semester} · {semester.title}</h2><span className="font-mono text-[10px] uppercase tracking-widest text-primary">{semester.focus}</span></div><div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{groups.map(([title, items]) => items.length > 0 && <div key={title}><h3 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{title}</h3><ul className="mt-2 space-y-1.5">{items.map((item) => <li key={item} className="flex gap-2 text-sm"><Check className="mt-0.5 size-3.5 shrink-0 text-primary" />{item}</li>)}</ul></div>)}</div></article>;
}

function ListPanel({ title, items }: { title: string; items: string[] }) { return <section className="border-t border-border pt-4"><SectionTitle>{title}</SectionTitle><ol className="mt-3 space-y-2">{items.map((item, index) => <li key={item} className="flex gap-3 text-sm"><span className="font-mono text-xs text-primary">{String(index + 1).padStart(2, "0")}</span><span>{item}</span></li>)}</ol></section>; }
function SectionTitle({ children }: { children: React.ReactNode }) { return <h2 className="font-mono text-[11px] font-bold uppercase tracking-widest">{children}</h2>; }
function Status({ title, detail, children }: { title: string; detail: string; children?: React.ReactNode }) { return <section className="border border-border bg-card p-8 text-center"><h2 className="text-lg font-bold">{title}</h2><p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">{detail}</p>{children && <div className="mt-5">{children}</div>}</section>; }