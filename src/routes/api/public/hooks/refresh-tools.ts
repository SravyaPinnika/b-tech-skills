import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

const JOB = "weekly_tools_refresh";
const MAX_NEW_TOOLS = 6;

interface AiTool {
  name: string;
  category: string;
  description: string;
  why_it_matters: string;
  branches: string[];
  url: string;
}

export const Route = createFileRoute("/api/public/hooks/refresh-tools")({
  server: {
    handlers: {
      POST: async () => {
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

        // Paused-state guard + single-flight lease.
        const { data: state } = await admin
          .from("job_state")
          .select("paused, lease_until")
          .eq("job_name", JOB)
          .maybeSingle();

        if (state?.paused) {
          return Response.json({ skipped: "paused" });
        }
        if (state?.lease_until && new Date(state.lease_until) > new Date()) {
          return Response.json({ skipped: "already_running" });
        }

        const leaseUntil = new Date(Date.now() + 10 * 60_000).toISOString();
        await admin.from("job_state").update({ lease_until: leaseUntil }).eq("job_name", JOB);

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

        const { data: existing } = await admin.from("tools").select("name");
        const known = (existing ?? []).map((row) => row.name);

        const prompt = [
          "You track tools that Indian B.Tech students (CSE, IT, AIML, Data Science) should learn for campus placements and technical interviews.",
          `List up to ${MAX_NEW_TOOLS} genuinely notable tools, frameworks, libraries or platforms that have become relevant recently and are NOT in this list:`,
          known.join(", ") || "(empty)",
          "Only include real, existing tools. For each, give: name, category, one-sentence description, why it matters for placements, relevant branches (from CSE, IT, AIML, DS), and the official URL.",
          'Reply as JSON: {"tools":[{"name":"","category":"","description":"","why_it_matters":"","branches":[""],"url":""}]}',
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

        let tools: AiTool[] = [];
        try {
          const parsed = JSON.parse(content) as { tools?: AiTool[] };
          tools = Array.isArray(parsed.tools) ? parsed.tools : [];
        } catch {
          await finish("error", "Could not parse AI response");
          return Response.json({ error: "Bad AI response" }, { status: 502 });
        }

        const validBranches = new Set(["CSE", "IT", "AIML", "DS"]);
        const rows = tools
          .filter((t) => t?.name && t?.category && t?.description && !known.includes(t.name))
          .slice(0, MAX_NEW_TOOLS)
          .map((t) => ({
            name: String(t.name).slice(0, 120),
            category: String(t.category).slice(0, 60),
            description: String(t.description).slice(0, 400),
            why_it_matters: t.why_it_matters ? String(t.why_it_matters).slice(0, 400) : null,
            branches: (Array.isArray(t.branches) ? t.branches : []).filter((b) => validBranches.has(b)),
            url: typeof t.url === "string" && t.url.startsWith("https://") ? t.url : null,
          }));

        if (rows.length > 0) {
          const { error } = await admin.from("tools").upsert(rows, { onConflict: "name" });
          if (error) {
            await finish("error", error.message);
            return Response.json({ error: error.message }, { status: 500 });
          }
        }

        await finish("ok", `Added ${rows.length} tools`);
        return Response.json({ added: rows.length, names: rows.map((r) => r.name) });
      },
    },
  },
});
