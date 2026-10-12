import type { Lesson } from "./types";

export const heapsLesson: Lesson = {
  slug: "heaps-priority-queues",
  topic: "Heaps & Priority Queues",
  title: "Heaps & Priority Queues",
  blurb: "Keep the smallest (or largest) element one step away: O(log n) insert, O(1) peek.",
  overview: {
    simple: [
      "A heap is a complete binary tree stored in an array where every parent is smaller (min-heap) or larger (max-heap) than its children. Only the root ordering is guaranteed - siblings are unordered.",
      "A priority queue is the abstract idea 'always give me the most important item next'; a heap is the usual implementation.",
      "Because the tree is complete, it fits in an array with no pointers: children of i live at 2i+1 and 2i+2.",
    ],
    whyLearn: [
      "Any 'top k', 'kth largest', 'merge k sorted' or 'schedule next task' problem is a heap problem.",
      "Dijkstra and Prim rely on a priority queue.",
      "Streaming medians and rate-limited job queues use two heaps.",
    ],
    realWorld: [
      "OS task schedulers pick the highest-priority runnable process.",
      "Hospital triage and ride-hailing dispatch are priority queues.",
      "Log aggregation merges many sorted streams with a k-way heap merge.",
    ],
  },
  coreConcepts: [
    {
      heading: "Array layout and index math",
      body: [
        "For index i: parent = (i - 1) / 2, left = 2i + 1, right = 2i + 2. No node references are needed.",
        "The heap is always complete, so its height is floor(log2 n) and every operation touches at most one root-to-leaf path.",
      ],
      diagram: `min-heap
            2
          /   \\
        5      8
       / \\    /
      9   6  11

array: [2, 5, 8, 9, 6, 11]
index:  0  1  2  3  4  5
left(1) = 3 -> 9, parent(4) = 1 -> 5`,
    },
    {
      heading: "Sift up (insert) and sift down (remove)",
      body: [
        "Insert appends at the end and swaps upward while it is smaller than its parent.",
        "Remove takes the root, moves the last element to the root and swaps downward with the smaller child until order is restored.",
        "Both walk at most the height, so both are O(log n).",
      ],
      diagram: `insert 1 into [2,5,8,9,6]
append: [2,5,8,9,6,1]
1 < parent 8 -> swap: [2,5,1,9,6,8]
1 < parent 2 -> swap: [1,5,2,9,6,8]`,
      code: {
        title: "Manual min-heap",
        code: `int[] h = new int[100]; int size = 0;

void push(int v) {
    h[size] = v;
    int i = size++;
    while (i > 0 && h[i] < h[(i - 1) / 2]) {
        int p = (i - 1) / 2;
        int t = h[i]; h[i] = h[p]; h[p] = t;
        i = p;
    }
}

int pop() {
    int top = h[0];
    h[0] = h[--size];
    int i = 0;
    while (true) {
        int l = 2*i + 1, r = 2*i + 2, small = i;
        if (l < size && h[l] < h[small]) small = l;
        if (r < size && h[r] < h[small]) small = r;
        if (small == i) break;
        int t = h[i]; h[i] = h[small]; h[small] = t;
        i = small;
    }
    return top;
}`,
        explain: [
          "push appends then sifts up; the loop stops at the root or when order holds.",
          "pop replaces the root with the last element, shrinks the size, then sifts down.",
          "Interviews usually accept PriorityQueue, but you must be able to explain these two loops.",
        ],
      },
    },
    {
      heading: "Java PriorityQueue",
      body: [
        "PriorityQueue is a min-heap by default. Pass a comparator to make it a max-heap or to order objects.",
        "peek() is O(1), offer/poll are O(log n), but contains() and remove(Object) are O(n).",
        "Iterating a PriorityQueue does NOT give sorted order - only repeated poll() does.",
      ],
      code: {
        title: "Common PriorityQueue setups",
        code: `PriorityQueue<Integer> min = new PriorityQueue<>();
PriorityQueue<Integer> max = new PriorityQueue<>(Comparator.reverseOrder());

// order int[] tasks by second field
PriorityQueue<int[]> pq =
    new PriorityQueue<>((a, b) -> Integer.compare(a[1], b[1]));

// heapify a collection in O(n)
PriorityQueue<Integer> heap = new PriorityQueue<>(list);`,
        explain: [
          "Comparator.reverseOrder() is the cleanest max-heap.",
          "Integer.compare avoids subtraction overflow.",
          "Building from a collection is O(n), cheaper than n inserts.",
        ],
      },
    },
  ],
  javaSyntax: [
    {
      title: "Top k with a bounded heap",
      code: `PriorityQueue<Integer> pq = new PriorityQueue<>();   // min-heap of size k
for (int v : nums) {
    pq.offer(v);
    if (pq.size() > k) pq.poll();     // drop the smallest
}
// pq now holds the k largest; pq.peek() is the kth largest`,
      explain: [
        "For k largest use a MIN-heap; for k smallest use a MAX-heap.",
        "The heap never exceeds k + 1 elements, so space is O(k).",
        "Total time is O(n log k), better than sorting when k is small.",
      ],
    },
    {
      title: "Two heaps for a running median",
      code: `PriorityQueue<Integer> lo = new PriorityQueue<>(Comparator.reverseOrder()); // max-heap
PriorityQueue<Integer> hi = new PriorityQueue<>();                          // min-heap

void add(int x) {
    lo.offer(x);
    hi.offer(lo.poll());
    if (hi.size() > lo.size()) lo.offer(hi.poll());
}
double median() {
    return lo.size() > hi.size() ? lo.peek() : (lo.peek() + hi.peek()) / 2.0;
}`,
      explain: [
        "lo holds the smaller half (max on top), hi the larger half (min on top).",
        "The cross-push keeps both halves correctly partitioned.",
        "Rebalance so lo.size() equals hi.size() or is one larger.",
      ],
    },
  ],
  patterns: [
    {
      name: "Bounded heap for top k",
      what: "Keep only k elements, evicting the worst.",
      when: "Kth largest, k closest points, top k frequent words.",
      identify: "The question asks for k best items out of a large stream.",
      example: "K closest points to the origin using a max-heap on distance.",
      code: `PriorityQueue<int[]> pq = new PriorityQueue<>(
    (a, b) -> (b[0]*b[0] + b[1]*b[1]) - (a[0]*a[0] + a[1]*a[1]));
for (int[] p : points) { pq.offer(p); if (pq.size() > k) pq.poll(); }`,
    },
    {
      name: "K-way merge",
      what: "Hold one element from each sorted source and always take the smallest.",
      when: "Merge k sorted lists/arrays, smallest range covering k lists.",
      identify: "Several already sorted inputs must be combined.",
      example: "Merge k sorted linked lists.",
      code: `PriorityQueue<Node> pq = new PriorityQueue<>((a, b) -> a.val - b.val);
for (Node l : lists) if (l != null) pq.offer(l);
Node dummy = new Node(0), tail = dummy;
while (!pq.isEmpty()) {
    Node n = pq.poll();
    tail.next = n; tail = n;
    if (n.next != null) pq.offer(n.next);
}`,
    },
    {
      name: "Greedy scheduling with a heap",
      what: "Always process the currently cheapest / earliest-finishing option.",
      when: "Task scheduler, meeting rooms II, minimum cost to connect ropes.",
      identify: "Repeated 'pick the smallest remaining' decisions.",
      example: "Meeting rooms II: count overlapping meetings.",
      code: `Arrays.sort(iv, (a, b) -> a[0] - b[0]);
PriorityQueue<Integer> ends = new PriorityQueue<>();
for (int[] m : iv) {
    if (!ends.isEmpty() && ends.peek() <= m[0]) ends.poll();
    ends.offer(m[1]);
}
return ends.size();   // rooms needed`,
    },
  ],
  examples: [
    {
      title: "3rd largest of [3,2,3,1,2,4,5,5,6]",
      input: "nums as above, k = 3",
      steps: [
        "Min-heap grows to [1,2,3]; after each offer beyond size 3 the smallest is dropped.",
        "Processing 4 -> heap [2,3,4]; 5 -> [3,4,5]; 5 -> [4,5,5]; 6 -> [5,5,6].",
        "peek() gives the smallest of the three largest.",
      ],
      output: "5",
    },
    {
      title: "Connect ropes with minimum cost",
      input: "ropes = [4, 3, 2, 6]",
      steps: [
        "Poll 2 and 3 -> cost 5, push 5. Total 5.",
        "Poll 4 and 5 -> cost 9, push 9. Total 14.",
        "Poll 6 and 9 -> cost 15. Total 29.",
      ],
      output: "29",
    },
  ],
  problems: [
    {
      id: "hp-1",
      title: "Last stone weight",
      level: "Beginner",
      statement: "Repeatedly smash the two heaviest stones; return the weight of the last stone or 0.",
      input: "[2,7,4,1,8,1]",
      output: "1",
      approach: "Max-heap, poll twice, push back the difference if non-zero.",
      steps: ["Offer all stones into a max-heap.", "While at least two remain, poll a and b and push a - b when positive.", "Return the remaining stone or 0."],
      code: `int lastStone(int[] s) {
    PriorityQueue<Integer> pq = new PriorityQueue<>(Comparator.reverseOrder());
    for (int v : s) pq.offer(v);
    while (pq.size() > 1) {
        int a = pq.poll(), b = pq.poll();
        if (a != b) pq.offer(a - b);
    }
    return pq.isEmpty() ? 0 : pq.peek();
}`,
      time: "O(n log n)",
      space: "O(n)",
    },
    {
      id: "hp-2",
      title: "Top k frequent elements",
      level: "Intermediate",
      statement: "Return the k most frequent elements of an array.",
      input: "[1,1,1,2,2,3], k = 2",
      output: "[1,2]",
      approach: "Count with a HashMap, then keep a min-heap of size k ordered by frequency.",
      steps: ["Build value -> count.", "Offer each key into a min-heap keyed on count, polling when size exceeds k.", "Drain the heap into the result."],
      code: `int[] topK(int[] nums, int k) {
    Map<Integer,Integer> f = new HashMap<>();
    for (int v : nums) f.merge(v, 1, Integer::sum);
    PriorityQueue<Integer> pq =
        new PriorityQueue<>((a, b) -> f.get(a) - f.get(b));
    for (int key : f.keySet()) { pq.offer(key); if (pq.size() > k) pq.poll(); }
    int[] out = new int[k];
    for (int i = k - 1; i >= 0; i--) out[i] = pq.poll();
    return out;
}`,
      time: "O(n log k)",
      space: "O(n)",
    },
    {
      id: "hp-3",
      title: "Find median from a data stream",
      level: "Interview",
      statement: "Support addNum(x) and findMedian() on a growing stream of numbers.",
      input: "add 1, add 2, median, add 3, median",
      output: "1.5 then 2.0",
      approach: "Two heaps: a max-heap for the lower half and a min-heap for the upper half, rebalanced after each insert.",
      steps: [
        "Push into the max-heap, then move its top into the min-heap.",
        "If the min-heap is larger, move its top back.",
        "Median is the max-heap top when sizes differ, otherwise the average of both tops.",
      ],
      code: `PriorityQueue<Integer> lo = new PriorityQueue<>(Comparator.reverseOrder());
PriorityQueue<Integer> hi = new PriorityQueue<>();
void addNum(int x) {
    lo.offer(x); hi.offer(lo.poll());
    if (hi.size() > lo.size()) lo.offer(hi.poll());
}
double findMedian() {
    return lo.size() > hi.size() ? lo.peek() : (lo.peek() + hi.peek()) / 2.0;
}`,
      time: "O(log n) add, O(1) median",
      space: "O(n)",
    },
  ],
  mistakes: [
    { mistake: "Using a max-heap for 'k largest'.", fix: "Use a min-heap of size k so the smallest of the kept elements is evicted." },
    { mistake: "Expecting iteration over a PriorityQueue to be sorted.", fix: "Only repeated poll() yields sorted order." },
    { mistake: "Writing (a, b) -> a - b for large ints.", fix: "Use Integer.compare to avoid overflow." },
    { mistake: "Calling contains/remove on a PriorityQueue in a loop.", fix: "Those are O(n); use a lazy-deletion set or a TreeMap instead." },
    { mistake: "Assuming a heap is fully sorted.", fix: "Only the root is guaranteed; siblings have no ordering." },
  ],
  interviewQuestions: [
    { q: "Why is building a heap from n elements O(n) and not O(n log n)?", a: "Sift-down cost is proportional to node height, and most nodes are near the leaves, so the sum converges to O(n)." },
    { q: "Heap vs balanced BST?", a: "A heap gives O(1) min and cheaper constants but no ordered traversal or search; a BST gives O(log n) search and sorted iteration." },
    { q: "How does Dijkstra use a priority queue?", a: "It repeatedly extracts the unvisited node with the smallest tentative distance, giving O((V + E) log V)." },
    { q: "How do you support decrease-key with Java's PriorityQueue?", a: "Re-insert the improved entry and skip stale entries when polled (lazy deletion), since decrease-key is not exposed." },
    { q: "How do two heaps give a running median?", a: "Split the data into a lower max-heap and an upper min-heap and keep their sizes within one; the tops bracket the median." },
  ],
  practice: {
    easy: ["Last stone weight", "Kth largest element in a stream", "Minimum cost to connect ropes", "Sort characters by frequency"],
    medium: ["Top k frequent elements", "K closest points to origin", "Task scheduler", "Meeting rooms II", "Reorganise string"],
    hard: ["Merge k sorted lists", "Find median from data stream", "Sliding window median", "IPO / maximise capital"],
  },
  complexity: [
    { operation: "peek (min or max)", time: "O(1)", space: "O(1)" },
    { operation: "offer / poll", time: "O(log n)", space: "O(1)" },
    { operation: "Build heap from array", time: "O(n)", space: "O(1)" },
    { operation: "Heap sort", time: "O(n log n)", space: "O(1)" },
    { operation: "contains / remove(Object)", time: "O(n)", space: "O(1)", note: "Avoid in hot loops" },
    { operation: "Top k of n elements", time: "O(n log k)", space: "O(k)" },
  ],
  revision: {
    concepts: ["Complete binary tree stored in an array; children at 2i+1 and 2i+2.", "Only the root is ordered.", "Insert sifts up, remove sifts down."],
    rules: ["k largest -> min-heap of size k.", "Never rely on iteration order.", "Integer.compare in comparators."],
    patterns: ["Bounded top-k heap", "K-way merge", "Greedy scheduling", "Two heaps for median"],
    syntax: ["new PriorityQueue<>(Comparator.reverseOrder())", "pq.offer / poll / peek", "new PriorityQueue<>(collection)", "comparator on int[] fields"],
    problems: ["Top k frequent", "Merge k sorted lists", "Meeting rooms II", "Median from data stream"],
  },
};
