import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Json } from "@/integrations/supabase/types";

export interface StudentProfileRow {
  name: string;
  branch: string;
  year: number;
  semester: number;
  career_goal: string;
  target_job: string;
  skills: string[];
  languages: string[];
  weekly_hours: number;
}

export interface ProgressRow {
  item_kind: string;
  item_id: string;
  done: boolean;
}

export interface AttemptRow {
  id: string;
  branch: string;
  kind: string;
  topic: string;
  score: number;
  total: number;
  seconds_taken: number;
  weak_topics: string[];
  created_at: string;
}

export interface ApplicationRow {
  id: string;
  company: string;
  role: string;
  kind: string;
  status: string;
  applied_on: string;
  link: string | null;
  notes: string | null;
}

/* ---------------------------------- profile ---------------------------------- */

export const getMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<StudentProfileRow | null> => {
    const { data, error } = await context.supabase
      .from("student_profiles")
      .select(
        "name, branch, year, semester, career_goal, target_job, skills, languages, weekly_hours",
      )
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ?? null;
  });

const profileInput = z.object({
  name: z.string().min(1).max(80),
  branch: z.string().min(1).max(40),
  year: z.number().int().min(1).max(4),
  semester: z.number().int().min(1).max(8),
  career_goal: z.string().max(120),
  target_job: z.string().max(120),
  skills: z.array(z.string().max(60)).max(60),
  languages: z.array(z.string().max(40)).max(30),
  weekly_hours: z.number().int().min(1).max(80),
});

export const saveMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => profileInput.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("student_profiles")
      .upsert({ ...data, user_id: context.userId }, { onConflict: "user_id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* --------------------------------- progress ---------------------------------- */

export const listProgress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ProgressRow[]> => {
    const { data, error } = await context.supabase
      .from("user_progress")
      .select("item_kind, item_id, done")
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const setProgress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        item_kind: z.string().min(1).max(40),
        item_id: z.string().min(1).max(200),
        done: z.boolean(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("user_progress")
      .upsert({ ...data, user_id: context.userId }, { onConflict: "user_id,item_kind,item_id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* --------------------------------- attempts ---------------------------------- */

export const listAttempts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AttemptRow[]> => {
    const { data, error } = await context.supabase
      .from("practice_attempts")
      .select("id, branch, kind, topic, score, total, seconds_taken, weak_topics, created_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(60);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

/* ------------------------------- applications -------------------------------- */

export const listApplications = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ApplicationRow[]> => {
    const { data, error } = await context.supabase
      .from("applications")
      .select("id, company, role, kind, status, applied_on, link, notes")
      .eq("user_id", context.userId)
      .order("applied_on", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const saveApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        id: z.string().uuid().optional(),
        company: z.string().min(1).max(120),
        role: z.string().max(120),
        kind: z.enum(["internship", "job"]),
        status: z.enum(["saved", "applied", "online-test", "interview", "offer", "rejected"]),
        applied_on: z.string().min(4).max(20),
        link: z.string().max(400).nullable().optional(),
        notes: z.string().max(2000).nullable().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const row = {
      user_id: context.userId,
      company: data.company,
      role: data.role,
      kind: data.kind,
      status: data.status,
      applied_on: data.applied_on,
      link: data.link ?? null,
      notes: data.notes ?? null,
    };
    const { error } = data.id
      ? await context.supabase.from("applications").update(row).eq("id", data.id)
      : await context.supabase.from("applications").insert(row);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("applications").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ------------------------------ user content -------------------------------- */

export const getUserContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ kind: z.string().min(1).max(40), cache_key: z.string().max(200).default("") }).parse(d),
  )
  .handler(async ({ data, context }): Promise<Json | null> => {
    const { data: row, error } = await context.supabase
      .from("user_content")
      .select("payload")
      .eq("user_id", context.userId)
      .eq("kind", data.kind)
      .eq("cache_key", data.cache_key)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (row?.payload as Json) ?? null;
  });
