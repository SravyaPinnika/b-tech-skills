import type { Lesson } from "./types";

export const recursionLesson: Lesson = {
  slug: "recursion-backtracking",
  topic: "Recursion & Backtracking",
  title: "Recursion & Backtracking",
  blurb: "Solve a problem by solving smaller copies of itself, then undo choices to explore every option.",
  overview: {
    simple: [
      "A recursive method calls itself on a smaller input. It needs a base case (when to stop) and a recursive case (how to shrink the problem).",
      "Each call gets its own frame on the call stack holding its parameters and local variables. When the base case returns, the frames unwind one by one.",
      "Backtracking is recursion plus undo: choose an option, recurse, then remove the choice so the next option can be tried.",
    ],
    whyLearn: [
      "Trees, graphs, divide-and-conquer and DP are all expressed recursively.",
      "Permutation, subset and board problems (N-Queens, Sudoku) only have backtracking solutions.",
      "It forces you to reason about state, which is exactly what interviewers probe.",
    ],
    realWorld: [
      "File system traversal (folders inside folders).",
      "JSON and expression parsers.",
      "Game AI exploring move sequences.",
    ],
  },
  coreConcepts: [
    {
      heading: "Base case, recursive case, call stack",
      body: [
        "Without a base case the recursion never stops and the JVM throws StackOverflowError.",
        "Trust the recursion: assume the smaller call returns the right answer and just combine it correctly.",
      ],
      diagram: `fact(4)
 -> 4 * fact(3)
       -> 3 * fact(2)
             -> 2 * fact(1)
                   -> 1        base case
      returns 2 -> 6 -> 24`,
      code: {
        title: "Factorial and Fibonacci",
        code: `long fact(int n) {
    if (n <= 1) return 1;          // base case
    return n * fact(n - 1);        // recursive case
}

int fib(int n, int[] memo) {
    if (n < 2) return n;
    if (memo[n] != 0) return memo[n];
    return memo[n] = fib(n - 1, memo) + fib(n - 2, memo);
}`,
        explain: [
          "The base case must be reachable for every input, including 0.",
          "Plain fib is O(2^n); the memo array makes it O(n).",
          "Return type long avoids overflow past 12!.",
        ],
      },
    },
    {
      heading: "Recursion tree and complexity",
      body: [
        "Count the number of nodes in the recursion tree to get the time complexity, and the maximum depth to get the stack space.",
        "Two calls per level with depth n gives O(2^n); one call per level gives O(n); halving the input gives O(log n).",
      ],
      diagram: `subsets([1,2,3]) - each level: take / skip
            []
        /        \\
      [1]         []
     /   \\       /   \\
  [1,2]  [1]   [2]   []
  ...  2^n leaves, depth n`,
    },
    {
      heading: "The backtracking template",
      body: [
        "Add a choice to the current path, recurse deeper, then remove it. Pruning invalid branches early is what makes backtracking fast enough.",
        "Always copy the path when you record an answer, otherwise every stored result points at the same mutable list.",
      ],
      code: {
        title: "Generic backtracking skeleton",
        code: `void backtrack(List<Integer> path, boolean[] used, int[] nums, List<List<Integer>> out) {
    if (path.size() == nums.length) {
        out.add(new ArrayList<>(path));      // copy!
        return;
    }
    for (int i = 0; i < nums.length; i++) {
        if (used[i]) continue;               // prune
        used[i] = true;  path.add(nums[i]);  // choose
        backtrack(path, used, nums, out);    // explore
        path.remove(path.size() - 1); used[i] = false;  // un-choose
    }
}`,
        explain: [
          "The used[] array prevents reusing the same element in a permutation.",
          "new ArrayList<>(path) snapshots the current answer.",
          "Undo both the path and the used flag, in reverse order of the choose step.",
        ],
      },
    },
  ],
  javaSyntax: [
    {
      title: "Recursion on arrays and strings",
      code: `int sum(int[] a, int i) {
    return i == a.length ? 0 : a[i] + sum(a, i + 1);
}

String rev(String s) {
    return s.isEmpty() ? s : rev(s.substring(1)) + s.charAt(0);
}`,
      explain: [
        "Passing an index instead of copying subarrays keeps recursion cheap.",
        "The string version allocates each substring, so prefer indices in real code.",
        "The ternary form makes the base case obvious.",
      ],
    },
    {
      title: "Subsets and combinations",
      code: `void subsets(int[] a, int i, List<Integer> cur, List<List<Integer>> out) {
    if (i == a.length) { out.add(new ArrayList<>(cur)); return; }
    subsets(a, i + 1, cur, out);                 // skip a[i]
    cur.add(a[i]);
    subsets(a, i + 1, cur, out);                 // take a[i]
    cur.remove(cur.size() - 1);
}`,
      explain: [
        "Two calls per index generate all 2^n subsets.",
        "The remove after the take branch is the backtrack step.",
        "Sort the input and skip equal neighbours to avoid duplicate subsets.",
      ],
    },
  ],
  patterns: [
    {
      name: "Choose / explore / un-choose",
      what: "Mutate shared state, recurse, then restore it.",
      when: "Permutations, subsets, combination sum, word search.",
      identify: "The answer is a list of all valid arrangements.",
      example: "Combination sum where numbers may repeat.",
      code: `void comb(int[] a, int start, int rem, List<Integer> cur, List<List<Integer>> out) {
    if (rem == 0) { out.add(new ArrayList<>(cur)); return; }
    for (int i = start; i < a.length; i++) {
        if (a[i] > rem) continue;
        cur.add(a[i]);
        comb(a, i, rem - a[i], cur, out);   // i, not i+1: reuse allowed
        cur.remove(cur.size() - 1);
    }
}`,
    },
    {
      name: "Divide and conquer",
      what: "Split the input in half, solve both halves, merge.",
      when: "Merge sort, quick sort, binary search, majority element.",
      identify: "The problem splits cleanly with an easy combine step.",
      example: "Merge sort recursion.",
      code: `void sort(int[] a, int lo, int hi) {
    if (lo >= hi) return;
    int mid = (lo + hi) >>> 1;
    sort(a, lo, mid); sort(a, mid + 1, hi); merge(a, lo, mid, hi);
}`,
    },
    {
      name: "Memoised recursion (top-down DP)",
      what: "Cache results by state so each subproblem is solved once.",
      when: "Overlapping subproblems: fib, grid paths, coin change.",
      identify: "The recursion tree repeats the same arguments.",
      example: "Grid unique paths with a memo table.",
      code: `int paths(int r, int c, Integer[][] memo) {
    if (r == 0 || c == 0) return 1;
    if (memo[r][c] != null) return memo[r][c];
    return memo[r][c] = paths(r - 1, c, memo) + paths(r, c - 1, memo);
}`,
    },
  ],
  examples: [
    {
      title: "All permutations of [1,2,3]",
      input: "nums = [1,2,3]",
      steps: [
        "Pick 1 -> pick 2 -> pick 3 -> record [1,2,3], undo to [1].",
        "Pick 3 then 2 -> [1,3,2].",
        "Backtrack to empty path and start with 2, then 3.",
      ],
      output: "[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]",
    },
    {
      title: "Tower of Hanoi with 3 disks",
      input: "n = 3, from A to C using B",
      steps: [
        "Move top n-1 disks A -> B (recursive).",
        "Move disk n from A -> C.",
        "Move n-1 disks B -> C (recursive). Total moves 2^n - 1 = 7.",
      ],
      output: "7 moves",
    },
  ],
  problems: [
    {
      id: "rec-1",
      title: "Sum of digits",
      level: "Beginner",
      statement: "Return the sum of the digits of a non-negative integer using recursion.",
      input: "n = 4092",
      output: "15",
      approach: "The last digit is n % 10; recurse on n / 10.",
      steps: ["Base case n == 0 returns 0.", "Return n % 10 + digitSum(n / 10).", "Each call removes one digit, so depth is O(log n)."],
      code: `int digitSum(int n) { return n == 0 ? 0 : n % 10 + digitSum(n / 10); }`,
      time: "O(log n)",
      space: "O(log n) stack",
    },
    {
      id: "rec-2",
      title: "Generate all subsets",
      level: "Intermediate",
      statement: "Return all possible subsets (the power set) of a distinct integer array.",
      input: "[1,2,3]",
      output: "8 subsets from [] to [1,2,3]",
      approach: "For each index, branch on skipping and taking the element.",
      steps: ["At index i, recurse without a[i].", "Add a[i], recurse, then remove it.", "At i == n record a copy of the current list."],
      code: `List<List<Integer>> subsets(int[] a) {
    List<List<Integer>> out = new ArrayList<>();
    dfs(a, 0, new ArrayList<>(), out);
    return out;
}
void dfs(int[] a, int i, List<Integer> cur, List<List<Integer>> out) {
    if (i == a.length) { out.add(new ArrayList<>(cur)); return; }
    dfs(a, i + 1, cur, out);
    cur.add(a[i]); dfs(a, i + 1, cur, out); cur.remove(cur.size() - 1);
}`,
      time: "O(n * 2^n)",
      space: "O(n) stack",
    },
    {
      id: "rec-3",
      title: "N-Queens",
      level: "Interview",
      statement: "Place n queens on an n x n board so no two attack each other; count the valid boards.",
      input: "n = 4",
      output: "2",
      approach: "Place one queen per row and track used columns and both diagonals with boolean arrays for O(1) validity checks.",
      steps: [
        "Recurse row by row.",
        "For each column, skip it if the column or either diagonal is already taken.",
        "Mark, recurse to the next row, then unmark.",
      ],
      code: `int count = 0;
void solve(int row, int n, boolean[] col, boolean[] d1, boolean[] d2) {
    if (row == n) { count++; return; }
    for (int c = 0; c < n; c++) {
        int i = row + c, j = row - c + n;
        if (col[c] || d1[i] || d2[j]) continue;
        col[c] = d1[i] = d2[j] = true;
        solve(row + 1, n, col, d1, d2);
        col[c] = d1[i] = d2[j] = false;
    }
}`,
      time: "O(n!) with pruning",
      space: "O(n)",
    },
  ],
  mistakes: [
    { mistake: "Missing or unreachable base case.", fix: "Write the base case first and check it triggers for the smallest input." },
    { mistake: "Storing the mutable path directly in the results list.", fix: "Add a copy: new ArrayList<>(path)." },
    { mistake: "Forgetting to undo a choice.", fix: "Every mutation before the recursive call needs a matching restore after it." },
    { mistake: "Recomputing overlapping subproblems.", fix: "Memoise on the exact state parameters." },
    { mistake: "Very deep recursion on large inputs.", fix: "Convert to iteration with an explicit stack when depth can exceed ~10^4." },
  ],
  interviewQuestions: [
    { q: "What causes StackOverflowError?", a: "Recursion depth exceeding the thread stack, usually from a missing base case or unbounded depth on large input." },
    { q: "Recursion vs iteration trade-off?", a: "Recursion is clearer for tree-shaped problems but costs stack frames; iteration is faster and constant-stack but needs manual state." },
    { q: "What is tail recursion and does Java optimise it?", a: "A call in the final position; the JVM does not eliminate it, so deep tail recursion still overflows." },
    { q: "How do you compute backtracking complexity?", a: "Multiply the branching factor by the depth: number of nodes in the recursion tree times the work per node." },
    { q: "Difference between backtracking and DFS?", a: "Backtracking is DFS over the state space with explicit undo and pruning of invalid branches." },
  ],
  practice: {
    easy: ["Factorial", "Fibonacci with memo", "Reverse a string recursively", "Sum of array elements", "Power(x, n)"],
    medium: ["Subsets and subsets II", "Permutations", "Combination sum", "Letter combinations of a phone number", "Word search on a grid"],
    hard: ["N-Queens", "Sudoku solver", "Palindrome partitioning", "Regular expression matching"],
  },
  complexity: [
    { operation: "Linear recursion (sum, factorial)", time: "O(n)", space: "O(n) stack" },
    { operation: "Binary recursion without memo", time: "O(2^n)", space: "O(n)" },
    { operation: "Memoised recursion", time: "O(states)", space: "O(states)" },
    { operation: "Subsets generation", time: "O(n * 2^n)", space: "O(n)" },
    { operation: "Permutations generation", time: "O(n * n!)", space: "O(n)" },
  ],
  revision: {
    concepts: ["Base case + recursive case + call stack.", "Recursion tree nodes give time, depth gives space.", "Backtracking = choose, explore, un-choose."],
    rules: ["Copy the path before storing it.", "Prune early to survive factorial search spaces.", "Memoise whenever states repeat."],
    patterns: ["Choose/explore/un-choose", "Divide and conquer", "Top-down memoisation", "Include/exclude branching"],
    syntax: ["out.add(new ArrayList<>(cur))", "cur.remove(cur.size()-1)", "memo[n] != 0 guard", "(lo + hi) >>> 1"],
    problems: ["Subsets", "Permutations", "Combination sum", "N-Queens", "Sudoku solver"],
  },
};
