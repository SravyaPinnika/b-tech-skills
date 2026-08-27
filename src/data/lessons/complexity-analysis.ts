import type { Lesson } from "./types";

export const complexityLesson: Lesson = {
  slug: "complexity-analysis",
  topic: "Time & Space Complexity analysis",
  title: "Time & Space Complexity Analysis",
  blurb: "Count operations, not seconds: Big-O, the constraint-to-complexity table, and how to state it in an interview.",
  overview: {
    simple: [
      "Time complexity describes how the number of basic operations grows as the input size n grows. Space complexity does the same for extra memory.",
      "Big-O gives an upper bound and ignores constants and lower-order terms, because those do not change how an algorithm scales: 3n + 50 is O(n).",
      "The practical use is prediction: given the constraint n <= 10^5, you know an O(n^2) solution will time out and you need O(n log n) or better.",
    ],
    whyLearn: [
      "Interviewers expect you to state complexity before writing code and to justify it afterwards.",
      "Constraints in the problem statement tell you which complexity is expected, which narrows the technique to use.",
      "Space analysis catches hidden costs like recursion stacks and copied substrings.",
    ],
    realWorld: [
      "Capacity planning: how a service behaves as traffic multiplies.",
      "Database query cost estimation drives index choices.",
      "Mobile apps must respect memory budgets, not just CPU.",
    ],
  },
  coreConcepts: [
    {
      heading: "Growth rates and the ordering you must memorise",
      body: [
        "O(1) < O(log n) < O(sqrt n) < O(n) < O(n log n) < O(n^2) < O(n^3) < O(2^n) < O(n!).",
        "Constants and lower-order terms are dropped: O(2n + 100) = O(n), O(n^2 + n) = O(n^2).",
        "Big-O is an upper bound, Big-Omega a lower bound, Big-Theta a tight bound. Interviews usually mean the tight bound when they say Big-O.",
      ],
      diagram: `ops
 |                                      2^n
 |                                n^2
 |                        n log n
 |                n
 |        log n
 |__1________________________________ n
n=1000: log n ~ 10, n log n ~ 10^4, n^2 = 10^6, 2^n = astronomical`,
    },
    {
      heading: "How to count loops and recursion",
      body: [
        "Sequential blocks add (O(n) + O(n) = O(n)); nested loops multiply (n * n = n^2).",
        "A loop whose index doubles or halves runs O(log n) times.",
        "For recursion, use the recursion tree: nodes give time, depth gives stack space. T(n) = 2T(n/2) + O(n) resolves to O(n log n) by the Master Theorem.",
      ],
      code: {
        title: "Reading complexity off code",
        code: `for (int i = 0; i < n; i++) { ... }                  // O(n)

for (int i = 0; i < n; i++)
    for (int j = 0; j < n; j++) { ... }              // O(n^2)

for (int i = 1; i < n; i *= 2) { ... }               // O(log n)

for (int i = 0; i < n; i++)
    for (int j = i; j < n; j++) { ... }              // n(n+1)/2 -> O(n^2)

for (int i = 0; i < n; i++)
    for (int j = 0; j < m; j++) { ... }              // O(n*m), not O(n^2)`,
        explain: [
          "Triangular loops are still quadratic: constants like 1/2 are dropped.",
          "i *= 2 gives logarithmic iterations.",
          "Different bounds must stay separate variables: O(n*m).",
        ],
      },
    },
    {
      heading: "Space complexity and the hidden costs",
      body: [
        "Space complexity counts extra memory beyond the input: auxiliary arrays, hash maps, and the recursion stack.",
        "Recursion of depth d costs O(d) stack space even if no arrays are allocated.",
        "In Java, substring and boxing allocate: building n substrings of length k costs O(n*k).",
      ],
      code: {
        title: "Same time, different space",
        code: `// O(n) time, O(n) space
int[] doubled = new int[a.length];
for (int i = 0; i < a.length; i++) doubled[i] = a[i] * 2;

// O(n) time, O(1) space
for (int i = 0; i < a.length; i++) a[i] *= 2;

// O(n) time, O(n) stack space
int sum(int[] a, int i) { return i == a.length ? 0 : a[i] + sum(a, i + 1); }`,
        explain: [
          "Allocating a parallel array is O(n) auxiliary space.",
          "In-place mutation uses O(1).",
          "Recursion depth n means O(n) space even though nothing is allocated on the heap.",
        ],
      },
    },
    {
      heading: "Amortised and average vs worst case",
      body: [
        "Amortised means averaged over a sequence of operations: ArrayList.add is O(1) amortised because doubling happens rarely, even though one add can cost O(n).",
        "Average case assumes a distribution of inputs (quicksort O(n log n) average, O(n^2) worst). Interviews expect worst case unless you say otherwise.",
      ],
      diagram: `ArrayList growth (capacity doubling)
adds:   1 2 3 4 5 6 7 8 9
copies:     2   4       8       total copies < 2n
=> amortised O(1) per add`,
    },
    {
      heading: "Constraints tell you the target complexity",
      body: [
        "Assume roughly 10^8 simple operations per second in a judge environment.",
        "n <= 10 -> O(n!) or O(2^n) backtracking is fine. n <= 20 -> O(2^n). n <= 500 -> O(n^3). n <= 5000 -> O(n^2). n <= 10^5 -> O(n log n). n <= 10^7 -> O(n) only.",
      ],
      diagram: `n           acceptable
<= 10       n!, 2^n
<= 20       2^n, n^2 * 2^n small
<= 500      n^3
<= 5,000    n^2
<= 100,000  n log n
<= 10^7     n
huge        log n / O(1) math`,
    },
  ],
  javaSyntax: [
    {
      title: "Costs of common Java operations",
      code: `list.get(i);            // ArrayList O(1), LinkedList O(n)
list.add(x);            // O(1) amortised
list.contains(x);       // O(n)
map.get(k);             // O(1) average
set.contains(x);        // O(1) average
treeMap.get(k);         // O(log n)
Collections.sort(list); // O(n log n)
s.substring(a, b);      // O(b - a) copy
sb.append(c);           // O(1) amortised`,
      explain: [
        "contains on a List is the most common accidental O(n^2) source inside a loop.",
        "Switch to a HashSet for membership checks.",
        "Concatenating strings in a loop is O(n^2); StringBuilder is O(n).",
      ],
    },
    {
      title: "Measuring instead of guessing",
      code: `long start = System.nanoTime();
solve(input);
long ms = (System.nanoTime() - start) / 1_000_000;
System.out.println(ms + " ms");`,
      explain: [
        "Timing confirms a complexity guess: doubling n should roughly double an O(n) runtime and quadruple an O(n^2) one.",
        "Warm up the JVM before timing, since JIT compilation skews the first runs.",
        "Never optimise before you know which part dominates.",
      ],
    },
  ],
  patterns: [
    {
      name: "Recursion tree analysis",
      what: "Count nodes for time and depth for space.",
      when: "Any recursive or divide-and-conquer algorithm.",
      identify: "The function calls itself.",
      example: "Merge sort: log n levels, O(n) work per level.",
      code: `T(n) = 2T(n/2) + O(n)  ->  O(n log n)
T(n) = T(n/2) + O(1)   ->  O(log n)     (binary search)
T(n) = 2T(n-1) + O(1)  ->  O(2^n)       (naive fib)`,
    },
    {
      name: "Trade space for time",
      what: "Cache or index data so repeated work becomes a lookup.",
      when: "Repeated searches, repeated range sums, repeated subproblems.",
      identify: "The brute force recomputes the same thing.",
      example: "HashSet lookup replacing a nested scan, turning O(n^2) into O(n).",
      code: `Set<Integer> seen = new HashSet<>();
for (int v : a) { if (seen.contains(target - v)) return true; seen.add(v); }`,
    },
    {
      name: "Drop the dominated term",
      what: "Simplify a compound cost to its largest term.",
      when: "Reporting the complexity of a multi-phase algorithm.",
      identify: "Your solution sorts and then sweeps, or builds and then queries.",
      example: "Sort O(n log n) then sweep O(n) is O(n log n) overall.",
      code: `Arrays.sort(a);           // O(n log n)  dominant
for (int v : a) { ... }   // O(n)
// total: O(n log n)`,
    },
  ],
  examples: [
    {
      title: "Analysing a nested loop with a break",
      input: "for i in 0..n: for j in 0..n: if cond break;",
      steps: [
        "Worst case the inner loop runs n times for every i -> O(n^2).",
        "Best case it breaks immediately -> O(n).",
        "Report the worst case, O(n^2), unless the problem guarantees otherwise.",
      ],
      output: "O(n^2) time, O(1) space",
    },
    {
      title: "Why naive Fibonacci is exponential",
      input: "fib(n) = fib(n-1) + fib(n-2)",
      steps: [
        "Each call spawns two more, so the recursion tree nearly doubles per level.",
        "Number of nodes is about 1.618^n (golden ratio), so time is O(2^n).",
        "Memoisation collapses it to n distinct states -> O(n) time, O(n) space.",
      ],
      output: "O(2^n) naive vs O(n) memoised",
    },
  ],
  problems: [
    {
      id: "cx-1",
      title: "Classify these snippets",
      level: "Beginner",
      statement: "Give the time complexity of a single loop, a nested loop, and a halving loop.",
      input: "three loops over n",
      output: "O(n), O(n^2), O(log n)",
      approach: "Count how many times the loop body executes as a function of n.",
      steps: ["Single loop runs n times.", "Nested loops multiply to n * n.", "Halving with i /= 2 runs log2(n) times."],
      code: `for (int i = 0; i < n; i++) {}                 // O(n)
for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) {}   // O(n^2)
for (int i = n; i > 0; i /= 2) {}              // O(log n)`,
      time: "n/a",
      space: "O(1)",
    },
    {
      id: "cx-2",
      title: "Optimise a quadratic duplicate check",
      level: "Intermediate",
      statement: "Given a nested-loop duplicate finder, reduce its complexity.",
      input: "array of n integers",
      output: "boolean, in O(n) time",
      approach: "Replace the inner scan with a HashSet membership test, trading O(n) space for time.",
      steps: ["The nested version is O(n^2).", "A HashSet gives O(1) average membership.", "One pass is therefore O(n) time and O(n) space."],
      code: `boolean hasDup(int[] a) {
    Set<Integer> seen = new HashSet<>();
    for (int v : a) if (!seen.add(v)) return true;
    return false;
}`,
      time: "O(n)",
      space: "O(n)",
    },
    {
      id: "cx-3",
      title: "Pick the technique from the constraints",
      level: "Interview",
      statement: "n <= 2*10^5 and you must count pairs with a given sum. What complexity is expected and which technique fits?",
      input: "n = 200000",
      output: "O(n) or O(n log n) - hashing or sort plus two pointers",
      approach: "n^2 = 4*10^10 operations is far beyond the ~10^8 budget, so any quadratic solution is out.",
      steps: [
        "Compute n^2 and compare with 10^8 to rule out brute force.",
        "Aim for O(n log n): sorting plus two pointers, or O(n) with a frequency map.",
        "State the complexity out loud before coding.",
      ],
      code: `Map<Integer,Integer> f = new HashMap<>();
long pairs = 0;
for (int v : a) { pairs += f.getOrDefault(target - v, 0); f.merge(v, 1, Integer::sum); }
// O(n) time, O(n) space`,
      time: "O(n)",
      space: "O(n)",
    },
  ],
  mistakes: [
    { mistake: "Keeping constants in the answer, like O(3n).", fix: "Drop constants and lower-order terms: O(n)." },
    { mistake: "Calling two different bounds n, giving O(n^2) instead of O(n*m).", fix: "Name each input size separately." },
    { mistake: "Forgetting the recursion stack in the space answer.", fix: "Add O(depth) for recursive solutions." },
    { mistake: "Using list.contains inside a loop.", fix: "Use a HashSet to keep the loop linear." },
    { mistake: "Confusing average with worst case.", fix: "State which you mean; interviews default to worst case." },
  ],
  interviewQuestions: [
    { q: "What is the difference between O, Omega and Theta?", a: "O is an upper bound, Omega a lower bound and Theta a tight bound that holds in both directions." },
    { q: "Why do we drop constant factors?", a: "Big-O describes scaling behaviour for large n; constants depend on hardware and do not change the growth class." },
    { q: "What does amortised O(1) mean?", a: "The average cost per operation over a long sequence is constant even though individual operations can be expensive, as with ArrayList resizing." },
    { q: "What complexity should you target when n = 10^5?", a: "O(n log n) or better, because n^2 = 10^10 operations exceeds any reasonable time limit." },
    { q: "Is O(log n) base important?", a: "No - log bases differ by a constant factor, so log2 and log10 are the same complexity class." },
  ],
  practice: {
    easy: ["Classify common loops", "Compare linear vs binary search", "Compute space for a 2D DP table", "Spot the accidental O(n^2) in a list-contains loop"],
    medium: ["Analyse merge sort with the Master Theorem", "Prove ArrayList add is amortised O(1)", "Compare HashMap vs TreeMap for a workload", "Reduce a 2D DP to O(n) space"],
    hard: ["Analyse union-find with path compression", "Complexity of building a heap in O(n)", "Analyse backtracking with pruning", "Amortised analysis of a monotonic stack"],
  },
  complexity: [
    { operation: "Constant work", time: "O(1)", space: "O(1)" },
    { operation: "Binary search", time: "O(log n)", space: "O(1)" },
    { operation: "Single pass", time: "O(n)", space: "O(1)" },
    { operation: "Sorting", time: "O(n log n)", space: "O(n) or O(log n)" },
    { operation: "Nested loops", time: "O(n^2)", space: "O(1)" },
    { operation: "Subsets / bitmask enumeration", time: "O(2^n)", space: "O(n)" },
    { operation: "Permutations", time: "O(n!)", space: "O(n)" },
  ],
  revision: {
    concepts: ["Big-O measures growth, not seconds.", "Sequential blocks add, nested loops multiply.", "Recursion tree: nodes = time, depth = space."],
    rules: ["Drop constants and dominated terms.", "Include the recursion stack in space.", "Match the target complexity to the constraint on n."],
    patterns: ["Recursion tree analysis", "Trade space for time", "Drop the dominated term", "Constraint-to-complexity table"],
    syntax: ["HashSet for O(1) membership", "StringBuilder instead of +=", "TreeMap for O(log n) ordered ops", "System.nanoTime for measurement"],
    problems: ["Classify loops", "Optimise duplicate detection", "Pick the technique from constraints", "Analyse merge sort"],
  },
};
