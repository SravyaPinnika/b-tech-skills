import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";

const JOB = "weekly_recruiters_refresh";
const MAX_NEW = 6;

interface AiRecruiter {
  company: string;
  role: string;
  hiring_status: string;
  hiring_window: string;
  branches: string[];
  skills: string[];
  project_expectations: string;
  interview_process: string;
  ctc_range: string;
  eligibility: string;
  url: string;
}

export const Route = createFileRoute("/api/public/hooks/refresh-recruiters")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const unauthorized = await authenticateCronRequest(request);
        if (unauthorized) return unauthorized;

        const supabaseUrl = process.env["SUPABASE_URL"];
        const serviceKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];
        const aiKey = process.env["LOVABLE_API_KEY"];
        if (!supabaseUrl || !serviceKey) {
          return Response.json({ error: "Backend not configured" }, { status: 500 });
        }
        if (!aiKey) {
          return Response.json({ error: "Missing LOVABLE_API_KEY" }, { status: 500 });
        }

        const admin = createClient(supabaseUrl, serviceKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });

        const { data: state } = await admin
          .from("job_state")
          .select("paused, lease_until")
          .eq("job_name", JOB)
          .maybeSingle();

        if (state?.paused) return Response.json({ skipped: "paused" });
        if (state?.lease_until && new Date(state.lease_until) > new Date()) {
          return Response.json({ skipped: "already_running" });
        }

        await admin
          .from("job_state")
          .update({ lease_until: new Date(Date.now() + 10 * 60_000).toISOString() })
          .eq("job_name", JOB);

        const finish = async (status: string, message: string) => {
          await admin
            .from("job_state")
            .update({
              last_run_at: new Date().toISOString(),
              last_status: status,
              last_message: message.slice(0, 500),
              lease_until: null,
              paused: status === "blocked",
            })
            .eq("job_name", JOB);
        };

        const { data: existing } = await admin.from("recruiters").select("company");
        const known = (existing ?? []).map((r) => r.company as string);

        const prompt = [
          "You track campus recruitment for Indian B.Tech students (CSE, IT, AIML, Data Science).",
          `List up to ${MAX_NEW} real companies actively hiring freshers or running campus/off-campus drives that are NOT already in this list:`,
          known.join(", ") || "(empty)",
          "Only include real companies with genuine fresher hiring. For each give: company, role title, hiring_status, hiring_window (e.g. 'Aug-Oct 2026'), eligible branches (from CSE, IT, AIML, DS), required skills (5-8 short tags), project_expectations (what kind of projects impress them), interview_process (rounds), ctc_range (INR), eligibility (CGPA/backlog rules), and the official careers URL.",
          'Reply as JSON: {"recruiters":[{"company":"","role":"","hiring_status":"","hiring_window":"","branches":[""],"skills":[""],"project_expectations":"","interview_process":"","ctc_range":"","eligibility":"","url":""}]}',
        ].join("\n\n");

        let response: Response;
        try {
          response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Lovable-API-Key": aiKey,
              "X-Lovable-AIG-SDK": "fetch",
            },
            body: JSON.stringify({
              model: "google/gemini-3.7-flash",
              messages: [{ role: "user", content: prompt }],
              response_format: { type: "json_object" },
            }),
          });
        } catch (error) {
          await finish("error", String(error));
          return Response.json({ error: "AI request failed" }, { status: 502 });
        }

        if (!response.ok) {
          const body = await response.text();
          const blocked = response.status === 402 || response.status === 403;
          await finish(blocked ? "blocked" : "error", `[${response.status}] ${body}`);
          return Response.json({ error: body }, { status: response.status });
        }

        const payload = (await response.json()) as {
          choices?: { message?: { content?: string } }[];
        };
        const content = payload.choices?.[0]?.message?.content ?? "{}";

        let items: AiRecruiter[] = [];
        try {
          const parsed = JSON.parse(content) as { recruiters?: AiRecruiter[] };
          items = Array.isArray(parsed.recruiters) ? parsed.recruiters : [];
        } catch {
          await finish("error", "Could not parse AI response");
          return Response.json({ error: "Bad AI response" }, { status: 502 });
        }

        const validBranches = new Set(["CSE", "IT", "AIML", "DS"]);
        const str = (v: unknown, n: number) => (typeof v === "string" ? v.slice(0, n) : null);
        const rows = items
          .filter((r) => r?.company && r?.role && !known.includes(r.company))
          .slice(0, MAX_NEW)
          .map((r) => ({
            company: String(r.company).slice(0, 120),
            role: String(r.role).slice(0, 160),
            hiring_status: str(r.hiring_status, 60) ?? "Actively hiring",
            hiring_window: str(r.hiring_window, 60),
            branches: (Array.isArray(r.branches) ? r.branches : []).filter((b) =>
              validBranches.has(b),
            ),
            skills: (Array.isArray(r.skills) ? r.skills : [])
              .filter((s) => typeof s === "string")
              .slice(0, 10)
              .map((s) => s.slice(0, 60)),
            project_expectations: str(r.project_expectations, 600),
            interview_process: str(r.interview_process, 600),
            ctc_range: str(r.ctc_range, 120),
            eligibility: str(r.eligibility, 300),
            url: typeof r.url === "string" && r.url.startsWith("https://") ? r.url : null,
          }));

        if (rows.length > 0) {
          const { error } = await admin.from("recruiters").upsert(rows, { onConflict: "company" });
          if (error) {
            await finish("error", error.message);
            return Response.json({ error: error.message }, { status: 500 });
          }
        }

        await finish("ok", `Added ${rows.length} recruiters`);
        return Response.json({ added: rows.length, companies: rows.map((r) => r.company) });
      },
    },
  },
});
