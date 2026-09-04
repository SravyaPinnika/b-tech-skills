import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthButton } from "@/components/AuthButton";
import { listTools, type ToolRow } from "@/lib/tools.functions";

export const Route = createFileRoute("/_authenticated/tools")({
  loader: () => listTools(),
  head: () => ({
    meta: [
      { title: "Weekly Tools Feed — Placement Ascent" },
      {
        name: "description",
        content:
          "An automatically updated weekly feed of tools, frameworks and platforms B.Tech students should know for placements, tagged by branch and category.",
      },
      { property: "og:title", content: "Weekly Tools Feed — Placement Ascent" },
      {
        property: "og:description",
        content:
          "New tools added every week, tagged by branch (CSE, IT, AIML, DS) with why each one matters for interviews.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ToolsPage,
  errorComponent: () => (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="text-xl font-bold tracking-tight">The tools feed didn't load</h1>
      <p className="mt-2 text-sm text-muted-foreground">Refresh the page to try again.</p>
    </div>
  ),
});

function ToolsPage() {
  const { tools, lastRunAt, currentWeek } = Route.useLoaderData();
  const newThisWeek = tools.filter((t) => t.added_week >= currentWeek).length;

  const grouped = tools.reduce<Record<string, ToolRow[]>>((acc, tool) => {
    (acc[tool.category] ??= []).push(tool);
    return acc;
  }, {});

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link to="/" className="font-mono text-xs uppercase tracking-tighter text-muted-foreground">
            ← Roadmap
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/jobs"
              className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
            >
              Jobs
            </Link>
            <div className="flex items-center gap-1.5">
              <span className="size-2 animate-pulse rounded-full bg-primary" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-primary">
                Auto-updated weekly
              </span>
            </div>
            <AuthButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-12 px-4 py-8">
        <section className="flex items-end justify-between gap-4 border-b border-border pb-4 rise">
          <div>
            <h1 className="text-4xl font-black tracking-tighter">Weekly Stack</h1>
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

        {Object.entries(grouped).map(([category, items]) => (
          <section key={category} className="space-y-2">
            <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              {category}
            </h2>
            <div className="divide-y divide-border">
              {items.map((tool, i) => (
                <article key={tool.id} className="flex items-start gap-4 py-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-surface-strong font-mono text-xs text-primary">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {tool.url ? (
                        <a
                          href={tool.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-bold tracking-tight hover:text-primary"
                        >
                          {tool.name}
                        </a>
                      ) : (
                        <h3 className="text-sm font-bold tracking-tight">{tool.name}</h3>
                      )}
                      {tool.added_week >= currentWeek && (
                        <span className="rounded-xs bg-foreground px-1.5 py-0.5 text-[9px] font-bold text-background">
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{tool.description}</p>
                    {tool.why_it_matters && (
                      <p className="mt-1 text-xs text-foreground/70">{tool.why_it_matters}</p>
                    )}
                  </div>
                  <div className="shrink-0 font-mono text-[10px] uppercase text-muted-foreground">
                    {tool.branches.join(" ")}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}

        {tools.length === 0 && (
          <p className="font-mono text-xs text-muted-foreground">
            No tools indexed yet — the weekly refresh will populate this feed.
          </p>
        )}

        <footer className="border-t border-border/50 pt-12 pb-8 text-center">
          <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            — Ascent Protocol —
          </div>
        </footer>
      </main>
    </div>
  );
}
