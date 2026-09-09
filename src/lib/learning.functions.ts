import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { COURSE_MAP, type Course, type CurriculumTopic } from "@/data/curriculum";
import type { Json } from "@/integrations/supabase/types";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface ConceptContent {
  definition: string;
  explanation: string[];
  keyPoints: string[];
  example: string;
  code?: string | undefined;
  codeLanguage?: string | undefined;
  diagram?: string | undefined;
  interviewTip: string;
}

export interface McqQuestion {
  q: string;
  options: string[];
}

export interface McqExam {
  questions: McqQuestion[];
}

export interface CodingTask {
  title: string;
  statement: string;
  schema?: string | undefined;
  inputFormat?: string | undefined;
  outputFormat?: string | undefined;
  examples: { input: string; output: string; explanation?: string | undefined }[];
  constraints: string[];
  starterCode: string;
}

export interface CodingTest {
  language: string;
  tasks: CodingTask[];
}

export interface CodingGrade {
  score: number;
  total: number;
  verdicts: { task: string; passed: boolean; feedback: string }[];
  overall: string;
}

export interface AttemptRow {
  id: string;
  kind: string;
  score: number;
  total: number;
  created_at: string;
}

export const CODING_LANGUAGES = ["C", "C++", "Python", "JavaScript"] as const;

/** Courses where a hands-on coding / query test makes sense. */
export function codingTestKind(course: Course): "sql" | "code" | null {
  if (course.slug === "dbms-sql") return "sql";
  if (course.kind === "coding") return "code";
  if (
    course.slug === "core-programming-languages" ||
    course.slug === "object-oriented-programming" ||
    course.slug === "web-development" ||
    course.slug === "backend-development"
  )
    return "code";
  return null;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function resolve(courseSlug: string, topicSlug: string): { course: Course; topic: CurriculumTopic } {
  const course = COURSE_MAP[courseSlug];
  const topic = course?.topics.find((t) => t.slug === topicSlug);
  if (!course || !topic) throw new Error("Unknown course or topic");
  return { course, topic };
}

async function askAi<T>(prompt: string, system: string): Promise<T> {
  const aiKey = process.env["LOVABLE_API_KEY"];
  if (!aiKey) throw new Error("AI is not configured");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": aiKey,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: "google/gemini-3.7-flash",
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (res.status === 429) throw new Error("Too many requests right now — please try again in a minute.");
  if (res.status === 402) throw new Error("AI usage limit reached. Please add credits to continue.");
  if (!res.ok) throw new Error(`AI request failed (${res.status})`);
  const payload = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = payload.choices?.[0]?.message?.content ?? "{}";
  return JSON.parse(content) as T;
}

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

const topicInput = z.object({ course: z.string(), topic: z.string() });

/* ------------------------------------------------------------------ */
/* Concept content                                                     */
/* ------------------------------------------------------------------ */

export const getConceptContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => topicInput.extend({ index: z.number().int().min(0) }).parse(d))
  .handler(async ({ data, context }): Promise<ConceptContent> => {
    const { course, topic } = resolve(data.course, data.topic);
    const title = topic.subtopics[data.index];
    if (!title) throw new Error("Unknown concept");

    const { data: cached } = await context.supabase
      .from("concept_content")
      .select("content")
      .eq("course_slug", course.slug)
      .eq("topic_slug", topic.slug)
      .eq("sub_index", data.index)
      .maybeSingle();
    if (cached?.content) return cached.content as unknown as ConceptContent;

    const codeish = codingTestKind(course) !== null;
    const content = await askAi<ConceptContent>(
      [
        `Course: ${course.title}`,
        `Topic: ${topic.title} (${topic.difficulty} level)`,
        `Concept to teach: "${title}"`,
        `Sibling concepts in this topic: ${topic.subtopics.join(", ")}`,
        "",
        "Write a complete, student-friendly lesson for a B.Tech student preparing for placements.",
        "Return JSON with exactly these keys:",
        "definition (1-2 sentences, simple words)",
        "explanation (array of 3-5 short paragraphs, building from basics to how it works)",
        "keyPoints (array of 4-6 crisp bullet points to remember)",
        "example (a concrete worked example in plain text, with numbers or a scenario)",
        codeish
          ? `code (a short, correct code snippet — use ${course.slug === "dbms-sql" ? "SQL" : "C"} unless the concept is language specific), codeLanguage`
          : "code (omit or empty string)",
        "diagram (an ASCII diagram or table, max 12 lines, that visualises the idea; empty string if not useful)",
        "interviewTip (1-2 sentences: how interviewers ask about this and what to say)",
      ].join("\n"),
      "You are a patient computer science teacher. Be accurate, concrete and concise. Output valid JSON only.",
    );

    const clean: ConceptContent = {
      definition: String(content.definition ?? ""),
      explanation: Array.isArray(content.explanation) ? content.explanation.map(String) : [],
      keyPoints: Array.isArray(content.keyPoints) ? content.keyPoints.map(String) : [],
      example: String(content.example ?? ""),
      code: content.code ? String(content.code) : undefined,
      codeLanguage: content.codeLanguage ? String(content.codeLanguage) : undefined,
      diagram: content.diagram ? String(content.diagram) : undefined,
      interviewTip: String(content.interviewTip ?? ""),
    };

    const db = await admin();
    await db.from("concept_content").upsert(
      {
        course_slug: course.slug,
        topic_slug: topic.slug,
        sub_index: data.index,
        title,
        content: clean as unknown as Json,
      },
      { onConflict: "course_slug,topic_slug,sub_index" },
    );
    return clean;
  });

