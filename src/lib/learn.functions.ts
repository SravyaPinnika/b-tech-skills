import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { findLearnSubTopic, findLearnCourse, findLearnBranch } from "@/data/branch-courses";
import type { Json } from "@/integrations/supabase/types";

export interface PracticeItem {
  question: string;
  solution: string;
}

export interface InterviewItem {
  question: string;
  answer: string;
}

export interface SubTopicLesson {
  title: string;
  summary: string;
  why: string[];
  concepts: { heading: string; body: string }[];
  formulas: string[];
  example: { title: string; steps: string[]; result: string };
  diagram: string;
  realWorld: string[];
  quickRevision: string[];
  practice: PracticeItem[];
  coding: { title: string; statement: string; language: string; starterCode: string } | null;
  interview: InterviewItem[];
  project: { title: string; goal: string; steps: string[] };
}

export interface QuizQuestion {
  q: string;
  options: string[];
}

const target = z.object({
  branch: z.string().min(1).max(40),
  course: z.string().min(1).max(120),
  sub: z.string().min(1).max(120),
});

function resolve(input: { branch: string; course: string; sub: string }) {
  const branch = findLearnBranch(input.branch);
  const course = findLearnCourse(input.branch, input.course);
  const sub = findLearnSubTopic(input.branch, input.course, input.sub);
  if (!branch || !course || !sub) throw new Error("Unknown topic");
  return { branch, course, sub };
}

/* ------------------------------- lesson ---------------------------------- */

export const getSubTopicLesson = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => target.parse(d))
  .handler(async ({ data }): Promise<SubTopicLesson> => {
    const { branch, course, sub } = resolve(data);
    const { cached, askAi, str, strArr } = await import("./ai.server");
    const isCoding = sub.tags.includes("Coding");

    return cached<SubTopicLesson>(
      "learn-subtopic",
      `${branch.id}|${course.slug}|${sub.slug}`,
      async () => {
        const raw = await askAi<Record<string, unknown>>(
          [
            `Branch: ${branch.short}`,
            `Course / subject: ${course.name}`,
            `Sub-topic to teach: "${sub.name}" (${sub.difficulty} level)`,
            `Other sub-topics in this subject: ${course.subtopics.map((s) => s.name).join(", ")}`,
            "",
            "Write a complete, simple, student-friendly learning page for a B.Tech student preparing for placements.",
            "Return JSON with exactly these keys:",
            "summary (2-3 sentences, very simple words)",
            "why (array of 3-4 short reasons this matters for exams, projects and placements)",
            "concepts (array of 4-6 objects {heading, body} — body is 2-4 sentences)",
            "formulas (array of 0-5 important formulas or rules as plain strings; empty array if not relevant)",
            "example (object {title, steps: array of 3-6 short steps, result})",
            "diagram (an ASCII diagram or table, max 12 lines, that makes the idea visual; empty string if not useful)",
            "realWorld (array of 3 real-world or industry uses)",
            "quickRevision (array of 5-6 one-line takeaways)",
            "practice (array of 4 objects {question, solution} — solution is a worked answer)",
            isCoding
              ? "coding (object {title, statement, language, starterCode} — one small beginner-friendly programming task)"
              : "coding (null)",
            "interview (array of 4 objects {question, answer} — answers are model answers a student can say)",
            "project (object {title, goal, steps: array of 4-6 steps} — a small doable mini project)",
          ].join("\n"),
          "You are a patient engineering teacher. Be accurate, concrete, concise and beginner friendly. Output valid JSON only.",
        );

        const arr = (v: unknown): Record<string, unknown>[] =>
          Array.isArray(v) ? (v.filter((x) => x && typeof x === "object") as Record<string, unknown>[]) : [];

        const ex = (raw["example"] ?? {}) as Record<string, unknown>;
        const proj = (raw["project"] ?? {}) as Record<string, unknown>;
        const code = raw["coding"] as Record<string, unknown> | null | undefined;

        return {
          title: sub.name,
          summary: str(raw["summary"]),
          why: strArr(raw["why"]),
          concepts: arr(raw["concepts"]).map((c) => ({
            heading: str(c["heading"]),
            body: str(c["body"]),
          })),
          formulas: strArr(raw["formulas"]),
          example: {
            title: str(ex["title"], "Worked example"),
            steps: strArr(ex["steps"]),
            result: str(ex["result"]),
          },
          diagram: str(raw["diagram"]),
          realWorld: strArr(raw["realWorld"]),
          quickRevision: strArr(raw["quickRevision"]),
          practice: arr(raw["practice"]).map((p) => ({
            question: str(p["question"]),
            solution: str(p["solution"]),
          })),
          coding:
            isCoding && code && str(code["statement"])
              ? {
                  title: str(code["title"], sub.name),
                  statement: str(code["statement"]),
                  language: str(code["language"], "C"),
                  starterCode: str(code["starterCode"]),
                }
              : null,
          interview: arr(raw["interview"]).map((i) => ({
            question: str(i["question"]),
            answer: str(i["answer"]),
          })),
          project: {
            title: str(proj["title"], `${sub.name} mini project`),
            goal: str(proj["goal"]),
            steps: strArr(proj["steps"]),
          },
        };
      },
    );
  });

