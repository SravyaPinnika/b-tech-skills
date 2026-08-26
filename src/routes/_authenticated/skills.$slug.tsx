import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { skillBySlug } from "@/data/skills";

export const Route = createFileRoute("/_authenticated/skills/$slug")({
  loader: ({ params }) => {
    const skill = skillBySlug(params.slug);
    if (!skill) throw notFound();
    return { skill };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Skill not found" }, { name: "robots", content: "noindex" }] };
    }
    const { skill } = loaderData;
    const description = `${skill.name} for B.Tech placements: ${skill.weight}% weightage, why it matters, and all ${skill.topics.length} topics to cover.`;
    return {
      meta: [
        { title: `${skill.name} — Placement Roadmap` },
        { name: "description", content: description },
        { property: "og:title", content: `${skill.name} — Placement Roadmap` },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: SkillDetail,
  notFoundComponent: SkillNotFound,
});

function SkillNotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold tracking-tight">Skill not found</h1>
      <Link to="/" className="mt-4 inline-block font-mono text-xs uppercase tracking-widest text-primary">
        Back to roadmap
      </Link>
    </div>
  );
}

function SkillDetail() {
  const { skill } = Route.useLoaderData();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link to="/" className="font-mono text-xs uppercase tracking-tighter text-muted-foreground">
            ← Roadmap
          </Link>
          <span className="font-mono text-[10px] uppercase tracking-widest text-primary">
            {skill.branches.join(" / ")}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-12 px-4 py-8">
        <section className="rise">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tighter text-balance">{skill.name}</h1>
              <p className="mt-2 text-sm text-muted-foreground">{skill.tagline}</p>
            </div>
            <span className="font-mono text-3xl font-bold italic tracking-tighter">{skill.weight}%</span>
          </div>
          <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-surface-strong">
            <div
              className="h-full bg-primary meter-fill"
              style={{ ["--final-width" as string]: `${skill.weight}%` }}
            />
          </div>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Share of placement rounds where this skill decides the outcome
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Why it matters
          </h2>
          <p className="text-sm leading-relaxed">{skill.importance}</p>
        </section>

        <section className="space-y-4">
          <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Topics to cover
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {skill.topics.map((topic, i) => (
              <div
                key={topic}
                className="flex items-center gap-3 rounded border border-border bg-surface/60 px-3 py-2"
              >
                <span className="font-mono text-[10px] text-primary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-sm">{topic}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            What interviews test
          </h2>
          <ul className="divide-y divide-border">
            {skill.interviewFocus.map((item) => (
              <li key={item} className="py-3 text-sm text-muted-foreground">
                {item}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
