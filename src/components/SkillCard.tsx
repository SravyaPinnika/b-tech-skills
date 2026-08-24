import { Link } from "@tanstack/react-router";
import type { Skill } from "@/data/skills";

export function SkillCard({ skill, index }: { skill: Skill; index: number }) {
  return (
    <Link
      to="/skills/$slug"
      params={{ slug: skill.slug }}
      className="group block rounded-lg border border-border bg-surface/60 p-4 rise transition-colors hover:border-primary/40"
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

      <div className="space-y-4">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-strong">
          <div
            className="h-full bg-primary meter-fill"
            style={{ ["--final-width" as string]: `${skill.weight}%` }}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {skill.topics.slice(0, 4).map((topic) => (
            <div
              key={topic}
              className="truncate rounded border border-border px-2 py-1 font-mono text-[10px] text-muted-foreground"
            >
              {topic}
            </div>
          ))}
        </div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-primary">
          {skill.topics.length} topics
        </p>
      </div>
    </Link>
  );
}
