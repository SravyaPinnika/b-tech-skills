import type { TopicMap } from "../topicContent";

export const llmTopics: TopicMap = {
  "Prompt engineering & structured output": {
    summary:
      "A prompt is the program. Give the model a role, the task, constraints and an output schema instead of hoping for the right shape.",
    keyPoints: [
      "Few-shot examples beat long prose instructions for format control.",
      "Ask for JSON with an explicit schema and validate the response (Zod/Pydantic).",
      "Lower temperature for extraction, higher for ideation.",
      "Split system (rules) from user (data) so untrusted text cannot rewrite the rules.",
    ],
    syntax: {
      lang: "text",
      code: "SYSTEM: You extract fields. Reply with JSON only.\nSCHEMA: {\"name\": string, \"amount\": number}\nUSER: Invoice from Acme for 4200 rupees",
    },
    diagram: `prompt = role + task + constraints + examples + schema
        |
      model
        |
   raw text -> validate(schema) -> ok? use : retry once`,
  },

  "Embeddings and vector search": {
    summary:
      "An embedding maps text to a vector so that similar meanings land close together. Search then becomes nearest-neighbour lookup by cosine similarity.",
    keyPoints: [
      "Cosine similarity compares direction, not magnitude — normalise vectors.",
      "Vector stores (pgvector, Pinecone, FAISS) use ANN indexes (HNSW/IVF) for speed.",
      "Query and documents must use the same embedding model.",
      "Hybrid search (vector + keyword BM25) beats either alone on names and IDs.",
    ],
    syntax: {
      lang: "text",
      code: "cos(a, b) = (a · b) / (|a| * |b|)   -> 1 = same meaning, 0 = unrelated",
    },
    diagram: `"dog"  *
"puppy" *      <- close together
                 "invoice" *  <- far away

query vector -> ANN index -> top-k nearest chunks`,
  },

  "Retrieval-augmented generation (RAG)": {
    summary:
      "RAG retrieves relevant chunks from your own data and puts them in the prompt, so answers are grounded and citable without retraining.",
    keyPoints: [
      "Pipeline: ingest -> chunk -> embed -> store -> retrieve -> rerank -> generate.",
      "Always pass sources back so answers can be checked.",
      "Retrieval quality, not the model, is the usual failure point.",
      "Instruct the model to say 'not in the context' rather than guess.",
    ],
    diagram: `docs -> chunk -> embed -> [vector DB]
                                  ^
question -> embed ----------------+
                                  |
                            top-k chunks
                                  |
                        prompt + context -> LLM -> answer + citations`,
  },

  "Chunking, reranking and evaluation": {
    summary:
      "Chunk size decides what retrieval can even find; reranking reorders candidates with a stronger model; evaluation keeps changes honest.",
    keyPoints: [
      "Start at 300-800 tokens with 10-15% overlap; split on headings, not mid-sentence.",
      "Retrieve wide (k=20-50), then rerank down to 3-5 with a cross-encoder.",
      "Measure retrieval (recall@k, MRR) separately from answer quality (faithfulness).",
      "Keep a fixed golden question set and re-run it on every change.",
    ],
    diagram: `chunking
[--------- long doc ---------]
[ c1 ][ c2 ][ c3 ][ c4 ]      <- overlap keeps sentences whole
   \\__/  \\__/  \\__/

retrieve 30 --> rerank --> keep 4 --> prompt`,
  },

  "Tool calling & agent loops": {
    summary:
      "Tool calling lets the model request a function with typed arguments; an agent loops model -> tool -> observation until the task is done.",
    keyPoints: [
      "You declare tools with a JSON schema; the model returns a call, your code executes it.",
      "The model never runs code itself — your handler validates and executes.",
      "Always cap iterations and total tokens or the loop can run away.",
      "Make tools idempotent and require confirmation for destructive actions.",
    ],
    syntax: {
      lang: "json",
      code: "{\n  \"name\": \"get_weather\",\n  \"parameters\": {\n    \"type\": \"object\",\n    \"properties\": { \"city\": { \"type\": \"string\" } },\n    \"required\": [\"city\"]\n  }\n}",
    },
    diagram: `user goal
   |
   v
[ LLM ] --tool call--> [ your function ] --result--+
   ^                                               |
   +---------------- observation ------------------+
   |
 final answer (max N loops)`,
  },

  "Fine-tuning vs prompting vs RAG trade-offs": {
    summary:
      "Prompting changes instructions, RAG changes knowledge, fine-tuning changes behaviour and style. Pick by which of those is actually wrong.",
    keyPoints: [
      "Facts change often or must be cited -> RAG.",
      "Output format/tone/domain phrasing is wrong -> fine-tune.",
      "Just needs clearer instructions or examples -> prompt engineering.",
      "Fine-tuning needs curated pairs and re-runs whenever data drifts; RAG updates instantly.",
    ],
    diagram: `problem                     fix
--------------------------------------------
answers outdated/unsourced  RAG
wrong style or format       fine-tune (LoRA)
misunderstood the task      better prompt
too slow / too costly       smaller model + cache`,
  },

  "Guardrails, hallucination handling, cost control": {
    summary:
      "Production LLM features need input/output validation, grounding checks and hard budgets.",
    keyPoints: [
      "Treat all retrieved and user text as untrusted — prompt injection is the top risk.",
      "Reduce hallucination by grounding, citations and abstention instructions.",
      "Cache repeated prompts and cap max tokens; log token spend per request.",
      "Add moderation and PII filtering on both input and output.",
    ],
    diagram: `input -> [validate + moderate] -> prompt (+context)
                                       |
                                     LLM
                                       |
        answer <- [schema check | grounding check | moderation]
                       |
                  fail -> retry once -> else safe fallback`,
  },
};
