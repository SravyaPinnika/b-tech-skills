
/** Server-only AI + admin helpers shared by platform server functions. */
import type { Json } from "@/integrations/supabase/types";

export async function askAi<T>(
  prompt: string,
  system: string,
): Promise<T> {
  const apiKey = process.env["NVIDIA_API_KEY"];

  if (!apiKey) {
    throw new Error(
      "NVIDIA API key is missing. Check NVIDIA_API_KEY in your environment.",
    );
  }

  const response = await fetch(
    "https://integrate.api.nvidia.com/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "nvidia/nemotron-3.5-lightning-30b-a3b",
        messages: [
          {
            role: "system",
            content:
              system +
              "\n\nReturn exactly one valid JSON object. Do not include Markdown fences, explanations, or extra text.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
       temperature: 0.2,
       max_tokens: 8192,
       stream: false,
       response_format: {
       type: "json_object",
       },
chat_template_kwargs: {
  enable_thinking: false,
},  
      }),
    },
  );

  const result = await response.json() as {
    choices?: Array<{
      finish_reason?: string | null;
      message?: {
        content?: string | null;
        reasoning_content?: string | null;
      };
    }>;
    error?: {
      message?: string;
    };
    usage?: {
      completion_tokens?: number;
    };
  };

  if (!response.ok) {
    throw new Error(
      `NVIDIA API error (${response.status}): ${
        result.error?.message ?? "Request failed"
      }`,
    );
  }

  const choice = result.choices?.[0];
  if (choice?.finish_reason === "length") {
  throw new Error(
    "NVIDIA response was truncated because it reached the token limit. " +
    "Reduce the requested JSON output or increase max_tokens if supported."
  );
}
  let content = choice?.message?.content?.trim() ?? "";

  if (!content) {
    throw new Error(
      `NVIDIA returned no final text (finish reason: ${
        choice?.finish_reason ?? "unknown"
      }; completion tokens: ${
        result.usage?.completion_tokens ?? "unknown"
      }). Please try again.`,
    );
  }

  // Remove optional Markdown JSON fences.
  content = content
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  // If the model added introductory text, extract the JSON value.
  const start = content.search(/[\[{]/);

  if (start !== -1) {
    const opening = content[start];
    const closing = opening === "{" ? "}" : "]";
    let depth = 0;
    let inString = false;
    let escaped = false;

    for (let i = start; i < content.length; i++) {
      const char = content[i];

      if (inString) {
        if (escaped) {
          escaped = false;
        } else if (char === "\\") {
          escaped = true;
        } else if (char === '"') {
          inString = false;
        }
        continue;
      }

      if (char === '"') {
        inString = true;
      } else if (char === opening) {
        depth++;
      } else if (char === closing) {
        depth--;

        if (depth === 0) {
          content = content.slice(start, i + 1);
          break;
        }
      }
    }
  }

  try {
    return JSON.parse(content) as T;
  } catch {
  console.error(
    "NVIDIA JSON parsing failed. Response preview:",
    content.slice(0, 1500),
  );

  throw new Error(
    `NVIDIA returned invalid JSON (finish reason: ${
      choice?.finish_reason ?? "unknown"
    }). Check the server terminal for the response preview.`,
  );
}
}
export async function adminDb() {
  const { supabaseAdmin } = await import(
    "@/integrations/supabase/client.server"
  );
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
      {
        kind,
        cache_key: cacheKey,
        payload: fresh as unknown as Json,
      },
      { onConflict: "kind,cache_key" },
    );

  return fresh;
}

export const str = (
  v: unknown,
  fallback = "",
): string =>
  typeof v === "string" && v.trim()
    ? v
    : fallback;

export const strArr = (v: unknown): string[] =>
  Array.isArray(v)
    ? v.map((x) => String(x)).filter(Boolean)
    : [];
