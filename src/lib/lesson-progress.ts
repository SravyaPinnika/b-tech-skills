import { useCallback, useEffect, useState } from "react";

const KEY = "dsa-progress-v1";

export interface ProgressState {
  /** Completed lesson slugs. */
  topics: string[];
  /** Completed concept ids: `${slug}::${index}`. */
  concepts: string[];
  /** Solved problem ids: `${slug}::${problemId}`. */
  problems: string[];
}

const EMPTY: ProgressState = { topics: [], concepts: [], problems: [] };

function read(): ProgressState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    return {
      topics: parsed.topics ?? [],
      concepts: parsed.concepts ?? [],
      problems: parsed.problems ?? [],
    };
  } catch {
    return EMPTY;
  }
}

function toggle(list: string[], id: string) {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

/** Client-side progress tracking backed by localStorage. */
export function useLessonProgress() {
  const [state, setState] = useState<ProgressState>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(read());
    setHydrated(true);
  }, []);

  const persist = useCallback((next: ProgressState) => {
    setState(next);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable — keep in-memory state */
    }
  }, []);

  const toggleTopic = useCallback(
    (slug: string) => persist({ ...read(), topics: toggle(read().topics, slug) }),
    [persist],
  );
  const toggleConcept = useCallback(
    (id: string) => persist({ ...read(), concepts: toggle(read().concepts, id) }),
    [persist],
  );
  const toggleProblem = useCallback(
    (id: string) => persist({ ...read(), problems: toggle(read().problems, id) }),
    [persist],
  );

  return { state, hydrated, toggleTopic, toggleConcept, toggleProblem };
}
