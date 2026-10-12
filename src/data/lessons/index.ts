import type { Lesson } from "./types";

import { arraysStringsLesson } from "./arrays-strings";
import { hashingLesson } from "./hashing-frequency-maps";
import { twoPointersLesson } from "./two-pointers-sliding-window";
import { recursionLesson } from "./recursion-backtracking";
import { sortingSearchingLesson } from "./sorting-searching";
import { linearStructuresLesson } from "./linked-lists-stacks-queues";
import { treesLesson } from "./trees-bst";
import { heapsLesson } from "./heaps-priority-queues";
import { graphsLesson } from "./graphs";
import { dpLesson } from "./dynamic-programming";
import { greedyLesson } from "./greedy-intervals";
import { complexityLesson } from "./complexity-analysis";

/** Ordered list — drives Previous / Next topic navigation. */
export const DSA_LESSONS: Lesson[] = [
  arraysStringsLesson,
  hashingLesson,
  twoPointersLesson,
  recursionLesson,
  sortingSearchingLesson,
  linearStructuresLesson,
  treesLesson,
  heapsLesson,
  graphsLesson,
  dpLesson,
  greedyLesson,
  complexityLesson,
];

export const LESSON_BY_SLUG: Record<string, Lesson> = Object.fromEntries(
  DSA_LESSONS.map((l) => [l.slug, l]),
);

/** Topic string (as used in skills.ts) -> lesson slug. */
export const LESSON_SLUG_BY_TOPIC: Record<string, string> = Object.fromEntries(
  DSA_LESSONS.map((l) => [l.topic, l.slug]),
);

export function lessonBySlug(slug: string): Lesson | undefined {
  return LESSON_BY_SLUG[slug];
}

export function lessonNeighbours(slug: string) {
  const i = DSA_LESSONS.findIndex((l) => l.slug === slug);
  return {
    index: i,
    total: DSA_LESSONS.length,
    prev: i > 0 ? DSA_LESSONS[i - 1] : undefined,
    next: i >= 0 && i < DSA_LESSONS.length - 1 ? DSA_LESSONS[i + 1] : undefined,
  };
}

export type { Lesson } from "./types";
