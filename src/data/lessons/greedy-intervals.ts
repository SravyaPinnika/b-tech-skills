import type { Lesson } from "./types";

export const greedyLesson: Lesson = {
  slug: "greedy-intervals",
  topic: "Greedy & Interval problems",
  title: "Greedy Algorithms & Intervals",
  blurb: "Sort by the right key, take the locally best choice, and prove you never need to look back.",
  overview: {
    simple: [
      "A greedy algorithm makes the choice that looks best right now and never reconsiders it. It is correct only when a local optimum is guaranteed to be part of a global optimum.",
      "Interval problems (meetings, bookings, ranges) are the biggest greedy family: sort by start time to merge, sort by end time to pack the most non-overlapping items.",
      "The hard part is not the code (usually 5 lines after sorting) but knowing which key to sort by and why it works.",
    ],
    whyLearn: [
      "Scheduling, merging and jump-game questions appear constantly in online rounds.",
      "Greedy solutions are far shorter than DP, so interviewers ask you to justify them.",
      "Knowing when greedy FAILS (coin change with arbitrary coins) is equally tested.",
    ],
    realWorld: [
      "Calendar apps merge overlapping events and count rooms needed.",
      "CPU and network schedulers pick the earliest deadline first.",
      "Huffman coding compresses data with a greedy merge of the two rarest symbols.",
    ],
  },
  coreConcepts: [
    {
      heading: "When greedy is provably correct",
      body: [
        "Two properties are required: the greedy choice property (a local best choice is contained in some optimal solution) and optimal substructure (after that choice, the remaining problem is the same kind of problem).",
        "Typical proof technique: exchange argument - assume an optimal solution differs from the greedy choice and show you can swap in the greedy choice without making it worse.",
        "If a locally best choice can be beaten later, use DP instead. Coin change with coins [1,3,4] and amount 6 is the standard counterexample: greedy gives 4+1+1, optimal is 3+3.",
      ],
      diagram: `greedy works                greedy fails
activity selection          coin change [1,3,4], 6
sort by earliest finish     greedy: 4,1,1 = 3 coins
each pick leaves the most   optimal: 3,3   = 2 coins
room for later ones         -> use DP`,
    },
    {
      heading: "Sort by end time: activity selection",
      body: [
        "To fit the maximum number of non-overlapping intervals, always take the one that finishes earliest among those that still fit. Finishing early leaves the most room for the rest.",
        "This is the same algorithm as 'minimum arrows to burst balloons' and 'non-overlapping intervals to remove'.",
      ],
      diagram: `intervals (sorted by end)
[1,3]  [2,5]  [4,7]  [6,8]
take [1,3]  -> last end 3
skip [2,5]  (starts 2 < 3)
take [4,7]  -> last end 7
skip [6,8]
count = 2`,
      code: {
        title: "Maximum non-overlapping intervals",
        code: `int maxNonOverlap(int[][] iv) {
    Arrays.sort(iv, (a, b) -> Integer.compare(a[1], b[1]));   // by end
    int count = 0, lastEnd = Integer.MIN_VALUE;
    for (int[] x : iv) {
        if (x[0] >= lastEnd) { count++; lastEnd = x[1]; }
    }
    return count;
}`,
        explain: [
          "Sorting by end time is the key insight; sorting by start or length is wrong.",
          "x[0] >= lastEnd treats touching intervals as compatible - use > if touching counts as overlap.",
          "Removals needed = total - count.",
        ],
      },
    },
    {
      heading: "Sort by start time: merging",
      body: [
        "To merge overlapping intervals, sort by start and extend the current interval whenever the next one starts before the current end.",
        "The same sweep answers 'insert interval' and 'do any two intervals overlap'.",
      ],
      diagram: `[1,3] [2,6] [8,10] [15,18]
[1,3] + [2,6]  -> overlap -> [1,6]
[1,6] vs [8,10] -> gap -> emit [1,6]
result: [1,6] [8,10] [15,18]`,
      code: {
        title: "Merge intervals",
        code: `int[][] merge(int[][] iv) {
    Arrays.sort(iv, (a, b) -> Integer.compare(a[0], b[0]));
    List<int[]> out = new ArrayList<>();
    for (int[] x : iv) {
        if (!out.isEmpty() && x[0] <= out.get(out.size() - 1)[1]) {
            out.get(out.size() - 1)[1] = Math.max(out.get(out.size() - 1)[1], x[1]);
        } else {
            out.add(new int[]{x[0], x[1]});
        }
    }
    return out.toArray(new int[0][]);
}`,
        explain: [
          "Compare the new start with the last emitted end.",
          "Math.max is required because an interval can be fully contained in the previous one.",
          "Copy the interval when adding so later mutations do not affect the input.",
        ],
      },
    },
    {
      heading: "Sweep line and difference arrays",
      body: [
        "To count overlaps at any moment, treat each interval as +1 at the start and -1 at the end, sort the events, and track a running total.",
        "The maximum running total is the number of resources needed (meeting rooms, minimum platforms).",
      ],
      code: {
        title: "Minimum meeting rooms with a sweep",
        code: `int minRooms(int[][] iv) {
    int n = iv.length;
    int[] starts = new int[n], ends = new int[n];
    for (int i = 0; i < n; i++) { starts[i] = iv[i][0]; ends[i] = iv[i][1]; }
    Arrays.sort(starts); Arrays.sort(ends);
    int rooms = 0, best = 0, j = 0;
    for (int i = 0; i < n; i++) {
        while (j < n && ends[j] <= starts[i]) { rooms--; j++; }
        rooms++;
        best = Math.max(best, rooms);
    }
    return best;
}`,
        explain: [
          "Sorting starts and ends independently is legal because we only need counts.",
          "Free a room whenever a meeting ended at or before the current start.",
          "The peak concurrency is the answer.",
        ],
      },
    },
  ],
  javaSyntax: [
    {
      title: "Sorting intervals safely",
      code: `int[][] iv = {{1,4},{0,2}};
Arrays.sort(iv, (a, b) -> Integer.compare(a[0], b[0]));                 // by start
Arrays.sort(iv, Comparator.<int[]>comparingInt(a -> a[1])
                          .thenComparingInt(a -> a[0]));                // end, then start
List<int[]> list = new ArrayList<>();
list.sort(Comparator.comparingInt(a -> a[0]));`,
      explain: [
        "Integer.compare avoids overflow for large coordinates.",
        "Comparator.<int[]>comparingInt is needed for type inference when chaining.",
        "Sorting is O(n log n) and dominates the linear sweep that follows.",
      ],
    },
    {
      title: "Greedy with a running maximum",
      code: `// jump game: can you reach the end?
int reach = 0;
for (int i = 0; i < a.length; i++) {
    if (i > reach) return false;
    reach = Math.max(reach, i + a[i]);
}
return true;`,
      explain: [
        "reach is the furthest index proven reachable so far.",
        "If the loop index passes reach, there is a gap you cannot cross.",
        "This is O(n) with O(1) memory and replaces an O(n^2) DP.",
      ],
    },
  ],
  patterns: [
    {
      name: "Earliest finish first",
      what: "Sort by end and greedily accept compatible items.",
      when: "Activity selection, non-overlapping intervals, burst balloons with arrows.",
      identify: "Maximise the count of non-conflicting items.",
      example: "Minimum arrows to burst all balloons.",
      code: `Arrays.sort(p, (a, b) -> Integer.compare(a[1], b[1]));
int arrows = 1, end = p[0][1];
for (int[] b : p) if (b[0] > end) { arrows++; end = b[1]; }`,
    },
    {
      name: "Merge sweep by start",
      what: "Sort by start and extend or emit.",
      when: "Merge intervals, insert interval, employee free time.",
      identify: "Combine overlapping ranges into maximal ranges.",
      example: "Insert a new interval into a sorted non-overlapping list.",
      code: `for (int[] x : iv) {
    if (x[1] < ni[0]) out.add(x);
    else if (x[0] > ni[1]) { out.add(ni); ni = x; }
    else { ni[0] = Math.min(ni[0], x[0]); ni[1] = Math.max(ni[1], x[1]); }
}
out.add(ni);`,
    },
    {
      name: "Heap-assisted greedy",
      what: "Keep a heap of the currently active choices so you can always release or pick the extreme one.",
      when: "Meeting rooms II, task scheduler, minimum cost to connect ropes, IPO.",
      identify: "The greedy decision depends on the smallest/largest of a changing set.",
      example: "Meeting rooms II with a min-heap of end times.",
      code: `Arrays.sort(iv, (a, b) -> Integer.compare(a[0], b[0]));
PriorityQueue<Integer> ends = new PriorityQueue<>();
for (int[] m : iv) {
    if (!ends.isEmpty() && ends.peek() <= m[0]) ends.poll();
    ends.offer(m[1]);
}
return ends.size();`,
    },

  ],
  examples: [
    {
      title: "Merge [[1,3],[2,6],[8,10],[15,18]]",
      input: "the intervals above",
      steps: [
        "Already sorted by start. Emit [1,3].",
        "[2,6] starts at 2 <= 3, extend to [1,6].",
        "[8,10] starts after 6, emit it. [15,18] emits separately.",
      ],
      output: "[[1,6],[8,10],[15,18]]",
    },
    {
      title: "Gas station / jump game reach",
      input: "nums = [2,3,1,1,4]",
      steps: [
        "i=0 reach = 0 + 2 = 2.",
        "i=1 reach = max(2, 1+3) = 4.",
        "i=2..4 are all within reach, so the last index is reachable.",
      ],
      output: "true",
    },
  ],
  problems: [
    {
      id: "gd-1",
      title: "Assign cookies",
      level: "Beginner",
      statement: "Give cookies to children so that the most children are satisfied; child i needs size >= g[i].",
      input: "g = [1,2,3], s = [1,1]",
      output: "1",
      approach: "Sort both arrays and give the smallest adequate cookie to the least greedy child.",
      steps: ["Sort greed and sizes.", "Advance the cookie pointer until it satisfies the current child.", "Count matches."],
      code: `int findContentChildren(int[] g, int[] s) {
    Arrays.sort(g); Arrays.sort(s);
    int i = 0, j = 0;
    while (i < g.length && j < s.length) {
        if (s[j] >= g[i]) i++;
        j++;
    }
    return i;
}`,
      time: "O(n log n)",
      space: "O(1)",
    },
    {
      id: "gd-2",
      title: "Merge intervals",
      level: "Intermediate",
      statement: "Merge all overlapping intervals and return the non-overlapping cover.",
      input: "[[1,3],[2,6],[8,10],[15,18]]",
      output: "[[1,6],[8,10],[15,18]]",
      approach: "Sort by start, then extend the last emitted interval when they overlap.",
      steps: ["Sort by start.", "If the current start <= last end, extend the last end with max.", "Otherwise append a copy of the interval."],
      code: `int[][] merge(int[][] iv) {
    Arrays.sort(iv, (a, b) -> Integer.compare(a[0], b[0]));
    List<int[]> out = new ArrayList<>();
    for (int[] x : iv) {
        int[] last = out.isEmpty() ? null : out.get(out.size() - 1);
        if (last != null && x[0] <= last[1]) last[1] = Math.max(last[1], x[1]);
        else out.add(new int[]{x[0], x[1]});
    }
    return out.toArray(new int[0][]);
}`,
      time: "O(n log n)",
      space: "O(n)",
    },
    {
      id: "gd-3",
      title: "Non-overlapping intervals (minimum removals)",
      level: "Interview",
      statement: "Return the minimum number of intervals to remove so the rest do not overlap.",
      input: "[[1,2],[2,3],[3,4],[1,3]]",
      output: "1",
      approach: "Greedily keep the maximum number of compatible intervals by earliest end time; removals = n - kept.",
      steps: [
        "Sort by end time.",
        "Keep an interval whenever its start is >= the last kept end.",
        "Answer is n minus the kept count.",
      ],
      code: `int eraseOverlapIntervals(int[][] iv) {
    Arrays.sort(iv, (a, b) -> Integer.compare(a[1], b[1]));
    int kept = 0, end = Integer.MIN_VALUE;
    for (int[] x : iv) if (x[0] >= end) { kept++; end = x[1]; }
    return iv.length - kept;
}`,
      time: "O(n log n)",
      space: "O(1)",
    },
  ],
  mistakes: [
    { mistake: "Sorting by the wrong key.", fix: "Maximise count -> sort by end. Merge ranges -> sort by start." },
    { mistake: "Assuming greedy always works for optimisation.", fix: "Look for a counterexample; if a later choice can beat the local one, use DP." },
    { mistake: "Forgetting that an interval can be nested inside another.", fix: "Use Math.max when extending the end." },
    { mistake: "Confusing touching intervals with overlapping ones.", fix: "Decide whether [1,2] and [2,3] conflict and pick > or >= consistently." },
    { mistake: "Mutating the input intervals while merging.", fix: "Add copies to the output list." },
  ],
  interviewQuestions: [
    { q: "What two properties must hold for greedy to be correct?", a: "The greedy choice property and optimal substructure; you usually justify it with an exchange argument." },
    { q: "Why sort by end time in activity selection?", a: "The interval finishing earliest leaves the maximum remaining time, so it can never reduce the number of intervals you can still fit." },
    { q: "Give a problem where greedy fails but DP works.", a: "Coin change with coins [1,3,4] for amount 6: greedy picks 4+1+1 while the optimum is 3+3." },
    { q: "How do you compute minimum meeting rooms?", a: "Sweep the sorted start and end times counting concurrent meetings, or use a min-heap of end times; the peak count is the answer." },
    { q: "Greedy vs DP complexity trade-off?", a: "Greedy is typically O(n log n) from sorting with O(1) extra space; DP is polynomial in the state space but always safe." },
  ],
  practice: {
    easy: ["Assign cookies", "Best time to buy and sell stock II", "Lemonade change", "Can place flowers", "Maximum units on a truck"],
    medium: ["Merge intervals", "Insert interval", "Non-overlapping intervals", "Jump game I and II", "Gas station", "Partition labels"],
    hard: ["Minimum number of taps to water a garden", "Task scheduler", "Candy distribution", "Course schedule III", "IPO"],
  },
  complexity: [
    { operation: "Sort intervals", time: "O(n log n)", space: "O(log n)" },
    { operation: "Merge sweep", time: "O(n)", space: "O(n)", note: "After sorting" },
    { operation: "Activity selection", time: "O(n log n)", space: "O(1)" },
    { operation: "Meeting rooms with heap", time: "O(n log n)", space: "O(n)" },
    { operation: "Jump game running max", time: "O(n)", space: "O(1)" },
  ],
  revision: {
    concepts: ["Greedy needs the greedy-choice property plus optimal substructure.", "Sort by end to maximise count, by start to merge.", "Sweep line counts concurrency."],
    rules: ["Prove with an exchange argument or find a counterexample.", "Use Math.max when extending ends.", "Decide the touching-interval convention up front."],
    patterns: ["Earliest finish first", "Merge sweep by start", "Heap of end times", "Running reachability maximum"],
    syntax: ["Arrays.sort(iv, (a,b) -> Integer.compare(a[0], b[0]))", "Comparator.comparingInt chaining", "out.toArray(new int[0][])", "PriorityQueue of ends"],
    problems: ["Merge intervals", "Non-overlapping intervals", "Meeting rooms II", "Jump game", "Partition labels"],
  },
};
