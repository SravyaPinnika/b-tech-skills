import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getConceptContent, type ConceptContent } from "@/lib/learning.functions";

interface Props {
  course: string;
  topic: string;
  index: number;
  title: string;
  done: boolean;
  onToggle: () => void;
}

export function ConceptPanel({ course, topic, index, title, done, onToggle }: Props) {
  const [open, setOpen] = useState(false);
  const fetchContent = useServerFn(getConceptContent);
  const query = useQuery({
    queryKey: ["concept", course, topic, index],
    queryFn: () => fetchContent({ data: { course, topic, index } }),
    enabled: open,
    staleTime: Infinity,
    retry: 1,
  });

  return (
    <li className="rounded-sm border border-border bg-card">
      <div className="flex items-center gap-3 px-3 py-2.5">
        <button
          onClick={onToggle}
          aria-label={done ? "Mark not done" : "Mark done"}
          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border text-[9px] ${
            done ? "border-primary bg-primary text-primary-foreground" : "border-border"
          }`}
        >
          {done ? "✓" : ""}
        </button>
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex flex-1 items-center justify-between gap-3 text-left"
        >
          <span className={`text-sm ${done ? "text-muted-foreground line-through" : "font-medium"}`}>
            {title}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-primary">
            {open ? "Hide" : "Learn"}
          </span>
        </button>
      </div>

      {open && (
        <div className="border-t border-border px-4 py-4">
          {query.isPending && (
            <p className="animate-pulse text-xs text-muted-foreground">Preparing your lesson…</p>
          )}
          {query.isError && (
            <div className="text-xs text-destructive">
              {(query.error as Error).message}{" "}
              <button onClick={() => query.refetch()} className="underline">
                Retry
              </button>
            </div>
          )}
          {query.data && <ConceptBody c={query.data} />}
        </div>
      )}
    </li>
  );
}

function ConceptBody({ c }: { c: ConceptContent }) {
  return (
    <div className="space-y-4 text-sm">
      <p className="font-semibold leading-relaxed">{c.definition}</p>
      <div className="space-y-2 text-muted-foreground">
        {c.explanation.map((p, i) => (
          <p key={i} className="leading-relaxed">
            {p}
          </p>
        ))}
      </div>
      {c.diagram && (
        <pre className="overflow-x-auto rounded-sm border border-border bg-background p-3 font-mono text-[11px] leading-snug">
          {c.diagram}
        </pre>
      )}
      {c.keyPoints.length > 0 && (
        <div>
          <h4 className="font-mono text-[10px] uppercase tracking-widest text-primary">Key points</h4>
          <ul className="mt-1.5 list-disc space-y-1 pl-5 text-muted-foreground">
            {c.keyPoints.map((k, i) => (
              <li key={i}>{k}</li>
            ))}
          </ul>
        </div>
      )}
      <div>
        <h4 className="font-mono text-[10px] uppercase tracking-widest text-primary">Example</h4>
        <p className="mt-1.5 leading-relaxed text-muted-foreground">{c.example}</p>
      </div>
      {c.code && (
        <div>
          <h4 className="font-mono text-[10px] uppercase tracking-widest text-primary">
            {c.codeLanguage ?? "Code"}
          </h4>
          <pre className="mt-1.5 overflow-x-auto rounded-sm border border-border bg-background p-3 font-mono text-[11px] leading-snug">
            {c.code}
          </pre>
        </div>
      )}
      <p className="rounded-sm border border-primary/30 bg-primary/5 p-3 text-xs leading-relaxed">
        <span className="font-semibold text-primary">Interview tip: </span>
        {c.interviewTip}
      </p>
    </div>
  );
}
