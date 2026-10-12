import type { Lesson } from "./types";

export const dpLesson: Lesson = {
  slug: "dynamic-programming",
  topic: "Dynamic Programming: 1D, 2D, knapsack, LIS, DP on trees",
  title: "Dynamic Programming",
  blurb: "Define the state, write the recurrence, cache the answers: exponential recursion becomes polynomial.",
  overview: {
    simple: [
      "Dynamic programming applies when a problem has optimal substructure (the best answer is built from best answers of smaller inputs) and overlapping subproblems (the same smaller input appears many times).",
      "Top-down DP is plain recursion plus a memo table. Bottom-up DP fills a table in dependency order with loops. Both compute exactly the same values.",
      "The whole skill is choosing the state: what parameters uniquely describe a subproblem.",
    ],
    whyLearn: [
      "DP is the hardest recurring category in placement interviews and the biggest score differentiator.",
      "It generalises: knapsack, edit distance, LIS and grid paths all reuse the same four steps.",
      "Recognising a DP (versus greedy) is itself a tested skill.",
    ],
    realWorld: [
      "Diff tools and spell checkers use edit distance.",
      "Resource allocation and budgeting are knapsack variants.",
      "Sequence alignment in bioinformatics is 2D DP.",
    ],
  },
  coreConcepts: [
    {
      heading: "The four-step method",
      body: [
        "1. State: what does dp[i] (or dp[i][j]) mean, in one sentence.",
        "2. Recurrence: how does the state depend on smaller states.",
        "3. Base cases: the smallest states you can fill directly.",
        "4. Order and answer: iterate so dependencies exist first, then read the answer out of the table.",
        "Write the recursion first, then convert it - never guess a loop.",
      ],
      diagram: `climbStairs
state : dp[i] = ways to reach step i
recur : dp[i] = dp[i-1] + dp[i-2]
base  : dp[0]=1, dp[1]=1
order : i ascending, answer dp[n]`,
      code: {
        title: "Memoised vs tabulated",
        code: `// top-down
int climb(int i, Integer[] memo) {
    if (i <= 1) return 1;
    if (memo[i] != null) return memo[i];
    return memo[i] = climb(i - 1, memo) + climb(i - 2, memo);
}

// bottom-up, O(1) space
int climb(int n) {
    int a = 1, b = 1;
    for (int i = 2; i <= n; i++) { int c = a + b; a = b; b = c; }
    return b;
}`,
        explain: [
          "Memoisation caches on the state parameters, so each state is computed once.",
          "The bottom-up loop follows the same recurrence, ascending.",
          "When dp[i] only needs the last two entries, keep two variables instead of an array.",
        ],
      },
    },
    {
      heading: "1D DP: choose or skip",
      body: [
        "Many linear DPs are 'take the current element and jump, or skip it': house robber, min cost climbing stairs, decode ways.",
        "Kadane's algorithm is DP where the state is 'best sum ending here'.",
      ],
      code: {
        title: "House robber",
        code: `int rob(int[] a) {
    int prev = 0, cur = 0;                // best up to i-2, i-1
    for (int v : a) {
        int take = prev + v;              // rob this house
        int skip = cur;                   // skip it
        prev = cur;
        cur = Math.max(take, skip);
    }
    return cur;
}`,
        explain: [
          "dp[i] = max(dp[i-1], dp[i-2] + a[i]) is the recurrence.",
          "Two rolling variables replace the array.",
          "For a circular street, run it twice: excluding the first house, then the last.",
        ],
      },
    },
    {
      heading: "2D DP: grids and two sequences",
      body: [
        "Whenever two indices vary independently (two strings, a grid, item plus capacity), the state is two dimensional.",
        "Edit distance and LCS compare s1[i-1] with s2[j-1]: equal means take the diagonal, unequal means 1 + the best neighbour.",
      ],
      diagram: `LCS("abcde","ace")
     ""  a  c  e
 ""   0  0  0  0
 a    0  1  1  1
 b    0  1  1  1
 c    0  1  2  2
 d    0  1  2  2
 e    0  1  2  3   -> answer 3`,
      code: {
        title: "Edit distance",
        code: `int editDistance(String a, String b) {
    int m = a.length(), n = b.length();
    int[][] dp = new int[m + 1][n + 1];
    for (int i = 0; i <= m; i++) dp[i][0] = i;      // delete all
    for (int j = 0; j <= n; j++) dp[0][j] = j;      // insert all
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++)
            dp[i][j] = (a.charAt(i-1) == b.charAt(j-1))
                ? dp[i-1][j-1]
                : 1 + Math.min(dp[i-1][j-1], Math.min(dp[i-1][j], dp[i][j-1]));
    return dp[m][n];
}`,
        explain: [
          "Row/column 0 mean converting to or from an empty string.",
          "The three neighbours correspond to replace, delete and insert.",
          "Indices are shifted by one, so use charAt(i-1).",
        ],
      },
    },
    {
      heading: "Knapsack family and LIS",
      body: [
        "0/1 knapsack: each item used at most once - iterate capacity DOWNWARD in the 1D version.",
        "Unbounded knapsack (coin change): items reusable - iterate capacity UPWARD.",
        "LIS in O(n log n) keeps a 'tails' array where tails[k] is the smallest possible tail of an increasing subsequence of length k+1.",
      ],
      code: {
        title: "0/1 knapsack, coin change, LIS",
        code: `// 0/1 knapsack (max value)
int[] dp = new int[cap + 1];
for (int i = 0; i < n; i++)
    for (int c = cap; c >= w[i]; c--)                 // downward!
        dp[c] = Math.max(dp[c], dp[c - w[i]] + val[i]);

// coin change (min coins, reuse allowed)
int[] f = new int[amount + 1];
Arrays.fill(f, Integer.MAX_VALUE); f[0] = 0;
for (int coin : coins)
    for (int a = coin; a <= amount; a++)              // upward
        if (f[a - coin] != Integer.MAX_VALUE) f[a] = Math.min(f[a], f[a-coin] + 1);

// LIS in O(n log n)
List<Integer> tails = new ArrayList<>();
for (int v : nums) {
    int i = Collections.binarySearch(tails, v);
    if (i < 0) i = -i - 1;
    if (i == tails.size()) tails.add(v); else tails.set(i, v);
}
int lis = tails.size();`,
        explain: [
          "Downward capacity prevents reusing the same item twice.",
          "Upward capacity intentionally allows reuse.",
          "The tails array length equals the LIS length; the array itself is not necessarily a valid subsequence.",
        ],
      },
    },
    {
      heading: "DP on trees",
      body: [
        "The state is a node plus a small flag, and children are combined in post-order.",
        "Classic example: rob a binary tree where you cannot rob a parent and child together.",
      ],
      code: {
        title: "House robber III",
        code: `int[] dfs(TreeNode n) {                 // {robThis, skipThis}
    if (n == null) return new int[]{0, 0};
    int[] l = dfs(n.left), r = dfs(n.right);
    int rob  = n.val + l[1] + r[1];
    int skip = Math.max(l[0], l[1]) + Math.max(r[0], r[1]);
    return new int[]{rob, skip};
}`,
        explain: [
          "Returning a pair avoids a HashMap memo.",
          "If you rob a node you must skip both children.",
          "The answer is max of the root's two values.",
        ],
      },
    },
  ],
  javaSyntax: [
    {
      title: "Table initialisation",
      code: `int[] dp = new int[n + 1];
Arrays.fill(dp, Integer.MAX_VALUE);      // for minimisation
int[][] grid = new int[m][n];
for (int[] row : grid) Arrays.fill(row, -1);
Integer[][] memo = new Integer[m][n];    // null means not computed`,
      explain: [
        "Use MAX_VALUE for min problems and 0 or MIN_VALUE for max problems.",
        "Guard against MAX_VALUE + 1 overflow before adding.",
        "Integer[][] with null distinguishes 'not computed' from a legitimate 0.",
      ],
    },
    {
      title: "Space optimisation with rolling rows",
      code: `int[] prev = new int[n + 1], cur = new int[n + 1];
for (int i = 1; i <= m; i++) {
    for (int j = 1; j <= n; j++) {
        cur[j] = /* uses prev[j], prev[j-1], cur[j-1] */ 0;
    }
    int[] t = prev; prev = cur; cur = t;
}`,
      explain: [
        "Only the previous row is needed for most 2D recurrences, giving O(n) space.",
        "Swap references instead of copying arrays.",
        "Clear the reused row if stale values could leak in.",
      ],
    },
  ],
  patterns: [
    {
      name: "Take / skip (0-1 choice)",
      what: "At each index decide to include the element or not.",
      when: "Knapsack, subset sum, house robber, partition equal subset sum.",
      identify: "Each item can be used at most once and you optimise a total.",
      example: "Subset sum feasibility.",
      code: `boolean[] dp = new boolean[target + 1];
dp[0] = true;
for (int v : nums)
    for (int t = target; t >= v; t--) dp[t] |= dp[t - v];
return dp[target];`,
    },
    {
      name: "Two-sequence alignment",
      what: "dp[i][j] compares prefixes of two strings.",
      when: "LCS, edit distance, wildcard matching, shortest common supersequence.",
      identify: "Two strings or arrays with independent progress.",
      example: "Longest common subsequence.",
      code: `for (int i = 1; i <= m; i++)
  for (int j = 1; j <= n; j++)
    dp[i][j] = a.charAt(i-1) == b.charAt(j-1)
        ? dp[i-1][j-1] + 1
        : Math.max(dp[i-1][j], dp[i][j-1]);`,
    },
    {
      name: "Interval DP",
      what: "dp[i][j] over a range, iterating by increasing length.",
      when: "Matrix chain multiplication, burst balloons, longest palindromic subsequence.",
      identify: "The answer for a range depends on a split point inside it.",
      example: "Longest palindromic subsequence.",
      code: `for (int len = 2; len <= n; len++)
  for (int i = 0; i + len - 1 < n; i++) {
      int j = i + len - 1;
      dp[i][j] = s.charAt(i) == s.charAt(j)
          ? dp[i+1][j-1] + 2
          : Math.max(dp[i+1][j], dp[i][j-1]);
  }`,
    },
  ],
  examples: [
    {
      title: "Coin change for amount 11 with coins [1,2,5]",
      input: "coins = [1,2,5], amount = 11",
      steps: [
        "f[0] = 0. Using coin 1: f[a] = a.",
        "Using coin 2 improves even amounts: f[4] = 2, f[6] = 3, ...",
        "Using coin 5: f[10] = 2, f[11] = min(old, f[6] + 1) = 3.",
      ],
      output: "3 coins (5 + 5 + 1)",
    },
    {
      title: "LIS of [10,9,2,5,3,7,101,18]",
      input: "the array above",
      steps: [
        "tails: [10] -> [9] -> [2] -> [2,5] -> [2,3] -> [2,3,7].",
        "101 extends: [2,3,7,101].",
        "18 replaces 101: [2,3,7,18]; length stays 4.",
      ],
      output: "4",
    },
  ],
  problems: [
    {
      id: "dp-1",
      title: "Climbing stairs",
      level: "Beginner",
      statement: "Count the ways to climb n stairs taking 1 or 2 steps at a time.",
      input: "n = 5",
      output: "8",
      approach: "dp[i] = dp[i-1] + dp[i-2] with two rolling variables.",
      steps: ["Base: 1 way for 0 and 1 stairs.", "Each step adds the previous two counts.", "Return the last value."],
      code: `int climbStairs(int n) {
    int a = 1, b = 1;
    for (int i = 2; i <= n; i++) { int c = a + b; a = b; b = c; }
    return b;
}`,
      time: "O(n)",
      space: "O(1)",
    },
    {
      id: "dp-2",
      title: "Coin change (minimum coins)",
      level: "Intermediate",
      statement: "Return the fewest coins summing to amount, or -1 if impossible.",
      input: "coins = [1,2,5], amount = 11",
      output: "3",
      approach: "Unbounded knapsack: f[a] = min over coins of f[a - coin] + 1.",
      steps: ["Fill f with a sentinel large value, f[0] = 0.", "For each coin sweep amounts upward.", "Return -1 if f[amount] is still the sentinel."],
      code: `int coinChange(int[] coins, int amount) {
    int[] f = new int[amount + 1];
    Arrays.fill(f, amount + 1);
    f[0] = 0;
    for (int c : coins)
        for (int a = c; a <= amount; a++) f[a] = Math.min(f[a], f[a - c] + 1);
    return f[amount] > amount ? -1 : f[amount];
}`,
      time: "O(amount * coins)",
      space: "O(amount)",
    },
    {
      id: "dp-3",
      title: "Edit distance",
      level: "Interview",
      statement: "Minimum insert/delete/replace operations to turn word1 into word2.",
      input: "\"horse\", \"ros\"",
      output: "3",
      approach: "2D table over prefixes; equal characters inherit the diagonal, otherwise 1 + min of three neighbours.",
      steps: [
        "Initialise the first row and column with prefix lengths.",
        "Fill row by row using the character comparison.",
        "dp[m][n] is the answer.",
      ],
      code: `int minDistance(String a, String b) {
    int m = a.length(), n = b.length();
    int[][] dp = new int[m+1][n+1];
    for (int i = 0; i <= m; i++) dp[i][0] = i;
    for (int j = 0; j <= n; j++) dp[0][j] = j;
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++)
            dp[i][j] = a.charAt(i-1) == b.charAt(j-1) ? dp[i-1][j-1]
                : 1 + Math.min(dp[i-1][j-1], Math.min(dp[i-1][j], dp[i][j-1]));
    return dp[m][n];
}`,
      time: "O(m*n)",
      space: "O(m*n), reducible to O(n)",
    },
  ],
  mistakes: [
    { mistake: "Vague state definition.", fix: "Write dp[i] means ... in words before coding anything." },
    { mistake: "Wrong iteration direction in 1D knapsack.", fix: "0/1 goes downward over capacity; unbounded goes upward." },
    { mistake: "Missing or wrong base cases.", fix: "Fill row 0 and column 0 deliberately and test n = 0, 1." },
    { mistake: "Overflow when adding a sentinel MAX_VALUE.", fix: "Use amount + 1 as the sentinel or check before adding." },
    { mistake: "Using greedy where DP is required.", fix: "If a locally best choice can be beaten later (coin change with [1,3,4]), you need DP." },
  ],
  interviewQuestions: [
    { q: "How do you recognise a DP problem?", a: "Optimal substructure plus overlapping subproblems, usually phrased as count the ways, min/max cost, or is it possible." },
    { q: "Memoisation vs tabulation?", a: "Both are O(states); memoisation only visits reachable states and reads naturally, tabulation avoids recursion overhead and enables space reduction." },
    { q: "Difference between 0/1 and unbounded knapsack?", a: "0/1 allows each item once (iterate capacity descending); unbounded allows repeats (iterate ascending)." },
    { q: "How do you reduce 2D DP to O(n) space?", a: "If each cell depends only on the previous row, keep two rows and swap them - but you lose the ability to reconstruct the path." },
    { q: "How is LIS solved in O(n log n)?", a: "Maintain the smallest possible tail for each subsequence length and binary search the replacement position for each value." },
  ],
  practice: {
    easy: ["Climbing stairs", "Min cost climbing stairs", "House robber", "Fibonacci with memo", "Maximum subarray"],
    medium: ["Coin change", "Longest common subsequence", "Unique paths with obstacles", "Partition equal subset sum", "Longest increasing subsequence", "Word break"],
    hard: ["Edit distance", "Burst balloons", "Regular expression matching", "Best time to buy and sell stock IV", "House robber III"],
  },
  complexity: [
    { operation: "1D DP (n states, O(1) transition)", time: "O(n)", space: "O(n) or O(1)" },
    { operation: "2D DP (grid / two strings)", time: "O(m*n)", space: "O(m*n) or O(n)" },
    { operation: "0/1 knapsack", time: "O(n*capacity)", space: "O(capacity)" },
    { operation: "LIS (DP)", time: "O(n^2)", space: "O(n)" },
    { operation: "LIS (binary search)", time: "O(n log n)", space: "O(n)" },
    { operation: "Interval DP", time: "O(n^3)", space: "O(n^2)" },
  ],
  revision: {
    concepts: ["Optimal substructure + overlapping subproblems.", "State, recurrence, base case, order.", "Memoisation and tabulation compute the same table."],
    rules: ["0/1 knapsack iterates capacity downward.", "Unbounded iterates upward.", "Write the recursion before the loops."],
    patterns: ["Take/skip", "Two-sequence alignment", "Interval DP", "DP on trees returning a pair"],
    syntax: ["Arrays.fill for sentinels", "Integer[][] memo with null", "rolling prev/cur rows", "Collections.binarySearch for LIS"],
    problems: ["Climbing stairs", "Coin change", "LCS", "Edit distance", "LIS", "House robber"],
  },
};
