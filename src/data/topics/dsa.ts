import type { TopicMap } from "../topicContent";

export const dsaTopics: TopicMap = {
  "Arrays & Strings": {
    summary:
      "An array stores elements in contiguous memory, so any element is reachable in O(1) by index. Strings are arrays of characters, usually immutable in Java/Python.",
    keyPoints: [
      "Access O(1), search O(n), insert/delete in the middle O(n) because elements shift.",
      "Prefix sums turn repeated range-sum queries into O(1) lookups.",
      "Building a string in a loop is O(n^2) — use StringBuilder / list + join.",
      "Classics: Kadane's max subarray, Dutch national flag, rotate array.",
    ],
    syntax: {
      lang: "python",
      code: "prefix[0] = 0\nfor i, v in enumerate(nums):\n    prefix[i + 1] = prefix[i] + v\n# sum(l..r) = prefix[r + 1] - prefix[l]",
    },
    diagram: `index :   0    1    2    3    4
        +----+----+----+----+----+
array   | 10 | 20 | 30 | 40 | 50 |
        +----+----+----+----+----+
prefix  0 -> 10 -> 30 -> 60 ->100 ->150
sum(1..3) = prefix[4] - prefix[1] = 100 - 10 = 90`,
  },

  "Hashing & Frequency Maps": {
    summary:
      "A hash table maps a key to a bucket using a hash function, giving average O(1) insert, delete and lookup. Frequency maps count occurrences of items.",
    keyPoints: [
      "Average O(1), worst case O(n) when every key collides.",
      "Collisions are resolved by chaining (linked list per bucket) or open addressing.",
      "Load factor above ~0.75 triggers a rehash into a bigger table.",
      "Classics: two sum, longest consecutive sequence, group anagrams.",
    ],
    syntax: {
      lang: "python",
      code: "freq = {}\nfor ch in text:\n    freq[ch] = freq.get(ch, 0) + 1",
    },
    diagram: `key "cat" --> hash() --> 3
        buckets
        +---+
      0 |   |
      1 | --> ("bat",2)
      2 |   |
      3 | --> ("cat",5) --> ("act",1)   <- collision chain
      4 |   |
        +---+`,
  },

  "Two Pointers / Sliding Window": {
    summary:
      "Two pointers walk a sorted array from both ends; a sliding window keeps a contiguous range and expands/shrinks it, replacing nested loops with one pass.",
    keyPoints: [
      "Turns an O(n^2) brute force into O(n).",
      "Fixed window: move both ends together. Variable window: grow right, shrink left while invalid.",
      "Requires a monotone property (sorted data, or a condition that only worsens as the window grows).",
      "Classics: longest substring without repeats, min window substring, container with most water.",
    ],
    syntax: {
      lang: "python",
      code: "left = 0\nfor right in range(len(s)):\n    add(s[right])\n    while invalid():\n        remove(s[left]); left += 1\n    best = max(best, right - left + 1)",
    },
    diagram: `s = a b c a b b
      L         R
      [a b c]              valid, len 3
        L       R
        [b c a]            valid, len 3
          L     R
          [c a b]          valid, len 3
window slides right, left only moves forward -> O(n)`,
  },

  "Recursion & Backtracking": {
    summary:
      "Recursion solves a problem by calling itself on smaller input. Backtracking explores a decision tree, undoing a choice before trying the next one.",
    keyPoints: [
      "Every recursion needs a base case and progress toward it.",
      "Recursion depth costs stack memory: O(depth) space.",
      "Backtracking = choose -> explore -> un-choose.",
      "Classics: subsets, permutations, N-Queens, sudoku, word search.",
    ],
    syntax: {
      lang: "python",
      code: "def solve(path, options):\n    if done(path): out.append(path[:]); return\n    for o in options:\n        path.append(o)      # choose\n        solve(path, next(o))# explore\n        path.pop()          # un-choose",
    },
    diagram: `subsets of [1,2]
                []
             /      \\
         [1]          []
        /   \\        /  \\
   [1,2]    [1]    [2]   []
each level = "take it or skip it" decision`,
  },

  "Sorting & Searching, Binary Search on Answer": {
    summary:
      "Sorting orders data so searching becomes logarithmic. Binary search halves the search space each step; 'binary search on answer' searches the answer range instead of the array.",
    keyPoints: [
      "Merge sort O(n log n) stable, quick sort O(n log n) average / O(n^2) worst, heap sort in-place.",
      "Binary search needs a monotone predicate: false...false true...true.",
      "Answer search pattern: can we do it with capacity X? then minimise X.",
      "Classics: search in rotated array, koko eating bananas, split array largest sum.",
    ],
    syntax: {
      lang: "python",
      code: "lo, hi = 1, max_possible\nwhile lo < hi:\n    mid = (lo + hi) // 2\n    if feasible(mid): hi = mid\n    else: lo = mid + 1\nreturn lo",
    },
    diagram: `predicate over candidate answers
  answer: 1  2  3  4  5  6  7  8
  ok?:    F  F  F  T  T  T  T  T
                  ^ first True = optimal answer
each check discards half the range -> O(log range)`,
  },

  "Linked Lists, Stacks, Queues": {
    summary:
      "A linked list stores nodes joined by pointers. A stack is LIFO (push/pop one end); a queue is FIFO (enqueue back, dequeue front).",
    keyPoints: [
      "Linked list: O(1) insert/delete with a pointer, O(n) access.",
      "Use a dummy head node to avoid special-casing the first element.",
      "Fast/slow pointers detect cycles and find the middle.",
      "Classics: reverse list, merge two lists, LRU cache, valid parentheses, monotonic stack.",
    ],
    syntax: {
      lang: "python",
      code: "prev, cur = None, head\nwhile cur:\n    cur.next, prev, cur = prev, cur, cur.next\nreturn prev  # reversed head",
    },
    diagram: `linked list
 head -> [1] -> [2] -> [3] -> null

 stack (LIFO)        queue (FIFO)
   push v |          in -> [a][b][c] -> out
   pop  ^ |          dequeue takes a
  +-------+          enqueue appends d`,
  },

  "Trees & BST Traversals": {
    summary:
      "A binary tree has at most two children per node. In a BST every left descendant is smaller and every right descendant is larger than the node.",
    keyPoints: [
      "Inorder traversal of a BST yields sorted order.",
      "Search/insert/delete is O(h): O(log n) balanced, O(n) skewed.",
      "DFS orders: preorder (root,L,R), inorder (L,root,R), postorder (L,R,root). BFS = level order with a queue.",
      "Classics: lowest common ancestor, validate BST, diameter, level-order zigzag.",
    ],
    syntax: {
      lang: "python",
      code: "def inorder(n):\n    if not n: return\n    inorder(n.left); visit(n); inorder(n.right)",
    },
    diagram: `          8
        /   \\
       3     10
      / \\      \\
     1   6      14
inorder  : 1 3 6 8 10 14   (sorted)
preorder : 8 3 1 6 10 14
level    : 8 | 3 10 | 1 6 14`,
  },

  "Heaps & Priority Queues": {
    summary:
      "A heap is a complete binary tree kept in an array where every parent beats its children (min-heap: parent smaller). It gives the best element in O(1).",
    keyPoints: [
      "push and pop are O(log n); peek is O(1); heapify an array in O(n).",
      "Array indices: children of i are 2i+1 and 2i+2, parent is (i-1)//2.",
      "Top-K pattern: keep a size-K heap of the opposite type.",
      "Classics: k largest elements, merge k sorted lists, median from a data stream (two heaps).",
    ],
    syntax: {
      lang: "python",
      code: "import heapq\nh = []\nfor x in nums:\n    heapq.heappush(h, x)\n    if len(h) > k: heapq.heappop(h)  # k largest remain",
    },
    diagram: `min-heap
          2
        /   \\
       5     4
      / \\   /
     9   6 7
array: [2, 5, 4, 9, 6, 7]
index:  0  1  2  3  4  5   (children of i: 2i+1, 2i+2)`,
  },

  "Graphs: BFS, DFS, Topological Sort, Dijkstra": {
    summary:
      "A graph is a set of vertices joined by edges, stored as an adjacency list. BFS explores level by level, DFS goes deep, Dijkstra finds shortest paths with non-negative weights.",
    keyPoints: [
      "BFS with a queue gives shortest path in an unweighted graph; DFS with recursion/stack detects cycles.",
      "Topological sort orders a DAG (Kahn's in-degree method or DFS post-order).",
      "Dijkstra uses a min-heap: O((V+E) log V); use Bellman-Ford for negative weights.",
      "Classics: number of islands, course schedule, clone graph, network delay time.",
    ],
    syntax: {
      lang: "python",
      code: "q = deque([src]); dist = {src: 0}\nwhile q:\n    u = q.popleft()\n    for v in adj[u]:\n        if v not in dist:\n            dist[v] = dist[u] + 1; q.append(v)",
    },
    diagram: `   (A)--4--(B)
    |  \\     |
    2    5   1
    |      \\ |
   (C)--8--(D)
BFS from A : A | B C | D          (levels)
DFS from A : A B D C              (depth first)
Dijkstra   : A=0 C=2 B=4 D=5      (heap by distance)`,
  },

  "Dynamic Programming: 1D, 2D, knapsack, LIS, DP on trees": {
    summary:
      "DP solves problems with overlapping subproblems by storing each subresult once — top-down with memoisation or bottom-up with a table.",
    keyPoints: [
      "Define the state, the transition, the base case, and the answer cell.",
      "0/1 knapsack: dp[i][w] = max(skip, take + dp[i-1][w-wt]).",
      "LIS in O(n log n) with patience sorting / binary search.",
      "Space optimisation: keep only the previous row when the transition uses i-1.",
    ],
    syntax: {
      lang: "python",
      code: "dp = [0] * (W + 1)\nfor wt, val in items:            # 0/1 knapsack\n    for w in range(W, wt - 1, -1):\n        dp[w] = max(dp[w], dp[w - wt] + val)",
    },
    diagram: `knapsack table (W = 5)
        w=0  1  2  3  4  5
 item1   0   0  6  6  6  6
 item2   0   0  6 10 10 16
 item3   0   0  6 10 12 16   <- answer dp[n][W]
each cell = max(skip row above, take value + dp[w - wt])`,
  },

  "Greedy & Interval problems": {
    summary:
      "A greedy algorithm takes the locally best choice at each step and never revisits it. It is correct only when the problem has the greedy-choice property.",
    keyPoints: [
      "Interval scheduling: sort by end time to fit the most non-overlapping intervals.",
      "Merging intervals: sort by start, extend while start <= current end.",
      "Prove greedy with an exchange argument, otherwise fall back to DP.",
      "Classics: activity selection, non-overlapping intervals, meeting rooms II, gas station.",
    ],
    syntax: {
      lang: "python",
      code: "intervals.sort(key=lambda x: x[0])\nfor s, e in intervals:\n    if out and s <= out[-1][1]: out[-1][1] = max(out[-1][1], e)\n    else: out.append([s, e])",
    },
    diagram: `input   |----A----|
              |---B---|
                          |--C--|
merged  |------AB-------| |--C--|
sort by start, extend while overlap -> O(n log n)`,
  },

  "Time & Space Complexity analysis": {
    summary:
      "Big-O describes how run time or memory grows with input size, ignoring constants. It is the first thing an interviewer asks after your code compiles.",
    keyPoints: [
      "Order: O(1) < O(log n) < O(n) < O(n log n) < O(n^2) < O(2^n) < O(n!).",
      "Nested loops multiply; sequential loops add.",
      "Recursion cost = number of calls x work per call; depth counts as space.",
      "Amortised analysis explains why a dynamic array push is O(1) on average.",
    ],
    syntax: {
      lang: "text",
      code: "for i in n:        -> O(n)\n  for j in n:      -> O(n^2)\nbinary search      -> O(log n)\nsort then scan     -> O(n log n)",
    },
    diagram: `ops
 ^                         2^n   n^2
 |                        /     /
 |                       /    /
 |                      /   /       n log n
 |                     /  /   ____/  n
 |                    / / ___/______ log n
 +-------------------------------------> n`,
  },
};
