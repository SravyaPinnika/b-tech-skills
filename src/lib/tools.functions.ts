import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export interface ToolRow {
  id: string;
  name: string;
  category: string;
  description: string;
  why_it_matters: string | null;
  branches: string[];
  url: string | null;
  added_week: string;
}

export interface ToolsPayload {
  tools: ToolRow[];
  lastRunAt: string | null;
  currentWeek: string;
}

function currentWeekStart(): string {
  const now = new Date();
  const day = (now.getUTCDay() + 6) % 7;
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - day));
  return monday.toISOString().slice(0, 10);
}

export const listTools = createServerFn({ method: "GET" }).handler(async (): Promise<ToolsPayload> => {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const supabase = createClient<Database>(url, key, {
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

  const [{ data: tools }, { data: job }] = await Promise.all([
    supabase
      .from("tools")
      .select("id, name, category, description, why_it_matters, branches, url, added_week")
      .order("added_week", { ascending: false })
      .order("name", { ascending: true }),
    supabase.from("job_state").select("last_run_at").eq("job_name", "weekly_tools_refresh").maybeSingle(),
  ]);

  return {
    tools: (tools ?? []) as ToolRow[],
    lastRunAt: job?.last_run_at ?? null,
    currentWeek: currentWeekStart(),
  };
});
