import { Link } from "@tanstack/react-router";
import type { Skill } from "@/data/skills";

export function SkillCard({ skill, index }: { skill: Skill; index: number }) {
  return (
    <div
      className="group flex flex-col rounded-lg border border-border bg-surface/60 p-4 rise transition-colors hover:border-primary/40"
      style={{ animationDelay: `${100 + index * 60}ms` }}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold tracking-tight transition-colors group-hover:text-primary">
            {skill.name}
          </h3>
          <p className="text-xs text-muted-foreground">{skill.tagline}</p>
        </div>
        <span className="font-mono text-xl font-bold italic tracking-tighter">{skill.weight}%</span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-strong">
        <div
          className="h-full bg-primary meter-fill"
          style={{ ["--final-width" as string]: `${skill.weight}%` }}
        />
      </div>
      <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {skill.weight}% placement requirement
      </p>

      <Link
        to="/courses"
        className="mt-4 inline-block self-start rounded-sm border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors hover:border-primary/50 hover:text-primary"
      >
        Go to courses →
      </Link>
    </div>
  );
}
