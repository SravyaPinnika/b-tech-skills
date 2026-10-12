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
    deepDive: [
      "Arrays are the foundation of almost every other data structure because contiguous memory gives cache-friendly access: consecutive elements sit next to each other in RAM, so scanning an array is much faster in practice than chasing pointers in a linked list even though both are 'O(n)'. This is why interviewers care whether your solution is array-based or list-based, not just its Big-O.",
      "Because arrays have a fixed underlying capacity in low-level languages, dynamic arrays (Python list, Java ArrayList, C++ vector) grow by allocating a new block roughly double the size and copying over old elements when full. A single resize costs O(n), but since it happens rarely (geometrically), the amortised cost of append is O(1) — a favourite 'explain amortised analysis' interview trap.",
      "Strings deserve separate treatment because immutability changes the cost model: in Java and Python, s += ch creates a brand-new string object every time, so concatenating n characters in a loop costs O(1+2+...+n) = O(n^2). Always accumulate in a mutable buffer (list, StringBuilder, StringBuffer) and join/build once at the end.",
      "Two-dimensional array problems (matrix rotation, spiral traversal, transposition) are really array-of-arrays problems: master row/column index arithmetic (transpose then reverse rows = 90-degree rotation) because this pattern reappears in image processing and grid-based graph problems like number of islands.",
    ],
    example: {
      title: "Building a prefix-sum array and answering a range query",
      steps: [
        "nums = [10, 20, 30, 40, 50], build prefix with prefix[0] = 0.",
        "prefix[1] = prefix[0] + nums[0] = 0 + 10 = 10.",
        "prefix[2] = prefix[1] + nums[1] = 10 + 20 = 30.",
        "prefix[3] = prefix[2] + nums[2] = 30 + 30 = 60.",
        "prefix[4] = prefix[3] + nums[3] = 60 + 40 = 100.",
        "prefix[5] = prefix[4] + nums[4] = 100 + 50 = 150.",
        "Query sum(1..3) (indices 1,2,3 i.e. 20+30+40) = prefix[4] - prefix[1] = 100 - 10 = 90.",
      ],
      result: "sum(1..3) = 90, computed in O(1) after an O(n) preprocessing pass.",
    },
    mistakes: [
      {
        mistake: "Concatenating strings inside a loop with +=, producing hidden O(n^2) behaviour.",
        fix: "Append pieces to a list and call ''.join(parts) once, or use StringBuilder/StringBuffer in Java.",
      },
      {
        mistake: "Off-by-one errors when translating an inclusive range [l, r] into prefix-sum indices.",
        fix: "Always define prefix with an extra leading 0 so sum(l, r) = prefix[r+1] - prefix[l]; test on a 2-element array by hand.",
      },
      {
        mistake: "Mutating an array while iterating over it with a for-each loop, skipping or duplicating elements.",
        fix: "Iterate over indices, iterate a copy, or use a two-pointer/write-index technique for in-place removal.",
      },
      {
        mistake: "Assuming array 'delete' is O(1) like a hash map.",
        fix: "Remember that removing from the middle requires shifting all following elements, costing O(n); use a linked list or swap-with-last if order does not matter.",
      },
    ],
    interviewQA: [
      {
        q: "Why is appending to a dynamic array considered O(1) if resizing copies every element?",
        a: "Resizing happens infrequently because capacity doubles each time it fills up. Summing the copy costs over n appends gives O(n) total work, which averages to O(1) per append — this is amortised analysis.",
      },
      {
        q: "How would you find the maximum sum of any contiguous subarray in O(n)?",
        a: "Use Kadane's algorithm: keep a running 'current sum ending here', reset it to 0 whenever it goes negative, and track the best sum seen so far in a single pass.",
      },
      {
        q: "How do you reverse an array in place without extra space?",
        a: "Use two pointers starting at both ends, swap the elements they point to, then move the left pointer right and the right pointer left until they meet.",
      },
      {
        q: "Why are Java Strings immutable, and what is the performance implication?",
        a: "Immutability enables safe sharing (string pooling, thread safety, use as hash keys). The cost is that every modification allocates a new object, so repeated concatenation should use StringBuilder to avoid O(n^2) behaviour.",
      },
    ],
    practice: [
      "Implement Kadane's algorithm and verify it against a brute-force O(n^2) solution on random arrays.",
      "Build a prefix-sum class supporting O(1) range-sum queries after O(n) preprocessing.",
      "Solve 'rotate array by k positions' in place using the reverse-three-times trick.",
      "Implement the Dutch national flag (3-way partition) algorithm to sort an array of 0s, 1s, 2s in one pass.",
      "Write a function that checks if two strings are anagrams without using a library sort.",
    ],
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
    deepDive: [
      "A hash table's performance hinges entirely on the quality of its hash function and how it handles collisions. A good hash function spreads keys uniformly across buckets; a poor one (or an adversarial input designed to collide) can degrade every operation to O(n), which is why languages like Python randomise string hashing per process to prevent hash-flooding attacks.",
      "Chaining stores a small linked list (or dynamic array) per bucket and simply appends on collision; open addressing instead probes for the next free slot within the table itself (linear probing, quadratic probing, double hashing). Open addressing has better cache locality but suffers from clustering and requires careful handling of deletions (tombstones), which is a frequent point of confusion in interviews.",
      "Load factor = number of entries / number of buckets. Most implementations resize (typically doubling capacity) once load factor crosses a threshold like 0.75, then rehash every existing key into the new table — an O(n) one-time cost that, like dynamic arrays, amortises to O(1) per insertion.",
      "Frequency maps generalise naturally to sliding-window and 'anagram group' problems: two strings are anagrams iff their character frequency maps are identical, and a fixed-size frequency array (size 26 for lowercase letters) is often faster than a hash map because it avoids hashing overhead entirely.",
    ],
    example: {
      title: "Two Sum using a hash map in one pass",
      steps: [
        "nums = [2, 7, 11, 15], target = 9. Start with an empty map seen = {}.",
        "i=0, num=2: complement = 9-2 = 7, not in seen, so store seen[2] = 0.",
        "i=1, num=7: complement = 9-7 = 2, and 2 IS in seen (index 0).",
        "Return the pair of indices [seen[2], 1] = [0, 1] immediately, no need to scan further.",
      ],
      result: "Indices [0, 1] found in a single O(n) pass instead of O(n^2) nested loops.",
    },
    mistakes: [
      {
        mistake: "Using a mutable object (like a list) as a dictionary key.",
        fix: "Convert to an immutable, hashable type first — use a tuple instead of a list, or frozenset instead of a set.",
      },
      {
        mistake: "Assuming hash map operations are always O(1), even under heavy collisions or a poor hash function.",
        fix: "State the average vs worst case explicitly in interviews, and know that Java's HashMap converts a long collision chain into a balanced tree (treeify) to bound it at O(log n).",
      },
      {
        mistake: "Forgetting to handle a missing key and causing a KeyError/NullPointerException.",
        fix: "Use dict.get(key, default) in Python, getOrDefault in Java, or check containsKey/'in' before accessing.",
      },
      {
        mistake: "Iterating over a dictionary and modifying it at the same time.",
        fix: "Iterate over a copy of the keys (list(d.keys())) or build a new dictionary instead of mutating during iteration.",
      },
    ],
    interviewQA: [
      {
        q: "What is the average and worst-case time complexity of a hash map lookup, and why do they differ?",
        a: "Average is O(1) because a good hash function spreads keys evenly across buckets. Worst case is O(n) if all keys collide into one bucket, turning it into a linked-list scan; Java mitigates this by treeifying long chains into a balanced tree for O(log n) worst case.",
      },
      {
        q: "How would you find the longest consecutive sequence in an unsorted array in O(n)?",
        a: "Put all numbers in a hash set. For each number that is the start of a sequence (i.e., num-1 is not in the set), count forward while num+1, num+2... are in the set, tracking the maximum length found.",
      },
      {
        q: "How do you resolve hash collisions, and what are the trade-offs?",
        a: "Chaining links colliding entries in a list per bucket, which is simple and handles high load factors gracefully but has pointer-chasing overhead. Open addressing probes for another slot in the same array, giving better cache locality but requiring care with deletions and clustering.",
      },
      {
        q: "Why do we resize a hash table, and what does that cost?",
        a: "As more elements are inserted, load factor rises and collisions become more likely, degrading performance. Resizing (usually doubling capacity) once load factor crosses a threshold and rehashing all keys costs O(n) once, but happens rarely enough that insertion remains amortised O(1).",
      },
    ],
    practice: [
      "Implement Two Sum and Group Anagrams using hash maps.",
      "Build your own simple hash table with chaining from scratch, including a resize/rehash method.",
      "Solve Longest Consecutive Sequence in O(n) using a hash set.",
      "Implement an LRU-style frequency counter that finds the top-k most frequent elements.",
      "Compare runtime of a hash-map-based solution vs a sorting-based solution on the same problem.",
    ],
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
    deepDive: [
      "The two-pointer and sliding-window families work because of a monotonicity guarantee: as the right pointer advances, the window can only get 'worse' (more duplicate characters, larger sum, etc.), which means once it becomes invalid it will stay invalid until you shrink from the left. This guarantee is exactly what lets each pointer move only forward across the whole algorithm, giving a total of O(n) pointer moves instead of O(n^2) re-scans.",
      "There are really two distinct patterns worth separating in your mental model: the opposite-direction two-pointer pattern (used on sorted arrays for problems like two-sum-sorted, container with most water, or trapping rain water) where pointers start at both ends and move inward; and the same-direction sliding-window pattern (used for substring/subarray problems) where both pointers start at the left and only the right pointer initiates expansion.",
      "Fixed-size windows (e.g., 'maximum sum of any k consecutive elements') are simpler: you slide the window by adding the new right element and removing the leftmost element every single step, keeping the window size constant, and update the running aggregate in O(1) per step rather than recomputing the sum from scratch.",
      "A common enhancement is maintaining auxiliary state alongside the window, such as a frequency map of characters currently inside the window, so that checking 'is the window valid' is an O(1) operation rather than an O(window size) rescan — this is essential to keep the minimum-window-substring family of problems at true O(n) rather than O(n * window size).",
    ],
    example: {
      title: "Longest substring without repeating characters, on s = 'abcabb'",
      steps: [
        "left=0, seen={}, best=0.",
        "right=0 'a': not in seen, seen={a:0}, window='a', best=1.",
        "right=1 'b': not in seen, seen={a:0,b:1}, window='ab', best=2.",
        "right=2 'c': not in seen, window='abc', best=3.",
        "right=3 'a': 'a' is in window, so move left past it: left becomes 1, remove old 'a', window='bca', best stays 3.",
        "right=4 'b': 'b' is in window, move left to 2, window='cab', best stays 3.",
        "right=5 'b': 'b' is in window again, move left to 5, window='b', best stays 3.",
      ],
      result: "Longest substring without repeats has length 3 (e.g., 'abc' or 'cab').",
    },
    mistakes: [
      {
        mistake: "Moving the left pointer backward, breaking the O(n) guarantee.",
        fix: "Always advance left monotonically forward; if you find yourself needing to move it back, the problem needs a different technique (or a hash map storing last-seen index instead).",
      },
      {
        mistake: "Recomputing the window's validity (e.g., sum or distinct count) from scratch on every step.",
        fix: "Maintain the running aggregate incrementally: add the incoming element, remove the outgoing one, and update in O(1).",
      },
      {
        mistake: "Applying two pointers/sliding window to unsorted data expecting sorted-array behavior (e.g., opposite-direction two-sum trick).",
        fix: "Sort first if order doesn't matter for the answer, or confirm the problem's structure genuinely gives a monotone window property before using this pattern.",
      },
      {
        mistake: "Off-by-one errors in window length calculation (right - left vs right - left + 1).",
        fix: "Be explicit about inclusive/exclusive bounds; test the formula on a window of exactly one element first.",
      },
    ],
    interviewQA: [
      {
        q: "When is the sliding window technique applicable?",
        a: "When the problem asks about a contiguous subarray/substring and the validity condition is monotone: expanding the window can only make it more likely to violate the condition, so once invalid, shrinking from the left is the correct fix rather than restarting.",
      },
      {
        q: "What is the time complexity of the sliding window technique and why?",
        a: "O(n) because each pointer (left and right) only ever moves forward across the entire array, giving at most 2n total pointer movements, even though it looks like a nested loop.",
      },
      {
        q: "How does the two-pointer technique solve 'container with most water' in O(n)?",
        a: "Start pointers at both ends; the area is limited by the shorter wall, so moving the taller pointer inward can never increase the area, while moving the shorter one might. Always move the pointer at the shorter wall inward, tracking the max area seen.",
      },
      {
        q: "How do you find the minimum window substring containing all characters of another string?",
        a: "Use a variable sliding window with a frequency map of the target string; expand right until the window contains all required characters, then shrink left as much as possible while still valid, updating the best answer at each valid shrink.",
      },
    ],
    practice: [
      "Solve 'longest substring without repeating characters' and 'minimum window substring'.",
      "Solve 'container with most water' using the opposite-direction two-pointer pattern.",
      "Implement a fixed-size sliding window to find the maximum sum of any k consecutive elements.",
      "Solve 'three sum' by sorting the array and using two pointers inside a loop.",
      "Solve 'longest repeating character replacement' to practice a window with a tolerance count.",
    ],
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
    deepDive: [
      "Every recursive function has an implicit call stack, and understanding that stack is the key to reasoning about both correctness and space complexity. Each recursive call pushes a new stack frame holding its local variables and return address; a recursion depth of d therefore costs O(d) space in addition to whatever time complexity the algorithm has, which is why deeply recursive solutions can hit stack-overflow limits on inputs that array-based/iterative solutions handle fine.",
      "Backtracking is best understood as a systematic depth-first search over an implicit decision tree, where each node represents a partial solution and each edge represents one choice. The 'choose, explore, un-choose' pattern is essential: mutating shared state (like a running path list) is far more memory-efficient than copying it at every level, but it only works correctly if every choice is undone exactly once after exploring it, restoring the state to what it was before the choice was made.",
      "Pruning is what makes backtracking practical rather than a brute-force exponential blowup: as soon as a partial solution can be proven invalid (e.g., a queen attacks another in N-Queens, or a sudoku cell violates a row/column/box constraint), you should return immediately instead of continuing to build on top of it. Good pruning is often the difference between a solution that times out and one that runs comfortably within limits.",
      "Many recursive problems (Fibonacci, climbing stairs, edit distance) exhibit overlapping subproblems, meaning plain recursion recomputes the same state exponentially many times; adding memoisation (a cache keyed by the recursive state) converts this into a DP algorithm with polynomial complexity, which is exactly the bridge between the 'recursion' and 'dynamic programming' study topics.",
    ],
    example: {
      title: "Generating all subsets of [1, 2] via choose/explore/un-choose",
      steps: [
        "Start: path=[], index=0, options=[1,2]. Call solve(path, 0).",
        "At index 0, first branch: choose 1 -> path=[1]. Recurse to index 1.",
        "At index 1, choose 2 -> path=[1,2]. Recurse to index 2 (end): record [1,2].",
        "Un-choose 2 -> path=[1]. No more options at index 1: record [1] as a subset too (implicit skip branch).",
        "Un-choose 1 -> path=[]. Back at index 0, second branch: skip 1, move to index 1 with path=[].",
        "At index 1, choose 2 -> path=[2], recurse to index 2: record [2]. Un-choose -> path=[]; skip 2 too: record [].",
      ],
      result: "All 4 subsets generated: [1,2], [1], [2], [] — matching 2^2 = 4 possibilities.",
    },
    mistakes: [
      {
        mistake: "Forgetting the base case, causing infinite recursion and a stack overflow.",
        fix: "Always write the base case first and verify the recursive call moves strictly closer to it (smaller index, smaller n, shrinking substring, etc.).",
      },
      {
        mistake: "Appending the same mutable list object to results instead of a copy, so all stored 'answers' end up pointing to the same final (usually empty) list.",
        fix: "Append path[:] (a copy) or list(path) in Python, or new ArrayList<>(path) in Java, not the reference itself.",
      },
      {
        mistake: "Forgetting to undo a choice (pop from path, unmark a visited cell) before trying the next branch.",
        fix: "Pair every 'choose' with exactly one corresponding 'un-choose' right after the recursive call returns, structured symmetrically in code.",
      },
      {
        mistake: "Not pruning invalid states early, leading to exponential blowup that times out.",
        fix: "Check constraints (attacks, duplicates, sum exceeded) before recursing further, and return immediately on violation instead of exploring deeper.",
      },
    ],
    interviewQA: [
      {
        q: "What is the difference between recursion and backtracking?",
        a: "Recursion is any function that calls itself to break a problem into smaller subproblems. Backtracking is a specific recursive strategy for exploring all candidate solutions in a decision tree, where invalid partial solutions are abandoned (pruned) and choices are explicitly undone before trying alternatives.",
      },
      {
        q: "What is the time and space complexity of generating all permutations of n elements?",
        a: "Time is O(n * n!) since there are n! permutations and building/copying each one takes O(n). Space is O(n) for the recursion stack/current path, plus O(n * n!) if you store all results.",
      },
      {
        q: "How do you avoid stack overflow in a deep recursive solution?",
        a: "Convert the recursion to an iterative version using an explicit stack, increase the language's recursion limit if appropriate, or restructure the recursion to be tail-recursive if the language optimizes for it (though most mainstream languages like Python and Java do not).",
      },
      {
        q: "How does memoisation change a recursive solution's complexity?",
        a: "It caches the result of each unique recursive call so it is computed once; this turns exponential-time solutions with overlapping subproblems (like naive Fibonacci) into polynomial-time solutions, at the cost of extra memory for the cache.",
      },
    ],
    practice: [
      "Implement subsets, permutations, and combinations from scratch using backtracking.",
      "Solve N-Queens and count all valid placements for n=8.",
      "Solve Sudoku solver using backtracking with constraint pruning.",
      "Solve Word Search on a grid using DFS backtracking with a visited marker.",
      "Convert a recursive Fibonacci solution into a memoised version and measure the speedup.",
    ],
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
    deepDive: [
      "Comparison-based sorting has a proven lower bound of O(n log n): you cannot sort faster than that using only comparisons, because there are n! possible orderings and each comparison gives at most one bit of information (log2(n!) is Theta(n log n)). Non-comparison sorts like counting sort or radix sort can beat this bound only by exploiting extra structure in the data (small integer range, fixed digit count), trading generality for speed.",
      "Merge sort's stability (equal elements keep their relative order) and guaranteed O(n log n) make it the default choice when worst-case performance matters or when sorting complex objects by multiple keys; quicksort is usually faster in practice due to better cache locality and lower constant factors, but its O(n^2) worst case (already-sorted or adversarial input with a naive pivot) means production libraries use randomised or median-of-three pivot selection, or fall back to heapsort (introsort) to bound the worst case.",
      "Binary search's real power in interviews is not searching a literal array but searching an abstract 'answer space' where a feasibility predicate is monotone: if capacity X works, every larger capacity also works. This turns optimisation problems ('minimise the maximum load', 'find the minimum days to ship all packages') into a search over possible answers with a feasibility check inside, rather than trying every value one by one.",
      "A precise binary search implementation avoids two classic bugs: integer overflow when computing mid as (lo+hi)/2 for very large bounds (use lo + (hi-lo)/2 instead), and infinite loops caused by an incorrect update rule — always ensure the search range strictly shrinks on every iteration by matching your mid rounding (floor vs ceiling) to whether you update lo=mid or hi=mid.",
    ],
    example: {
      title: "Binary search on answer: Koko eating bananas at minimum speed",
      steps: [
        "Piles = [3, 6, 7, 11], hours limit = 8. Search space for speed k is [1, max(piles)] = [1, 11].",
        "lo=1, hi=11, mid=6: hours needed = ceil(3/6)+ceil(6/6)+ceil(7/6)+ceil(11/6) = 1+1+2+2=6 <= 8, feasible, so hi=6.",
        "lo=1, hi=6, mid=3: hours = ceil(3/3)+ceil(6/3)+ceil(7/3)+ceil(11/3) = 1+2+3+4=10 > 8, not feasible, so lo=4.",
        "lo=4, hi=6, mid=5: hours = 1+2+2+3=8 <= 8, feasible, so hi=5.",
        "lo=4, hi=5, mid=4: hours = 1+2+2+3=8 <= 8, feasible, so hi=4.",
        "lo=4, hi=4: loop ends.",
      ],
      result: "Minimum eating speed k = 4, found in O(log(max pile)) feasibility checks.",
    },
    mistakes: [
      {
        mistake: "Computing mid as (lo + hi) / 2, risking integer overflow in languages with fixed-width integers.",
        fix: "Use mid = lo + (hi - lo) / 2, which is equivalent but avoids overflow (mostly relevant in Java/C++, but good habit everywhere).",
      },
      {
        mistake: "Mismatched update rule causing an infinite loop, e.g., using lo = mid instead of lo = mid + 1 when mid was already ruled out.",
        fix: "Ensure each branch strictly shrinks the range: if mid is excluded by the check, move the corresponding bound past mid, never leave it unchanged.",
      },
      {
        mistake: "Using binary search on data that isn't actually sorted or doesn't have a monotone predicate.",
        fix: "Explicitly verify (or sort first) that the property you are searching for is monotone across the range before applying binary search.",
      },
      {
        mistake: "Choosing a quicksort pivot naively (always first or last element), causing O(n^2) on sorted or reverse-sorted input.",
        fix: "Use median-of-three or a randomised pivot selection to avoid worst-case behaviour on adversarial/sorted inputs.",
      },
    ],
    interviewQA: [
      {
        q: "Compare merge sort and quick sort.",
        a: "Merge sort guarantees O(n log n) in all cases and is stable, but requires O(n) extra space for merging. Quick sort is typically faster in practice due to in-place partitioning and cache locality, averages O(n log n), but degrades to O(n^2) on adversarial input unless pivot selection is randomised.",
      },
      {
        q: "What is 'binary search on the answer' and when do you use it?",
        a: "It's applying binary search over a range of candidate answers (not array indices) when there's a monotone feasibility predicate — e.g., 'can we finish in D days with capacity X?' You binary search the smallest/largest X for which the predicate is true.",
      },
      {
        q: "How do you search in a rotated sorted array in O(log n)?",
        a: "At each step, determine which half (left of mid or right of mid) is properly sorted by comparing arr[lo] with arr[mid]. Check if the target lies within that sorted half's range; if so recurse there, otherwise recurse into the other half.",
      },
      {
        q: "Why is comparison-based sorting's lower bound O(n log n)?",
        a: "There are n! possible orderings of n elements, and each comparison yields at most one bit of information, so distinguishing between n! orderings requires at least log2(n!) = Theta(n log n) comparisons in the worst case.",
      },
    ],
    practice: [
      "Implement merge sort and quick sort from scratch and compare their runtimes on sorted vs random input.",
      "Solve 'search in rotated sorted array' and 'find minimum in rotated sorted array'.",
      "Solve 'Koko eating bananas' and 'split array largest sum' using binary search on answer.",
      "Implement binary search for the first and last occurrence of a target in a sorted array with duplicates.",
      "Implement counting sort for an array of small-range integers and compare it to comparison sorts.",
    ],
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
    deepDive: [
      "Linked lists trade array's O(1) random access for O(1) insertion/deletion at any point you already have a reference to, because no shifting of subsequent elements is required — you just rewire a couple of pointers. This makes them ideal as the backing structure for LRU caches (combined with a hash map for O(1) lookup of the node to move) and for implementing other structures like stacks, queues, and adjacency lists in graphs.",
      "A dummy (sentinel) head node is a small trick that eliminates an entire class of edge-case bugs: without it, inserting/deleting the actual head requires special-case code because there's no 'previous' node to update; with a dummy node preceding the real head, every operation — including modifying the head — follows the exact same code path as modifying any interior node.",
      "The fast/slow (tortoise and hare) pointer technique is the standard tool for two classes of linked-list problems: cycle detection (Floyd's algorithm — if a cycle exists, the fast pointer moving 2 steps and slow pointer moving 1 step will eventually meet inside the cycle) and finding the middle node in one pass (when fast reaches the end, slow is at the middle), both achieving O(n) time and O(1) space without needing to know the length in advance.",
      "Stacks and queues are usually implemented on top of either a dynamic array (for stacks, since push/pop happen at one end which is O(1) amortised) or a doubly linked list / circular buffer (for queues, since removing from the front of a plain array is O(n) but removing from the front of a linked list or via two index pointers in a circular buffer is O(1)). Monotonic stacks — where you maintain elements in increasing or decreasing order, popping violators before pushing — are the standard technique for 'next greater element' style problems, achieving O(n) total work because each element is pushed and popped at most once.",
    ],
    example: {
      title: "Reversing a singly linked list 1 -> 2 -> 3 -> null iteratively",
      steps: [
        "prev = null, cur = node(1). List so far: 1->2->3->null.",
        "Save cur.next (node 2). Set cur.next = prev (1.next = null). Move prev = cur (prev=1), cur = saved next (cur=2).",
        "Save cur.next (node 3). Set cur.next = prev (2.next = 1). Move prev = 2, cur = 3.",
        "Save cur.next (null). Set cur.next = prev (3.next = 2). Move prev = 3, cur = null.",
        "Loop ends because cur is null. Return prev, which is node 3.",
      ],
      result: "Reversed list: 3 -> 2 -> 1 -> null, done in O(n) time and O(1) extra space.",
    },
    mistakes: [
      {
        mistake: "Losing the reference to the rest of the list when reversing pointers, causing the list to be truncated.",
        fix: "Always save cur.next into a temporary variable before overwriting cur.next, in that exact order.",
      },
      {
        mistake: "Not handling the empty list or single-node list as edge cases.",
        fix: "Explicitly test head == null and head.next == null (or rely on a dummy node) before writing the general-case logic.",
      },
      {
        mistake: "Implementing a queue with a plain array and dequeuing from index 0, making it accidentally O(n) per operation.",
        fix: "Use a deque/doubly linked list, or two-pointer circular buffer, or two-stack technique so dequeue is O(1) amortised.",
      },
      {
        mistake: "Forgetting to update the tail pointer when appending to a linked list that tracks both head and tail.",
        fix: "Whenever you insert at the end, update tail = new_node (and handle the case where the list was empty, so head must also be set).",
      },
    ],
    interviewQA: [
      {
        q: "How do you detect a cycle in a linked list without extra space?",
        a: "Use Floyd's cycle detection: a slow pointer moves one step and a fast pointer moves two steps per iteration. If there's a cycle, they will eventually point to the same node; if the fast pointer reaches null, there's no cycle. This runs in O(n) time and O(1) space.",
      },
      {
        q: "How would you implement a queue using two stacks?",
        a: "Keep an 'in' stack for enqueue (push directly) and an 'out' stack for dequeue. When dequeuing, if 'out' is empty, pop everything from 'in' and push it onto 'out' (reversing order), then pop from 'out'. Each element moves between stacks at most once, giving amortised O(1) per operation.",
      },
      {
        q: "What is a monotonic stack and what problems does it solve?",
        a: "A monotonic stack keeps its elements in strictly increasing or decreasing order by popping elements that violate the order before pushing a new one. It solves 'next greater/smaller element' style problems in O(n) because each element is pushed and popped at most once.",
      },
      {
        q: "How does an LRU cache achieve O(1) get and put?",
        a: "Combine a hash map (key -> node) for O(1) lookup with a doubly linked list that maintains usage order. On access, move the node to the front (O(1) with pointers). On overflow, evict the node at the tail (O(1)).",
      },
    ],
    practice: [
      "Implement singly and doubly linked lists from scratch with insert/delete/search.",
      "Solve 'reverse linked list', 'merge two sorted lists', and 'detect cycle in linked list'.",
      "Implement a stack-based solution for 'valid parentheses' and 'evaluate reverse polish notation'.",
      "Implement an LRU cache using a hash map plus a doubly linked list.",
      "Solve 'next greater element' using a monotonic stack.",
    ],
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
    deepDive: [
      "Every tree operation's complexity is expressed in terms of height h, not size n, because operations like search follow a single root-to-leaf path. A balanced tree has h = O(log n), but an unbalanced (degenerate) tree built by inserting already-sorted data collapses into a linked list with h = O(n) — this is precisely the motivation for self-balancing trees like AVL and Red-Black trees, which guarantee O(log n) height via rotations.",
      "The three DFS orders each serve a distinct purpose: preorder is used to serialize a tree structure (since root comes first, it can be reconstructed by recursively splitting), inorder is used specifically on BSTs to retrieve sorted output, and postorder is used whenever children must be fully processed before the parent — deleting a tree node by node, evaluating an expression tree, or computing subtree properties like height/diameter bottom-up.",
      "BFS (level-order traversal) uses an explicit queue rather than recursion, processing one full level before moving to the next; this is essential for problems needing level-by-level information (zigzag traversal, right-side view, minimum depth) and is also the same core algorithm as BFS on graphs, since a tree is just a connected acyclic graph.",
      "Validating whether a tree is a valid BST is a classic trap: comparing only a node to its immediate children is insufficient, because a node deep in the left subtree must be less than every ancestor on the path to the root, not just its direct parent. The correct approach passes down a valid (min, max) range to each recursive call, or equivalently checks that an inorder traversal produces strictly increasing values.",
    ],
    example: {
      title: "Inorder traversal of the BST rooted at 8 (children: 3 and 10; 3's children 1,6; 10's child 14)",
      steps: [
        "Call inorder(8): first recurse left into inorder(3).",
        "inorder(3): first recurse left into inorder(1). inorder(1) has no children, visit 1, output so far: [1].",
        "Back in inorder(3): visit 3, output: [1, 3]. Then recurse right into inorder(6), visit 6, output: [1, 3, 6].",
        "Back in inorder(8): visit 8, output: [1, 3, 6, 8]. Then recurse right into inorder(10).",
        "inorder(10): no left child, visit 10, output: [1, 3, 6, 8, 10]. Recurse right into inorder(14), visit 14.",
        "Final output: [1, 3, 6, 8, 10, 14].",
      ],
      result: "Inorder traversal produces the sorted sequence 1, 3, 6, 8, 10, 14.",
    },
    mistakes: [
      {
        mistake: "Validating a BST by only comparing a node to its immediate children, not the full ancestor range.",
        fix: "Pass a (min, max) bound down the recursion so every descendant is checked against all relevant ancestors, not just its direct parent.",
      },
      {
        mistake: "Forgetting the base case (null node) in recursive tree functions, causing a NullPointerException/AttributeError.",
        fix: "Always check 'if node is None: return <appropriate base value>' as the very first line of any recursive tree function.",
      },
      {
        mistake: "Confusing BFS (level order, needs a queue) with DFS (any of pre/in/postorder, needs recursion or an explicit stack).",
        fix: "Remember BFS explores breadth-first with a FIFO queue; DFS explores depth-first with a LIFO stack or the call stack via recursion.",
      },
      {
        mistake: "Computing tree diameter by only considering paths through the root.",
        fix: "The diameter is the maximum of (left height + right height) evaluated at every node, not just the root; compute it bottom-up while also returning each node's height.",
      },
    ],
    interviewQA: [
      {
        q: "How do you validate whether a binary tree is a valid BST?",
        a: "Recursively pass down a valid (min, max) range for each node; the root has range (-infinity, infinity), and each left/right child narrows that range using the parent's value. Alternatively, do an inorder traversal and check it's strictly increasing.",
      },
      {
        q: "How do you find the lowest common ancestor of two nodes in a binary tree?",
        a: "Recursively search left and right subtrees for the two target nodes; if both are found in different subtrees of a node, that node is the LCA. If a node itself is one of the targets, return it immediately (it could be an ancestor of the other).",
      },
      {
        q: "What is the time complexity of search, insert, and delete in a BST, and when does it degrade?",
        a: "All three are O(h) where h is the tree height. For a balanced tree, h = O(log n); but if elements are inserted in sorted order without rebalancing, the tree degenerates into a linked list with h = O(n).",
      },
      {
        q: "How would you serialize and deserialize a binary tree?",
        a: "Use preorder traversal, recording null markers for missing children (e.g., comma-separated string with '#' for null). To deserialize, recursively consume tokens in the same preorder sequence, reconstructing left before right since preorder visits root, then left subtree, then right subtree.",
      },
    ],
    practice: [
      "Implement all three DFS traversals (preorder, inorder, postorder) both recursively and iteratively with an explicit stack.",
      "Implement BFS level-order traversal and zigzag level-order traversal using a queue.",
      "Solve 'validate BST', 'lowest common ancestor', and 'diameter of binary tree'.",
      "Implement serialize/deserialize for a binary tree.",
      "Build a self-balancing check: write a function that determines if a binary tree is height-balanced.",
    ],
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
    deepDive: [
      "A heap is a complete binary tree, meaning every level is fully filled except possibly the last, which is filled left to right — this completeness property is exactly what allows it to be stored compactly in a plain array with no pointers, using simple index arithmetic to find parents and children instead of pointer chasing.",
      "Building a heap from an unsorted array (heapify) is O(n), not O(n log n) as a naive analysis might suggest, because most nodes in a heap are near the bottom and sift down only a short distance; a careful summation over all levels shows the total work is bounded by O(n). This is why heapsort's overall O(n log n) comes entirely from the n extraction (pop) steps, not the initial build.",
      "The 'top-K' pattern is one of the most common heap interview questions: to find the K largest elements among n, you maintain a min-heap of size K — whenever a new element is bigger than the heap's minimum, you pop the minimum and push the new element. This runs in O(n log K), far better than sorting the whole array (O(n log n)) when K is small.",
      "The 'median of a data stream' problem showcases a two-heap technique: a max-heap holds the smaller half of numbers seen so far, and a min-heap holds the larger half, kept balanced in size (differing by at most 1). The median is then either the top of the larger heap, or the average of both tops — giving O(log n) insertion and O(1) median retrieval.",
    ],
    example: {
      title: "Inserting into a min-heap array [2,5,4,9,6,7] and sifting up",
      steps: [
        "Current heap array: [2, 5, 4, 9, 6, 7]. Insert new value 1 at the end: [2, 5, 4, 9, 6, 7, 1], index 6.",
        "Compare new element (index 6, value 1) with its parent at index (6-1)//2 = 2, value 4. Since 1 < 4, swap.",
        "Array becomes [2, 5, 1, 9, 6, 7, 4], element now at index 2. Compare with parent at (2-1)//2 = 0, value 2. Since 1 < 2, swap.",
        "Array becomes [1, 5, 2, 9, 6, 7, 4], element now at index 0 (the root). No parent left, sift-up stops.",
        "Heap property restored: root 1 is the minimum, verified by checking each parent is <= its children.",
      ],
      result: "New minimum 1 is now at the root after O(log n) swaps during sift-up.",
    },
    mistakes: [
      {
        mistake: "Confusing a min-heap with a max-heap and getting the wrong top element for the problem (e.g., using a min-heap when you need the K largest).",
        fix: "Remember the top-K trick: to find K largest, keep a MIN-heap of size K (pop the smallest when it overflows); to find K smallest, keep a MAX-heap of size K.",
      },
      {
        mistake: "Assuming a heap is fully sorted just because the root is the min/max.",
        fix: "A heap only guarantees the parent-child ordering, not a total order across siblings; only popping repeatedly (heapsort) produces a fully sorted sequence.",
      },
      {
        mistake: "Using a heap when a simple running max/min variable would suffice, adding unnecessary O(log n) overhead.",
        fix: "Only reach for a heap when you need repeated access to a changing min/max among a dynamic collection of elements, e.g., top-K, or merging multiple sorted streams.",
      },
      {
        mistake: "Forgetting Python's heapq is a min-heap only, then getting reversed results when max-heap behavior is needed.",
        fix: "Simulate a max-heap by pushing negated values (or a tuple with negated priority) and negate again on pop.",
      },
    ],
    interviewQA: [
      {
        q: "Why is heapify O(n) instead of O(n log n)?",
        a: "Although there are n sift-down operations each theoretically costing O(log n), most nodes are near the bottom of the tree and only need to sift down a short distance. Summing the actual work across all levels (using the fact that there are n/2 leaves needing 0 work, n/4 nodes needing at most 1 swap, etc.) telescopes to O(n) total.",
      },
      {
        q: "How would you find the K largest elements in a stream of numbers?",
        a: "Maintain a min-heap of size K. For each new number, push it in; if the heap size exceeds K, pop the minimum. At the end (or at any point), the heap contains exactly the K largest elements seen so far, achieved in O(n log K) total time.",
      },
      {
        q: "How do you find the median of a running data stream efficiently?",
        a: "Maintain two heaps: a max-heap for the lower half of numbers and a min-heap for the upper half, keeping their sizes balanced (differ by at most one). Insert into the appropriate heap and rebalance if needed; the median is the top of the larger heap, or the average of both tops if sizes are equal.",
      },
      {
        q: "How do you merge K sorted lists efficiently?",
        a: "Push the first element of each list into a min-heap along with which list it came from. Repeatedly pop the minimum, append it to the result, and push the next element from that same list if one exists. This runs in O(N log K) where N is total elements and K is the number of lists.",
      },
    ],
    practice: [
      "Implement a min-heap from scratch with push, pop, and heapify operations.",
      "Solve 'kth largest element in an array' using a size-K heap.",
      "Solve 'merge K sorted lists' using a heap.",
      "Solve 'find median from a data stream' using the two-heap technique.",
      "Implement heapsort and compare its performance against merge sort and quick sort.",
    ],
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
    deepDive: [
      "The choice between an adjacency list and adjacency matrix has real consequences: an adjacency list uses O(V+E) space and is efficient for sparse graphs (the common case in most interview problems), while an adjacency matrix uses O(V^2) space but gives O(1) edge-existence checks, which matters for dense graphs or when you frequently ask 'is there an edge between u and v'.",
      "BFS and DFS solve fundamentally different classes of problems despite both being O(V+E): BFS explores the graph in expanding rings from the source, which is exactly what's needed for shortest-path-in-unweighted-graph and 'minimum number of steps' problems, while DFS explores as deep as possible before backtracking, which is naturally suited to cycle detection, connected components, and generating all paths/permutations of a graph traversal.",
      "Topological sort only exists for a Directed Acyclic Graph (DAG); if a cycle exists, no valid ordering can satisfy all the 'must come before' constraints. Kahn's algorithm computes it via repeatedly removing zero-in-degree nodes (using a queue, which doubles as cycle detection: if not all nodes get processed, a cycle exists), while the DFS approach appends nodes to the front of the result once all their descendants are fully processed (post-order), then reverses.",
      "Dijkstra's algorithm greedily finalizes the shortest distance to the closest unvisited node at each step, which only works correctly because edge weights are non-negative — a negative edge could retroactively create a shorter path to an already-finalized node, breaking the greedy guarantee. When negative weights are present, Bellman-Ford (O(V*E), relaxing every edge V-1 times) must be used instead, and it can additionally detect negative-weight cycles.",
    ],
    example: {
      title: "BFS shortest path from A in an unweighted graph A-B, A-C, B-D, C-D",
      steps: [
        "Queue = [A], dist = {A: 0}.",
        "Pop A. Neighbors are B and C, neither visited: dist[B] = 1, dist[C] = 1. Queue = [B, C].",
        "Pop B. Neighbor D not visited: dist[D] = dist[B] + 1 = 2. Queue = [C, D].",
        "Pop C. Neighbor D already visited (dist already set), skip. Queue = [D].",
        "Pop D. No unvisited neighbors. Queue empty, BFS complete.",
      ],
      result: "Shortest distances from A: A=0, B=1, C=1, D=2, computed level by level in O(V+E).",
    },
    mistakes: [
      {
        mistake: "Forgetting to mark a node as visited before or right when enqueuing it in BFS, causing it to be added to the queue multiple times.",
        fix: "Mark a node visited (or set its distance) at the moment you enqueue it, not when you dequeue it, to avoid duplicate enqueues.",
      },
      {
        mistake: "Using DFS/BFS on a graph without tracking visited nodes, causing infinite loops on cyclic graphs.",
        fix: "Always maintain a visited set (or array) and check/update it before recursing or enqueuing further.",
      },
      {
        mistake: "Applying Dijkstra's algorithm to a graph with negative edge weights and getting an incorrect shortest path.",
        fix: "Recognize the non-negative-weight requirement; switch to Bellman-Ford when negative weights are possible.",
      },
      {
        mistake: "Confusing topological sort's existence condition, attempting it on a graph containing a cycle.",
        fix: "Verify the graph is a DAG first (e.g., check that Kahn's algorithm processes all V nodes); if not all nodes are processed, report that no topological order exists because of a cycle.",
      },
    ],
    interviewQA: [
      {
        q: "How does BFS guarantee the shortest path in an unweighted graph?",
        a: "BFS explores nodes in increasing order of distance from the source, level by level, since it uses a FIFO queue. The first time a node is reached is guaranteed to be via the shortest possible number of edges, because all shorter paths would have been explored in earlier levels.",
      },
      {
        q: "How do you detect a cycle in a directed graph?",
        a: "Use DFS with three states per node: unvisited, in the current recursion stack (visiting), and fully processed (visited). If you encounter a node that is currently in the recursion stack during DFS, a cycle exists. Alternatively, use Kahn's algorithm: if fewer than V nodes get zero in-degree processed, a cycle exists.",
      },
      {
        q: "Explain how Dijkstra's algorithm works and its complexity.",
        a: "It greedily picks the unvisited node with the smallest known distance (using a min-heap), then relaxes (updates) the distances to its neighbors. It repeats until all nodes are finalized. With a binary heap, this runs in O((V+E) log V) since each edge relaxation may push a new heap entry.",
      },
      {
        q: "What is the difference between Dijkstra and Bellman-Ford?",
        a: "Dijkstra is faster (O((V+E) log V)) but requires all edge weights to be non-negative because it greedily finalizes distances. Bellman-Ford is slower (O(V*E)) but works with negative edge weights and can detect negative-weight cycles by checking for further relaxation after V-1 iterations.",
      },
    ],
    practice: [
      "Implement BFS and DFS on an adjacency list, both recursively (DFS) and iteratively.",
      "Solve 'number of islands' using BFS/DFS on a grid.",
      "Implement topological sort using both Kahn's algorithm and DFS post-order, and solve 'course schedule'.",
      "Implement Dijkstra's algorithm with a min-heap and solve 'network delay time'.",
      "Implement Bellman-Ford and test it on a graph containing a negative-weight edge.",
    ],
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
    deepDive: [
      "Dynamic programming applies to exactly two kinds of problems: those with overlapping subproblems (the same subproblem is solved repeatedly in naive recursion) and optimal substructure (the optimal solution to the whole problem can be built from optimal solutions to its subproblems). If either property is missing — e.g., subproblems don't overlap, or a locally optimal choice doesn't lead to a globally optimal one — plain recursion or greedy is more appropriate than DP.",
      "The single most important skill in DP is correctly defining the state: what does dp[i] or dp[i][j] actually represent in words? Getting this definition precise (e.g., 'dp[i][w] = the maximum value achievable using the first i items with capacity exactly/at-most w') makes the transition almost fall out naturally, whereas guessing the transition without a clear state definition is how most students get stuck.",
      "Top-down (recursion + memoisation) and bottom-up (iterative table filling) compute the same values but differ in practice: top-down naturally handles sparse state spaces and is often easier to write correctly first, while bottom-up avoids recursion-stack overhead and enables space optimisation (e.g., 0/1 knapsack's O(n*W) table can be compressed to a single O(W) array by iterating the capacity dimension in reverse, since each item can only be used once).",
      "Beyond the classic 1D/2D array DPs, DP generalizes to trees (compute a value bottom-up via post-order traversal, e.g., 'house robber III' or 'maximum path sum'), to bitmask DP (state includes a bitmask of which subset of items has been used, common in Traveling-Salesman-style problems), and to interval DP (dp[i][j] over a range, used in matrix chain multiplication and palindrome partitioning) — recognizing which 'flavor' a problem belongs to is often the hardest part of solving it under time pressure.",
    ],
    example: {
      title: "0/1 knapsack with items (wt=2,val=6), (wt=3,val=10), (wt=1,val=2), capacity W=5",
      steps: [
        "Initialize dp = [0,0,0,0,0,0] for w=0..5 (nothing taken yet).",
        "Process item1 (wt=2, val=6): for w from 5 down to 2, dp[w] = max(dp[w], dp[w-2]+6). dp becomes [0,0,6,6,6,6].",
        "Process item2 (wt=3, val=10): for w from 5 down to 3, dp[3]=max(6,dp[0]+10)=10, dp[4]=max(6,dp[1]+10)=10, dp[5]=max(6,dp[2]+10)=16. dp becomes [0,0,6,10,10,16].",
        "Process item3 (wt=1, val=2): for w from 5 down to 1, dp[5]=max(16,dp[4]+2)=16, dp[4]=max(10,dp[3]+2)=12, dp[3]=max(10,dp[2]+2)=10, dp[2]=max(6,dp[1]+2)=6, dp[1]=max(0,dp[0]+2)=2. dp becomes [0,2,6,10,12,16].",
        "Answer is dp[5] = 16, the best combination for capacity 5.",
      ],
      result: "Maximum value achievable with capacity 5 is 16 (using item1 + item2: weight 2+3=5, value 6+10=16).",
    },
    mistakes: [
      {
        mistake: "Iterating the capacity loop forward in 0/1 knapsack, accidentally allowing an item to be used multiple times (turning it into unbounded knapsack).",
        fix: "Iterate the weight/capacity dimension backward (from W down to wt) when using a 1D compressed array for 0/1 knapsack, so each dp[w] update uses values from before the current item was applied.",
      },
      {
        mistake: "Writing the recursive transition before clearly defining what dp[i] or dp[i][j] means in plain English.",
        fix: "Always write a one-sentence definition of the state first, then derive the transition and base case from that definition.",
      },
      {
        mistake: "Confusing LIS (longest increasing subsequence, not necessarily contiguous) with the longest increasing contiguous subarray.",
        fix: "Re-read the problem statement for 'subsequence' (elements can be non-contiguous, order preserved) vs 'subarray'/'substring' (must be contiguous) before choosing the DP formulation.",
      },
      {
        mistake: "Not initializing base cases correctly (e.g., dp[0] or dp[i][0]), leading to wrong answers despite a correct transition.",
        fix: "Explicitly reason through the smallest inputs (empty array, zero capacity) by hand and set base cases to match before trusting the general transition.",
      },
    ],
    interviewQA: [
      {
        q: "What are the two properties a problem must have to be solved with DP?",
        a: "Overlapping subproblems (the same smaller subproblem recurs many times in a naive recursive solution) and optimal substructure (an optimal solution to the problem can be constructed from optimal solutions to its subproblems).",
      },
      {
        q: "How do you solve the Longest Increasing Subsequence problem in O(n log n)?",
        a: "Maintain an array 'tails' where tails[k] is the smallest possible tail value of an increasing subsequence of length k+1. For each number, binary search for its position in tails and either extend or replace; the final length of tails is the LIS length.",
      },
      {
        q: "How would you optimize a 2D DP table's space to O(n)?",
        a: "If the transition for row i only depends on row i-1 (not earlier rows), you only need to keep the previous row (or, for capacity-style DP, a single 1D array updated in the correct iteration direction) instead of the full 2D table.",
      },
      {
        q: "Give an example of DP applied to a tree structure.",
        a: "The 'house robber III' problem: for each node, compute two values via post-order traversal — the max money if this node IS robbed (node's value + sum of children's 'not robbed' values) and if it is NOT robbed (sum of max(robbed, not robbed) for each child). The answer at the root is max of both values.",
      },
    ],
    practice: [
      "Implement 0/1 knapsack both as a 2D table and a space-optimised 1D array.",
      "Solve Longest Increasing Subsequence in both O(n^2) and O(n log n).",
      "Solve 'edit distance' and 'longest common subsequence' as 2D DP problems.",
      "Solve 'house robber' (1D) and 'house robber III' (DP on trees).",
      "Solve 'coin change' (minimum coins) and compare it against the greedy approach to see where greedy fails.",
    ],
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
    deepDive: [
      "A greedy algorithm is correct only when the problem exhibits the greedy-choice property: making the locally optimal choice at each step never prevents reaching a globally optimal solution. This must be proven, typically via an exchange argument — showing that any optimal solution can be transformed into the greedy solution without making it worse, step by step — rather than assumed, because many problems that look greedy actually require DP (e.g., 0/1 knapsack looks similar to fractional knapsack but greedy fails on it).",
      "Interval scheduling (choosing the maximum number of non-overlapping intervals) is the canonical greedy proof example: sorting by end time and always picking the interval that finishes earliest among remaining valid choices leaves the most room for future intervals, which can be proven correct by an exchange argument comparing any optimal solution's first choice against the greedy choice.",
      "Interval merging is a different but related problem: given overlapping intervals, sort by start time, then walk through them once, extending the current merged interval's end whenever the next interval's start is less than or equal to it, otherwise starting a new merged interval. This is O(n log n) dominated by the sort, with O(n) for the single merge pass.",
      "'Meeting rooms II' generalizes interval scheduling to ask how many resources (rooms) are needed simultaneously, solved either by a sweep-line approach (separately sort start and end times, then walk through them counting concurrent overlaps) or with a min-heap of end times (for each new meeting, if it starts after the earliest-ending meeting, reuse that room; otherwise allocate a new one) — both giving O(n log n).",
    ],
    example: {
      title: "Merging overlapping intervals [[1,3],[2,6],[8,10],[15,18]]",
      steps: [
        "Sort by start time (already sorted here): [[1,3],[2,6],[8,10],[15,18]].",
        "Initialize merged = [[1,3]].",
        "Next interval [2,6]: its start 2 <= merged's last end 3, so overlap; extend merged's last end to max(3,6)=6. merged = [[1,6]].",
        "Next interval [8,10]: its start 8 > merged's last end 6, no overlap; append it. merged = [[1,6],[8,10]].",
        "Next interval [15,18]: its start 15 > merged's last end 10, no overlap; append it. merged = [[1,6],[8,10],[15,18]].",
      ],
      result: "Merged intervals: [[1,6],[8,10],[15,18]], computed in O(n log n) due to the sort.",
    },
    mistakes: [
      {
        mistake: "Applying a greedy strategy without proving the greedy-choice property, getting a wrong answer on problems that actually require DP.",
        fix: "Attempt an exchange-argument proof or test on adversarial small examples; if greedy fails on any case, switch to DP (e.g., 0/1 knapsack needs DP, fractional knapsack allows greedy).",
      },
      {
        mistake: "Sorting interval-scheduling problems by start time when the correct key is end time (or vice versa for merging).",
        fix: "For 'maximum number of non-overlapping intervals', sort by END time. For 'merge overlapping intervals', sort by START time. Keep these two patterns distinct.",
      },
      {
        mistake: "Using strict less-than instead of less-than-or-equal (or vice versa) when checking interval overlap, causing off-by-one errors on touching intervals.",
        fix: "Clarify whether touching intervals (end of one equals start of next) count as overlapping for the specific problem, and use <= or < consistently based on that rule.",
      },
      {
        mistake: "Not considering that a greedy choice must be irrevocable; trying to 'undo' a greedy decision later, which defeats the purpose and often introduces bugs.",
        fix: "If your solution needs to revisit or undo earlier decisions, that's a signal the problem may require backtracking or DP rather than pure greedy.",
      },
    ],
    interviewQA: [
      {
        q: "How do you prove a greedy algorithm is correct?",
        a: "Typically via an exchange argument: assume there's an optimal solution that differs from the greedy choice at some step, then show you can modify that optimal solution to match the greedy choice without making the solution worse, implying greedy is at least as good.",
      },
      {
        q: "How do you solve the activity selection / maximum non-overlapping intervals problem?",
        a: "Sort intervals by end time. Iterate through them, greedily selecting an interval if its start time is greater than or equal to the end time of the last selected interval, since finishing earliest leaves the most room for subsequent activities.",
      },
      {
        q: "How do you determine the minimum number of meeting rooms needed for a list of intervals?",
        a: "Use a min-heap of end times: for each meeting sorted by start time, if the earliest-ending room's end time is less than or equal to the new meeting's start, reuse that room (pop and push the new end time); otherwise allocate a new room (push without popping). The heap's max size during the process is the answer.",
      },
      {
        q: "Give an example where a greedy approach fails and DP is required instead.",
        a: "0/1 knapsack: greedily picking items by best value-to-weight ratio can fail because items can't be split, so a slightly worse ratio item might fit better with remaining capacity. Fractional knapsack, where items can be split, is where the greedy ratio approach actually works.",
      },
    ],
    practice: [
      "Solve 'merge intervals' and 'insert interval'.",
      "Solve 'non-overlapping intervals' (minimum removals to make intervals non-overlapping) using the end-time-sort greedy.",
      "Solve 'meeting rooms II' using both the sweep-line and min-heap approaches.",
      "Solve 'gas station' and prove why the greedy single-pass approach works.",
      "Compare greedy vs DP on 0/1 knapsack vs fractional knapsack to see exactly where greedy breaks down.",
    ],
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
    deepDive: [
      "Big-O notation formally describes an upper bound on growth rate as input size approaches infinity, deliberately ignoring constant factors and lower-order terms because they become irrelevant at scale — an O(n) algorithm with a large constant will eventually beat an O(n^2) algorithm regardless of constants, once n is large enough. Interviewers care about this because it predicts how a solution will behave in production on real-world data sizes, not just on the small test case in front of you.",
      "It's important to distinguish Big-O (upper bound, worst case), Big-Omega (lower bound, best case), and Big-Theta (tight bound, when upper and lower bounds match) — in casual interview conversation 'complexity' almost always means Big-O, but precise engineers know that saying 'binary search is O(log n)' technically describes the worst case, while its best case (Omega(1), finding the target immediately at the midpoint) is different.",
      "Recursion complexity analysis multiplies the number of recursive calls by the work done per call, and this is most rigorously computed with the Master Theorem for divide-and-conquer recurrences of the form T(n) = a*T(n/b) + f(n): comparing f(n) against n^(log_b(a)) tells you whether the recursive calls or the combine step dominates the total runtime (e.g., merge sort's T(n) = 2T(n/2) + O(n) resolves to O(n log n) because the two terms are balanced).",
      "Amortised analysis (as opposed to worst-case-per-operation analysis) looks at the total cost of a sequence of operations divided by the number of operations, which is essential for structures like dynamic arrays (occasional O(n) resize, but O(1) amortised per push) and even some hash table operations — interviewers often ask you to explain WHY something is amortised O(1) rather than just quoting the fact.",
    ],
    example: {
      title: "Analysing nested loops with a break condition",
      steps: [
        "Code: for i in range(n): for j in range(i, n): if arr[j] == target: break.",
        "Outer loop runs n times (i from 0 to n-1).",
        "For each i, inner loop starts at j=i, so it runs (n - i) iterations in the worst case (no break).",
        "Total worst-case iterations = n + (n-1) + (n-2) + ... + 1 = n(n+1)/2.",
        "Drop constants and lower-order terms: n(n+1)/2 = (n^2 + n)/2, which is O(n^2) as n grows large.",
      ],
      result: "Overall time complexity is O(n^2), even though the inner loop's range shrinks each iteration.",
    },
    mistakes: [
      {
        mistake: "Assuming two nested loops always mean O(n^2), even when the inner loop's range is independent of n (e.g., a fixed constant like 26 for lowercase letters).",
        fix: "Check what each loop actually iterates over: a loop bounded by a constant contributes O(1), not O(n), regardless of nesting.",
      },
      {
        mistake: "Forgetting to account for the space used by the recursion call stack when stating space complexity.",
        fix: "Always add O(depth) for the call stack in recursive solutions, even if no extra data structure is explicitly allocated.",
      },
      {
        mistake: "Confusing time complexity of building a data structure (e.g., O(n) to build a hash set) with the complexity of a single operation on it (O(1) average lookup).",
        fix: "State complexities per distinct step: preprocessing/build cost separately from per-query cost, especially in problems involving multiple queries.",
      },
      {
        mistake: "Treating O(2^n) and O(n!) as 'basically the same as O(n^2), just slower', without appreciating how quickly they become computationally infeasible.",
        fix: "Internalize concrete scale: O(2^n) is fine for n<=25 or so, O(n!) is only fine for n<=10-12, whereas O(n^2) is fine for n up to ~10,000-100,000 depending on constant factors.",
      },
    ],
    interviewQA: [
      {
        q: "What is the difference between Big-O, Big-Omega, and Big-Theta?",
        a: "Big-O gives an upper bound (worst-case growth rate), Big-Omega gives a lower bound (best-case growth rate), and Big-Theta gives a tight bound where the upper and lower bounds coincide, describing the exact asymptotic growth rate.",
      },
      {
        q: "Why is a dynamic array's push operation considered amortised O(1) even though resizing is O(n)?",
        a: "Resizing (doubling capacity and copying all elements) happens only occasionally — specifically, after a geometrically increasing number of pushes. Summing the total copying cost over n pushes gives O(n) total work, which divided by n operations averages to O(1) per push.",
      },
      {
        q: "How do you determine the time complexity of a recursive function?",
        a: "Set up a recurrence relation describing the cost per call and how many subcalls it makes (e.g., T(n) = 2T(n/2) + O(n)), then solve it using the Master Theorem, a recursion tree, or substitution to get the closed-form Big-O.",
      },
      {
        q: "What's the space complexity of an in-place iterative algorithm versus its recursive counterpart?",
        a: "An in-place iterative algorithm typically uses O(1) extra space since it only needs a fixed number of variables, while a recursive version of the same algorithm uses O(depth) space for the call stack, where depth is often O(n) or O(log n) depending on how the recursion divides the problem.",
      },
    ],
    practice: [
      "Analyse the time and space complexity of five of your own past solutions, writing out the reasoning explicitly.",
      "Practice deriving recurrences for divide-and-conquer algorithms (merge sort, binary search) and solving them with the Master Theorem.",
      "Write a program that empirically times an O(n), O(n log n), and O(n^2) algorithm on increasing input sizes and plot the growth.",
      "Explain amortised analysis by implementing a dynamic array with manual doubling and counting total copy operations.",
      "Practice identifying complexity from code snippets, including loops with early breaks and loops with non-linear step increments.",
    ],
  },
};