/* ------------------------------------------------------------------ */
/* MCQ exam                                                            */
/* ------------------------------------------------------------------ */

interface StoredMcq extends McqQuestion {
  answer: number;
  why: string;
}

async function loadMcq(course: Course, topic: CurriculumTopic): Promise<StoredMcq[]> {
  const db = await admin();
  const { data: cached } = await db
    .from("topic_exams")
    .select("payload")
    .eq("course_slug", course.slug)
    .eq("topic_slug", topic.slug)
    .eq("kind", "mcq")
    .eq("language", "")
    .maybeSingle();
  if (cached?.payload) return (cached.payload as unknown as { questions: StoredMcq[] }).questions;

  const gen = await askAi<{ questions: StoredMcq[] }>(
    [
      `Course: ${course.title}`,
      `Topic: ${topic.title}`,
      `Concepts covered: ${topic.subtopics.join(", ")}`,
      "",
      "Create a 10-question multiple choice exam for a B.Tech placement aspirant.",
      "Mix difficulty: 3 easy, 4 medium, 3 hard (interview style). Cover different concepts; avoid trivia.",
      'Return JSON: {"questions":[{"q":"","options":["","","",""],"answer":0,"why":""}]}',
      "answer is the 0-based index of the correct option. why is a one-sentence explanation.",
    ].join("\n"),
    "You are an examiner writing precise, unambiguous questions. Exactly 4 options each. Output valid JSON only.",
  );
  const questions = (gen.questions ?? [])
    .filter((q) => q && q.q && Array.isArray(q.options) && q.options.length === 4)
    .slice(0, 10)
    .map((q) => ({
      q: String(q.q),
      options: q.options.map(String),
      answer: Math.min(3, Math.max(0, Number(q.answer) || 0)),
      why: String(q.why ?? ""),
    }));
  if (questions.length < 5) throw new Error("Could not build the exam, please retry.");

  await db.from("topic_exams").upsert(
    {
      course_slug: course.slug,
      topic_slug: topic.slug,
      kind: "mcq",
      language: "",
      payload: { questions } as unknown as Json,
    },
    { onConflict: "course_slug,topic_slug,kind,language" },
  );
  return questions;
}

export const getTopicExam = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => topicInput.parse(d))
  .handler(async ({ data }): Promise<McqExam> => {
    const { course, topic } = resolve(data.course, data.topic);
    const qs = await loadMcq(course, topic);
    return { questions: qs.map(({ q, options }) => ({ q, options })) };
  });

export const submitTopicExam = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => topicInput.extend({ answers: z.array(z.number().int().min(-1).max(3)) }).parse(d))
  .handler(async ({ data, context }) => {
    const { course, topic } = resolve(data.course, data.topic);
    const qs = await loadMcq(course, topic);
    const review = qs.map((q, i) => ({
      correct: q.answer,
      chosen: data.answers[i] ?? -1,
      why: q.why,
    }));
    const score = review.filter((r) => r.correct === r.chosen).length;
    await context.supabase.from("exam_attempts").insert({
      user_id: context.userId,
      course_slug: course.slug,
      topic_slug: topic.slug,
      kind: "mcq",
      score,
      total: qs.length,
      feedback: review as unknown as Json,
    });
    return { score, total: qs.length, review };
  });

/* ------------------------------------------------------------------ */
/* Coding / SQL test                                                   */
/* ------------------------------------------------------------------ */

