import { BRANCHES, type BranchId } from "./branches";
import { COURSES, type Course } from "./curriculum";
import { SKILLS, type Skill } from "./skills";

/**
 * Single source of truth linking the 13 B.Tech branches to the shared course
 * and skill catalogue. Home, Profile and Courses pages all read from here.
 */

const UNIVERSAL_COURSES = [
  "core-programming-languages",
  "aptitude-reasoning",
  "english-communication",
  "interview-placement-preparation",
  "project-development",
];

const SOFTWARE_CORE = [
  "data-structures-algorithms-dsa",
  "dbms-sql",
  "object-oriented-programming",
  "operating-systems",
  "computer-networks",
];

export const BRANCH_COURSE_SLUGS: Record<BranchId, string[]> = {
  cse: [...SOFTWARE_CORE, "system-design", "web-development", "backend-development", "devops-cloud", ...UNIVERSAL_COURSES],
  it: [...SOFTWARE_CORE, "web-development", "backend-development", "devops-cloud", "system-design", ...UNIVERSAL_COURSES],
  aiml: [
    "data-structures-algorithms-dsa",
    "dbms-sql",
    "object-oriented-programming",
    "ai-ml-llm-generative-ai",
    "web-development",
    "devops-cloud",
    ...UNIVERSAL_COURSES,
  ],
  "ai-ds": [
    "data-structures-algorithms-dsa",
    "dbms-sql",
    "ai-ml-llm-generative-ai",
    "web-development",
    "devops-cloud",
    ...UNIVERSAL_COURSES,
  ],
  "cse-ds": [
    "data-structures-algorithms-dsa",
    "dbms-sql",
    "object-oriented-programming",
    "ai-ml-llm-generative-ai",
    "operating-systems",
    "web-development",
    ...UNIVERSAL_COURSES,
  ],
  "cse-cyber": [
    "data-structures-algorithms-dsa",
    "dbms-sql",
    "operating-systems",
    "computer-networks",
    "web-development",
    "devops-cloud",
    ...UNIVERSAL_COURSES,
  ],
  "cse-iot": [
    "data-structures-algorithms-dsa",
    "operating-systems",
    "computer-networks",
    "dbms-sql",
    "web-development",
    "devops-cloud",
    ...UNIVERSAL_COURSES,
  ],
  ece: [
    "data-structures-algorithms-dsa",
    "operating-systems",
    "computer-networks",
    "object-oriented-programming",
    ...UNIVERSAL_COURSES,
  ],
  eee: ["data-structures-algorithms-dsa", "operating-systems", "dbms-sql", ...UNIVERSAL_COURSES],
  mech: ["data-structures-algorithms-dsa", "dbms-sql", ...UNIVERSAL_COURSES],
  civil: ["data-structures-algorithms-dsa", "dbms-sql", ...UNIVERSAL_COURSES],
  chemical: ["data-structures-algorithms-dsa", "dbms-sql", ...UNIVERSAL_COURSES],
  quantum: [
    "data-structures-algorithms-dsa",
    "ai-ml-llm-generative-ai",
    "object-oriented-programming",
    "dbms-sql",
    ...UNIVERSAL_COURSES,
  ],
};

const UNIVERSAL_SKILLS = ["programming-language-mastery", "aptitude-communication"];

export const BRANCH_SKILL_SLUGS: Record<BranchId, string[]> = {
  cse: [
    "data-structures-algorithms",
    "dbms-sql",
    "operating-systems",
    "computer-networks",
    "system-design",
    "web-development",
    "devops-cloud",
    ...UNIVERSAL_SKILLS,
  ],
  it: [
    "data-structures-algorithms",
    "dbms-sql",
    "operating-systems",
    "computer-networks",
    "web-development",
    "devops-cloud",
    "system-design",
    ...UNIVERSAL_SKILLS,
  ],
  aiml: [
    "data-structures-algorithms",
    "machine-learning",
    "deep-learning",
    "applied-llm-genai",
    "statistics-probability",
    "dbms-sql",
    ...UNIVERSAL_SKILLS,
  ],
  "ai-ds": [
    "statistics-probability",
    "data-analysis-visualisation",
    "dbms-sql",
    "machine-learning",
    "deep-learning",
    "data-structures-algorithms",
    ...UNIVERSAL_SKILLS,
  ],
  "cse-ds": [
    "data-structures-algorithms",
    "dbms-sql",
    "statistics-probability",
    "data-analysis-visualisation",
    "machine-learning",
    ...UNIVERSAL_SKILLS,
  ],
  "cse-cyber": [
    "data-structures-algorithms",
    "operating-systems",
    "computer-networks",
    "dbms-sql",
    "devops-cloud",
    "web-development",
    ...UNIVERSAL_SKILLS,
  ],
  "cse-iot": [
    "data-structures-algorithms",
    "operating-systems",
    "computer-networks",
    "devops-cloud",
    "web-development",
    ...UNIVERSAL_SKILLS,
  ],
  ece: ["data-structures-algorithms", "operating-systems", "computer-networks", ...UNIVERSAL_SKILLS],
  eee: ["data-structures-algorithms", "operating-systems", "dbms-sql", ...UNIVERSAL_SKILLS],
  mech: ["data-structures-algorithms", "dbms-sql", "data-analysis-visualisation", ...UNIVERSAL_SKILLS],
  civil: ["data-structures-algorithms", "dbms-sql", "data-analysis-visualisation", ...UNIVERSAL_SKILLS],
  chemical: ["data-structures-algorithms", "dbms-sql", "statistics-probability", ...UNIVERSAL_SKILLS],
  quantum: [
    "statistics-probability",
    "machine-learning",
    "deep-learning",
    "data-structures-algorithms",
    "applied-llm-genai",
    ...UNIVERSAL_SKILLS,
  ],
};

export type BranchSelection = BranchId | "all";

export function branchOptions() {
  return BRANCHES;
}

/** Courses relevant to a branch, in catalogue order. `all` returns every course. */
export function coursesForBranchId(selection: BranchSelection): Course[] {
  if (selection === "all") return COURSES;
  const slugs = new Set(BRANCH_COURSE_SLUGS[selection] ?? []);
  const list = COURSES.filter((course) => slugs.has(course.slug));
  return list.length ? list : COURSES;
}

/** Skills relevant to a branch, ranked by placement weight. `all` returns every skill. */
export function skillsForBranchId(selection: BranchSelection): Skill[] {
  const list =
    selection === "all"
      ? [...SKILLS]
      : SKILLS.filter((skill) => (BRANCH_SKILL_SLUGS[selection] ?? []).includes(skill.slug));
  const ranked = (list.length ? list : [...SKILLS]).slice();
  ranked.sort((a, b) => b.weight - a.weight);
  return ranked;
}
