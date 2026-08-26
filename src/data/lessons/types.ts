/** Shared shape for a full DSA lesson page. */

export interface CodeBlock {
  title: string;
  code: string;
  /** Line-by-line / important-line explanations. */
  explain: string[];
}

export interface Concept {
  heading: string;
  /** Simple paragraphs, beginner level. */
  body: string[];
  code?: CodeBlock;
  /** Optional monospace diagram. */
  diagram?: string;
}

export interface Pattern {
  name: string;
  what: string;
  when: string;
  identify: string;
  example: string;
  code: string;
}

export interface WorkedExample {
  title: string;
  input: string;
  steps: string[];
  output: string;
}

export type ProblemLevel = "Beginner" | "Intermediate" | "Interview";

export interface Problem {
  id: string;
  title: string;
  level: ProblemLevel;
  statement: string;
  input: string;
  output: string;
  approach: string;
  steps: string[];
  code: string;
  time: string;
  space: string;
}

export interface Mistake {
  mistake: string;
  fix: string;
}

export interface InterviewQA {
  q: string;
  a: string;
}

export interface ComplexityRow {
  operation: string;
  time: string;
  space: string;
  note?: string;
}

export interface Lesson {
  /** URL slug, e.g. "arrays-strings". */
  slug: string;
  /** Must equal the topic string used in src/data/skills.ts. */
  topic: string;
  title: string;
  blurb: string;
  overview: {
    simple: string[];
    whyLearn: string[];
    realWorld: string[];
  };
  coreConcepts: Concept[];
  javaSyntax: CodeBlock[];
  patterns: Pattern[];
  examples: WorkedExample[];
  problems: Problem[];
  mistakes: Mistake[];
  interviewQuestions: InterviewQA[];
  practice: { easy: string[]; medium: string[]; hard: string[] };
  complexity: ComplexityRow[];
  revision: {
    concepts: string[];
    rules: string[];
    patterns: string[];
    syntax: string[];
    problems: string[];
  };
}
