import { SKILLS, skillsForBranch, type Branch, type Skill } from "@/data/skills";
import { skillPercent, topicKey, type SkillProgressState } from "@/lib/skill-progress";

export interface SkillReadiness {
  skill: Skill;
  percent: number;
  completedTopics: number;
  nextTopic: { index: number; name: string } | null;
}

/** Per-skill progress plus a weighted overall placement-readiness score. */
export function computeReadiness(branch: Branch, state: SkillProgressState) {
  const skills = skillsForBranch(branch);

  const rows: SkillReadiness[] = skills.map((skill) => {
    const percent = skillPercent(state, skill.slug, skill.topics.length);
    const completedTopics = skill.topics.filter(
      (_t, i) => state[topicKey(skill.slug, i)] === "completed",
    ).length;
    const nextIndex = skill.topics.findIndex(
      (_t, i) => state[topicKey(skill.slug, i)] !== "completed",
    );
    return {
      skill,
      percent,
      completedTopics,
      nextTopic:
        nextIndex === -1 ? null : { index: nextIndex, name: skill.topics[nextIndex] as string },
    };
  });

  const weightSum = rows.reduce((sum, r) => sum + r.skill.weight, 0);
  const overall =
    weightSum === 0
      ? 0
      : Math.round(rows.reduce((sum, r) => sum + r.percent * r.skill.weight, 0) / weightSum);

  const totalTopics = rows.reduce((sum, r) => sum + r.skill.topics.length, 0);
  const completedTopics = rows.reduce((sum, r) => sum + r.completedTopics, 0);

  return { rows, overall, totalTopics, completedTopics };
}

/**
 * Recommends the next topic: the highest-weighted skill that is started but
 * unfinished, otherwise the highest-weighted skill not started yet.
 */
export function recommendNext(rows: SkillReadiness[]) {
  const started = rows
    .filter((r) => r.percent > 0 && r.percent < 100 && r.nextTopic)
    .sort((a, b) => b.skill.weight - a.skill.weight)[0];
  const fresh = rows
    .filter((r) => r.percent === 0 && r.nextTopic)
    .sort((a, b) => b.skill.weight - a.skill.weight)[0];
  const pick = started ?? fresh;
  if (!pick || !pick.nextTopic) return null;

  const reason = started
    ? `You've cleared ${pick.completedTopics} of ${pick.skill.topics.length} topics in ${pick.skill.name}. Keep the streak going.`
    : `${pick.skill.name} decides ${pick.skill.weight}% of placement rounds for your branch, and you haven't started it yet.`;

  return { skill: pick.skill, topic: pick.nextTopic, reason };
}

/** Biggest gap = highest-weight skill with the lowest completion. */
export function biggestGap(rows: SkillReadiness[]) {
  return [...rows].sort(
    (a, b) => (100 - b.percent) * b.skill.weight - (100 - a.percent) * a.skill.weight,
  )[0];
}

export const ALL_SKILL_SLUGS = SKILLS.map((s) => s.slug);
