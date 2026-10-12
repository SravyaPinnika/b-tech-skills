import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { branchInfo, INTERVIEW_KINDS } from "@/data/branches";
import type { Json } from "@/integrations/supabase/types";

export interface InterviewQA {
  question: string;
  answer: string;
  tip: string;
}

export interface InterviewSet {
  title: string;
  intro: string;
  questions: InterviewQA[];
}

export interface CompanyPrep {
  company: string;
  rounds: string[];
  topics: string[];
  questions: string[];
  tips: string[];
  eligibility: string;
}

const kindIds = INTERVIEW_KINDS.map((k) => k.id) as [string, ...string[]];

export const getInterviewSet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ branch: z.string().min(1).max(40), kind: z.enum(kindIds) }).parse(d),
  )
  .handler(async ({ data }): Promise<InterviewSet> => {
    const b = branchInfo(data.branch);
    const { cached, askAi, str } = await import("./ai.server");

    return cached<InterviewSet>("interview", `${b.id}|${data.kind}`, async () => {
      const ask: Record<string, string> = {
        technical: `12 technical interview questions on the core subjects of ${b.short} (${b.coreSubjects.join(", ")}), from basics to depth.`,
        hr: "12 HR and behavioural interview questions Indian campus panels actually ask, with model answers a fresher can adapt.",
        coding: `10 coding interview questions to be solved in ${b.codingLanguage}, with the approach, complexity and a short code sketch inside the answer.`,
        mock: `A 12-question mock interview flow for a ${b.short} fresher: introduction, project deep-dive, core subject questions, situational questions, closing questions — in the order a real panel asks them.`,
        company: `12 frequently asked interview questions across these recruiters: ${b.companies.join(", ")}.`,
      };
      const gen = await askAi<InterviewSet>(
        [
          `Branch: ${b.short}`,
          `Target jobs: ${b.targetJobs.join(", ")}`,
          "",
          ask[data.kind] ?? ask["technical"]!,
          "Return JSON:",
          '{"title":"","intro":"","questions":[{"question":"","answer":"","tip":""}]}',
          "answer: a complete model answer of 3-6 sentences (or steps) that a student can speak out loud.",
          "tip: one sentence on what the interviewer is really checking.",
        ].join("\n"),
        "You are an interview panel member and placement trainer for Indian engineering colleges. Answers must be accurate and speakable. Output valid JSON only.",
      );
      const questions = (Array.isArray(gen.questions) ? gen.questions : [])
        .slice(0, 14)
        .map((q) => ({
          question: str(q?.question),
          answer: str(q?.answer),
          tip: str(q?.tip),
        }))
        .filter((q) => q.question && q.answer);
      if (questions.length < 4) throw new Error("Could not build the question set — please retry.");
      return { title: str(gen.title, b.label), intro: str(gen.intro), questions };
    });
  });

export const getCompanyPrep = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({ branch: z.string().min(1).max(40), company: z.string().min(1).max(80) })
      .parse(d),
  )
  .handler(async ({ data }): Promise<CompanyPrep> => {
    const b = branchInfo(data.branch);
    const { cached, askAi, str, strArr } = await import("./ai.server");

    return cached<CompanyPrep>("company", `${b.id}|${data.company}`, async () => {
      const gen = await askAi<CompanyPrep>(
        [
          `Company: ${data.company}`,
          `Candidate branch: ${b.short}`,
          `Roles they hire for: ${b.targetJobs.join(", ")}`,
          "",
          "Describe how a B.Tech fresher should prepare for this company's campus/off-campus hiring.",
          "Return JSON:",
          '{"company":"","rounds":[""],"topics":[""],"questions":[""],"tips":[""],"eligibility":""}',
          "rounds: the actual hiring stages in order. topics: 6-10 topics they test. questions: 8 questions they commonly ask. tips: 4-6 practical tips. eligibility: typical CGPA/backlog/branch criteria in one or two sentences.",
        ].join("\n"),
        "You are a campus placement coordinator with accurate knowledge of Indian hiring processes. If unsure about a detail, describe the typical pattern rather than inventing specifics. Output valid JSON only.",
      );
      return {
        company: str(gen.company, data.company),
        rounds: strArr(gen.rounds),
        topics: strArr(gen.topics),
        questions: strArr(gen.questions),
        tips: strArr(gen.tips),
        eligibility: str(gen.eligibility),
      };
    });
  });

export interface MockFeedback {
  score: number;
  strengths: string[];
  improvements: string[];
  modelAnswer: string;
}

export const gradeMockAnswer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        branch: z.string().min(1).max(40),
        question: z.string().min(1).max(1000),
        answer: z.string().min(1).max(4000),
      })
      .parse(d),
  )
  .handler(async ({ data, context }): Promise<MockFeedback> => {
    const b = branchInfo(data.branch);
    const { askAi, str, strArr } = await import("./ai.server");
    const gen = await askAi<MockFeedback>(
      [
        `Branch: ${b.short}`,
        `Interview question: ${data.question}`,
        `Student's spoken answer: ${data.answer}`,
        "",
        "Grade this answer as an interviewer would.",
        'Return JSON: {"score":0,"strengths":[""],"improvements":[""],"modelAnswer":""}',
        "score is out of 10. improvements: 2-4 specific, actionable points. modelAnswer: a strong 4-6 sentence answer.",
      ].join("\n"),
      "You are a strict but encouraging interview coach. Output valid JSON only.",
    );
    const feedback: MockFeedback = {
      score: Math.max(0, Math.min(10, Number(gen.score) || 0)),
      strengths: strArr(gen.strengths),
      improvements: strArr(gen.improvements),
      modelAnswer: str(gen.modelAnswer),
    };
    await context.supabase.from("practice_attempts").insert({
      user_id: context.userId,
      branch: b.id,
      kind: "mock-interview",
      topic: data.question.slice(0, 120),
      score: feedback.score,
      total: 10,
      seconds_taken: 0,
      weak_topics: feedback.improvements.slice(0, 3),
      feedback: feedback as unknown as Json,
    });
    return feedback;
  });
