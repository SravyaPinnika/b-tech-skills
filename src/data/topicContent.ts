export interface TopicContent {
  /** Short W3Schools-style definition. */
  summary: string;
  /** Must-know points asked in interviews. */
  keyPoints: string[];
  /** Optional snippet or formula. */
  syntax?: { lang: string; code: string };
  /** Monospace diagram rendered in a <pre> block. */
  diagram: string;
  /** Longer explanation paragraphs that go beyond the summary. */
  deepDive?: string[];
  /** One worked example, dry-run style. */
  example?: { title: string; steps: string[]; result?: string };
  /** Frequent student mistakes and the fix. */
  mistakes?: { mistake: string; fix: string }[];
  /** Interview questions with model answers. */
  interviewQA?: { q: string; a: string }[];
  /** Things to practise / build after reading. */
  practice?: string[];
}


export type TopicMap = Record<string, TopicContent>;

import { dsaTopics } from "./topics/dsa";
import { dbmsTopics } from "./topics/dbms";
import { osTopics } from "./topics/os";
import { networksTopics } from "./topics/networks";
import { systemDesignTopics } from "./topics/system-design";
import { languageTopics } from "./topics/language";
import { mlTopics } from "./topics/ml";
import { dlTopics } from "./topics/dl";
import { llmTopics } from "./topics/llm";
import { statsTopics } from "./topics/stats";
import { dataAnalysisTopics } from "./topics/data-analysis";
import { webTopics } from "./topics/web";
import { devopsTopics } from "./topics/devops";
import { aptitudeTopics } from "./topics/aptitude";

export const TOPIC_CONTENT: Record<string, TopicMap> = {
  "data-structures-algorithms": dsaTopics,
  "dbms-sql": dbmsTopics,
  "operating-systems": osTopics,
  "computer-networks": networksTopics,
  "system-design": systemDesignTopics,
  "programming-language-mastery": languageTopics,
  "machine-learning": mlTopics,
  "deep-learning": dlTopics,
  "applied-llm-genai": llmTopics,
  "statistics-probability": statsTopics,
  "data-analysis-visualisation": dataAnalysisTopics,
  "web-development": webTopics,
  "devops-cloud": devopsTopics,
  "aptitude-communication": aptitudeTopics,
};

export function topicContent(skillSlug: string, topic: string): TopicContent | undefined {
  return TOPIC_CONTENT[skillSlug]?.[topic];
}
