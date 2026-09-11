import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { branchInfo, PROJECT_LEVELS } from "@/data/branches";

export interface BranchProject {
  title: string;
  level: string;
  problem: string;
  skills: string[];
  technologies: string[];
  steps: string[];
  githubGuide: string[];
  deployment: string[];
  vivaQuestions: string[];
  interviewQuestions: string[];
  estWeeks: number;
}

export const getBranchProjects = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        branch: z.string().min(1).max(40),
        level: z.enum(PROJECT_LEVELS),
      })
      .parse(d),
  )
  .handler(async ({ data }): Promise<BranchProject[]> => {
    const b = branchInfo(data.branch);
    const { cached, askAi, str, strArr } = await import("./ai.server");

    return cached<BranchProject[]>("projects", `${b.id}|${data.level}`, async () => {
      const gen = await askAi<{ projects: BranchProject[] }>(
        [
          `Branch: ${b.short}`,
          `Level: ${data.level}`,
          `Languages/tools used in this branch: ${b.languages.join(", ")}`,
          `Branch skills: ${b.skills.join(", ")}`,
          "",
          `Create 5 ${data.level} level projects a B.Tech ${b.label} student can actually build and defend in a viva or interview.`,
          data.level === "final-year"
            ? "These must be substantial final-year projects with novelty, a clear literature gap and measurable results."
            : "Keep them realistic for the level and finishable by one student.",
          "Return JSON:",
          '{"projects":[{"title":"","problem":"","skills":[""],"technologies":[""],"steps":[""],"githubGuide":[""],"deployment":[""],"vivaQuestions":[""],"interviewQuestions":[""],"estWeeks":4}]}',
          "problem: 2-3 sentences on the real problem it solves.",
          "steps: 6-10 ordered build steps.",
          "githubGuide: 3-5 lines on repo structure, README and commit hygiene.",
          "deployment: 2-4 lines on how to deploy, host or demonstrate it (for core branches, how to demo hardware/simulation results).",
          "vivaQuestions: 5 examiner questions. interviewQuestions: 5 interviewer questions with the depth a recruiter would probe.",
        ].join("\n"),
        "You are a senior engineering project guide for Indian B.Tech students. Projects must be branch-accurate and buildable. Output valid JSON only.",
      );
      const list = (Array.isArray(gen.projects) ? gen.projects : []).slice(0, 6).map((p) => ({
        title: str(p?.title, "Project"),
        level: data.level,
        problem: str(p?.problem),
        skills: strArr(p?.skills),
        technologies: strArr(p?.technologies),
        steps: strArr(p?.steps),
        githubGuide: strArr(p?.githubGuide),
        deployment: strArr(p?.deployment),
        vivaQuestions: strArr(p?.vivaQuestions),
        interviewQuestions: strArr(p?.interviewQuestions),
        estWeeks: Math.max(1, Math.min(52, Number(p?.estWeeks) || 4)),
      }));
      if (list.length === 0) throw new Error("Could not build projects — please retry.");
      return list;
    });
  });
