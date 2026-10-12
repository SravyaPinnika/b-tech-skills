import type { Lesson } from "./types";

export const arraysStringsLesson: Lesson = {
  slug: "arrays-strings",
  topic: "Arrays & Strings",
  title: "Arrays & Strings",
  blurb: "The base container of every coding round: contiguous memory, index math, and string immutability.",
  overview: {
    simple: [
      "An array is a fixed-size block of memory holding elements of the same type, one after another. Because the elements sit next to each other, the computer can jump straight to element number i without walking through the earlier ones.",
      "A string is an array of characters with extra rules. In Java a String cannot be changed after it is created (it is immutable), so every 'edit' actually builds a new String.",
      "Almost every interview problem starts with an array or a string, so mastering index arithmetic here makes every later topic easier.",
    ],
    whyLearn: [
      "80% of online assessment questions use an array or string as the input format.",
      "Array indexing teaches the difference between O(1) random access and O(n) shifting, which is the foundation of complexity analysis.",
      "String handling exposes the cost of immutability, which is a favourite follow-up question in Java interviews.",
    ],
    realWorld: [
      "Pixel buffers in images are flat arrays indexed as row * width + col.",
      "Database pages store fixed-width records in array-like layout for fast scanning.",
      "Log processing pipelines split and scan strings billions of times a day.",
    ],
  },
  coreConcepts: [
    {
      heading: "Contiguous memory and O(1) access",
      body: [
        "The address of element i is base + i * sizeOfElement. That single multiplication is why reading arr[i] costs the same no matter how big the array is.",
        "Inserting or deleting in the middle is expensive, because every element after the hole must shift one position.",
      ],
      diagram: `index:   0    1    2    3    4
        +----+----+----+----+----+
 array  | 12 |  7 | 25 |  3 | 18 |
        +----+----+----+----+----+
addr:   100  104  108  112  116     (int = 4 bytes)
arr[3] -> 100 + 3*4 = 112  -> one jump, O(1)`,
      code: {
        title: "Reading, writing and growing",
        code: `int[] a = new int[5];      // all zeros
a[0] = 12;                 // O(1) write
int x = a[0];              // O(1) read
int n = a.length;          // length is a field, not a method

// arrays cannot grow: copy into a bigger one
int[] bigger = java.util.Arrays.copyOf(a, a.length * 2);`,
        explain: [
          "new int[5] allocates 5 slots initialised to 0 (null for objects, false for boolean).",
          "a.length has no parentheses for arrays; String uses length().",
          "Arrays.copyOf allocates a new array and copies, so growing costs O(n).",
        ],
      },
    },
    {
      heading: "Prefix sums: answering range queries fast",
      body: [
        "If you are asked many times for the sum of a range, recomputing each time is O(n) per query. Build a prefix array once, then every query is O(1).",
        "pre[i] stores the sum of the first i elements, so sum(l..r) = pre[r + 1] - pre[l].",
      ],
      diagram: `arr :      3    1    4    1    5
pre : 0    3    4    8    9   14
            ^                  ^
sum(1..3) = pre[4] - pre[1] = 9 - 3 = 6`,
      code: {
        title: "Prefix sum build and query",
        code: `int[] pre = new int[arr.length + 1];
for (int i = 0; i < arr.length; i++) {
    pre[i + 1] = pre[i] + arr[i];
}
int sumLtoR = pre[r + 1] - pre[l];   // inclusive range`,
        explain: [
          "pre has one extra slot so that pre[0] = 0 removes the l == 0 special case.",
          "Build is O(n) once; each query is then O(1).",
          "Use long[] when values can overflow int.",
        ],
      },
    },
    {
      heading: "Strings are immutable in Java",
      body: [
        "s = s + \"x\" inside a loop creates a brand new String each iteration, giving O(n^2) total work. StringBuilder edits an internal char array instead, giving O(n).",
        "Use == only for identity; use equals() to compare content.",
      ],
      code: {
        title: "StringBuilder vs concatenation",
        code: `// BAD: O(n^2)
String s = "";
for (char c : chars) s += c;

// GOOD: O(n)
StringBuilder sb = new StringBuilder();
for (char c : chars) sb.append(c);
String result = sb.toString();`,
        explain: [
          "Each += copies all previous characters into a new object.",
          "append writes into a resizable buffer, amortised O(1) per character.",
          "sb.reverse(), sb.deleteCharAt(i) and sb.setCharAt(i, c) cover most in-place needs.",
        ],
      },
    },
  ],
  javaSyntax: [
    {
      title: "Array essentials",
      code: `int[] a = {5, 2, 9};
int[][] grid = new int[3][4];        // 3 rows, 4 cols
java.util.Arrays.sort(a);            // ascending, O(n log n)
java.util.Arrays.fill(a, -1);
int[] copy = java.util.Arrays.copyOfRange(a, 1, 3);
System.out.println(java.util.Arrays.toString(a));`,
      explain: [
        "grid[r][c] is an array of arrays; grid.length is rows, grid[0].length is columns.",
        "Arrays.sort on primitives uses dual-pivot quicksort; on objects it uses a stable merge sort.",
        "copyOfRange end index is exclusive.",
      ],
    },
    {
      title: "String essentials",
      code: `String s = "placement";
s.length();          // 9
s.charAt(0);         // 'p'
s.substring(2, 5);   // "ace"  (end exclusive)
s.indexOf("ce");     // 4
s.toCharArray();
s.equals("other");   // content compare
"a,b,c".split(",");  // ["a","b","c"]`,
      explain: [
        "substring is O(k) because it copies the characters in modern Java.",
        "charAt returns a char; subtract 'a' to convert a lowercase letter into 0..25.",
        "split takes a regex, so escape characters like \\\\. when splitting on a dot.",
      ],
    },
  ],
  patterns: [
    {
      name: "Prefix sum / running total",
      what: "Precompute cumulative values so range answers become subtractions.",
      when: "Many range-sum queries, subarray sums equal to k, equilibrium index.",
      identify: "The statement repeats 'sum of subarray' or gives multiple queries.",
      example: "Count subarrays with sum k using a HashMap of prefix counts.",
      code: `int count = 0, sum = 0;
Map<Integer,Integer> seen = new HashMap<>();
seen.put(0, 1);
for (int v : arr) {
    sum += v;
    count += seen.getOrDefault(sum - k, 0);
    seen.merge(sum, 1, Integer::sum);
}`,
    },
    {
      name: "In-place two-index write",
      what: "Keep a write pointer behind a read pointer to compact an array without extra memory.",
      when: "Remove duplicates, move zeros, filter elements in O(1) space.",
      identify: "The problem says 'in place' and 'return new length'.",
      example: "Move all zeros to the end while keeping the order of non-zeros.",
      code: `int w = 0;
for (int r = 0; r < a.length; r++) {
    if (a[r] != 0) { int t = a[w]; a[w++] = a[r]; a[r] = t; }
}`,
    },
    {
      name: "Frequency array for characters",
      what: "Use int[26] or int[128] instead of a HashMap when the alphabet is fixed.",
      when: "Anagrams, first unique character, character counts.",
      identify: "Input is lowercase letters or ASCII only.",
      example: "Check if two strings are anagrams in O(n) time and O(1) space.",
      code: `int[] f = new int[26];
for (char c : s.toCharArray()) f[c - 'a']++;
for (char c : t.toCharArray()) if (--f[c - 'a'] < 0) return false;`,
    },
  ],
  examples: [
    {
      title: "Maximum subarray sum (Kadane)",
      input: "arr = [-2, 1, -3, 4, -1, 2, 1, -5, 4]",
      steps: [
        "cur = max(v, cur + v) tracks the best sum ending at the current index.",
        "-2 -> cur=-2, best=-2",
        "1 -> cur=max(1,-1)=1, best=1",
        "-3 -> cur=-2, best=1",
        "4 -> cur=4, best=4",
        "-1 -> cur=3; 2 -> cur=5, best=5; 1 -> cur=6, best=6",
        "-5 -> cur=1; 4 -> cur=5, best stays 6",
      ],
      output: "6 (the subarray [4, -1, 2, 1])",
    },
    {
      title: "Reverse words in a sentence",
      input: "s = \"crack the interview\"",
      steps: [
        "Split on one-or-more spaces: [\"crack\", \"the\", \"interview\"].",
        "Walk the array backwards appending to a StringBuilder.",
        "Insert a single space between words, none at the end.",
      ],
      output: "\"interview the crack\"",
    },
  ],
  problems: [
    {
      id: "as-1",
      title: "Two Sum (sorted input)",
      level: "Beginner",
      statement: "Given a sorted array and a target, return the indices of two numbers that add up to the target.",
      input: "a = [2, 7, 11, 15], target = 9",
      output: "[0, 1]",
      approach: "Because the array is sorted, walk one pointer from each end and shrink the window based on the sum.",
      steps: [
        "Set i = 0, j = n - 1.",
        "If a[i] + a[j] == target return the pair.",
        "If the sum is too small move i right; if too large move j left.",
      ],
      code: `int[] twoSum(int[] a, int target) {
    int i = 0, j = a.length - 1;
    while (i < j) {
        int sum = a[i] + a[j];
        if (sum == target) return new int[]{i, j};
        if (sum < target) i++; else j--;
    }
    return new int[]{-1, -1};
}`,
      time: "O(n)",
      space: "O(1)",
    },
    {
      id: "as-2",
      title: "Rotate array by k",
      level: "Intermediate",
      statement: "Rotate an array to the right by k steps, in place.",
      input: "a = [1,2,3,4,5,6,7], k = 3",
      output: "[5,6,7,1,2,3,4]",
      approach: "Reverse the whole array, then reverse the first k and the remaining n-k elements.",
      steps: [
        "k %= n so large k values are handled.",
        "reverse(0, n-1) gives [7,6,5,4,3,2,1].",
        "reverse(0, k-1) fixes the first block, reverse(k, n-1) fixes the rest.",
      ],
      code: `void rotate(int[] a, int k) {
    int n = a.length; k %= n;
    reverse(a, 0, n - 1); reverse(a, 0, k - 1); reverse(a, k, n - 1);
}
void reverse(int[] a, int i, int j) {
    while (i < j) { int t = a[i]; a[i++] = a[j]; a[j--] = t; }
}`,
      time: "O(n)",
      space: "O(1)",
    },
    {
      id: "as-3",
      title: "Longest common prefix",
      level: "Interview",
      statement: "Find the longest common prefix string amongst an array of strings.",
      input: "[\"flower\", \"flow\", \"flight\"]",
      output: "\"fl\"",
      approach: "Take the first string as a candidate prefix and trim it against every other string.",
      steps: [
        "Start with prefix = strs[0].",
        "While strs[i] does not start with prefix, drop its last character.",
        "If prefix becomes empty, return \"\".",
      ],
      code: `String lcp(String[] strs) {
    if (strs.length == 0) return "";
    String p = strs[0];
    for (int i = 1; i < strs.length; i++) {
        while (!strs[i].startsWith(p)) {
            p = p.substring(0, p.length() - 1);
            if (p.isEmpty()) return "";
        }
    }
    return p;
}`,
      time: "O(total characters)",
      space: "O(1) extra",
    },
  ],
  mistakes: [
    { mistake: "Using arr.length() or str.length for the size.", fix: "Arrays use the field length; String uses the method length()." },
    { mistake: "Comparing strings with ==.", fix: "Use equals() for content and equalsIgnoreCase() for case-insensitive checks." },
    { mistake: "Building strings with += in a loop.", fix: "Use StringBuilder to avoid quadratic time." },
    { mistake: "Off-by-one in substring or loop bounds.", fix: "Remember substring(start, end) excludes end and the last index is n - 1." },
    { mistake: "Integer overflow while summing large arrays.", fix: "Accumulate into a long." },
  ],
  interviewQuestions: [
    { q: "Why is array access O(1)?", a: "Elements are stored contiguously, so the address is computed with base + i * elementSize, a constant-time arithmetic operation." },
    { q: "Why are Java strings immutable?", a: "For safe sharing in the string pool, thread safety, and cached hashCode which makes them reliable HashMap keys." },
    { q: "Difference between ArrayList and array?", a: "ArrayList resizes automatically and stores objects (with boxing for primitives); arrays are fixed size and can hold primitives directly." },
    { q: "When is a frequency array better than a HashMap?", a: "When the key range is small and known, such as 26 lowercase letters: it avoids hashing overhead and uses O(1) space." },
    { q: "How does Kadane's algorithm work?", a: "It keeps the best sum ending at the current index, restarting the running sum whenever it becomes worse than the element alone." },
  ],
  practice: {
    easy: [
      "Remove duplicates from a sorted array in place",
      "Move all zeros to the end",
      "Reverse a string without extra array",
      "Check if a string is a palindrome ignoring non-alphanumerics",
      "Find the second largest element",
    ],
    medium: [
      "Maximum subarray sum (Kadane)",
      "Product of array except self",
      "Rotate a matrix 90 degrees in place",
      "Group anagrams",
      "Longest substring without repeating characters",
    ],
    hard: [
      "Trapping rain water",
      "Median of two sorted arrays",
      "Minimum window substring",
      "First missing positive",
    ],
  },
  complexity: [
    { operation: "Access arr[i]", time: "O(1)", space: "O(1)" },
    { operation: "Linear search", time: "O(n)", space: "O(1)" },
    { operation: "Insert / delete at middle", time: "O(n)", space: "O(1)", note: "Shifting elements" },
    { operation: "Sort (Arrays.sort)", time: "O(n log n)", space: "O(log n)" },
    { operation: "Prefix sum build", time: "O(n)", space: "O(n)", note: "Then O(1) per query" },
    { operation: "String concatenation in loop", time: "O(n^2)", space: "O(n)", note: "Use StringBuilder instead" },
  ],
  revision: {
    concepts: [
      "Arrays are contiguous and fixed size; access is O(1), middle insert is O(n).",
      "Prefix sums convert repeated range queries into O(1) subtractions.",
      "Java strings are immutable; StringBuilder is the mutable counterpart.",
    ],
    rules: [
      "Always check for empty or single-element input.",
      "Use long when sums may exceed 2^31 - 1.",
      "Prefer int[26] over HashMap for fixed alphabets.",
    ],
    patterns: ["Prefix sum", "In-place read/write pointers", "Frequency counting", "Kadane running best"],
    syntax: ["arr.length vs s.length()", "Arrays.sort / fill / copyOf", "s.substring(a, b) end exclusive", "sb.append / reverse / toString"],
    problems: ["Two Sum", "Rotate array", "Kadane maximum subarray", "Longest common prefix", "Group anagrams"],
  },
};
