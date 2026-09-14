/**
 * Branch → Course → Sub-topic catalogue.
 *
 * Derived from the branch subject data so the whole platform stays in sync:
 * adding a subject or topic in `branch-subjects.ts` automatically appears here.
 */
import { BRANCHES, type BranchId } from "./branches";
import { BRANCH_SUBJECTS, type SubjectDifficulty } from "./branch-subjects";

export type LearnTag = "Theory" | "Practical" | "Interview" | "Coding" | "Project";

export interface LearnSubTopic {
  slug: string;
  name: string;
  description: string;
  difficulty: SubjectDifficulty;
  minutes: number;
  tags: LearnTag[];
}

export interface LearnCourse {
  slug: string;
  name: string;
  description: string;
  difficulty: SubjectDifficulty;
  /** Existing curriculum course this subject maps to, when one exists. */
  courseSlug?: string | undefined;
  subtopics: LearnSubTopic[];
}

export interface LearnBranch {
  id: BranchId;
  label: string;
  short: string;
  courses: LearnCourse[];
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\+/g, "p")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const CODING_WORDS = [
  "programming",
  "program",
  "code",
  "coding",
  "python",
  "java",
  "sql",
  "query",
  "data structure",
  "algorithm",
  "web",
  "script",
  "qiskit",
  "circuit",
  "matlab",
];

const PRACTICAL_WORDS = [
  "design",
  "lab",
  "process",
  "system",
  "machine",
  "network",
  "analysis",
  "measurement",
  "cad",
  "survey",
  "manufactur",
  "deployment",
  "security",
  "testing",
  "visual",
];

const MINUTES: Record<SubjectDifficulty, number> = {
  Beginner: 30,
  Intermediate: 45,
  Advanced: 60,
};

function tagsFor(subject: string, topic: string, difficulty: SubjectDifficulty): LearnTag[] {
  const hay = `${subject} ${topic}`.toLowerCase();
  const tags: LearnTag[] = ["Theory"];
  if (CODING_WORDS.some((w) => hay.includes(w))) tags.push("Coding");
  if (PRACTICAL_WORDS.some((w) => hay.includes(w))) tags.push("Practical");
  tags.push("Interview");
  if (difficulty !== "Beginner") tags.push("Project");
  return tags;
}

function describe(subject: string, topic: string, difficulty: SubjectDifficulty): string {
  const depth =
    difficulty === "Beginner"
      ? "Start from the basics"
      : difficulty === "Intermediate"
        ? "Build solid working understanding"
        : "Go deep, the way interviewers expect";
  return `${depth} of ${topic} as part of ${subject} — explanation, worked example, practice and interview questions.`;
}

export const LEARN_BRANCHES: LearnBranch[] = BRANCHES.map((branch) => ({
  id: branch.id,
  label: branch.label,
  short: branch.short,
  courses: (BRANCH_SUBJECTS[branch.id] ?? []).map((subject) => ({
    slug: slugify(subject.name),
    name: subject.name,
    description: subject.description,
    difficulty: subject.difficulty,
    courseSlug: subject.courseSlug,
    subtopics: subject.topics.map((topic) => ({
      slug: slugify(topic),
      name: topic,
      description: describe(subject.name, topic, subject.difficulty),
      difficulty: subject.difficulty,
      minutes: MINUTES[subject.difficulty],
      tags: tagsFor(subject.name, topic, subject.difficulty),
    })),
  })),
}));

export const LEARN_BRANCH_MAP: Record<string, LearnBranch> = Object.fromEntries(
  LEARN_BRANCHES.map((b) => [b.id, b]),
);

export function findLearnBranch(branchId: string): LearnBranch | undefined {
  return LEARN_BRANCH_MAP[branchId];
}

export function findLearnCourse(branchId: string, courseSlug: string): LearnCourse | undefined {
  return findLearnBranch(branchId)?.courses.find((c) => c.slug === courseSlug);
}

export function findLearnSubTopic(
  branchId: string,
  courseSlug: string,
  subSlug: string,
): LearnSubTopic | undefined {
  return findLearnCourse(branchId, courseSlug)?.subtopics.find((s) => s.slug === subSlug);
}

/** Total number of sub-topics in a branch. */
export function branchTopicCount(branch: LearnBranch): number {
  return branch.courses.reduce((n, c) => n + c.subtopics.length, 0);
}

/** Progress key used in `user_progress` for a learned sub-topic. */
export function subTopicKey(branchId: string, courseSlug: string, subSlug: string): string {
  return `${branchId}/${courseSlug}/${subSlug}`;
}

export interface LearnSearchHit {
  branch: LearnBranch;
  course: LearnCourse;
  sub: LearnSubTopic;
}

export function searchLearn(query: string, limit = 40): LearnSearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const hits: LearnSearchHit[] = [];
  for (const branch of LEARN_BRANCHES) {
    for (const course of branch.courses) {
      for (const sub of course.subtopics) {
        const hay = `${branch.label} ${branch.short} ${course.name} ${sub.name} ${sub.tags.join(" ")}`.toLowerCase();
        if (hay.includes(q)) hits.push({ branch, course, sub });
        if (hits.length >= limit) return hits;
      }
    }
  }
  return hits;
}
