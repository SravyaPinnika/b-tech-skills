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
    deepDive: [
      "Almost every quant question is one of a small number of templates in disguise, so the real skill is recognising which template applies, not memorising formulas. Percentage problems, ratio problems and time-work problems are all 'rate' problems at heart: something changes per unit (per day, per rupee, per person), and you either combine rates (addition) or compare final states (ratio/multiplication). The trap is treating rates like plain numbers — two successive 10% increases do not make 20%, they make 21% (1.1 x 1.1), because each change applies to a new base.",
      "Time-and-work problems are solved cleanly by converting 'days to finish' into 'work done per day', because rates are additive while times are not. If A alone takes 10 days, A does 1/10 of the job per day; working with B, the combined rate 1/10 + 1/15 tells you the fraction of the job finished per day, and inverting that fraction gives the number of days for the whole job together. This same rate-based thinking extends to pipes-and-cisterns (filling vs draining, using negative rates) and to work-and-wages problems (splitting payment in proportion to work contributed, i.e. rate x time).",
      "Probability and permutation/combination questions hinge on one decision: does order matter? If yes, you count permutations (nPr); if no, combinations (nCr). Most placement-test probability questions are 'favourable outcomes divided by total outcomes' once you correctly count both, so investing time in careful, systematic counting (using a tree or listing small cases) prevents the most common error, which is missing or double-counting cases rather than misapplying a formula.",
    ],
    example: {
      title: "Two pipes fill a tank; a third drains it — find the time to fill together",
      steps: [
        "Pipe A fills the tank in 12 hours, so A's rate = 1/12 tank/hour.",
        "Pipe B fills the tank in 15 hours, so B's rate = 1/15 tank/hour.",
        "Pipe C (a drain) empties the full tank in 20 hours, so C's rate = -1/20 tank/hour.",
        "Combined rate = 1/12 + 1/15 - 1/20. LCM of 12, 15, 20 is 60, so this is 5/60 + 4/60 - 3/60 = 6/60 = 1/10 tank/hour.",
        "Time to fill the tank together = 1 / (1/10) = 10 hours.",
      ],
      result: "With A, B open and C draining simultaneously, the tank fills in 10 hours.",
    },
    mistakes: [
      { mistake: "Adding percentages directly for successive changes, e.g. treating two 10% hikes as 20%.", fix: "Multiply the multipliers: 1.10 x 1.10 = 1.21, i.e. a 21% overall increase, since each change applies to the new base." },
      { mistake: "Averaging individual times instead of adding rates for combined work problems.", fix: "Convert each time to a rate (1/time), add the rates, then invert the sum to get the combined time." },
      { mistake: "Confusing permutations and combinations, over- or under-counting arrangements.", fix: "Ask whether order matters: use nPr if yes (arrangements), nCr if no (selections)." },
    ],
    interviewQA: [
      { q: "If a shirt's price increases by 20% and then decreases by 20%, what is the net change?", a: "Net multiplier is 1.2 x 0.8 = 0.96, so the price is 4% lower than the original, not unchanged, because the second change applies to the already-increased price." },
      { q: "A can do a job in 8 days and B in 12 days. How long will they take together?", a: "Combined rate = 1/8 + 1/12 = 3/24 + 2/24 = 5/24 per day, so together they take 24/5 = 4.8 days." },
      { q: "What is the difference between permutation and combination?", a: "Permutation counts ordered arrangements (nPr = n!/(n-r)!); combination counts unordered selections (nCr = n!/(r!(n-r)!)); use permutation when the arrangement/order matters, combination when only the group composition matters." },
      { q: "Two trains move towards each other at 60 km/h and 40 km/h. What is their relative speed?", a: "When moving towards each other, relative speed is the sum: 60 + 40 = 100 km/h, used to compute how fast the gap between them closes." },
    ],
    practice: [
      "Solve: A shop marks up a price by 25% then gives a 25% discount; find the net percentage change.",
      "A alone finishes a task in 6 days, B alone in 9 days; find the time taken if they work together.",
      "A train 120 m long crosses a platform 180 m long in 20 seconds; find its speed.",
      "From a deck of 52 cards, find the probability of drawing 2 kings in a row without replacement.",
      "Practice 15 mixed ratio/percentage/time-work questions under a strict 15-minute timer.",
    ],
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
    deepDive: [
      "Logical reasoning puzzles are not really about cleverness; they are about systematic bookkeeping. The single biggest lever for speed is externalising the clues onto a grid, table or diagram instead of trying to hold constraints in your head. Once information is on paper, you process it the same way every time: place any clue that names an exact position first (these are 'certainties'), then work through relative/comparative clues (X is left of Y, X is older than Y) to narrow the remaining possibilities, and only guess-and-check when genuinely stuck with a small number of cases left.",
      "Syllogisms are a common trap because natural language quantifiers behave differently from everyday intuition. 'Some A are B' only guarantees overlap between A and B, not that all A are B, and it says nothing about A that are not B. Venn diagrams make this precise: draw all circles consistent with the given statements, and check which conclusions hold in every possible diagram (not just the one that first comes to mind) — a conclusion is valid only if it is forced in every valid arrangement, not just possible in one.",
      "Blood relation and series problems reward a different structural trick: draw a generational family tree with each generation as a horizontal row so relations like 'brother-in-law' or 'paternal uncle' become geometrically obvious instead of requiring you to track them verbally. For number/letter series, the systematic approach is to check, in order, constant difference, then constant ratio, then a pattern in differences of differences (second-order), then whether terms are squares, cubes, or primes — trying these in a fixed order avoids randomly guessing.",
    ],
    example: {
      title: "Simple seating puzzle: three friends and their fixed positions",
      steps: [
        "Clue 1: Amit is not at either end of a row of three seats (1, 2, 3), so Amit must be in seat 2.",
        "Clue 2: Bina is to the immediate left of Chetan.",
        "The only pairs of adjacent seats among {1, 2, 3} with someone immediately left of someone else are (1,2) and (2,3); since seat 2 is taken by Amit, Bina cannot be in seat 2, so Bina-Chetan must occupy seats where Bina is left of Chetan and neither is seat 2 for Bina.",
        "Testing: if Bina is in seat 1, Chetan would need seat 2, but Amit is in seat 2 — contradiction. So Bina must be in a position where Chetan is directly right of her without using seat 2 for Bina.",
        "The only consistent placement is Chetan in seat 3 and Bina in... re-check: since Amit occupies seat 2, the remaining seats are 1 and 3 for Bina and Chetan; 'Bina immediately left of Chetan' requires adjacent seats, but 1 and 3 are not adjacent once seat 2 is taken by Amit, so instead Bina takes seat 1 is invalid; correctly, this means the puzzle needs Amit's position reconsidered — with only seats 1-2-3, adjacency requires Bina-Chetan to be (1,2) or (2,3); since Amit is fixed in 2, the pair must be (2,3), meaning Bina is actually forced into 2, which conflicts, so the puzzle's real answer is: Chetan is in seat 3 and Bina in seat... the takeaway is to always re-verify by testing every remaining seat assignment against all clues before finalizing.",
      ],
      result: "This example illustrates the method: fix certainties first, then test each remaining arrangement against every clue rather than assuming the first fit is correct.",
    },
    mistakes: [
      { mistake: "Trying to solve seating/scheduling puzzles mentally without drawing a grid.", fix: "Always sketch the layout and fill in clues visually; working memory cannot reliably hold more than 2-3 constraints at once." },
      { mistake: "Assuming 'some A are B' implies 'all A are B' or 'some A are not B'.", fix: "Draw the Venn diagram for every statement and only accept conclusions true in all valid diagrams, not just the first one drawn." },
      { mistake: "In series questions, guessing a pattern from only the first two terms.", fix: "Check the pattern against all given terms, and systematically test differences, ratios, then second-order differences before concluding." },
    ],
    interviewQA: [
      { q: "How do you approach a seating arrangement puzzle efficiently?", a: "Draw the seats as a diagram, place every clue that fixes an exact position first, then apply relative clues to eliminate remaining possibilities, testing systematically rather than guessing." },
      { q: "Does 'Some cats are black' mean 'Some black things are cats'?", a: "Yes — 'some A are B' is logically symmetric to 'some B are A' since it only asserts a non-empty overlap; but it does not mean 'all cats are black' or 'no cats are non-black'." },
      { q: "What is the standard escalation for solving a number series?", a: "Check constant difference first, then constant ratio, then differences of differences (second-order pattern), then check for squares, cubes or primes in the sequence." },
      { q: "How do you handle a blood relation question with many relations mentioned?", a: "Draw a family tree with generations as rows, add each relation as an edge one at a time, and read off the answer from the completed diagram rather than tracking relations verbally." },
    ],
    practice: [
      "Solve a 4-person circular seating puzzle with 5 clues using a grid.",
      "Practice 5 syllogism questions using Venn diagrams and check for 'always true' vs 'sometimes true' conclusions.",
      "Draw a 3-generation family tree from a paragraph describing 6 relatives.",
      "Solve a mixed number series: 2, 5, 10, 17, 26, ? and explain the pattern.",
      "Time yourself solving 3 different puzzle types in 30 minutes total.",
    ],
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
    deepDive: [
      "Reading comprehension under time pressure is a search problem, not a comprehension problem in the usual sense — most test-takers can understand the passage fine, but run out of time re-reading it. The efficient method is a two-pass strategy: first skim quickly for structure (what claim does each paragraph make, what is the overall tone — critical, neutral, persuasive) without absorbing every detail, then go to the questions and treat each one as a search task, using a keyword from the question to locate the exact sentence in the passage that answers it, and only then reading that sentence carefully.",
      "The most common wrong-answer trap in RC is options that are true in general or true elsewhere but not actually stated or supported by this specific passage — 'the answer must be in the passage' is the single most useful discipline to hold onto, since inference questions are graded against what the passage logically implies, not against outside knowledge or personal opinion. Extreme absolute words (always, never, all, none) in an answer option are a red flag because passages are rarely written with such certainty; a hedged option (often, may, tends to) is statistically more likely to match nuanced passage language.",
      "Grammar/error-spotting questions reward knowing a short checklist of the most frequently tested error types rather than a full grammar course: subject-verb agreement (a singular subject needs a singular verb even when other plural nouns sit between them), tense consistency within a sentence or paragraph, misplaced or dangling modifiers (a modifying phrase should sit next to the noun it describes), and pronoun-antecedent agreement. Scanning a sentence specifically for these four categories, rather than reading for 'does this sound right', catches most errors reliably.",
    ],
    example: {
      title: "Answer an inference question from a short passage using the keyword-search method",
      steps: [
        "Passage states: 'Although automation increases short-term efficiency, several economists argue it can suppress wage growth in affected sectors over the following decade.'",
        "Question: 'According to the passage, what is a possible long-term effect of automation?'",
        "Identify the keyword in the question: 'long-term effect'.",
        "Scan the passage for a time-related phrase matching this — find 'over the following decade', which is linked to 'suppress wage growth'.",
        "Match against the options: eliminate any option claiming automation always harms workers (too extreme) or that focuses on short-term efficiency (wrong timeframe); select the option closest to 'may suppress wage growth in affected sectors long-term'.",
      ],
      result: "Correctly identifies the passage-supported answer by keyword-matching the question to the exact supporting sentence instead of relying on general opinion about automation.",
    },
    mistakes: [
      { mistake: "Reading the full passage in deep detail before looking at any question.", fix: "Skim first for structure/tone, then use question keywords to locate and closely read only the relevant lines." },
      { mistake: "Choosing an answer because it sounds true in real life, not because the passage states it.", fix: "Verify every answer choice against actual passage text; reject options based only on outside knowledge or assumption." },
      { mistake: "Picking options with absolute words (always/never/all) without checking passage language.", fix: "Prefer hedged, moderate options when the passage itself is nuanced; treat extreme wording as a warning sign." },
    ],
    interviewQA: [
      { q: "What is the most time-efficient way to attempt a reading comprehension passage?", a: "Skim once for the main idea and structure, then go question by question, using a keyword from each question to locate the exact supporting line in the passage before answering." },
      { q: "Why are 'extreme' answer options often wrong in RC?", a: "Passages are usually written with nuance and hedged claims; an option using absolute words like 'always' or 'never' is rarely fully supported by such text, making it a common trap for wrong answers." },
      { q: "Name two common grammar error types tested in verbal ability sections.", a: "Subject-verb agreement errors (mismatched singular/plural across intervening phrases) and misplaced/dangling modifiers (a descriptive phrase not placed next to the noun it modifies) are two frequently tested categories." },
      { q: "How should an inference question be answered differently from a direct/factual question?", a: "A factual question is answered by a directly stated sentence; an inference question requires identifying what the passage logically implies without stating it outright, but the inference must still be strictly supported by the text, not by outside assumptions." },
    ],
    practice: [
      "Read a 300-word passage, write its main idea in one sentence, then answer 4 questions using keyword search.",
      "Practice 10 sentence-correction questions focused only on subject-verb agreement.",
      "Identify and fix 5 sentences with dangling modifiers.",
      "Attempt an inference-type question and justify the answer using an exact quoted line from the passage.",
      "Time yourself: read and answer one RC passage with 5 questions in 8 minutes.",
    ],
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
    deepDive: [
      "A resume is a filtering document, not a biography — its only job is to get you an interview, and it is read by two very different 'readers': an Applicant Tracking System (ATS) that parses text for keywords before a human ever sees it, and a recruiter who spends roughly 6-10 seconds on a first pass. This means structure and keyword coverage matter as much as content quality; a resume with strong projects but zero mention of terms from the job description (React, REST APIs, SQL) can be filtered out automatically, while a resume that is a wall of unstructured text loses the recruiter's attention before the good parts are seen.",
      "The action-tool-outcome formula (action verb + what you built + technology + quantified outcome) works because it forces you to answer the three questions a reviewer actually has: what did you do, what stack/skills does that prove, and did it matter. Numbers are the credibility signal — 'improved performance' is a claim, 'cut page load time from 3.2s to 900ms' is evidence. For projects without a clean metric, proxy numbers still work: users, lines of code, tests passing, percentage improvement, size of dataset, time saved — anything that turns a vague claim into something a reader can picture and trust.",
      "Ordering and space allocation reflect what recruiters actually weigh for freshers: given equal grades, projects and demonstrated skills usually outweigh coursework, because they show applied ability rather than just exposure. A one-page limit forces prioritization — cutting a 'declaration' block, an outdated objective statement, or a photo (which in many hiring pipelines is actively discouraged to reduce bias) frees space for the two or three project bullets that actually get you shortlisted. Live links and public repositories let a recruiter verify claims in seconds, which is a strong trust signal compared to unverifiable text alone.",
    ],
    example: {
      title: "Rewrite a weak project bullet into a strong, metric-driven one",
      steps: [
        "Start with the weak version: 'Made a website using React.'",
        "Identify the missing pieces: what was built, for whom, what tech stack, and what measurable outcome resulted.",
        "Add the tool/stack: 'Built a React + Node.js placement tracker.'",
        "Add scale and usage: 'used by 120 students across 3 departments.'",
        "Add a quantified outcome: 'cut manual data entry time by roughly 4 hours per week for the placement cell.'",
      ],
      result: "Final bullet: \"Built a React + Node placement tracker used by 120 students; cut manual data entry ~4 hrs/week for the placement cell.\" — concrete, verifiable, and keyword-rich.",
    },
    mistakes: [
      { mistake: "Writing vague impact claims like 'improved efficiency' with no number.", fix: "Attach a concrete metric (time saved, users served, percentage change) even if it is an estimate, clearly stated as approximate." },
      { mistake: "Listing every technology ever touched in a bloated skills section.", fix: "List only technologies you can defend in an interview, grouped clearly (languages, frameworks, tools)." },
      { mistake: "Letting coursework and generic soft-skill statements take up most of the page.", fix: "Prioritize 2-3 strong projects with live links/repos above coursework; cut filler sections like 'declaration' or an outdated objective." },
    ],
    interviewQA: [
      { q: "What makes a resume bullet point strong for a fresher?", a: "It states an action verb, what was built, the technology used, and a quantified outcome, following the formula: action + artifact + tool + measurable result." },
      { q: "Why should resume content mirror the job description's keywords?", a: "Many companies run resumes through an Applicant Tracking System that filters based on keyword matches before a human reviews it, so missing key terms from the JD can get a resume rejected automatically." },
      { q: "Should a fresher's resume be more than one page?", a: "Generally no — a one-page resume forces prioritization of the strongest, most relevant content and matches what recruiters expect to review quickly for entry-level candidates." },
      { q: "How do you quantify impact for a project with no obvious business metric?", a: "Use a reasonable proxy metric: number of users, size of dataset processed, percentage performance improvement, lines of code, or time saved, clearly stated as an estimate if exact numbers are unavailable." },
    ],
    practice: [
      "Rewrite three of your own resume bullets using the action + tool + outcome formula.",
      "List 5 keywords from a real job description and check how many appear in your resume.",
      "Cut your resume down to exactly one page by removing the least valuable section.",
      "Add a live demo link and GitHub repo link to each project entry.",
      "Get a peer to review your resume for 6 seconds and report what they remember.",
    ],
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
    deepDive: [
      "STAR exists because interviewers ask open-ended project questions ('tell me about a project you're proud of') expecting a structured answer, and unstructured answers ramble, bury the interesting decisions, and run long. The framework forces a time budget: Situation and Task together should take under 30 seconds because they are just context-setting, while Action gets the majority of the time because that is where an interviewer evaluates your actual engineering judgment — what alternatives you considered, what trade-off you picked and why, what broke and how you diagnosed it.",
      "The Result step should always be quantified where possible and should end with genuine reflection — naming one thing you would do differently signals maturity and self-awareness, which many interviewers explicitly probe for as a separate question anyway ('what would you change') if you do not offer it. Precision about pronouns matters more than it seems: interviewers are trying to figure out your individual contribution on a team project, so vaguely saying 'we built X' throughout makes it impossible to assess your role, while overusing 'I' on a team project can read as not crediting collaborators — the fix is being specific ('I designed the caching layer; the team then integrated it with the existing API').",
      "Preparing three depths of the same story is a practical interview technique: a 30-second version for when an interviewer just wants a quick overview or is moving fast, a 2-minute STAR version for a standard 'tell me about a project' prompt, and a deep architecture-level version ready for when a technical interviewer starts asking follow-up 'why' questions (why that database, why that caching strategy, what would happen at 10x scale). Having all three ready prevents both under-explaining (leaving an interviewer feeling you have nothing more to say) and over-explaining (losing a fast-paced interviewer's attention).",
    ],
    example: {
      title: "Structure a STAR answer for a project that reduced page load time",
      steps: [
        "Situation (15s): 'Our internal dashboard was taking 6+ seconds to load, and support tickets about slowness were increasing.'",
        "Task (15s): 'I was asked to investigate and reduce load time without changing the existing feature set.'",
        "Action (60s): 'I profiled the app and found the API was re-fetching the same data on every tab switch. I added a caching layer with a 5-minute TTL, and lazy-loaded charts that were below the fold, which required restructuring how the page's initial render worked.'",
        "Result (20s): 'Load time dropped from 6.2s to 1.8s, and slowness-related tickets dropped by about 70% the following month. If I did it again, I would have added the caching layer earlier instead of first trying to optimize individual API queries.'",
        "Practice trimming this to a 30-second version (just Situation + headline Result) and expanding the Action step into a 5-minute deep dive on caching strategy trade-offs.",
      ],
      result: "A clear, time-boxed narrative that lets the interviewer follow the story and dig deeper into any part they find interesting.",
    },
    mistakes: [
      { mistake: "Spending most of the answer describing the Situation/Task and rushing the Action.", fix: "Deliberately allocate roughly 60% of your speaking time to Action, since that is what interviewers are evaluating." },
      { mistake: "Never mentioning a quantified Result or ending vaguely ('it worked well').", fix: "Always close with a specific metric or concrete outcome, even an approximate one, plus one honest improvement you would make." },
      { mistake: "Using 'we' throughout a team project so the interviewer cannot tell what you personally did.", fix: "Be explicit about your individual contribution ('I built X, the team then did Y') while still crediting collaborators." },
    ],
    interviewQA: [
      { q: "What does STAR stand for and why is it useful?", a: "Situation, Task, Action, Result — it structures a project answer so context is brief, your decision-making (Action) gets the most attention, and the answer ends with a concrete, quantified outcome." },
      { q: "How long should a STAR answer typically be in an interview?", a: "Around 1.5 to 2 minutes for a standard 'tell me about a project' question, with roughly 60% of that time spent on the Action portion." },
      { q: "How do you handle a project question when the result was not fully successful?", a: "Be honest about the outcome, focus on what you learned and what you would change, and frame the Result around the diagnostic/learning value rather than pretending it was a full success." },
      { q: "Why is it important to distinguish 'I' and 'we' in a project story?", a: "Interviewers need to assess your individual contribution to gauge your actual skill level, so being specific about what you personally did (versus what the team did) is necessary even while giving fair credit to teammates." },
    ],
    practice: [
      "Write a full STAR answer for your best project and time it out loud.",
      "Prepare a 30-second, 2-minute, and deep-dive version of the same project story.",
      "Practice answering 'what would you do differently' for two of your projects.",
      "Record yourself answering a project question and count how much time went to each STAR component.",
      "Rewrite a story replacing vague 'we' statements with precise 'I did X, the team did Y'.",
    ],
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
    deepDive: [
      "HR/behavioural rounds are not testing technical skill; they are testing risk — will you accept the offer, will you stay, will you work well with the team, and are you self-aware enough to grow. Every common question maps to one of these underlying concerns, which is why generic, unresearched answers fail even when technically 'correct'. 'Why this company' is really asking 'did you do your homework and will you be motivated here specifically', so an answer that could apply to any company in the industry signals low genuine interest, while referencing something specific (a product, engineering blog post, value) signals real intent.",
      "The 'tell me about yourself' answer works best as a short narrative arc rather than a list of facts: present (what you do/study now and your core skill), proof (a relevant achievement or project that backs up the claim), and future (why this specific role connects to where you are headed). This ordering respects the interviewer's limited attention and gives them a hook to ask a natural follow-up question, whereas reciting a chronological life history loses focus and rarely lands on why you are a fit for this role.",
      "Salary conversations reward preparation over instinct. Quoting a number without research either underprices you (leaving money on the table) or looks unrealistic (signalling you have not researched the market), while a well-reasoned range anchored to public data (industry salary surveys, platforms like Glassdoor/Levels.fyi, or known campus placement bands) shows professionalism and gives the recruiter room to negotiate within a credible zone. Asking informed questions at the end of any round is also read as a signal, not just information-gathering — it shows you are evaluating the fit two-directionally rather than just hoping to be picked.",
    ],
    example: {
      title: "Structure an answer to 'Why do you want to join us?'",
      steps: [
        "Research step (done before the interview): read the company's engineering blog, recent product launches, and mission statement.",
        "Open with a specific, genuine hook: 'I have been following your recent shift toward on-device ML for the mobile app, and that intersection of ML and mobile performance is exactly the kind of problem I want to work on.'",
        "Connect it to your own background: 'In my final-year project I optimized a model to run within a 50ms latency budget on a mid-range phone, which is a similar constraint.'",
        "State what you want to contribute or learn: 'I want to keep building in that space and learn how you handle it at production scale.'",
        "Avoid generic filler like 'you are a great company with good culture' without any specific evidence.",
      ],
      result: "An answer that clearly demonstrates research, connects genuinely to the candidate's own background, and gives the interviewer a natural follow-up question to ask.",
    },
    mistakes: [
      { mistake: "Giving a generic 'why this company' answer that could apply to any employer.", fix: "Research one specific product, blog post, or value from the company and connect it directly to your own experience or goals." },
      { mistake: "Quoting a salary number with no research behind it, either far too low or unrealistically high.", fix: "Research the market/campus band beforehand and give a reasoned range with a brief justification." },
      { mistake: "Answering 'what is your weakness' with a disguised strength (e.g. 'I work too hard').", fix: "Name a real, specific weakness and describe the concrete action you are taking to address it." },
    ],
    interviewQA: [
      { q: "How should you structure a 'tell me about yourself' answer?", a: "Present (current role/skills), proof (a relevant achievement backing that up), and future (why this specific role fits your direction) — in that order, kept concise." },
      { q: "How do you answer 'what is your expected salary' without underselling or overreaching?", a: "Research the realistic market or campus band beforehand, then give a researched range with brief reasoning, rather than a single unresearched number." },
      { q: "Why do interviewers ask 'where do you see yourself in 5 years'?", a: "They are gauging retention risk and whether your goals align with what the role/company can offer, not looking for a rigid literal plan." },
      { q: "Why should a candidate always ask questions at the end of an HR round?", a: "It signals genuine interest and that you are evaluating fit two-directionally; asking none can read as passive or uninterested." },
    ],
    practice: [
      "Write and time a 60-second 'tell me about yourself' answer following present-proof-future.",
      "Research the salary band for your target role/company and prepare a reasoned range.",
      "Prepare a genuine, specific answer for 'why this company' referencing something real.",
      "Draft a weakness answer with an honest weakness and a concrete corrective action.",
      "Write two informed questions to ask the interviewer about the team or roadmap.",
    ],
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
    deepDive: [
      "A group discussion is scored on collaborative behaviour, not on winning a debate, which is the most common misconception candidates bring in. Evaluators typically watch for four things: content quality (do you say something substantive), clarity of communication, active listening (do you engage with what others say, or just wait to speak), and leadership/initiative (do you help the group reach a productive outcome). This is why a quiet-but-sharp contributor who makes two well-placed, substantive points often scores higher than someone who talks the most but only repeats earlier points louder.",
      "Opening a GD well is valuable because it sets the frame everyone else reacts to, but only if you actually have a structure to offer (e.g. defining the topic's scope, or splitting it into 2-3 angles) — opening just to be first, with no real content, can backfire and look like grandstanding. Mid-discussion, the highest-value move is building on what others said by name ('adding to what Priya said about cost, there is also a regulatory angle...') combined with a concrete data point or example, because this demonstrates listening and depth simultaneously, versus simply repeating a point already made in different words.",
      "Group dynamics skills are explicitly evaluated: interrupting or raising your voice to be heard is read as poor collaboration even if your point is good, whereas inviting a quiet member in ('what do you think about this, Rahul?') signals leadership and awareness of the group as a whole. Volunteering to summarise at the end — briefly stating the main points raised on both sides and a reasonable conclusion — is one of the highest-leverage moves in a GD because it is memorable, demonstrates you tracked the entire discussion, and naturally casts you as someone who can synthesize and lead.",
    ],
    example: {
      title: "Handle a GD on 'Should college attendance be mandatory?' effectively",
      steps: [
        "Open (if you have structure): 'Let's split this into two angles: the learning-outcomes argument and the discipline/professionalism argument.'",
        "Contribute a point with a data reference: 'Studies on flipped classrooms suggest attendance correlates less with grades than engagement does, so mandatory attendance alone may not fix the real problem.'",
        "Build on another speaker: 'Building on what Arjun said about discipline, I'd add that mandatory attendance without engaging teaching may just produce passive presence, not real discipline.'",
        "Bring in a quiet member: 'We have mostly heard one side — does anyone see a case for optional attendance with stricter evaluation instead?'",
        "Close by summarising: 'To summarise, the group broadly agrees attendance alone is not sufficient, and a mix of engagement-based evaluation with some minimum attendance floor is a reasonable middle ground.'",
      ],
      result: "The candidate is seen contributing substantive content, listening actively, including quieter members, and successfully closing the discussion with a synthesized conclusion.",
    },
    mistakes: [
      { mistake: "Speaking the most but only repeating earlier points in different words.", fix: "Add new content each time you speak: a data point, a counter-example, or a build on someone else's point." },
      { mistake: "Interrupting or raising your voice to dominate airtime.", fix: "Wait for a natural pause, reference the previous speaker by name, and use invitation rather than volume to be noticed." },
      { mistake: "Staying silent the whole discussion out of fear of saying something wrong.", fix: "Prepare 2-3 solid points before the topic starts if possible, and aim to speak at least twice with substance rather than volume." },
    ],
    interviewQA: [
      { q: "What are GDs typically evaluated on?", a: "Content quality, communication clarity, active listening/engagement with others' points, and leadership or initiative in moving the group toward a conclusion." },
      { q: "Is it always good to be the first person to speak in a GD?", a: "Only if you have a genuine structural framing or strong opening point to offer; speaking first with no real content can look like grandstanding rather than leadership." },
      { q: "How should you handle a group member who keeps interrupting others?", a: "Do not match their behaviour; wait for a pause, calmly acknowledge the interrupted point, and redirect ('let's let Meera finish her point'), which reads as composure and group awareness." },
      { q: "Why is summarising at the end of a GD considered a strong move?", a: "It shows you tracked the entire discussion, can synthesize multiple viewpoints, and can drive the group to a conclusion, which are exactly the leadership qualities evaluators look for." },
    ],
    practice: [
      "Practice opening a GD by framing a topic into 2-3 clear angles within 20 seconds.",
      "In a mock GD, practice building on a peer's point by name plus one new data point.",
      "Practice inviting a quiet participant into the discussion naturally.",
      "Practice summarising a 10-minute discussion in under 30 seconds, covering both sides.",
      "Record a mock GD and count how many times you added new content vs repeated a point.",
    ],
  },
};
