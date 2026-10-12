export type Branch = "CSE" | "IT" | "AIML" | "DS";

export const BRANCHES: { id: Branch; label: string; headline: string; blurb: string }[] = [
  {
    id: "CSE",
    label: "CSE",
    headline: "Computer Science Ascent",
    blurb: "Rigorous skill tracks optimised for product-company technical evaluations.",
  },
  {
    id: "IT",
    label: "IT",
    headline: "Information Technology Ascent",
    blurb: "Service-to-product pipeline: fundamentals, web delivery and cloud operations.",
  },
  {
    id: "AIML",
    label: "AIML",
    headline: "AI & Machine Learning Ascent",
    blurb: "Maths-backed modelling plus the applied LLM stack recruiters now screen for.",
  },
  {
    id: "DS",
    label: "DS",
    headline: "Data Science Ascent",
    blurb: "SQL depth, statistics and storytelling — the three things every DS panel probes.",
  },
];

export interface Skill {
  slug: string;
  name: string;
  tagline: string;
  /** Share of placement rounds where this skill decides the outcome. */
  weight: number;
  branches: Branch[];
  importance: string;
  topics: string[];
  interviewFocus: string[];
}

export const SKILLS: Skill[] = [
  {
    slug: "data-structures-algorithms",
    name: "Data Structures & Algorithms",
    tagline: "Interview survival core.",
    weight: 98,
    branches: ["CSE", "IT", "AIML", "DS"],
    importance:
      "Every company with a coding round filters on DSA first. No amount of project work compensates for failing the online assessment.",
    topics: [
      "Arrays & Strings",
      "Hashing & Frequency Maps",
      "Two Pointers / Sliding Window",
      "Recursion & Backtracking",
      "Sorting & Searching, Binary Search on Answer",
      "Linked Lists, Stacks, Queues",
      "Trees & BST Traversals",
      "Heaps & Priority Queues",
      "Graphs: BFS, DFS, Topological Sort, Dijkstra",
      "Dynamic Programming: 1D, 2D, knapsack, LIS, DP on trees",
      "Greedy & Interval problems",
      "Time & Space Complexity analysis",
    ],
    interviewFocus: [
      "Solve 2 medium problems in 45 minutes while narrating your approach",
      "State complexity before writing code",
      "Handle edge cases without being prompted",
    ],
  },
  {
    slug: "dbms-sql",
    name: "DBMS & SQL",
    tagline: "Transactional integrity fundamentals.",
    weight: 88,
    branches: ["CSE", "IT", "DS"],
    importance:
      "SQL is the one skill asked in coding rounds, technical interviews and analytics rounds alike. It is also the easiest place to lose marks on theory.",
    topics: [
      "ER modelling & Normalisation (1NF to BCNF)",
      "Joins, subqueries, CTEs",
      "Window functions & aggregation",
      "Indexes and query plans",
      "Transactions, ACID, isolation levels",
      "Locking & deadlocks",
      "NoSQL vs relational trade-offs",
    ],
    interviewFocus: [
      "Write a window-function query on a whiteboard",
      "Explain why a query is slow and how an index fixes it",
      "Normalise a messy table live",
    ],
  },
  {
    slug: "operating-systems",
    name: "Operating Systems",
    tagline: "Concurrency and memory theory.",
    weight: 74,
    branches: ["CSE", "IT"],
    importance:
      "Core-subject rounds at product companies and most PSU/service interviews lean heavily on OS theory. High return for low study time.",
    topics: [
      "Process vs thread, context switching",
      "CPU scheduling algorithms",
      "Synchronisation: mutex, semaphore, monitors",
      "Deadlock conditions & avoidance",
      "Memory management, paging, segmentation",
      "Virtual memory & page replacement",
      "File systems and I/O",
    ],
    interviewFocus: [
      "Producer–consumer with semaphores",
      "Explain thrashing and how to detect it",
      "Compare paging with segmentation",
    ],
  },
  {
    slug: "computer-networks",
    name: "Computer Networks",
    tagline: "How the request actually travels.",
    weight: 66,
    branches: ["CSE", "IT"],
    importance:
      "Asked as theory in core rounds and as practical reasoning in system design and backend interviews.",
    topics: [
      "OSI & TCP/IP layers",
      "TCP vs UDP, handshakes, flow control",
      "HTTP/HTTPS, TLS, status codes",
      "DNS resolution, DHCP, NAT",
      "IP addressing & subnetting",
      "Routing basics and switching",
      "Web security: CORS, XSS, CSRF",
    ],
    interviewFocus: [
      "Walk through what happens when you type a URL",
      "Explain the TLS handshake in plain terms",
      "Subnet a given address block",
    ],
  },
  {
    slug: "system-design",
    name: "System Design",
    tagline: "Scalability and architecture.",
    weight: 70,
    branches: ["CSE", "IT"],
    importance:
      "Low-level design appears even in fresher interviews at product companies; high-level design becomes decisive for the top tier and for internship-to-PPO conversions.",
    topics: [
      "OOP & SOLID principles",
      "Low-level design: parking lot, splitwise, cache",
      "Design patterns: factory, observer, strategy, singleton",
      "Load balancing & horizontal scaling",
      "Caching layers and invalidation",
      "Database sharding & replication",
      "CAP theorem and consistency models",
      "Message queues and async processing",
      "API design & rate limiting",
      "Two Sum problem theory",
    ],
    interviewFocus: [
      "Design a URL shortener end to end",
      "Justify SQL vs NoSQL for a given workload",
      "Draw class diagrams for a small system",
    ],
  },
  {
    slug: "programming-language-mastery",
    name: "Core Language Mastery",
    tagline: "One language, deeply.",
    weight: 82,
    branches: ["CSE", "IT", "AIML", "DS"],
    importance:
      "Panels probe language internals once your solution works. Depth in one language (C++, Java or Python) beats shallow familiarity with four.",
    topics: [
      "Memory model & references vs values",
      "OOP implementation in your language",
      "Standard library / STL / collections",
      "Exception handling patterns",
      "Generics or templates",
      "Concurrency primitives",
      "Language-specific gotchas (GIL, JVM GC, undefined behaviour)",
    ],
    interviewFocus: [
      "Explain how your language manages memory",
      "Pick the right container and defend it",
      "Debug a snippet you did not write",
    ],
  },
  {
    slug: "machine-learning",
    name: "Machine Learning",
    tagline: "Classical modelling before deep nets.",
    weight: 92,
    branches: ["AIML", "DS"],
    importance:
      "AIML and DS panels start with classical ML because it exposes whether you understand bias-variance, evaluation and leakage — not just library calls.",
    topics: [
      "Supervised vs unsupervised learning",
      "Linear & logistic regression, regularisation",
      "Decision trees, random forest, gradient boosting",
      "SVM & kernel intuition",
      "Clustering: k-means, hierarchical, DBSCAN",
      "Dimensionality reduction: PCA, t-SNE",
      "Feature engineering & data leakage",
      "Cross-validation and metric selection",
      "Bias-variance trade-off, overfitting control",
    ],
    interviewFocus: [
      "Choose a metric for an imbalanced dataset and defend it",
      "Explain how gradient boosting differs from bagging",
      "Diagnose why validation score beats test score",
    ],
  },
  {
    slug: "deep-learning",
    name: "Deep Learning",
    tagline: "Networks, training dynamics, transformers.",
    weight: 84,
    branches: ["AIML"],
    importance:
      "Required for AIML-branded roles. Interviewers care about training behaviour and architecture choices more than about writing layers from scratch.",
    topics: [
      "Perceptrons, activations, backpropagation",
      "Loss functions & optimisers (SGD, Adam)",
      "Regularisation: dropout, batch norm, early stopping",
      "CNNs and computer-vision pipelines",
      "RNN, LSTM and sequence modelling",
      "Attention & transformer architecture",
      "Transfer learning & fine-tuning",
      "Model evaluation and error analysis",
    ],
    interviewFocus: [
      "Explain attention without equations, then with them",
      "Fix a network that will not converge",
      "Compare fine-tuning with feature extraction",
    ],
  },
  {
    slug: "applied-llm-genai",
    name: "Applied LLM & GenAI",
    tagline: "The stack hiring managers ask about now.",
    weight: 78,
    branches: ["AIML", "DS", "CSE"],
    importance:
      "The fastest-moving section of the placement market. A single deployed RAG or agent project routinely becomes the entire interview conversation.",
    topics: [
      "Prompt engineering & structured output",
      "Embeddings and vector search",
      "Retrieval-augmented generation (RAG)",
      "Chunking, reranking and evaluation",
      "Tool calling & agent loops",
      "Fine-tuning vs prompting vs RAG trade-offs",
      "Guardrails, hallucination handling, cost control",
    ],
    interviewFocus: [
      "Explain your RAG pipeline's failure modes",
      "Decide between fine-tuning and retrieval for a case",
      "Estimate token cost of a feature",
    ],
  },
  {
    slug: "statistics-probability",
    name: "Statistics & Probability",
    tagline: "The maths panels actually test.",
    weight: 86,
    branches: ["DS", "AIML"],
    importance:
      "Data-science interviews devote a full round to statistics. Weak probability answers end DS candidacies faster than weak coding.",
    topics: [
      "Descriptive statistics & distributions",
      "Conditional probability & Bayes theorem",
      "Central limit theorem & sampling",
      "Hypothesis testing, p-values, errors",
      "Confidence intervals",
      "A/B testing design and pitfalls",
      "Correlation vs causation, confounders",
    ],
    interviewFocus: [
      "Design an A/B test and define the stopping rule",
      "Solve a conditional-probability puzzle aloud",
      "Interpret a p-value correctly",
    ],
  },
  {
    slug: "data-analysis-visualisation",
    name: "Data Analysis & Visualisation",
    tagline: "From raw table to decision.",
    weight: 80,
    branches: ["DS", "IT"],
    importance:
      "Analytics rounds are case-based: clean data, find the signal, present it. Visual clarity is graded as much as correctness.",
    topics: [
      "Pandas / NumPy data wrangling",
      "Missing data & outlier strategy",
      "Exploratory data analysis workflow",
      "Matplotlib, Seaborn, Plotly",
      "Dashboarding with Power BI or Tableau",
      "Excel for quick analysis rounds",
      "Storytelling and executive summaries",
    ],
    interviewFocus: [
      "Take a messy CSV to three insights in 30 minutes",
      "Choose the right chart and justify it",
      "Present a finding to a non-technical stakeholder",
    ],
  },
  {
    slug: "web-development",
    name: "web development",
    tagline: "Ship something people can open.",
    weight: 76,
    branches: ["CSE", "IT"],
    importance:
      "Most campus projects are judged on whether they run. A deployed full-stack app gives interviewers something concrete to interrogate.",
    topics: [
      "HTML, CSS, responsive layout",
      "JavaScript & TypeScript fundamentals",
      "React: components, state, hooks",
      "REST API design and consumption",
      "Authentication & session handling",
      "Backend with Node / Spring / Django",
      "Database integration and migrations",
      "Deployment, environment config, monitoring",
    ],
    interviewFocus: [
      "Explain your app's data flow end to end",
      "Describe how you handled auth securely",
      "Show what you would refactor and why",
    ],
  },
  {
    slug: "devops-cloud",
    name: "DevOps & Cloud",
    tagline: "Delivery, not just development.",
    weight: 62,
    branches: ["CSE", "IT"],
    importance:
      "A differentiator rather than a filter: it rarely blocks an offer, but it frequently upgrades one — especially for infra and backend roles.",
    topics: [
      "Linux command line & shell scripting",
      "Git branching and PR workflow",
      "Docker images, volumes, compose",
      "CI/CD pipelines (GitHub Actions)",
      "Kubernetes basics",
      "Cloud primitives: compute, storage, IAM",
      "Logging, metrics, alerting",
    ],
    interviewFocus: [
      "Describe your deployment pipeline",
      "Debug a container that exits immediately",
      "Explain least-privilege access",
    ],
  },
  {
    slug: "aptitude-communication",
    name: "Aptitude & Communication",
    tagline: "The rounds nobody prepares for.",
    weight: 90,
    branches: ["CSE", "IT", "AIML", "DS"],
    importance:
      "Aptitude tests are the first elimination in mass recruitment, and the HR round is the last. Both are learnable, and both eliminate strong coders every season.",
    topics: [
      "Quantitative aptitude: ratios, time-work, probability",
      "Logical reasoning & puzzles",
      "Verbal ability and reading comprehension",
      "Resume framing with measurable impact",
      "Project storytelling (STAR method)",
      "HR questions & salary conversations",
      "Group discussion technique",
    ],
    interviewFocus: [
      "Clear a sectional-timed aptitude paper",
      "Explain your best project in 90 seconds",
      "Answer 'why should we hire you' without clichés",
    ],
  },
];

export function skillsForBranch(branch: Branch): Skill[] {
  return SKILLS.filter((skill) => skill.branches.includes(branch)).sort((a, b) => b.weight - a.weight);
}

export function skillBySlug(slug: string): Skill | undefined {
  return SKILLS.find((skill) => skill.slug === slug);
}
