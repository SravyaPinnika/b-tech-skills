import type { Lesson } from "./types";

export const sortingSearchingLesson: Lesson = {
  slug: "sorting-searching",
  topic: "Sorting & Searching, Binary Search on Answer",
  title: "Sorting, Searching & Binary Search on Answer",
  blurb: "Order the data, then exploit that order: comparison sorts, binary search, and searching the answer space.",
  overview: {
    simple: [
      "Sorting arranges data so that comparisons become predictable. Once data is sorted you can binary search it, deduplicate it, or sweep it in one pass.",
      "Binary search repeatedly halves a sorted range, so it finds an element in about log2(n) steps - 20 steps for a million items.",
      "Binary search on the answer is the advanced version: instead of searching an array, you search the range of possible answers and test each candidate with a feasibility check.",
    ],
    whyLearn: [
      "Sorting is the default first move for interval, greedy and duplicate problems.",
      "Binary search variants (first/last occurrence, rotated arrays) are extremely common in online tests.",
      "'Minimise the maximum' style questions are almost always binary search on answer.",
    ],
    realWorld: [
      "Databases sort rows to support merge joins and index scans.",
      "Leaderboards keep scores sorted for ranking queries.",
      "Capacity planning (how many servers do I need?) is a feasibility search.",
    ],
  },
  coreConcepts: [
    {
      heading: "Comparison sorts you must be able to describe",
      body: [
        "Merge sort splits, sorts halves and merges: always O(n log n), stable, needs O(n) extra memory.",
        "Quick sort partitions around a pivot: O(n log n) average, O(n^2) worst case, in place but not stable.",
        "Heap sort builds a heap then extracts: O(n log n), in place, not stable.",
        "Counting sort is not comparison based: O(n + k) when values live in a small range.",
      ],
      diagram: `merge sort on [5,2,4,1]
 split : [5,2] [4,1]
 split : [5][2] [4][1]
 merge : [2,5] [1,4]
 merge : [1,2,4,5]     depth log n, each level O(n)`,
      code: {
        title: "Merge step",
        code: `void merge(int[] a, int lo, int mid, int hi) {
    int[] tmp = new int[hi - lo + 1];
    int i = lo, j = mid + 1, k = 0;
    while (i <= mid && j <= hi) tmp[k++] = (a[i] <= a[j]) ? a[i++] : a[j++];
    while (i <= mid) tmp[k++] = a[i++];
    while (j <= hi)  tmp[k++] = a[j++];
    System.arraycopy(tmp, 0, a, lo, tmp.length);
}`,
        explain: [
          "a[i] <= a[j] (not <) is what keeps merge sort stable.",
          "The two tail loops copy whatever remains in one half.",
          "System.arraycopy is faster than a manual copy loop.",
        ],
      },
    },
    {
      heading: "Binary search and its boundaries",
      body: [
        "The invariant is: the answer, if it exists, is inside [lo, hi]. Every iteration shrinks that range.",
        "Use mid = lo + (hi - lo) / 2 to avoid overflow.",
        "For 'first index where condition is true', keep moving hi to mid instead of mid - 1 and return lo.",
      ],
      diagram: `[1, 3, 5, 7, 9, 11]  target 9
lo=0 hi=5 mid=2 (5) -> too small, lo=3
lo=3 hi=5 mid=4 (9) -> found at index 4`,
      code: {
        title: "Exact match and lower bound",
        code: `int find(int[] a, int t) {
    int lo = 0, hi = a.length - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] == t) return mid;
        if (a[mid] < t) lo = mid + 1; else hi = mid - 1;
    }
    return -1;
}

int lowerBound(int[] a, int t) {          // first index with a[i] >= t
    int lo = 0, hi = a.length;
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] < t) lo = mid + 1; else hi = mid;
    }
    return lo;
}`,
        explain: [
          "Exact search uses lo <= hi with inclusive bounds.",
          "lowerBound uses a half-open range [lo, hi) and returns lo, which can equal n.",
          "upperBound is the same with a[mid] <= t.",
        ],
      },
    },
    {
      heading: "Binary search on the answer",
      body: [
        "Works when feasibility is monotone: if a capacity of x works, every larger capacity also works.",
        "Define check(x) -> boolean, then binary search the smallest x where check is true.",
      ],
      diagram: `answers:  1  2  3 ... 7  8  9 ... max
check  :  F  F  F     F  T  T      T
                        ^ first true = answer`,
      code: {
        title: "Ship packages within D days",
        code: `int shipWithinDays(int[] w, int days) {
    int lo = Arrays.stream(w).max().getAsInt();
    int hi = Arrays.stream(w).sum();
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (feasible(w, days, mid)) hi = mid; else lo = mid + 1;
    }
    return lo;
}
boolean feasible(int[] w, int days, int cap) {
    int used = 1, cur = 0;
    for (int x : w) {
        if (cur + x > cap) { used++; cur = 0; }
        cur += x;
    }
    return used <= days;
}`,
        explain: [
          "lo is the largest single weight (a smaller capacity can never work), hi is the total.",
          "feasible greedily fills each day to the capacity.",
          "Shrinking hi to mid on success finds the minimum feasible capacity.",
        ],
      },
    },
  ],
  javaSyntax: [
    {
      title: "Sorting APIs",
      code: `int[] a = {3,1,2};
Arrays.sort(a);                                   // primitives, quicksort
Integer[] b = {3,1,2};
Arrays.sort(b, Comparator.reverseOrder());        // objects, stable merge sort
List<int[]> iv = new ArrayList<>();
iv.sort((x, y) -> Integer.compare(x[0], y[0]));   // by first element
people.sort(Comparator.comparingInt(P::age).thenComparing(P::name));`,
      explain: [
        "Never write (x, y) -> x - y for large values: it overflows. Use Integer.compare.",
        "Comparators only work on object arrays / collections, not int[].",
        "thenComparing chains tie-breakers.",
      ],
    },
    {
      title: "Built-in binary search",
      code: `int i = Arrays.binarySearch(a, 5);       // >=0 index, else -(insertionPoint)-1
int ins = i < 0 ? -i - 1 : i;
TreeMap<Integer,String> tm = new TreeMap<>();
tm.floorKey(10); tm.ceilingKey(10);     // nearest keys, O(log n)`,
      explain: [
        "A negative result encodes where the key would be inserted.",
        "The array must already be sorted or the result is undefined.",
        "TreeMap/TreeSet give binary-search behaviour on a dynamic set.",
      ],
    },
  ],
  patterns: [
    {
      name: "First / last occurrence",
      what: "Do not stop at the first match; keep shrinking towards the boundary.",
      when: "Count occurrences, find range of a value, search insert position.",
      identify: "Duplicates exist and you need the leftmost or rightmost index.",
      example: "Count of a target = upperBound - lowerBound.",
      code: `int count = upperBound(a, t) - lowerBound(a, t);`,
    },
    {
      name: "Rotated sorted array",
      what: "One half is always sorted; decide which half can contain the target.",
      when: "Search in rotated array, find the minimum element.",
      identify: "Sorted array that was rotated at an unknown pivot.",
      example: "Search in a rotated sorted array.",
      code: `while (lo <= hi) {
    int mid = lo + (hi - lo) / 2;
    if (a[mid] == t) return mid;
    if (a[lo] <= a[mid]) {
        if (t >= a[lo] && t < a[mid]) hi = mid - 1; else lo = mid + 1;
    } else {
        if (t > a[mid] && t <= a[hi]) lo = mid + 1; else hi = mid - 1;
    }
}`,
    },
    {
      name: "Sort then sweep",
      what: "Sorting reveals adjacency, so a single linear pass answers the question.",
      when: "Merge intervals, meeting rooms, minimum absolute difference.",
      identify: "Order does not matter in the input but neighbours matter in the answer.",
      example: "Minimum absolute difference between any two elements.",
      code: `Arrays.sort(a);
int best = Integer.MAX_VALUE;
for (int i = 1; i < a.length; i++) best = Math.min(best, a[i] - a[i-1]);`,
    },
  ],
  examples: [
    {
      title: "Binary search trace",
      input: "a = [2,4,6,8,10,12,14], target = 12",
      steps: [
        "lo=0 hi=6 mid=3 -> a[3]=8 < 12, lo=4.",
        "lo=4 hi=6 mid=5 -> a[5]=12 == target.",
        "Found in 2 comparisons instead of 6.",
      ],
      output: "index 5",
    },
    {
      title: "Minimum capacity to ship in 3 days",
      input: "weights = [1,2,3,4,5], days = 3",
      steps: [
        "lo = 5 (max weight), hi = 15 (sum).",
        "mid = 10 -> feasible in 2 days, hi = 10.",
        "mid = 7 -> [1,2,3] [4] [5] = 3 days, feasible, hi = 7.",
        "mid = 6 -> [1,2,3][4][5] fits in 3 days too, hi = 6. mid = 5 -> needs 4 days, lo = 6.",
      ],
      output: "6",
    },
  ],
  problems: [
    {
      id: "ss-1",
      title: "Search insert position",
      level: "Beginner",
      statement: "Return the index where the target is found, or where it should be inserted to keep the array sorted.",
      input: "a = [1,3,5,6], target = 4",
      output: "2",
      approach: "Lower bound binary search on a half-open range.",
      steps: ["lo = 0, hi = n.", "If a[mid] < target move lo past mid, else set hi = mid.", "Return lo."],
      code: `int searchInsert(int[] a, int t) {
    int lo = 0, hi = a.length;
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] < t) lo = mid + 1; else hi = mid;
    }
    return lo;
}`,
      time: "O(log n)",
      space: "O(1)",
    },
    {
      id: "ss-2",
      title: "Kth largest element",
      level: "Intermediate",
      statement: "Find the kth largest element in an unsorted array.",
      input: "[3,2,1,5,6,4], k = 2",
      output: "5",
      approach: "Keep a min-heap of size k, or use quickselect for O(n) average.",
      steps: ["Push each element into a min-heap.", "If the heap exceeds size k, poll the smallest.", "The heap root is the kth largest."],
      code: `int kthLargest(int[] a, int k) {
    PriorityQueue<Integer> pq = new PriorityQueue<>();
    for (int v : a) { pq.add(v); if (pq.size() > k) pq.poll(); }
    return pq.peek();
}`,
      time: "O(n log k)",
      space: "O(k)",
    },
    {
      id: "ss-3",
      title: "Split array largest sum",
      level: "Interview",
      statement: "Split the array into m contiguous subarrays minimising the largest subarray sum.",
      input: "[7,2,5,10,8], m = 2",
      output: "18",
      approach: "Binary search the answer between max element and total sum, checking how many parts a candidate limit needs.",
      steps: [
        "check(limit) greedily starts a new part whenever the running sum exceeds the limit.",
        "If parts <= m the limit is feasible, so search lower.",
        "Otherwise search higher.",
      ],
      code: `int splitArray(int[] a, int m) {
    int lo = 0, hi = 0;
    for (int v : a) { lo = Math.max(lo, v); hi += v; }
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        int parts = 1, cur = 0;
        for (int v : a) { if (cur + v > mid) { parts++; cur = 0; } cur += v; }
        if (parts <= m) hi = mid; else lo = mid + 1;
    }
    return lo;
}`,
      time: "O(n log(sum))",
      space: "O(1)",
    },
  ],
  mistakes: [
    { mistake: "Computing mid as (lo + hi) / 2 with huge bounds.", fix: "Use lo + (hi - lo) / 2 or (lo + hi) >>> 1." },
    { mistake: "Infinite loop from setting lo = mid.", fix: "Move lo to mid + 1, or restructure with the half-open lower-bound form." },
    { mistake: "Binary searching unsorted data.", fix: "Sort first, or confirm the predicate is monotone for answer-space search." },
    { mistake: "Using x - y in a comparator.", fix: "Integer.compare(x, y) avoids overflow." },
    { mistake: "Assuming Arrays.sort is stable for primitives.", fix: "It is not; box the values or sort indices when stability matters." },
  ],
  interviewQuestions: [
    { q: "Why is comparison sorting bounded by O(n log n)?", a: "There are n! orderings and each comparison gives one bit, so at least log2(n!) ~ n log n comparisons are needed." },
    { q: "When is quicksort worse than mergesort?", a: "On adversarial or already-sorted input with poor pivot choice it degrades to O(n^2); mergesort is always O(n log n) but uses O(n) memory." },
    { q: "What makes a sort stable and why does it matter?", a: "Equal keys keep their relative order, which is required when sorting by multiple fields in successive passes." },
    { q: "How do you spot binary-search-on-answer problems?", a: "They say minimise the maximum (or maximise the minimum) and a candidate answer can be validated in O(n)." },
    { q: "How does Collections.sort work in Java?", a: "TimSort - a hybrid of merge sort and insertion sort that exploits existing runs, O(n) on nearly sorted input." },
  ],
  practice: {
    easy: ["Binary search", "Search insert position", "First bad version", "Square root of x", "Sort an array of 0s, 1s and 2s"],
    medium: ["Search in rotated sorted array", "Find first and last position of element", "Kth largest element", "Find peak element", "Koko eating bananas"],
    hard: ["Median of two sorted arrays", "Split array largest sum", "Aggressive cows / minimum maximum distance", "Count inversions with merge sort"],
  },
  complexity: [
    { operation: "Merge sort", time: "O(n log n)", space: "O(n)", note: "Stable" },
    { operation: "Quick sort", time: "O(n log n) avg, O(n^2) worst", space: "O(log n)", note: "In place" },
    { operation: "Heap sort", time: "O(n log n)", space: "O(1)" },
    { operation: "Counting sort", time: "O(n + k)", space: "O(k)", note: "Small value range only" },
    { operation: "Binary search", time: "O(log n)", space: "O(1)" },
    { operation: "Binary search on answer", time: "O(n log(range))", space: "O(1)" },
  ],
  revision: {
    concepts: ["Comparison sorts cannot beat O(n log n).", "Binary search needs a monotone predicate, not necessarily an array.", "Sorting often converts a hard problem into a linear sweep."],
    rules: ["mid = lo + (hi - lo) / 2.", "Half-open range for boundary searches.", "Integer.compare inside comparators."],
    patterns: ["Lower/upper bound", "Rotated array halving", "Sort then sweep", "check(x) feasibility search"],
    syntax: ["Arrays.sort / binarySearch", "Comparator.comparingInt(...).thenComparing(...)", "TreeMap floorKey/ceilingKey", "PriorityQueue for kth largest"],
    problems: ["Search in rotated array", "First/last occurrence", "Koko eating bananas", "Split array largest sum"],
  },
};
