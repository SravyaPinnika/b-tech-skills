import type { Lesson } from "./types";

export const twoPointersLesson: Lesson = {
  slug: "two-pointers-sliding-window",
  topic: "Two Pointers / Sliding Window",
  title: "Two Pointers & Sliding Window",
  blurb: "Replace nested loops with two indices that only move forward: O(n^2) becomes O(n).",
  overview: {
    simple: [
      "Two pointers means keeping two indices into the same array and moving them based on a rule instead of trying every pair.",
      "A sliding window is a two-pointer variant where the pointers mark the start and end of a contiguous block. You expand the right side to include more, and shrink from the left when the window becomes invalid.",
      "Because each pointer only moves forward, the total work is O(n) even though the window changes size many times.",
    ],
    whyLearn: [
      "It is the standard optimisation asked for after you give the brute-force answer.",
      "Almost every 'longest / shortest / count subarray' problem is a window problem.",
      "It teaches invariant thinking: what must stay true inside the window.",
    ],
    realWorld: [
      "Network throughput measured over the last 5 seconds is a sliding window.",
      "Rate limiting counts requests inside a moving time window.",
      "Video streaming buffers keep a window of decoded frames.",
    ],
  },
  coreConcepts: [
    {
      heading: "Opposite-direction pointers",
      body: [
        "Used on sorted arrays or palindromes: one pointer starts at 0, the other at n-1, and they move towards each other.",
        "Each step eliminates one candidate, so the scan finishes in O(n).",
      ],
      diagram: `[ 2   3   5   8   11  15 ]   target = 13
  i                    j     2+15=17 too big -> j--
  i                j         2+11=13  -> found`,
      code: {
        title: "Palindrome check",
        code: `boolean isPal(String s) {
    int i = 0, j = s.length() - 1;
    while (i < j) {
        if (s.charAt(i++) != s.charAt(j--)) return false;
    }
    return true;
}`,
        explain: [
          "Loop while i < j: the middle character never needs a comparison.",
          "i++ and j-- inside charAt keeps the loop body to one line.",
          "For 'ignore punctuation' variants, skip non-alphanumeric characters before comparing.",
        ],
      },
    },
    {
      heading: "Fixed-size window",
      body: [
        "When the window length k is given, add the incoming element and subtract the outgoing one instead of re-summing.",
        "This is the cheapest window and turns O(n*k) into O(n).",
      ],
      diagram: `k = 3
[1  4  2  10  2  3]
 +--sum=7--+
    +--sum=16--+      slide: sum += 10, sum -= 1`,
      code: {
        title: "Max sum of k consecutive elements",
        code: `int maxSum(int[] a, int k) {
    int sum = 0;
    for (int i = 0; i < k; i++) sum += a[i];
    int best = sum;
    for (int i = k; i < a.length; i++) {
        sum += a[i] - a[i - k];
        best = Math.max(best, sum);
    }
    return best;
}`,
        explain: [
          "Build the first window explicitly.",
          "sum += a[i] - a[i-k] does the add and remove in one statement.",
          "Guard k <= a.length before starting.",
        ],
      },
    },
    {
      heading: "Variable-size window",
      body: [
        "Grow right while the window is valid; when it becomes invalid, shrink from the left until it is valid again.",
        "Track the answer either after growing (longest) or after shrinking (shortest).",
      ],
      diagram: `while (right < n) {
    include a[right++]
    while (invalid) exclude a[left++]
    answer = max(answer, right - left)
}`,
      code: {
        title: "Longest substring without repeats",
        code: `int longest(String s) {
    int[] last = new int[128];
    java.util.Arrays.fill(last, -1);
    int left = 0, best = 0;
    for (int r = 0; r < s.length(); r++) {
        char c = s.charAt(r);
        if (last[c] >= left) left = last[c] + 1;
        last[c] = r;
        best = Math.max(best, r - left + 1);
    }
    return best;
}`,
        explain: [
          "last[c] stores the most recent index of character c.",
          "If that index is inside the window, jump left past it instead of shrinking one by one.",
          "r - left + 1 is the current window length.",
        ],
      },
    },
  ],
  javaSyntax: [
    {
      title: "Window skeleton",
      code: `int left = 0;
Map<Character,Integer> win = new HashMap<>();
for (int right = 0; right < s.length(); right++) {
    win.merge(s.charAt(right), 1, Integer::sum);
    while (win.size() > k) {                 // invalid condition
        char out = s.charAt(left++);
        if (win.merge(out, -1, Integer::sum) == 0) win.remove(out);
    }
    best = Math.max(best, right - left + 1);
}`,
      explain: [
        "Remove the key when its count reaches zero, otherwise size() is wrong.",
        "The inner while never makes the total work quadratic because left only increases.",
        "Swap the invalid condition to fit the problem (sum, distinct count, character deficit).",
      ],
    },
    {
      title: "Fast and slow pointers",
      code: `int slow = 0;
for (int fast = 0; fast < a.length; fast++) {
    if (a[fast] != a[slow]) a[++slow] = a[fast];
}
int newLength = slow + 1;   // dedupe a sorted array in place`,
      explain: [
        "slow marks the end of the processed prefix.",
        "fast scans ahead looking for the next useful element.",
        "The same shape solves remove-element and move-zeros.",
      ],
    },
  ],
  patterns: [
    {
      name: "Shrink-to-shortest window",
      what: "Expand until the window satisfies the condition, then shrink while it still does, recording the minimum length.",
      when: "Minimum size subarray sum, minimum window substring.",
      identify: "The question asks for the smallest / shortest window.",
      example: "Smallest subarray with sum >= target.",
      code: `int left = 0, sum = 0, best = Integer.MAX_VALUE;
for (int r = 0; r < a.length; r++) {
    sum += a[r];
    while (sum >= target) { best = Math.min(best, r - left + 1); sum -= a[left++]; }
}
return best == Integer.MAX_VALUE ? 0 : best;`,
    },
    {
      name: "At-most-k trick for exactly-k",
      what: "count(exactly k) = count(at most k) - count(at most k-1).",
      when: "Subarrays with exactly k distinct values / k odd numbers.",
      identify: "The word 'exactly' with a distinct-count constraint.",
      example: "Subarrays with exactly k distinct integers.",
      code: `int exactly(int[] a, int k) { return atMost(a, k) - atMost(a, k - 1); }`,
    },
    {
      name: "Sorted pair scan",
      what: "Sort first, then use opposite pointers to find pairs or triplets.",
      when: "3Sum, closest pair, container with most water.",
      identify: "Order does not matter and you need combinations summing to a value.",
      example: "3Sum: fix i, then two-pointer the rest.",
      code: `Arrays.sort(a);
for (int i = 0; i < a.length - 2; i++) {
    if (i > 0 && a[i] == a[i-1]) continue;
    int l = i + 1, r = a.length - 1;
    while (l < r) {
        int s = a[i] + a[l] + a[r];
        if (s == 0) { /* record */ l++; r--; }
        else if (s < 0) l++; else r--;
    }
}`,
    },
  ],
  examples: [
    {
      title: "Minimum subarray with sum >= 7",
      input: "a = [2, 3, 1, 2, 4, 3], target = 7",
      steps: [
        "r=0..3 sum reaches 8 with window [2,3,1,2], length 4 -> best 4.",
        "Shrink: sum 6 after removing 2, stop.",
        "r=4 sum 10, shrink to [3,1,2,4]=10 (len 4), [1,2,4]=7 (len 3) -> best 3.",
        "r=5 sum 10 -> [2,4,3]=9 len 3, [4,3]=7 len 2 -> best 2.",
      ],
      output: "2 (the subarray [4,3])",
    },
    {
      title: "Longest substring without repeating characters",
      input: "s = \"abcabcbb\"",
      steps: [
        "Window grows to \"abc\" (len 3).",
        "Next 'a' repeats, left jumps to index 1 -> \"bca\".",
        "Every later window stays length 3 at best.",
      ],
      output: "3",
    },
  ],
  problems: [
    {
      id: "tp-1",
      title: "Reverse an array in place",
      level: "Beginner",
      statement: "Reverse the elements of an array without extra memory.",
      input: "[1,2,3,4,5]",
      output: "[5,4,3,2,1]",
      approach: "Swap the outermost pair and move both pointers inward.",
      steps: ["i = 0, j = n-1.", "Swap a[i] and a[j].", "i++, j-- until i >= j."],
      code: `void reverse(int[] a) {
    int i = 0, j = a.length - 1;
    while (i < j) { int t = a[i]; a[i++] = a[j]; a[j--] = t; }
}`,
      time: "O(n)",
      space: "O(1)",
    },
    {
      id: "tp-2",
      title: "Longest substring with at most 2 distinct characters",
      level: "Intermediate",
      statement: "Find the length of the longest substring containing at most two distinct characters.",
      input: "\"eceba\"",
      output: "3 (\"ece\")",
      approach: "Variable window with a count map; shrink while the map has more than 2 keys.",
      steps: ["Add s[right] to the map.", "While map size > 2, decrement and possibly remove s[left++].", "Update the best length."],
      code: `int lengthOfLongest(String s) {
    Map<Character,Integer> win = new HashMap<>();
    int left = 0, best = 0;
    for (int r = 0; r < s.length(); r++) {
        win.merge(s.charAt(r), 1, Integer::sum);
        while (win.size() > 2) {
            char out = s.charAt(left++);
            if (win.merge(out, -1, Integer::sum) == 0) win.remove(out);
        }
        best = Math.max(best, r - left + 1);
    }
    return best;
}`,
      time: "O(n)",
      space: "O(1) (at most 3 keys)",
    },
    {
      id: "tp-3",
      title: "Container with most water",
      level: "Interview",
      statement: "Given heights, pick two lines forming the container that holds the most water.",
      input: "[1,8,6,2,5,4,8,3,7]",
      output: "49",
      approach: "Start at both ends; area is limited by the shorter line, so move that pointer inward.",
      steps: [
        "area = (j - i) * min(h[i], h[j]).",
        "Record the maximum area.",
        "Move the pointer at the shorter line, since keeping it can never improve the area.",
      ],
      code: `int maxArea(int[] h) {
    int i = 0, j = h.length - 1, best = 0;
    while (i < j) {
        best = Math.max(best, (j - i) * Math.min(h[i], h[j]));
        if (h[i] < h[j]) i++; else j--;
    }
    return best;
}`,
      time: "O(n)",
      space: "O(1)",
    },
  ],
  mistakes: [
    { mistake: "Forgetting to remove zero-count keys from the window map.", fix: "Remove the key when its count hits 0 so size() reflects distinct characters." },
    { mistake: "Using two pointers on an unsorted array where sorting is required.", fix: "Sort first (or use hashing) when the technique depends on order." },
    { mistake: "Updating the answer in the wrong place.", fix: "Longest windows update after shrinking to valid; shortest windows update inside the shrink loop." },
    { mistake: "Off-by-one in window length.", fix: "Length of [left, right] inclusive is right - left + 1." },
    { mistake: "Moving both pointers on equality in a sorted pair scan.", fix: "Skip duplicates deliberately to avoid repeated triplets." },
  ],
  interviewQuestions: [
    { q: "Why is a sliding window O(n) even with an inner while loop?", a: "Each pointer only moves forward, so across the whole run there are at most 2n pointer moves." },
    { q: "When does two pointers require sorted input?", a: "Whenever the decision to move a pointer relies on monotonicity, as in pair sums or closest sum problems." },
    { q: "How do you handle 'exactly k' window problems?", a: "Compute atMost(k) - atMost(k-1), because both are easy monotone windows." },
    { q: "Difference between fast/slow and left/right pointers?", a: "Fast/slow both move forward for compaction or cycle detection; left/right define a window boundary or converge from the ends." },
    { q: "How would you find the maximum in every window of size k?", a: "Use a monotonic deque holding indices in decreasing value order, giving O(n) total." },
  ],
  practice: {
    easy: ["Reverse a string", "Valid palindrome", "Remove duplicates from sorted array", "Move zeros", "Max sum of size-k window"],
    medium: ["Longest substring without repeating characters", "Minimum size subarray sum", "3Sum", "Fruit into baskets", "Sort colours (Dutch flag)"],
    hard: ["Minimum window substring", "Sliding window maximum", "Trapping rain water", "Longest substring with at most k distinct"],
  },
  complexity: [
    { operation: "Opposite-direction scan", time: "O(n)", space: "O(1)" },
    { operation: "Fixed window sum", time: "O(n)", space: "O(1)" },
    { operation: "Variable window with count map", time: "O(n)", space: "O(k)" },
    { operation: "Sort then two-pointer", time: "O(n log n)", space: "O(log n)" },
    { operation: "Sliding window maximum (deque)", time: "O(n)", space: "O(k)" },
  ],
  revision: {
    concepts: ["Pointers only move forward, giving linear total work.", "Fixed windows add-in and subtract-out.", "Variable windows expand then shrink to restore validity."],
    rules: ["Window length = right - left + 1.", "Remove zero counts from the map.", "Sort first when the movement rule needs order."],
    patterns: ["Longest valid window", "Shortest valid window", "atMost(k) - atMost(k-1)", "Fast/slow compaction"],
    syntax: ["win.merge(c, 1, Integer::sum)", "sum += a[r] - a[r-k]", "while (i < j) swap", "Arrays.sort before pair scan"],
    problems: ["Longest substring without repeats", "Minimum size subarray sum", "3Sum", "Container with most water"],
  },
};
