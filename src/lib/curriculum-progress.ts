import { useCallback, useEffect, useState } from "react";
import { COURSES, type Course } from "@/data/curriculum";

const KEY = "curriculum-progress-v1";

export interface CurriculumState {
  /** Completed subtopic keys: `${courseSlug}/${topicSlug}/${subtopicIndex}` */
  done: string[];
  /** Bookmarked topic keys: `${courseSlug}/${topicSlug}` */
  bookmarks: string[];
  /** Notes per topic key. */
  notes: Record<string, string>;
}

const EMPTY: CurriculumState = { done: [], bookmarks: [], notes: {} };

export function subKey(course: string, topic: string, index: number) {
  return `${course}/${topic}/${index}`;
}

export function topicKeyOf(course: string, topic: string) {
  return `${course}/${topic}`;
}

function read(): CurriculumState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<CurriculumState>;
    return {
      done: parsed.done ?? [],
      bookmarks: parsed.bookmarks ?? [],
      notes: parsed.notes ?? {},
    };
  } catch {
    return EMPTY;
  }
}

export function useCurriculumProgress() {
  const [state, setState] = useState<CurriculumState>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(read());
    setHydrated(true);
  }, []);

  const persist = useCallback((next: CurriculumState) => {
    setState(next);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
  }, []);

  const toggleSub = useCallback(
    (key: string) => {
      const cur = read();
      const done = cur.done.includes(key)
        ? cur.done.filter((k) => k !== key)
        : [...cur.done, key];
      persist({ ...cur, done });
    },
    [persist],
  );

  const setTopicDone = useCallback(
    (course: string, topic: string, count: number, complete: boolean) => {
      const cur = read();
      const keys = Array.from({ length: count }, (_, i) => subKey(course, topic, i));
      const done = complete
        ? Array.from(new Set([...cur.done, ...keys]))
        : cur.done.filter((k) => !keys.includes(k));
      persist({ ...cur, done });
    },
    [persist],
  );

  const toggleBookmark = useCallback(
    (key: string) => {
      const cur = read();
      const bookmarks = cur.bookmarks.includes(key)
        ? cur.bookmarks.filter((k) => k !== key)
        : [...cur.bookmarks, key];
      persist({ ...cur, bookmarks });
    },
    [persist],
  );

  const setNote = useCallback(
    (key: string, value: string) => {
      const cur = read();
      persist({ ...cur, notes: { ...cur.notes, [key]: value } });
    },
    [persist],
  );

  return { state, hydrated, toggleSub, setTopicDone, toggleBookmark, setNote };
}

export function topicPercent(
  state: CurriculumState,
  course: string,
  topic: string,
  count: number,
) {
  if (count === 0) return 0;
  let n = 0;
  for (let i = 0; i < count; i += 1) if (state.done.includes(subKey(course, topic, i))) n += 1;
  return Math.round((n / count) * 100);
}

export function coursePercent(state: CurriculumState, course: Course) {
  const total = course.topics.reduce((a, t) => a + t.subtopics.length, 0);
  if (total === 0) return 0;
  const done = course.topics.reduce(
    (a, t) =>
      a +
      t.subtopics.filter((_, i) => state.done.includes(subKey(course.slug, t.slug, i))).length,
    0,
  );
  return Math.round((done / total) * 100);
}

export function overallCurriculumPercent(state: CurriculumState) {
  const total = COURSES.reduce(
    (a, c) => a + c.topics.reduce((b, t) => b + t.subtopics.length, 0),
    0,
  );
  if (total === 0) return 0;
  return Math.round((state.done.length / total) * 100);
}
