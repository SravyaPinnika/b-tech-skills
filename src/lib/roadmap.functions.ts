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
  languages: string[];
  weekly_hours: number;
}) {
  return [
    p.branch,
    p.year,
    p.semester,
    p.career_goal,
    p.target_job,
    [...(p.skills ?? [])].sort().join("+"),
    [...(p.languages ?? [])].sort().join("+"),
    p.weekly_hours,
  ]
    .join("|")
    .slice(0, 200);
}

export const getMyRoadmap = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => input.parse(d ?? {}))
  .handler(async ({ data, context }): Promise<Roadmap | null> => {
    const { data: profile } = await context.supabase
      .from("student_profiles")
      .select("branch, year, semester, career_goal, target_job, skills, languages, weekly_hours")
      .eq("user_id", context.userId)
      .maybeSingle();
      console.log("Roadmap profile:", {
  branch: profile?.branch,
  year: profile?.year,
  semester: profile?.semester,
  career_goal: profile?.career_goal,
  target_job: profile?.target_job,
  weekly_hours: profile?.weekly_hours,
});
    if (!profile) return null;

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
        `Build a personalised roadmap from semester ${profile.semester} through semester 8, inclusive.`,
`Generate exactly ${9 - profile.semester} semesters, one for every semester from ${profile.semester} to 8.`,
"Never include semesters earlier than the student's current semester.",
"Personalise every semester using the branch, current year, career goal, target job, existing skills, known languages, and weekly study hours.",
"Build on existing skills instead of teaching them from scratch.",
"Return one JSON object matching this structure:",
JSON.stringify({
  headline: "",
  summary: "",
  weeklyPlan: [],
  semesters: Array.from(
    { length: 9 - profile.semester },
    (_, i) => ({
      semester: profile.semester + i,
      title: "",
      focus: "",
      subjects: [],
      skills: [],
      courses: [],
      projects: [],
      certifications: [],
      interviewPrep: [],
      placementPrep: [],
    }),
  ),
  milestones: [],
}),
"Replace all empty arrays with real, specific content.",
`weeklyPlan must contain 4-6 practical activities suitable for ${profile.weekly_hours} study hours per week.`,
"Every semester must have 4-7 subjects, 3-6 skills, 2-4 courses, 1-3 projects, 1-2 certifications, 2-4 interviewPrep items, and 2-4 placementPrep items.",
"Return 4-6 distinct, measurable milestones, each with its semester and a specific achievement.",
"Never return placeholders such as 'Complete milestone', 'TODO', or 'Example weekly study activity'.",
"Be concrete, realistic, and specific to the student's branch and target job.",
      ].join("\n"),
      "You are an experienced Indian engineering placement mentor. Be specific, realistic, and branch-accurate. Output valid JSON only.",
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
      milestones: Array.isArray(gen.milestones)
  ? gen.milestones
      .map((item) => {
        if (typeof item === "string") return item;

        if (item && typeof item === "object") {
          const milestone = item as {
            semester?: number | string;
            title?: string;
            text?: string;
            description?: string;
          };

          const title =
            milestone.title ??
            milestone.text ??
            milestone.description;

          if (typeof title !== "string") return "";

          return milestone.semester != null
            ? `Semester ${milestone.semester}: ${title}`
            : title;
        }

        return "";
      })
      .filter(Boolean)
  : [],
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
