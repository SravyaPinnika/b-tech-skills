import type { TopicMap } from "../topicContent";

export const aptitudeTopics: TopicMap = {
  "Quantitative aptitude: ratios, time-work, probability": {
    summary:
      "Sectional tests reward pattern recognition and speed: most questions collapse into ratios, rates or basic counting.",
    keyPoints: [
      "Percentage change = (new - old)/old * 100; successive changes multiply, they do not add.",
      "Time-work: rate = 1/time; combined rate is the sum of individual rates.",
      "Speed-distance: relative speed adds when approaching, subtracts when chasing.",
      "Probability = favourable / total; use permutations when order matters.",
    ],
    syntax: {
      lang: "text",
      code: "A: 10 days -> 1/10 per day\nB: 15 days -> 1/15 per day\ntogether = 1/10 + 1/15 = 1/6  -> 6 days",
    },
    diagram: `work = 1 unit
A |-----------|  10 days
B |----------------|  15 days
A+B |------|  6 days   (rates add, times do not)`,
  },

  "Logical reasoning & puzzles": {
    summary:
      "Reasoning sections test structured elimination: build a grid or diagram, place certainties first, and eliminate the rest.",
    keyPoints: [
      "Seating/scheduling puzzles: draw the layout, mark fixed clues, then test possibilities.",
      "Syllogisms: use Venn diagrams; 'some' does not imply 'all'.",
      "Blood relations: sketch a family tree with generations as rows.",
      "Series: check differences, then ratios, then squares/primes.",
    ],
    diagram: `grid method (who drinks what)
        tea coffee milk
Amit     X    Y     X
Bina     Y    X     X
Chetan   X    X     Y
one Y per row and per column -> unique solution`,
  },

  "Verbal ability and reading comprehension": {
    summary:
      "Verbal marks come from reading strategy, not vocabulary alone: find the main idea, then locate the line that answers each question.",
    keyPoints: [
      "Skim for structure and tone first, then read the questions, then re-read the relevant lines.",
      "Answers must be supported by the passage — never by outside knowledge.",
      "Watch for extreme words (always, never) in wrong options.",
      "Learn common error types: subject-verb agreement, tense shift, misplaced modifiers.",
    ],
    diagram: `passage -> main idea (1 sentence)
        -> paragraph roles: claim | evidence | counter | conclusion
question -> keyword -> locate line -> eliminate 3 options`,
  },

  "Resume framing with measurable impact": {
    summary:
      "Each bullet should state the action, the tool and the measurable result. Numbers are what make a fresher resume credible.",
    keyPoints: [
      "Formula: action verb + what you built + technology + quantified outcome.",
      "One page, reverse chronological, no photo, no 'declaration' block.",
      "Put projects above coursework and include live links plus repositories.",
      "Mirror the job description's keywords — many resumes are machine-screened first.",
    ],
    syntax: {
      lang: "text",
      code: "Weak:  \"Made a website using React.\"\nStrong: \"Built a React + Node placement tracker used by 120 students; cut manual data entry ~4 hrs/week.\"",
    },
    diagram: `[ Name | email | phone | github | linkedin ]
[ Skills: languages / frameworks / tools ]
[ Projects: 3 x (what, stack, metric, link) ]
[ Education | Achievements ]`,
  },

  "Project storytelling (STAR method)": {
    summary:
      "STAR keeps project answers under two minutes and interviewer-friendly: Situation, Task, Action, Result.",
    keyPoints: [
      "Spend most of the time on Action — that is where your decisions show.",
      "End on a quantified Result plus one thing you would change.",
      "Say 'I' for your work and 'we' for team context; be precise about your part.",
      "Prepare three depths: 30 seconds, 2 minutes, and a deep architecture dive.",
    ],
    diagram: `S  problem + context      (15s)
T  your specific goal    (15s)
A  design, trade-offs, obstacles (60s)
R  metric + learning     (20s)`,
  },

  "HR questions & salary conversations": {
    summary:
      "HR rounds check motivation, stability and fit. Answers should be specific to this company and honest about trade-offs.",
    keyPoints: [
      "'Tell me about yourself' = present role/skills, relevant proof, why this role — in that order.",
      "For weaknesses, name a real one plus the concrete correction you are running.",
      "Research the band before quoting a number; give a researched range with reasoning.",
      "Always ask two informed questions about the team or roadmap.",
    ],
    diagram: `question -> intent
"why this company"  -> did you research us?
"biggest failure"   -> self-awareness
"5 year plan"       -> will you stay?
"salary expectation"-> is your range realistic?`,
  },

  "Group discussion technique": {
    summary:
      "GDs assess whether you can move a group forward: enter early with structure, build on others, and summarise at the end.",
    keyPoints: [
      "Open within the first 30 seconds if you have a framework to offer.",
      "Reference other speakers by name and add data, do not repeat.",
      "Never interrupt or raise your voice; bring quiet members in instead.",
      "Volunteer to summarise both sides and land a conclusion.",
    ],
    diagram: `frame the topic -> define scope -> pros | cons
      -> invite a quiet member -> data point -> summarise
scored on: clarity, listening, leadership, content`,
  },
};
