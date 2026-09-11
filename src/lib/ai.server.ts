/** Server-only AI + admin helpers shared by the platform server functions. */
import type { Json } from "@/integrations/supabase/types";

export async function askAi<T>(prompt: string, system: string): Promise<T> {
  const aiKey = process.env["LOVABLE_API_KEY"];
  if (!aiKey) throw new Error("AI is not configured");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": aiKey,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: "google/gemini-3.7-flash",
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (res.status === 429)
    throw new Error("Too many requests right now — please try again in a minute.");
  if (res.status === 402) throw new Error("AI usage limit reached. Please add credits to continue.");
  if (res.status === 403) throw new Error("AI access is blocked for this workspace.");
  if (!res.ok) throw new Error(`AI request failed (${res.status})`);
  const payload = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = payload.choices?.[0]?.message?.content ?? "{}";
  try {
    return JSON.parse(content) as T;
  } catch {
    throw new Error("The AI returned an unreadable answer — please try again.");
  }
}

export async function adminDb() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/** Read shared generated content, or generate it once and cache it. */
export async function cached<T>(
  kind: string,
  cacheKey: string,
  generate: () => Promise<T>,
): Promise<T> {
  const db = await adminDb();
  const { data } = await db
    .from("generated_content")
    .select("payload")
    .eq("kind", kind)
    .eq("cache_key", cacheKey)
    .maybeSingle();
  if (data?.payload) return data.payload as unknown as T;

  const fresh = await generate();
  await db
    .from("generated_content")
    .upsert(
      { kind, cache_key: cacheKey, payload: fresh as unknown as Json },
      { onConflict: "kind,cache_key" },
    );
  return fresh;
}

export const str = (v: unknown, fallback = ""): string =>
  typeof v === "string" && v.trim() ? v : fallback;
export const strArr = (v: unknown): string[] =>
  Array.isArray(v) ? v.map((x) => String(x)).filter(Boolean) : [];
