import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BRANCHES, skillsForBranch, type Branch } from "@/data/skills";
import { SkillCard } from "@/components/SkillCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Placement Ascent — B.Tech Skill Roadmap for CSE, IT, AIML, DS" },
      {
        name: "description",
        content:
          "Ranked placement skills for B.Tech CSE, IT, AIML and DS students: usefulness percentage, why each skill matters, and the exact topics to cover.",
      },
      { property: "og:title", content: "Placement Ascent — B.Tech Skill Roadmap" },
      {
        property: "og:description",
        content:
          "Branch-wise placement roadmap with skill weightage, importance and topic checklists, plus a weekly auto-updated tools feed.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const [branch, setBranch] = useState<Branch>("CSE");
  const active = BRANCHES.find((b) => b.id === branch)!;
  const skills = skillsForBranch(branch);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-medium uppercase tracking-tighter text-muted-foreground">
              Placement / Ascent Engine
            </span>
            <div className="flex items-center gap-4">
              <Link
                to="/jobs"
                className="font-mono text-[10px] uppercase tracking-widest text-primary hover:underline"
              >
                Jobs
              </Link>
              <Link
                to="/tools"
                className="font-mono text-[10px] uppercase tracking-widest text-primary hover:underline"
              >
                Tools feed
              </Link>
            </div>
          </div>

          <nav className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
            {BRANCHES.map((b) => (
              <button
                key={b.id}
                onClick={() => setBranch(b.id)}
                className={`shrink-0 rounded-sm px-4 py-1.5 text-xs font-bold tracking-tight transition-colors ${
                  b.id === branch
                    ? "bg-foreground text-background"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {b.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-12 px-4 py-8">
        <section className="rise">
          <h1 className="mb-2 text-4xl font-extrabold tracking-tighter text-balance">{active.headline}</h1>
          <p className="max-w-[46ch] text-sm leading-relaxed text-muted-foreground">{active.blurb}</p>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Core Competencies
            </h2>
            <span className="font-mono text-[10px] text-primary">Ranked by placement weightage</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {skills.map((skill, i) => (
              <SkillCard key={skill.slug} skill={skill} index={i} />
            ))}
          </div>
        </section>

        <section className="space-y-6 pt-4">
          <div className="flex items-end justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-2xl font-black tracking-tighter">Weekly Stack</h2>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                New tools are added automatically every week
              </p>
            </div>
            <Link
              to="/tools"
              className="rounded-full border border-primary/20 bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary"
            >
              OPEN
            </Link>
          </div>
          <p className="max-w-[52ch] text-sm text-muted-foreground">
            The tools page tracks the frameworks, libraries and platforms companies started asking about
            recently — refreshed on a weekly schedule and tagged by branch.
          </p>
        </section>

        <footer className="border-t border-border/50 pt-12 pb-8 text-center">
          <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            — Ascent Protocol —
          </div>
        </footer>
      </main>
    </div>
  );
}
