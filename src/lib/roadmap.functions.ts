import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { branchInfo } from "@/data/branches";
import type { Json } from "@/integrations/supabase/types";

export interface RoadmapSemester {
  semester: number;
  title: string;
  focus: string;
  subjects: string[];
  skills: string[];
  courses: string[];
  projects: string[];
  certifications: string[];
  interviewPrep: string[];
  placementPrep: string[];
}

export interface Roadmap {
  headline: string;
  summary: string;
  weeklyPlan: string[];
  semesters: RoadmapSemester[];
  milestones: string[];
  generatedAt: string;
}

const input = z.object({ regenerate: z.boolean().optional() });

function keyFor(p: {
  branch: string;
  year: number;
  semester: number;
  career_goal: string;
  target_job: string;
  skills: string[];
}) {
  return [p.branch, p.year, p.semester, p.career_goal, p.target_job, [...p.skills].sort().join("+")]
    .join("|")
    .slice(0, 200);
}

export const getMyRoadmap = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => input.parse(d ?? {}))
  .handler(async ({ data, context }): Promise<Roadmap> => {
    const { data: profile } = await context.supabase
      .from("student_profiles")
      .select("branch, year, semester, career_goal, target_job, skills, languages, weekly_hours")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (!profile) throw new Error("Create your profile first to get a roadmap.");

    const cacheKey = keyFor(profile);
    if (!data.regenerate) {
      const { data: existing } = await context.supabase
        .from("user_content")
        .select("payload")
        .eq("user_id", context.userId)
        .eq("kind", "roadmap")
        .eq("cache_key", cacheKey)
        .maybeSingle();
      if (existing?.payload) return existing.payload as unknown as Roadmap;
    }

    const b = branchInfo(profile.branch);
    const { askAi, str, strArr } = await import("./ai.server");

    const gen = await askAi<Roadmap>(
      [
        `Branch: ${b.short}`,
        `Current year: ${profile.year}, current semester: ${profile.semester}`,
        `Career goal: ${profile.career_goal || "placement"}`,
        `Target job: ${profile.target_job || b.targetJobs[0]}`,
        `Skills already known: ${profile.skills.join(", ") || "none yet"}`,
        `Languages known: ${profile.languages.join(", ") || "none yet"}`,
        `Study time available: ${profile.weekly_hours} hours per week`,
        `Typical branch subjects: ${b.coreSubjects.join(", ")}`,
        `Branch-relevant skills: ${b.skills.join(", ")}`,
        `Recruiters to target: ${b.companies.join(", ")}`,
        "",
        `Build a personalised semester-by-semester roadmap from semester ${profile.semester} to semester 8.`,
        "Skip semesters already finished. Never suggest skills the student already knows as new learning — build on them.",
        "Return JSON:",
        '{"headline":"","summary":"","weeklyPlan":["..."],"semesters":[{"semester":5,"title":"","focus":"","subjects":[""],"skills":[""],"courses":[""],"projects":[""],"certifications":[""],"interviewPrep":[""],"placementPrep":[""]}],"milestones":[""]}',
        "weeklyPlan: 4-6 lines describing how to split the weekly hours.",
        "Each semester: 4-7 subjects, 3-6 skills, 2-4 courses, 1-3 projects, 1-2 certifications, 2-4 interviewPrep items, 2-4 placementPrep items.",
        "milestones: 4-6 measurable checkpoints with a semester attached.",
        "Be concrete and specific to this branch. No generic filler.",
      ].join("\n"),
      "You are an experienced Indian engineering placement mentor. Be specific, realistic and branch-accurate. Output valid JSON only.",
    );

    const clean: Roadmap = {
      headline: str(gen.headline, `${b.short} roadmap`),
      summary: str(gen.summary),
      weeklyPlan: strArr(gen.weeklyPlan),
      semesters: (Array.isArray(gen.semesters) ? gen.semesters : [])
        .map((s, i) => ({
          semester: Number(s?.semester) || profile.semester + i,
          title: str(s?.title, `Semester ${Number(s?.semester) || profile.semester + i}`),
          focus: str(s?.focus),
          subjects: strArr(s?.subjects),
          skills: strArr(s?.skills),
          courses: strArr(s?.courses),
          projects: strArr(s?.projects),
          certifications: strArr(s?.certifications),
          interviewPrep: strArr(s?.interviewPrep),
          placementPrep: strArr(s?.placementPrep),
        }))
        .filter((s) => s.semester >= 1 && s.semester <= 8)
        .sort((a, b2) => a.semester - b2.semester),
      milestones: strArr(gen.milestones),
      generatedAt: new Date().toISOString(),
    };
    if (clean.semesters.length === 0) throw new Error("Could not build the roadmap — please retry.");

    await context.supabase.from("user_content").upsert(
      {
        user_id: context.userId,
        kind: "roadmap",
        cache_key: cacheKey,
        payload: clean as unknown as Json,
      },
      { onConflict: "user_id,kind,cache_key" },
    );
    return clean;
  });
