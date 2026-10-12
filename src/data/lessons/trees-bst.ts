import type { Lesson } from "./types";

export const treesLesson: Lesson = {
  slug: "trees-bst",
  topic: "Trees & BST Traversals",
  title: "Trees & Binary Search Trees",
  blurb: "Hierarchical data, four traversal orders, and the ordering property that makes search O(height).",
  overview: {
    simple: [
      "A tree is a set of nodes where each node has one parent (except the root) and any number of children. A binary tree limits each node to a left and a right child.",
      "A binary search tree (BST) adds a rule: everything in the left subtree is smaller than the node, everything in the right subtree is larger. That rule makes search, insert and delete O(height).",
      "Traversal means visiting every node in a defined order. Inorder on a BST always produces sorted output.",
    ],
    whyLearn: [
      "Tree recursion is the single most common interview shape after arrays.",
      "Traversal order questions (inorder, preorder, level order) are guaranteed in written rounds.",
      "Balanced trees underpin TreeMap, database indexes and file systems.",
    ],
    realWorld: [
      "HTML DOM and file directories are trees.",
      "Database indexes are B/B+ trees, a generalisation of BSTs.",
      "Decision trees in ML are binary trees over feature thresholds.",
    ],
  },
  coreConcepts: [
    {
      heading: "Terminology and shape",
      body: [
        "Height is the number of edges on the longest root-to-leaf path; depth is measured from the root down.",
        "A tree with n nodes has n - 1 edges. A balanced binary tree has height about log2(n); a degenerate one (a chain) has height n - 1.",
        "Complete, full and perfect trees describe how tightly nodes are packed - a heap is a complete binary tree.",
      ],
      diagram: `            8            level 0  (root)
          /   \\
        3      10         level 1
       / \\       \\
      1   6       14      level 2
         / \\      /
        4   7    13       level 3
height = 3, leaves = 1,4,7,13`,
    },
    {
      heading: "The four traversals",
      body: [
        "Preorder (node, left, right) copies or serialises a tree. Inorder (left, node, right) sorts a BST. Postorder (left, right, node) frees or aggregates from children upward. Level order uses a queue, one level at a time.",
        "Depth-first traversals are naturally recursive; level order needs an explicit queue.",
      ],
      diagram: `tree:   1
       / \\
      2   3
     / \\
    4   5
pre  : 1 2 4 5 3
in   : 4 2 5 1 3
post : 4 5 2 3 1
level: 1 | 2 3 | 4 5`,
      code: {
        title: "All four traversals",
        code: `class TreeNode { int val; TreeNode left, right; TreeNode(int v){val=v;} }

void pre(TreeNode n, List<Integer> out) {
    if (n == null) return;
    out.add(n.val); pre(n.left, out); pre(n.right, out);
}
void in(TreeNode n, List<Integer> out) {
    if (n == null) return;
    in(n.left, out); out.add(n.val); in(n.right, out);
}
void post(TreeNode n, List<Integer> out) {
    if (n == null) return;
    post(n.left, out); post(n.right, out); out.add(n.val);
}
List<List<Integer>> levels(TreeNode root) {
    List<List<Integer>> out = new ArrayList<>();
    if (root == null) return out;
    Queue<TreeNode> q = new ArrayDeque<>(); q.offer(root);
    while (!q.isEmpty()) {
        int size = q.size();                 // freeze this level
        List<Integer> level = new ArrayList<>();
        for (int i = 0; i < size; i++) {
            TreeNode n = q.poll();
            level.add(n.val);
            if (n.left != null) q.offer(n.left);
            if (n.right != null) q.offer(n.right);
        }
        out.add(level);
    }
    return out;
}`,
        explain: [
          "The null check is the base case for all three DFS orders.",
          "Only the position of out.add changes between pre, in and post.",
          "Capturing q.size() before the inner loop is what separates levels.",
        ],
      },
    },
    {
      heading: "BST operations and validation",
      body: [
        "Search compares with the node and descends into exactly one subtree, so it costs O(height).",
        "Validation must use a value range, not just parent comparisons: every node must lie strictly inside (min, max).",
        "Deleting a node with two children replaces it with the inorder successor (smallest node in the right subtree).",
      ],
      code: {
        title: "Search, insert, validate",
        code: `boolean search(TreeNode n, int t) {
    while (n != null) {
        if (n.val == t) return true;
        n = (t < n.val) ? n.left : n.right;
    }
    return false;
}

TreeNode insert(TreeNode n, int v) {
    if (n == null) return new TreeNode(v);
    if (v < n.val) n.left = insert(n.left, v); else n.right = insert(n.right, v);
    return n;
}

boolean isBST(TreeNode n, long min, long max) {
    if (n == null) return true;
    if (n.val <= min || n.val >= max) return false;
    return isBST(n.left, min, n.val) && isBST(n.right, n.val, max);
}
// call: isBST(root, Long.MIN_VALUE, Long.MAX_VALUE)`,
        explain: [
          "Iterative search avoids stack frames entirely.",
          "insert returns the (possibly new) subtree root, so the parent reassigns the link.",
          "long bounds avoid overflow when node values are Integer.MIN_VALUE / MAX_VALUE.",
        ],
      },
    },
  ],
  javaSyntax: [
    {
      title: "Recursive tree metrics",
      code: `int height(TreeNode n) {
    return n == null ? 0 : 1 + Math.max(height(n.left), height(n.right));
}
int count(TreeNode n) {
    return n == null ? 0 : 1 + count(n.left) + count(n.right);
}
boolean sameTree(TreeNode a, TreeNode b) {
    if (a == null || b == null) return a == b;
    return a.val == b.val && sameTree(a.left, b.left) && sameTree(a.right, b.right);
}`,
      explain: [
        "Most tree questions are 'combine the answers of both subtrees'.",
        "Returning 0 for null keeps the arithmetic clean.",
        "a == b in the null branch handles both-null and one-null cases at once.",
      ],
    },
    {
      title: "Iterative inorder with a stack",
      code: `List<Integer> inorder(TreeNode root) {
    List<Integer> out = new ArrayList<>();
    Deque<TreeNode> st = new ArrayDeque<>();
    TreeNode cur = root;
    while (cur != null || !st.isEmpty()) {
        while (cur != null) { st.push(cur); cur = cur.left; }
        cur = st.pop();
        out.add(cur.val);
        cur = cur.right;
    }
    return out;
}`,
      explain: [
        "Push the whole left spine, then process and turn right.",
        "This is the pattern behind a BST iterator with O(h) memory.",
        "Useful when recursion depth would overflow the stack.",
      ],
    },
  ],
  patterns: [
    {
      name: "Bottom-up return value",
      what: "Return information from children and combine it at the parent.",
      when: "Height, diameter, balanced check, subtree sums.",
      identify: "The answer at a node depends on both subtrees.",
      example: "Diameter of a binary tree computed while measuring height.",
      code: `int best = 0;
int depth(TreeNode n) {
    if (n == null) return 0;
    int l = depth(n.left), r = depth(n.right);
    best = Math.max(best, l + r);          // path through this node
    return 1 + Math.max(l, r);
}`,
    },
    {
      name: "Range-carrying DFS",
      what: "Pass allowed bounds or accumulated state down the recursion.",
      when: "Validate BST, path sum, root-to-leaf numbers.",
      identify: "A node's validity depends on ancestors, not just its parent.",
      example: "Root-to-leaf path sum equal to a target.",
      code: `boolean hasPath(TreeNode n, int rem) {
    if (n == null) return false;
    rem -= n.val;
    if (n.left == null && n.right == null) return rem == 0;
    return hasPath(n.left, rem) || hasPath(n.right, rem);
}`,
    },
    {
      name: "Level order (BFS) with size snapshot",
      what: "Process one level fully before the next using a queue.",
      when: "Level averages, right side view, minimum depth, zigzag order.",
      identify: "The question mentions levels, depth or nearest.",
      example: "Right side view keeps the last node of each level.",
      code: `int size = q.size();
for (int i = 0; i < size; i++) {
    TreeNode n = q.poll();
    if (i == size - 1) out.add(n.val);     // rightmost of the level
    if (n.left != null) q.offer(n.left);
    if (n.right != null) q.offer(n.right);
}`,
    },
  ],
  examples: [
    {
      title: "Insert 5 into a BST",
      input: "BST 8(3(1,6),10(_,14)), insert 5",
      steps: [
        "5 < 8 -> go left to 3.",
        "5 > 3 -> go right to 6.",
        "5 < 6 -> left child of 6 is null, attach 5 there.",
      ],
      output: "5 becomes the left child of 6",
    },
    {
      title: "Lowest common ancestor in a BST",
      input: "BST above, p = 1, q = 6",
      steps: [
        "At 8: both 1 and 6 are smaller, move left.",
        "At 3: 1 is smaller and 6 is larger - the paths split here.",
        "So 3 is the lowest common ancestor.",
      ],
      output: "3",
    },
  ],
  problems: [
    {
      id: "tr-1",
      title: "Maximum depth of a binary tree",
      level: "Beginner",
      statement: "Return the number of nodes along the longest root-to-leaf path.",
      input: "3(9, 20(15, 7))",
      output: "3",
      approach: "Recurse into both children and take 1 + the larger depth.",
      steps: ["Null returns 0.", "Compute left and right depth.", "Return 1 + max."],
      code: `int maxDepth(TreeNode n) {
    return n == null ? 0 : 1 + Math.max(maxDepth(n.left), maxDepth(n.right));
}`,
      time: "O(n)",
      space: "O(h)",
    },
    {
      id: "tr-2",
      title: "Validate a BST",
      level: "Intermediate",
      statement: "Determine whether a binary tree satisfies the BST property.",
      input: "5(1, 4(3, 6))",
      output: "false (4 is in the right subtree of 5 but smaller)",
      approach: "Carry (min, max) bounds down the recursion; checking only parent-child is insufficient.",
      steps: ["Start with infinite bounds.", "Each node must be strictly inside its bounds.", "Left child tightens max, right child tightens min."],
      code: `boolean isValid(TreeNode n, long min, long max) {
    if (n == null) return true;
    if (n.val <= min || n.val >= max) return false;
    return isValid(n.left, min, n.val) && isValid(n.right, n.val, max);
}`,
      time: "O(n)",
      space: "O(h)",
    },
    {
      id: "tr-3",
      title: "Lowest common ancestor in a binary tree",
      level: "Interview",
      statement: "Find the deepest node that has both p and q as descendants (general binary tree, no BST property).",
      input: "3(5(6,2(7,4)),1(0,8)), p = 5, q = 4",
      output: "5",
      approach: "Post-order recursion returning non-null when a target is found; the node where both sides return non-null is the LCA.",
      steps: [
        "If the node is null or equals p or q, return it.",
        "Recurse into both children.",
        "If both return non-null, this node is the LCA; otherwise pass up whichever is non-null.",
      ],
      code: `TreeNode lca(TreeNode n, TreeNode p, TreeNode q) {
    if (n == null || n == p || n == q) return n;
    TreeNode l = lca(n.left, p, q), r = lca(n.right, p, q);
    if (l != null && r != null) return n;
    return l != null ? l : r;
}`,
      time: "O(n)",
      space: "O(h)",
    },
  ],
  mistakes: [
    { mistake: "Validating a BST by comparing only with the direct parent.", fix: "Propagate (min, max) bounds from all ancestors." },
    { mistake: "Forgetting the null base case.", fix: "Every recursive tree function starts with if (node == null)." },
    { mistake: "Mixing up traversal orders.", fix: "Remember the position of the node visit: pre = first, in = middle, post = last." },
    { mistake: "Not snapshotting the queue size in level order.", fix: "Read q.size() before the inner loop so levels stay separate." },
    { mistake: "Assuming a BST is balanced.", fix: "Sorted inserts create a chain with O(n) operations; balanced trees (AVL / red-black) fix this." },
  ],
  interviewQuestions: [
    { q: "Which traversal gives sorted output for a BST and why?", a: "Inorder, because it visits everything smaller than a node before the node and everything larger after it." },
    { q: "How do you reconstruct a tree from traversals?", a: "Preorder plus inorder (or postorder plus inorder) is enough; preorder plus postorder is ambiguous without extra structure." },
    { q: "Why balance a BST?", a: "Unbalanced trees degrade to O(n) operations; AVL and red-black trees keep height O(log n) through rotations." },
    { q: "BFS vs DFS on a tree?", a: "BFS uses O(width) memory and finds shallowest answers first; DFS uses O(height) memory and suits path or subtree aggregation." },
    { q: "How would you delete a node from a BST?", a: "Leaf: remove it. One child: link the parent to that child. Two children: swap with the inorder successor, then delete the successor." },
  ],
  practice: {
    easy: ["Maximum depth", "Same tree", "Invert a binary tree", "Symmetric tree", "Search in a BST"],
    medium: ["Level order traversal", "Validate BST", "Kth smallest element in a BST", "Diameter of a binary tree", "Path sum II"],
    hard: ["Serialize and deserialize a binary tree", "Binary tree maximum path sum", "Construct tree from preorder and inorder", "Recover a BST"],
  },
  complexity: [
    { operation: "Traversal (any order)", time: "O(n)", space: "O(h)" },
    { operation: "BST search / insert / delete (balanced)", time: "O(log n)", space: "O(h)" },
    { operation: "BST operations (degenerate)", time: "O(n)", space: "O(n)" },
    { operation: "Level order (BFS)", time: "O(n)", space: "O(width)" },
    { operation: "Height / diameter", time: "O(n)", space: "O(h)" },
  ],
  revision: {
    concepts: ["Balanced height ~ log2(n); a chain is height n-1.", "Inorder on a BST is sorted.", "BST search descends one subtree per comparison."],
    rules: ["Always handle null first.", "Use bounds to validate a BST.", "Snapshot the level size in BFS."],
    patterns: ["Bottom-up combine", "Range-carrying DFS", "Level-order BFS", "Iterative inorder with a stack"],
    syntax: ["TreeNode left/right", "Math.max for height", "Deque for iterative inorder", "Queue for level order"],
    problems: ["Max depth", "Validate BST", "Level order", "LCA", "Diameter"],
  },
};
