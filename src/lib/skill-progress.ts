import { useCallback, useEffect, useState } from "react";

export type TopicStatus = "not-started" | "in-progress" | "completed";

const KEY = "skill-progress-v1";

/** Map of `${skillSlug}::${topicIndex}` -> status. */
export type SkillProgressState = Record<string, TopicStatus>;

export function topicKey(skillSlug: string, topicIndex: number) {
  return `${skillSlug}::${topicIndex}`;
}

export function readSkillProgress(): SkillProgressState {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SkillProgressState) : {};
  } catch {
    return {};
  }
}

const NEXT: Record<TopicStatus, TopicStatus> = {
  "not-started": "in-progress",
  "in-progress": "completed",
  completed: "not-started",
};

export function useSkillProgress() {
  const [state, setState] = useState<SkillProgressState>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(readSkillProgress());
    setHydrated(true);
  }, []);

  const persist = useCallback((next: SkillProgressState) => {
    setState(next);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
  }, []);

  const setStatus = useCallback(
    (key: string, status: TopicStatus) => {
      const next = { ...readSkillProgress(), [key]: status };
      persist(next);
    },
    [persist],
  );

  const cycleStatus = useCallback(
    (key: string) => {
      const current = readSkillProgress();
      persist({ ...current, [key]: NEXT[current[key] ?? "not-started"] });
    },
    [persist],
  );

  return { state, hydrated, setStatus, cycleStatus };
}

/** Fraction 0-100 of a skill's topics completed (in-progress counts as half). */
export function skillPercent(
  state: SkillProgressState,
  skillSlug: string,
  topicCount: number,
): number {
  if (topicCount === 0) return 0;
  let score = 0;
  for (let i = 0; i < topicCount; i += 1) {
    const status = state[topicKey(skillSlug, i)];
    if (status === "completed") score += 1;
    else if (status === "in-progress") score += 0.5;
  }
  return Math.round((score / topicCount) * 100);
}