export const getCodingTest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => topicInput.extend({ language: z.string().max(20) }).parse(d))
  .handler(async ({ data }): Promise<CodingTest> => {
    const { course, topic } = resolve(data.course, data.topic);
    const kind = codingTestKind(course);
    if (!kind) throw new Error("This course has no coding test");
    const language = kind === "sql" ? "SQL" : data.language || "C";


    const db = await admin();
    const { data: cached } = await db
      .from("topic_exams")
      .select("payload")
      .eq("course_slug", course.slug)
      .eq("topic_slug", topic.slug)
      .eq("kind", "coding")
      .eq("language", language)
      .maybeSingle();
    if (cached?.payload) return cached.payload as unknown as CodingTest;

    const gen = await askAi<{ tasks: CodingTask[] }>(
      [
        `Course: ${course.title}`,
        `Topic: ${topic.title}`,
        `Concepts: ${topic.subtopics.join(", ")}`,
        `Language: ${language}`,
        "",
        kind === "sql"
          ? "Create 3 SQL query tasks (easy, medium, hard) on this topic. Each task must include a small `schema` (CREATE TABLE statements plus 4-6 sample rows as INSERTs) and the expected result described in examples."
          : `Create 3 coding problems (easy, medium, hard) on this topic, to be solved in ${language}. Each with inputFormat, outputFormat, 2 examples with explanation, constraints, and starterCode (a function signature / main skeleton in ${language}).`,
        'Return JSON: {"tasks":[{"title":"","statement":"","schema":"","inputFormat":"","outputFormat":"","examples":[{"input":"","output":"","explanation":""}],"constraints":[""],"starterCode":""}]}',
      ].join("\n"),
      "You are a placement coding-round setter. Problems must be unambiguous and solvable in 15 minutes each. Output valid JSON only.",
    );
    const tasks = (gen.tasks ?? []).slice(0, 3).map((t) => ({
      title: String(t.title ?? "Task"),
      statement: String(t.statement ?? ""),
      schema: t.schema ? String(t.schema) : undefined,
      inputFormat: t.inputFormat ? String(t.inputFormat) : undefined,
      outputFormat: t.outputFormat ? String(t.outputFormat) : undefined,
      examples: Array.isArray(t.examples)
        ? t.examples.map((e) => ({
            input: String(e.input ?? ""),
            output: String(e.output ?? ""),
            explanation: e.explanation ? String(e.explanation) : undefined,
          }))
        : [],
      constraints: Array.isArray(t.constraints) ? t.constraints.map(String) : [],
      starterCode: String(t.starterCode ?? ""),
    }));
    if (tasks.length === 0) throw new Error("Could not build the test, please retry.");

    const test: CodingTest = { language, tasks };
    await db.from("topic_exams").upsert(
      {
        course_slug: course.slug,
        topic_slug: topic.slug,
        kind: "coding",
        language,
        payload: test as unknown as Json,
      },
      { onConflict: "course_slug,topic_slug,kind,language" },
    );
    return test;
  });

export const gradeCodingTest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    topicInput
      .extend({
        language: z.string().max(20),
        solutions: z.array(z.string().max(20_000)).max(3),
      })
      .parse(d),
  )
  .handler(async ({ data, context }): Promise<CodingGrade> => {
    const { course, topic } = resolve(data.course, data.topic);
    const kind = codingTestKind(course);
    if (!kind) throw new Error("This course has no coding test");
    const language = kind === "sql" ? "SQL" : data.language || "Java";

    const db = await admin();
    const { data: cached } = await db
      .from("topic_exams")
      .select("payload")
      .eq("course_slug", course.slug)
      .eq("topic_slug", topic.slug)
      .eq("kind", "coding")
      .eq("language", language)
      .maybeSingle();
    if (!cached?.payload) throw new Error("Start the test before submitting");
    const test = cached.payload as unknown as CodingTest;

    const graded = await askAi<{ verdicts: { passed: boolean; feedback: string }[]; overall: string }>(
      [
        `You are grading a ${language} coding round for topic "${topic.title}".`,
        ...test.tasks.map((t, i) =>
          [
            `--- TASK ${i + 1}: ${t.title}`,
            t.statement,
            t.schema ? `Schema:\n${t.schema}` : "",
            `Examples: ${JSON.stringify(t.examples)}`,
            `--- STUDENT SOLUTION ${i + 1}:`,
            data.solutions[i]?.trim() ? data.solutions[i] : "(no answer)",
          ].join("\n"),
        ),
        "",
        "For each task, mentally execute the solution on the examples and edge cases. Mark passed=true only if it is correct and complete. Give 2-3 sentences of specific feedback (bugs, missed edge cases, complexity, style).",
        'Return JSON: {"verdicts":[{"passed":true,"feedback":""}],"overall":""}',
      ].join("\n"),
      "You are a strict but encouraging technical interviewer. Output valid JSON only.",
    );

    const verdicts = test.tasks.map((t, i) => ({
      task: t.title,
      passed: Boolean(graded.verdicts?.[i]?.passed),
      feedback: String(graded.verdicts?.[i]?.feedback ?? ""),
    }));
    const score = verdicts.filter((v) => v.passed).length;
    const result: CodingGrade = {
      score,
      total: test.tasks.length,
      verdicts,
      overall: String(graded.overall ?? ""),
    };
    await context.supabase.from("exam_attempts").insert({
      user_id: context.userId,
      course_slug: course.slug,
      topic_slug: topic.slug,
      kind: "coding",
      score,
      total: test.tasks.length,
      feedback: result as unknown as Json,
    });
    return result;
  });

/* ------------------------------------------------------------------ */
/* Attempts                                                            */
/* ------------------------------------------------------------------ */

export const listTopicAttempts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => topicInput.parse(d))
  .handler(async ({ data, context }): Promise<AttemptRow[]> => {
    const { data: rows } = await context.supabase
      .from("exam_attempts")
      .select("id, kind, score, total, created_at")
      .eq("course_slug", data.course)
      .eq("topic_slug", data.topic)
      .order("created_at", { ascending: false })
      .limit(10);
    return (rows ?? []) as AttemptRow[];
  });
