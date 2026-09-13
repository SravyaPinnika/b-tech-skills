import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { BRANCHES } from "@/data/branches";
import { BRANCH_SUBJECTS } from "@/data/branch-subjects";

export interface SubjectTopicLesson {
  topic: string;
  explanation: string;
  example: string;
}

export interface SubjectLesson {
  name: string;
  branch: string;
  overview: string;
  topics: SubjectTopicLesson[];
  keyConcepts: string[];
  commonMistakes: string[];
  interviewQuestions: { q: string; a: string }[];
  practiceTasks: string[];
}

const input = z.object({
  branch: z.string(),
  index: z.number().int().min(0),
});

export const getSubjectLesson = createServerFn({ method: "GET" })
  .inputValidator((data) => input.parse(data))
  .handler(async ({ data }): Promise<SubjectLesson> => {
    const branch = BRANCHES.find((b) => b.id === data.branch);
    const subject = branch ? BRANCH_SUBJECTS[branch.id]?.[data.index] : undefined;
    if (!branch || !subject) throw new Error("Subject not found");

    const { cached, askAi, str, strArr } = await import("./ai.server");

    const generated = await cached(
      "subject-lesson",
      `${branch.id}:${data.index}:${subject.name}`,
      async () => {
        type Raw = {
          overview?: unknown;
          topics?: unknown;
          keyConcepts?: unknown;
          commonMistakes?: unknown;
          interviewQuestions?: unknown;
          practiceTasks?: unknown;
        };
        const raw = await askAi<Raw>(
          `Subject: "${subject.name}" (B.Tech branch: ${branch.label}).
Subject description: ${subject.description}
Important topics: ${subject.topics.join(", ")}
Difficulty: ${subject.difficulty}

Write complete, student-friendly learning material for this subject. Return JSON with:
- "overview": 2 short paragraphs introducing the subject, why it matters for placements, and how it is used in industry.
- "topics": an array with one entry per important topic listed above: {"topic": name, "explanation": 3-5 sentence clear explanation, "example": one concrete real-world or exam-style example}.
- "keyConcepts": 6-10 short bullet strings of the core ideas a student must remember.
- "commonMistakes": 4-6 short bullet strings of mistakes students make in this subject.
- "interviewQuestions": 5 entries {"q": question, "a": 2-3 sentence model answer} actually asked for this subject.
- "practiceTasks": 4-6 short bullet strings of hands-on tasks or problems to solve.
Use simple English. No placeholder text.`,
          "You are an experienced B.Tech professor writing placement-focused study material. Reply with valid JSON only.",
        );
        const topicsRaw = Array.isArray(raw.topics) ? raw.topics : [];
        return {
          overview: str(raw.overview, subject.description),
          topics: subject.topics.map((topic, i) => {
            const entry = (topicsRaw[i] ?? {}) as Record<string, unknown>;
            return {
              topic,
              explanation: str(entry["explanation"], ""),
              example: str(entry["example"], ""),
            };
          }),
          keyConcepts: strArr(raw.keyConcepts),
          commonMistakes: strArr(raw.commonMistakes),
          interviewQuestions: (Array.isArray(raw.interviewQuestions) ? raw.interviewQuestions : [])
            .slice(0, 6)
            .map((item) => {
              const entry = (item ?? {}) as Record<string, unknown>;
              return { q: str(entry["q"]), a: str(entry["a"]) };
            })
            .filter((qa) => qa.q && qa.a),
          practiceTasks: strArr(raw.practiceTasks),
        };
      },
    );

    return { name: subject.name, branch: branch.label, ...generated };
  });
