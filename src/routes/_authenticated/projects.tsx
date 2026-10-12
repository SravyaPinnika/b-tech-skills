import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { PROJECT_LEVELS, branchInfo, type ProjectLevel } from "@/data/branches";
import { getMyProfile } from "@/lib/profile.functions";
import { getBranchProjects } from "@/lib/projects.functions";

export const Route = createFileRoute("/_authenticated/projects")({
  head: () => ({ meta: [
    { title: "Branch Projects — Beginner to Final Year | B.Tech Skills" },
    { name: "description", content: "Build branch-specific B.Tech projects with steps, technologies, GitHub guidance, deployment and viva preparation." },
    { property: "og:title", content: "Branch-Specific B.Tech Projects" },
    { property: "og:description", content: "Practical projects from beginner through final year with complete build and interview guidance." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const loadProfile = useServerFn(getMyProfile);
  const loadProjects = useServerFn(getBranchProjects);
  const [level, setLevel] = useState<ProjectLevel>("beginner");
  const profile = useQuery({ queryKey: ["my-profile"], queryFn: () => loadProfile(), retry: false });
  const projects = useQuery({ queryKey: ["branch-projects", profile.data?.branch, level], queryFn: () => loadProjects({ data: { branch: profile.data?.branch ?? "cse", level } }), enabled: Boolean(profile.data), retry: false });
  const branch = branchInfo(profile.data?.branch);

  return <AppShell><main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:py-10">
    <header className="border-b border-border pb-5"><p className="font-mono text-[10px] uppercase tracking-widest text-primary">Portfolio work</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">{branch.label} projects</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">Build work you can explain in a viva, publish on GitHub and discuss with recruiters.</p></header>
    <nav className="flex flex-wrap gap-2" aria-label="Project level">{PROJECT_LEVELS.map((item) => <Button key={item} variant={level === item ? "default" : "secondary"} size="sm" onClick={() => setLevel(item)} className="capitalize">{item.replace("-", " ")}</Button>)}</nav>
    {profile.isPending && <p className="text-sm text-muted-foreground">Loading your branch…</p>}
    {!profile.isPending && !profile.data && <Empty title="Complete your profile to see branch projects."><Button asChild><Link to="/profile">Complete profile</Link></Button></Empty>}
    {projects.isPending && profile.data && <p className="text-sm text-muted-foreground">Preparing {level.replace("-", " ")} projects…</p>}
    {projects.isError && <Empty title={projects.error instanceof Error ? projects.error.message : "Projects could not be loaded."} />}
    {projects.data && <section className="space-y-4">{projects.data.map((project, index) => <details key={`${project.title}-${index}`} className="group border border-border bg-card p-5"><summary className="cursor-pointer list-none"><div className="flex flex-wrap items-start justify-between gap-3"><div><span className="font-mono text-[9px] uppercase tracking-widest text-primary">{project.level} · {project.estWeeks} weeks</span><h2 className="mt-1 text-xl font-black">{project.title}</h2><p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">{project.problem}</p></div><span className="text-xl text-primary group-open:rotate-45">+</span></div></summary><div className="mt-6 grid gap-6 border-t border-border pt-5 md:grid-cols-2"><ProjectList title="Skills" items={project.skills} /><ProjectList title="Technologies" items={project.technologies} /><ProjectList title="Build steps" items={project.steps} ordered /><ProjectList title="GitHub guidance" items={project.githubGuide} /><ProjectList title="Deployment / demo" items={project.deployment} /><ProjectList title="Viva questions" items={project.vivaQuestions} /><ProjectList title="Interview questions" items={project.interviewQuestions} /></div></details>)}</section>}
  </main></AppShell>;
}

function ProjectList({ title, items, ordered = false }: { title: string; items: string[]; ordered?: boolean }) { const List = ordered ? "ol" : "ul"; return <div><h3 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{title}</h3><List className={`mt-2 space-y-1.5 text-sm leading-relaxed ${ordered ? "list-decimal pl-5" : "list-disc pl-5"}`}>{items.map((item) => <li key={item}>{item}</li>)}</List></div>; }
function Empty({ title, children }: { title: string; children?: React.ReactNode }) { return <section className="border border-border bg-card p-8 text-center"><p className="text-sm text-muted-foreground">{title}</p>{children && <div className="mt-4">{children}</div>}</section>; }