import type { Lesson } from "./types";

export const linearStructuresLesson: Lesson = {
  slug: "linked-lists-stacks-queues",
  topic: "Linked Lists, Stacks, Queues",
  title: "Linked Lists, Stacks & Queues",
  blurb: "Pointer surgery plus the two access disciplines that power parsing, scheduling and traversal.",
  overview: {
    simple: [
      "A linked list stores each value in a node that also holds a reference to the next node. There is no index arithmetic, so access is sequential, but inserting in the middle is O(1) once you hold the previous node.",
      "A stack is last-in first-out (LIFO): you only touch the top. A queue is first-in first-out (FIFO): you add at the back and remove from the front.",
      "These three structures are the vocabulary for DFS (stack), BFS (queue) and streaming data (linked list / deque).",
    ],
    whyLearn: [
      "Linked-list pointer manipulation is a classic whiteboard test of care and edge-case handling.",
      "Stacks power expression parsing, undo, and the monotonic-stack pattern.",
      "Queues and deques appear in BFS, sliding-window maximum and producer-consumer design.",
    ],
    realWorld: [
      "Browser history is a stack; print jobs are a queue.",
      "Music playlists and LRU caches use doubly linked lists.",
      "Message brokers like Kafka expose queue semantics at scale.",
    ],
  },
  coreConcepts: [
    {
      heading: "Node structure and traversal",
      body: [
        "A singly linked node holds a value and a next pointer. The list is identified by its head; the tail's next is null.",
        "Always guard for null before dereferencing, and remember you cannot go backwards in a singly linked list.",
      ],
      diagram: `head
 |
 v
[3|*]->[7|*]->[9|*]->[1|null]

insert 5 after 7:
[3|*]->[7|*]->[5|*]->[9|*]->[1|null]`,
      code: {
        title: "Node, traversal, insert, delete",
        code: `class Node {
    int val; Node next;
    Node(int v) { val = v; }
}

for (Node cur = head; cur != null; cur = cur.next) System.out.println(cur.val);

// insert after p
Node n = new Node(5); n.next = p.next; p.next = n;

// delete the node after p
if (p.next != null) p.next = p.next.next;`,
        explain: [
          "Set the new node's next before rewiring p.next, or you lose the rest of the list.",
          "Deletion just skips a node; the garbage collector reclaims it.",
          "A dummy head node removes the 'deleting the first element' special case.",
        ],
      },
    },
    {
      heading: "Reversal and the two-pointer tricks",
      body: [
        "Reversal walks the list re-pointing each next to the previous node, using three references: prev, cur, next.",
        "Slow/fast pointers find the middle in one pass and detect cycles (Floyd's algorithm) in O(1) space.",
      ],
      diagram: `prev=null cur=head
while cur != null:
    nxt = cur.next
    cur.next = prev
    prev = cur
    cur = nxt
return prev   (new head)`,
      code: {
        title: "Reverse, middle, cycle",
        code: `Node reverse(Node head) {
    Node prev = null, cur = head;
    while (cur != null) { Node nxt = cur.next; cur.next = prev; prev = cur; cur = nxt; }
    return prev;
}

Node middle(Node head) {
    Node s = head, f = head;
    while (f != null && f.next != null) { s = s.next; f = f.next.next; }
    return s;
}

boolean hasCycle(Node head) {
    Node s = head, f = head;
    while (f != null && f.next != null) {
        s = s.next; f = f.next.next;
        if (s == f) return true;
    }
    return false;
}`,
        explain: [
          "Save cur.next before overwriting it during reversal.",
          "The fast pointer moves twice per step, so it reaches the end when slow is at the middle.",
          "If a cycle exists the fast pointer eventually laps the slow one.",
        ],
      },
    },
    {
      heading: "Stack and queue semantics",
      body: [
        "Use ArrayDeque for both: push/pop for a stack, offer/poll for a queue. Avoid the legacy synchronised Stack class.",
        "A monotonic stack keeps elements in increasing or decreasing order and answers 'next greater element' style questions in O(n).",
      ],
      diagram: `Stack (LIFO)          Queue (FIFO)
push 1,2,3            offer 1,2,3
  top -> 3              front -> 1
         2                       2
         1              back  -> 3
pop -> 3              poll  -> 1`,
      code: {
        title: "ArrayDeque as stack and queue",
        code: `Deque<Integer> stack = new ArrayDeque<>();
stack.push(1); stack.push(2);
stack.peek();  // 2
stack.pop();   // 2

Deque<Integer> queue = new ArrayDeque<>();
queue.offer(1); queue.offer(2);
queue.peek();  // 1
queue.poll();  // 1`,
      explain: [
          "ArrayDeque is faster than LinkedList for both roles and rejects null elements.",
          "push/pop operate on the head; offer/poll add at the tail and remove from the head.",
          "isEmpty() before peek/pop avoids NoSuchElementException with remove()/element().",
        ],
      },
    },
  ],
  javaSyntax: [
    {
      title: "Dummy node pattern",
      code: `Node dummy = new Node(0);
dummy.next = head;
Node prev = dummy;
while (prev.next != null) {
    if (prev.next.val == target) prev.next = prev.next.next;  // delete
    else prev = prev.next;
}
return dummy.next;`,
      explain: [
        "The dummy makes deleting the head identical to deleting any other node.",
        "Only advance prev when you did not delete, or you skip elements.",
        "Return dummy.next, never head, because head may have been removed.",
      ],
    },
    {
      title: "Monotonic stack",
      code: `int[] nextGreater(int[] a) {
    int[] res = new int[a.length];
    Arrays.fill(res, -1);
    Deque<Integer> st = new ArrayDeque<>();     // indices, decreasing values
    for (int i = 0; i < a.length; i++) {
        while (!st.isEmpty() && a[st.peek()] < a[i]) res[st.pop()] = a[i];
        st.push(i);
    }
    return res;
}`,
      explain: [
        "Store indices so you can write into the result array.",
        "Every index is pushed and popped once, giving O(n).",
        "Flip the comparison for next smaller element.",
      ],
    },
  ],
  patterns: [
    {
      name: "Slow / fast pointers",
      what: "Two pointers at different speeds over a list.",
      when: "Middle node, cycle detection, nth from end, palindrome list.",
      identify: "You need positional information without knowing the length.",
      example: "Remove the nth node from the end using a gap of n.",
      code: `Node dummy = new Node(0); dummy.next = head;
Node fast = dummy, slow = dummy;
for (int i = 0; i < n; i++) fast = fast.next;
while (fast.next != null) { fast = fast.next; slow = slow.next; }
slow.next = slow.next.next;
return dummy.next;`,
    },
    {
      name: "Monotonic stack sweep",
      what: "Maintain a stack whose values stay sorted, popping when the invariant breaks.",
      when: "Next greater/smaller element, largest rectangle in histogram, stock span.",
      identify: "You need the nearest element bigger or smaller than each item.",
      example: "Daily temperatures: days until a warmer day.",
      code: `Deque<Integer> st = new ArrayDeque<>();
for (int i = 0; i < t.length; i++) {
    while (!st.isEmpty() && t[st.peek()] < t[i]) { int j = st.pop(); res[j] = i - j; }
    st.push(i);
}`,
    },
    {
      name: "Two stacks / two queues simulation",
      what: "Build one structure from another to change the access order.",
      when: "Queue using stacks, stack using queues, min stack.",
      identify: "The question restricts which operations you may use.",
      example: "Min stack storing the running minimum alongside each value.",
      code: `Deque<int[]> st = new ArrayDeque<>();       // {value, minSoFar}
void push(int x) {
    int min = st.isEmpty() ? x : Math.min(x, st.peek()[1]);
    st.push(new int[]{x, min});
}
int getMin() { return st.peek()[1]; }`,
    },
  ],
  examples: [
    {
      title: "Reverse 1 -> 2 -> 3",
      input: "head = 1 -> 2 -> 3 -> null",
      steps: [
        "prev=null cur=1: nxt=2, 1.next=null, prev=1, cur=2.",
        "prev=1 cur=2: nxt=3, 2.next=1, prev=2, cur=3.",
        "prev=2 cur=3: nxt=null, 3.next=2, prev=3, cur=null -> stop.",
      ],
      output: "3 -> 2 -> 1 -> null",
    },
    {
      title: "Valid parentheses \"{[()]}\"",
      input: "s = \"{[()]}\"",
      steps: [
        "Push {, [, (.",
        "')' matches the top '(' -> pop. ']' matches '[' -> pop. '}' matches '{' -> pop.",
        "Stack is empty at the end, so the string is balanced.",
      ],
      output: "true",
    },
  ],
  problems: [
    {
      id: "ll-1",
      title: "Merge two sorted lists",
      level: "Beginner",
      statement: "Merge two sorted linked lists into one sorted list.",
      input: "1->3->5 and 2->4",
      output: "1->2->3->4->5",
      approach: "Use a dummy tail and always attach the smaller head.",
      steps: ["Create a dummy node and a tail pointer.", "While both lists are non-empty attach the smaller node and advance it.", "Attach whichever list remains."],
      code: `Node merge(Node a, Node b) {
    Node dummy = new Node(0), tail = dummy;
    while (a != null && b != null) {
        if (a.val <= b.val) { tail.next = a; a = a.next; }
        else { tail.next = b; b = b.next; }
        tail = tail.next;
    }
    tail.next = (a != null) ? a : b;
    return dummy.next;
}`,
      time: "O(n + m)",
      space: "O(1)",
    },
    {
      id: "ll-2",
      title: "Valid parentheses",
      level: "Intermediate",
      statement: "Check whether a string of brackets is correctly balanced and nested.",
      input: "\"([)]\"",
      output: "false",
      approach: "Push opening brackets and require the top to match every closing bracket.",
      steps: ["Push (, [, {.", "For a closing bracket, pop and compare; mismatch or empty stack means false.", "Balanced only if the stack ends empty."],
      code: `boolean valid(String s) {
    Deque<Character> st = new ArrayDeque<>();
    for (char c : s.toCharArray()) {
        if (c == '(' || c == '[' || c == '{') st.push(c);
        else {
            if (st.isEmpty()) return false;
            char o = st.pop();
            if ((c == ')' && o != '(') || (c == ']' && o != '[') || (c == '}' && o != '{')) return false;
        }
    }
    return st.isEmpty();
}`,
      time: "O(n)",
      space: "O(n)",
    },
    {
      id: "ll-3",
      title: "LRU cache",
      level: "Interview",
      statement: "Design a cache with O(1) get and put that evicts the least recently used key.",
      input: "capacity 2; put(1,1), put(2,2), get(1), put(3,3)",
      output: "get(2) returns -1 because key 2 was evicted",
      approach: "HashMap for lookup plus a doubly linked list for recency; LinkedHashMap with accessOrder does both.",
      steps: [
        "On get, move the node to the most-recent end.",
        "On put beyond capacity, remove the least-recent head node.",
        "Both operations are O(1) because the map gives the node directly.",
      ],
      code: `class LRUCache extends LinkedHashMap<Integer,Integer> {
    private final int cap;
    LRUCache(int cap) { super(16, 0.75f, true); this.cap = cap; }
    public int get(int k) { return super.getOrDefault(k, -1); }
    public void put2(int k, int v) { super.put(k, v); }
    @Override protected boolean removeEldestEntry(Map.Entry<Integer,Integer> e) {
        return size() > cap;
    }
}`,
      time: "O(1) per operation",
      space: "O(capacity)",
    },
  ],
  mistakes: [
    { mistake: "Losing the rest of the list while rewiring pointers.", fix: "Save next in a temporary variable before overwriting." },
    { mistake: "NullPointerException at the list end.", fix: "Check fast != null && fast.next != null before double stepping." },
    { mistake: "Returning head after possibly deleting it.", fix: "Use a dummy node and return dummy.next." },
    { mistake: "Using the legacy Stack or LinkedList as a queue.", fix: "Use ArrayDeque - faster and unsynchronised." },
    { mistake: "peek() on an empty deque.", fix: "peek returns null (safe); element()/remove() throw - check isEmpty first." },
  ],
  interviewQuestions: [
    { q: "Array vs linked list?", a: "Arrays give O(1) indexed access and cache locality; linked lists give O(1) insert/delete at a known position but O(n) access and pointer overhead." },
    { q: "How does Floyd's cycle detection work?", a: "A pointer moving two steps closes the gap on one moving a single step by one node per iteration, so inside a cycle they must meet." },
    { q: "Why ArrayDeque over Stack?", a: "Stack extends Vector and is synchronised, which is slower and legacy; ArrayDeque is a resizable circular array with no locking." },
    { q: "When is a doubly linked list needed?", a: "When you must remove a node given only that node, or traverse backwards - as in an LRU cache." },
    { q: "How do you implement a queue with two stacks?", a: "Push onto an input stack; when popping, if the output stack is empty move everything across, giving amortised O(1)." },
  ],
  practice: {
    easy: ["Reverse a linked list", "Middle of the linked list", "Merge two sorted lists", "Valid parentheses", "Implement a queue using stacks"],
    medium: ["Remove nth node from end", "Detect and remove cycle start", "Reorder list", "Min stack", "Next greater element"],
    hard: ["Merge k sorted lists", "Reverse nodes in k-groups", "LRU cache", "Largest rectangle in histogram", "Sliding window maximum"],
  },
  complexity: [
    { operation: "Linked list access by index", time: "O(n)", space: "O(1)" },
    { operation: "Insert / delete at known node", time: "O(1)", space: "O(1)" },
    { operation: "Reverse a list", time: "O(n)", space: "O(1)" },
    { operation: "Stack push / pop", time: "O(1)", space: "O(n)" },
    { operation: "Queue offer / poll (ArrayDeque)", time: "O(1) amortised", space: "O(n)" },
    { operation: "Monotonic stack sweep", time: "O(n)", space: "O(n)" },
  ],
  revision: {
    concepts: ["Nodes plus pointers; no index math.", "LIFO vs FIFO access disciplines.", "Slow/fast pointers reveal position and cycles."],
    rules: ["Save next before rewiring.", "Use a dummy head for insert/delete problems.", "ArrayDeque for both stack and queue."],
    patterns: ["Slow/fast pointers", "Dummy node", "Monotonic stack", "Two-structure simulation"],
    syntax: ["cur = cur.next", "st.push / st.pop / st.peek", "q.offer / q.poll", "dummy.next return"],
    problems: ["Reverse a list", "Detect cycle", "Merge two sorted lists", "Valid parentheses", "LRU cache"],
  },
};