/* -------------------------------- quiz ----------------------------------- */

interface StoredQuiz {
  questions: { q: string; options: string[]; answer: number; why: string }[];
}

async function loadQuiz(input: { branch: string; course: string; sub: string }): Promise<StoredQuiz> {
  const { branch, course, sub } = resolve(input);
  const { cached, askAi } = await import("./ai.server");
  return cached<StoredQuiz>("learn-quiz", `${branch.id}|${course.slug}|${sub.slug}`, async () => {
    const gen = await askAi<StoredQuiz>(
      [
        `Branch: ${branch.short}`,
        `Subject: ${course.name}`,
        `Sub-topic: ${sub.name}`,
        "",
        "Create a 8-question multiple choice quiz on this sub-topic for a B.Tech student.",
        "Mix difficulty: 3 easy, 3 medium, 2 interview level. Exactly 4 options each, one correct.",
        'Return JSON: {"questions":[{"q":"","options":["","","",""],"answer":0,"why":""}]}',
        "answer is the 0-based index of the correct option. why is a one-sentence explanation.",
      ].join("\n"),
      "You are an examiner writing precise, unambiguous questions. Output valid JSON only.",
    );
    const questions = (gen.questions ?? [])
      .filter((q) => q && q.q && Array.isArray(q.options) && q.options.length === 4)
      .slice(0, 8)
      .map((q) => ({
        q: String(q.q),
        options: q.options.map(String),
        answer: Math.min(3, Math.max(0, Number(q.answer) || 0)),
        why: String(q.why ?? ""),
      }));
    if (questions.length < 4) throw new Error("Could not build the quiz, please retry.");
    return { questions };
  });
}

export const getSubTopicQuiz = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => target.parse(d))
  .handler(async ({ data }): Promise<QuizQuestion[]> => {
    const quiz = await loadQuiz(data);
    return quiz.questions.map(({ q, options }) => ({ q, options }));
  });

export const submitSubTopicQuiz = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    target.extend({ answers: z.array(z.number().int().min(-1).max(3)).max(20) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { branch, course, sub } = resolve(data);
    const quiz = await loadQuiz(data);
    const review = quiz.questions.map((q, i) => ({
      q: q.q,
      options: q.options,
      correct: q.answer,
      chosen: data.answers[i] ?? -1,
      why: q.why,
    }));
    const score = review.filter((r) => r.correct === r.chosen).length;
    const weak = score === review.length ? [] : [sub.name];

    await context.supabase.from("practice_attempts").insert({
      user_id: context.userId,
      branch: branch.id,
      kind: "learn-quiz",
      topic: `${course.name} — ${sub.name}`,
      score,
      total: review.length,
      weak_topics: weak,
      feedback: review as unknown as Json,
    });

    return { score, total: review.length, review };
  });
