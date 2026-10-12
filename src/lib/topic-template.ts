import type { Course, CurriculumTopic } from "@/data/curriculum";

/** Generic but useful study scaffolding for any curriculum topic. */
export function topicGuide(course: Course, topic: CurriculumTopic) {
  const first = topic.subtopics[0] ?? topic.title;
  const codeish = course.kind === "coding" || course.kind === "project";

  return {
    overview: `${topic.title} is part of ${course.title}. Work through the ${topic.subtopics.length} concepts below one at a time: read the idea, write it out in your own words, then try it hands-on before ticking it off.`,
    beginner: `Start with "${first}". Learn what it is, why it exists and one small example you can reproduce from memory. Do not move on until you can explain it to a friend in two sentences.`,
    deep: codeish
      ? `Then go deeper: implement each concept yourself, reason about time and space cost, and compare at least two approaches for the same task.`
      : `Then go deeper: link each concept to a real system you have used, and be ready to explain trade-offs and failure cases, not just definitions.`,
    realWorld: `Interviewers usually ask about ${topic.title.toLowerCase()} through a scenario. Keep one concrete story ready — a project, an assignment or a bug you fixed — where you used it.`,
    mistakes: [
      "Reading notes without writing anything yourself.",
      "Memorising definitions but not being able to give an example.",
      codeish
        ? "Skipping edge cases: empty input, single element, duplicates, very large input."
        : "Skipping the 'why' — knowing what a thing is, but not when to choose it.",
    ],
    practice: topic.subtopics
      .slice(0, 5)
      .map((s) => `Explain "${s}" in your own words, then build or solve one small example using it.`),
    interviewQs: topic.subtopics
      .slice(0, 5)
      .map((s) => `What is ${s.toLowerCase()}? Where would you use it and what is the trade-off?`),
    miniChallenge: codeish
      ? `Solve one easy problem that uses ${topic.title.toLowerCase()} in under 20 minutes.`
      : `Write a half-page summary of ${topic.title.toLowerCase()} from memory, then check what you missed.`,
    advancedChallenge: codeish
      ? `Solve one medium problem using ${topic.title.toLowerCase()}, state complexity before coding, and handle every edge case unprompted.`
      : `Answer a scenario question on ${topic.title.toLowerCase()} out loud for 3 minutes without notes.`,
  };
}
