import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

export interface RecruiterRow {
  id: string;
  company: string;
  role: string;
  hiring_status: string;
  hiring_window: string | null;
  branches: string[];
  skills: string[];
  project_expectations: string | null;
  interview_process: string | null;
  ctc_range: string | null;
  eligibility: string | null;
  url: string | null;
  added_week: string;
  current_stage: string | null;
  apply_by: string | null;
  process_stages: string[];
}

export interface RecruitersPayload {
  recruiters: RecruiterRow[];
  lastRunAt: string | null;
  currentWeek: string;
}

function currentWeekStart(): string {
  const now = new Date();
  const day = (now.getUTCDay() + 6) % 7;
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - day));
  return monday.toISOString().slice(0, 10);
}

export const listRecruiters = createServerFn({ method: "GET" }).handler(
  async (): Promise<RecruitersPayload> => {
    const url = process.env["SUPABASE_URL"]!;
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => {
          const headers = new Headers(init?.headers);
          if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
            headers.delete("Authorization");
          }
          headers.set("apikey", key);
          return fetch(input, { ...init, headers });
        },
      },
    });

    const [{ data: recruiters }, { data: job }] = await Promise.all([
      supabase
        .from("recruiters")
        .select(
          "id, company, role, hiring_status, hiring_window, branches, skills, project_expectations, interview_process, ctc_range, eligibility, url, added_week, current_stage, apply_by, process_stages",
        )
        .order("added_week", { ascending: false })
        .order("company", { ascending: true }),
      supabase
        .from("job_state")
        .select("last_run_at")
        .eq("job_name", "weekly_recruiters_refresh")
        .maybeSingle(),
    ]);

    return {
      recruiters: (recruiters ?? []) as RecruiterRow[],
      lastRunAt: (job?.last_run_at as string | undefined) ?? null,
      currentWeek: currentWeekStart(),
    };
  },
);
