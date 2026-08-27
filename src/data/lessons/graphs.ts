import type { Lesson } from "./types";

export const graphsLesson: Lesson = {
  slug: "graphs",
  topic: "Graphs: BFS, DFS, Topological Sort, Dijkstra",
  title: "Graphs: BFS, DFS, Topological Sort, Dijkstra",
  blurb: "Nodes and edges, four traversal engines, and the shortest-path algorithms interviews ask for by name.",
  overview: {
    simple: [
      "A graph is a set of vertices connected by edges. Edges can be directed (one way) or undirected, weighted or unweighted.",
      "The two engines are BFS (explore level by level with a queue) and DFS (go deep with recursion or a stack). Almost every graph question is one of them plus bookkeeping.",
      "Topological sort orders a directed acyclic graph so every edge points forward - the classic 'course prerequisites' answer. Dijkstra finds shortest paths when edge weights are non-negative.",
    ],
    whyLearn: [
      "Grid problems (islands, rotting oranges, shortest path in a maze) are graph problems in disguise.",
      "Dependency resolution, deadlock detection and build order are topological sorts.",
      "Shortest-path questions appear in almost every product-company interview.",
    ],
    realWorld: [
      "Maps and navigation compute shortest routes with Dijkstra/A*.",
      "Social networks compute degrees of separation with BFS.",
      "Package managers and CI pipelines topologically sort dependencies.",
    ],
  },
  coreConcepts: [
    {
      heading: "Representations",
      body: [
        "An adjacency list stores, for each vertex, the list of its neighbours. It uses O(V + E) memory and is the default choice.",
        "An adjacency matrix is a V x V boolean/weight grid: O(1) edge lookup but O(V^2) memory, only good for dense graphs.",
        "Grids are implicit graphs: each cell is a vertex with up to four neighbours.",
      ],
      diagram: `graph            adjacency list
 1 --- 2         1: [2, 3]
 |     |         2: [1, 4]
 3 --- 4         3: [1, 4]
                 4: [2, 3]`,
      code: {
        title: "Building an adjacency list",
        code: `List<List<Integer>> g = new ArrayList<>();
for (int i = 0; i < n; i++) g.add(new ArrayList<>());
for (int[] e : edges) {
    g.get(e[0]).add(e[1]);
    g.get(e[1]).add(e[0]);        // omit for a directed graph
}

// weighted: store {neighbour, weight}
List<int[]>[] wg = new List[n];
for (int i = 0; i < n; i++) wg[i] = new ArrayList<>();
for (int[] e : edges) wg[e[0]].add(new int[]{e[1], e[2]});`,
        explain: [
          "Initialise every bucket before adding edges, or you get a NullPointerException.",
          "Add both directions for undirected graphs.",
          "For weighted graphs pack {to, weight} into an int[].",
        ],
      },
    },
    {
      heading: "BFS: shortest path in unweighted graphs",
      body: [
        "BFS visits all vertices at distance 1, then 2, and so on, so the first time it reaches a vertex it has found the shortest path in edge count.",
        "Mark a vertex visited when you enqueue it, not when you dequeue it, otherwise it can be queued many times.",
      ],
      diagram: `start 1
level 0: 1
level 1: 2 3
level 2: 4
dist = [_,0,1,1,2]`,
      code: {
        title: "BFS with distances",
        code: `int[] bfs(List<List<Integer>> g, int src) {
    int[] dist = new int[g.size()];
    Arrays.fill(dist, -1);
    Queue<Integer> q = new ArrayDeque<>();
    dist[src] = 0; q.offer(src);
    while (!q.isEmpty()) {
        int u = q.poll();
        for (int v : g.get(u)) {
            if (dist[v] == -1) { dist[v] = dist[u] + 1; q.offer(v); }
        }
    }
    return dist;
}`,
        explain: [
          "dist doubles as the visited marker (-1 means unseen).",
          "Each vertex is enqueued once, so time is O(V + E).",
          "For multi-source BFS, seed the queue with every source at distance 0.",
        ],
      },
    },
    {
      heading: "DFS, cycle detection and topological sort",
      body: [
        "DFS explores one branch fully before backtracking, which suits connectivity, components and cycle detection.",
        "In a directed graph, a cycle exists if DFS reaches a vertex currently on the recursion stack (colour it grey/black to track this).",
        "Kahn's algorithm does topological sort iteratively: repeatedly remove vertices with in-degree 0. If fewer than V vertices come out, the graph has a cycle.",
      ],
      diagram: `Kahn's algorithm
indeg: A0 B1 C1 D2
queue: [A] -> output A, B and C drop to 0
queue: [B,C] -> output B, C; D drops to 0
queue: [D] -> output D
order: A B C D`,
      code: {
        title: "Kahn's topological sort",
        code: `int[] topoOrder(int n, int[][] edges) {
    List<List<Integer>> g = new ArrayList<>();
    for (int i = 0; i < n; i++) g.add(new ArrayList<>());
    int[] indeg = new int[n];
    for (int[] e : edges) { g.get(e[0]).add(e[1]); indeg[e[1]]++; }

    Queue<Integer> q = new ArrayDeque<>();
    for (int i = 0; i < n; i++) if (indeg[i] == 0) q.offer(i);

    int[] order = new int[n]; int k = 0;
    while (!q.isEmpty()) {
        int u = q.poll(); order[k++] = u;
        for (int v : g.get(u)) if (--indeg[v] == 0) q.offer(v);
    }
    return k == n ? order : new int[0];    // empty means a cycle exists
}`,
        explain: [
          "in-degree counts how many prerequisites each vertex still has.",
          "Decrement when a prerequisite is output; enqueue when it reaches 0.",
          "k < n means some vertices never reached in-degree 0, i.e. a cycle.",
        ],
      },
    },
    {
      heading: "Dijkstra for weighted shortest paths",
      body: [
        "Dijkstra repeatedly settles the unvisited vertex with the smallest known distance, then relaxes its outgoing edges.",
        "It requires non-negative weights. With negative edges use Bellman-Ford (O(VE)), which also detects negative cycles.",
      ],
      code: {
        title: "Dijkstra with a priority queue",
        code: `int[] dijkstra(List<int[]>[] g, int src) {
    int n = g.length;
    int[] dist = new int[n];
    Arrays.fill(dist, Integer.MAX_VALUE);
    dist[src] = 0;
    PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[1] - b[1]);
    pq.offer(new int[]{src, 0});
    while (!pq.isEmpty()) {
        int[] cur = pq.poll();
        int u = cur[0], d = cur[1];
        if (d > dist[u]) continue;             // stale entry
        for (int[] e : g[u]) {
            int nd = d + e[1];
            if (nd < dist[e[0]]) { dist[e[0]] = nd; pq.offer(new int[]{e[0], nd}); }
        }
    }
    return dist;
}`,
        explain: [
          "The stale check replaces decrease-key, which Java's PriorityQueue lacks.",
          "Relaxation only pushes when a strictly shorter distance is found.",
          "Complexity is O((V + E) log V).",
        ],
      },
    },
  ],
  javaSyntax: [
    {
      title: "Grid DFS (flood fill)",
      code: `int[][] DIRS = {{1,0},{-1,0},{0,1},{0,-1}};

void dfs(char[][] grid, int r, int c) {
    if (r < 0 || c < 0 || r >= grid.length || c >= grid[0].length) return;
    if (grid[r][c] != '1') return;
    grid[r][c] = '0';                       // mark visited in place
    for (int[] d : DIRS) dfs(grid, r + d[0], c + d[1]);
}`,
      explain: [
        "Bounds check first, then the value check.",
        "Overwriting the cell avoids a separate visited array.",
        "The DIRS array removes four copy-pasted recursive calls.",
      ],
    },
    {
      title: "Union-Find (disjoint set)",
      code: `int[] parent, rank;
int find(int x) { return parent[x] == x ? x : (parent[x] = find(parent[x])); }
boolean union(int a, int b) {
    int ra = find(a), rb = find(b);
    if (ra == rb) return false;             // already connected -> cycle
    if (rank[ra] < rank[rb]) { int t = ra; ra = rb; rb = t; }
    parent[rb] = ra; rank[ra] += rank[rb];
    return true;
}`,
      explain: [
        "Path compression inside find flattens the tree.",
        "Union by rank/size keeps operations near O(1) amortised.",
        "union returning false detects cycles in undirected graphs, used by Kruskal's MST.",
      ],
    },
  ],
  patterns: [
    {
      name: "Multi-source BFS",
      what: "Seed the queue with every starting cell so all fronts expand together.",
      when: "Rotting oranges, nearest 0 in a matrix, walls and gates.",
      identify: "Several simultaneous sources or 'minimum time for all cells'.",
      example: "Rotting oranges: minutes until no fresh orange remains.",
      code: `for (int r = 0; r < m; r++)
  for (int c = 0; c < n; c++)
    if (grid[r][c] == 2) q.offer(new int[]{r, c});
int minutes = 0;
while (!q.isEmpty()) {
    int size = q.size();
    for (int i = 0; i < size; i++) { /* rot neighbours, enqueue */ }
    minutes++;
}`,
    },
    {
      name: "Cycle detection by colour",
      what: "Track WHITE (unvisited), GREY (on stack), BLACK (finished).",
      when: "Course schedule, deadlock detection, valid build order.",
      identify: "Directed graph where you must prove no circular dependency.",
      example: "Course schedule feasibility.",
      code: `boolean hasCycle(int u, int[] color, List<List<Integer>> g) {
    color[u] = 1;                       // grey
    for (int v : g.get(u)) {
        if (color[v] == 1) return true;              // back edge
        if (color[v] == 0 && hasCycle(v, color, g)) return true;
    }
    color[u] = 2;                       // black
    return false;
}`,
    },
    {
      name: "Connected components count",
      what: "Loop over vertices and start a traversal from each unvisited one.",
      when: "Number of islands, provinces, friend circles.",
      identify: "The question asks how many separate groups exist.",
      example: "Number of islands in a grid.",
      code: `int count = 0;
for (int r = 0; r < m; r++)
  for (int c = 0; c < n; c++)
    if (grid[r][c] == '1') { count++; dfs(grid, r, c); }`,
    },
  ],
  examples: [
    {
      title: "BFS shortest path in a grid",
      input: "3x3 grid, start (0,0), target (2,2), all cells open",
      steps: [
        "Level 0: (0,0). Level 1: (0,1), (1,0). Level 2: (0,2), (1,1), (2,0).",
        "Level 3: (1,2), (2,1). Level 4: (2,2) reached.",
        "Distance in steps equals 4 (Manhattan distance here).",
      ],
      output: "4 moves",
    },
    {
      title: "Topological order for courses",
      input: "prerequisites: 1 needs 0, 2 needs 0, 3 needs 1 and 2",
      steps: [
        "in-degrees: 0->0, 1->1, 2->1, 3->2. Queue starts with [0].",
        "Output 0; in-degrees of 1 and 2 drop to 0, queue [1,2].",
        "Output 1 and 2; 3 drops to 0. Output 3.",
      ],
      output: "[0, 1, 2, 3]",
    },
  ],
  problems: [
    {
      id: "gr-1",
      title: "Number of islands",
      level: "Beginner",
      statement: "Count the connected groups of '1' cells in a grid (4-directional).",
      input: "[[1,1,0],[0,1,0],[0,0,1]]",
      output: "2",
      approach: "Scan the grid; each unvisited land cell starts a DFS that sinks the whole island.",
      steps: ["For each cell equal to '1', increment the count.", "DFS flood-fills the island to '0'.", "Continue scanning."],
      code: `int numIslands(char[][] g) {
    int count = 0;
    for (int r = 0; r < g.length; r++)
        for (int c = 0; c < g[0].length; c++)
            if (g[r][c] == '1') { count++; sink(g, r, c); }
    return count;
}
void sink(char[][] g, int r, int c) {
    if (r < 0 || c < 0 || r >= g.length || c >= g[0].length || g[r][c] != '1') return;
    g[r][c] = '0';
    sink(g, r+1, c); sink(g, r-1, c); sink(g, r, c+1); sink(g, r, c-1);
}`,
      time: "O(m*n)",
      space: "O(m*n) recursion worst case",
    },
    {
      id: "gr-2",
      title: "Course schedule",
      level: "Intermediate",
      statement: "Given course prerequisites, decide whether all courses can be finished.",
      input: "numCourses = 2, prerequisites = [[1,0],[0,1]]",
      output: "false (cycle)",
      approach: "Kahn's topological sort: feasible only if every vertex is emitted.",
      steps: ["Build the adjacency list and in-degree array.", "Queue all zero in-degree courses.", "Emit and decrement; success when the emitted count equals numCourses."],
      code: `boolean canFinish(int n, int[][] pre) {
    List<List<Integer>> g = new ArrayList<>();
    for (int i = 0; i < n; i++) g.add(new ArrayList<>());
    int[] indeg = new int[n];
    for (int[] p : pre) { g.get(p[1]).add(p[0]); indeg[p[0]]++; }
    Queue<Integer> q = new ArrayDeque<>();
    for (int i = 0; i < n; i++) if (indeg[i] == 0) q.offer(i);
    int done = 0;
    while (!q.isEmpty()) {
        int u = q.poll(); done++;
        for (int v : g.get(u)) if (--indeg[v] == 0) q.offer(v);
    }
    return done == n;
}`,
      time: "O(V + E)",
      space: "O(V + E)",
    },
    {
      id: "gr-3",
      title: "Network delay time",
      level: "Interview",
      statement: "Signals travel along weighted directed edges from node k; return the time for all nodes to receive it, or -1.",
      input: "times = [[2,1,1],[2,3,1],[3,4,1]], n = 4, k = 2",
      output: "2",
      approach: "Dijkstra from k, then take the maximum finite distance.",
      steps: [
        "Build a weighted adjacency list.",
        "Run Dijkstra with a priority queue and stale-entry skipping.",
        "If any distance is still infinite, return -1; otherwise return the maximum.",
      ],
      code: `int networkDelay(int[][] times, int n, int k) {
    List<int[]>[] g = new List[n + 1];
    for (int i = 1; i <= n; i++) g[i] = new ArrayList<>();
    for (int[] t : times) g[t[0]].add(new int[]{t[1], t[2]});
    int[] dist = new int[n + 1];
    Arrays.fill(dist, Integer.MAX_VALUE);
    dist[k] = 0;
    PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[1] - b[1]);
    pq.offer(new int[]{k, 0});
    while (!pq.isEmpty()) {
        int[] cur = pq.poll();
        if (cur[1] > dist[cur[0]]) continue;
        for (int[] e : g[cur[0]]) {
            int nd = cur[1] + e[1];
            if (nd < dist[e[0]]) { dist[e[0]] = nd; pq.offer(new int[]{e[0], nd}); }
        }
    }
    int ans = 0;
    for (int i = 1; i <= n; i++) {
        if (dist[i] == Integer.MAX_VALUE) return -1;
        ans = Math.max(ans, dist[i]);
    }
    return ans;
}`,
      time: "O((V + E) log V)",
      space: "O(V + E)",
    },
  ],
  mistakes: [
    { mistake: "Marking visited on dequeue instead of enqueue in BFS.", fix: "Mark when you push, so a vertex is queued exactly once." },
    { mistake: "Forgetting to add both directions for undirected edges.", fix: "Add u->v and v->u when building the list." },
    { mistake: "Using DFS to find the shortest path in an unweighted graph.", fix: "BFS guarantees the minimum number of edges; DFS does not." },
    { mistake: "Running Dijkstra with negative weights.", fix: "Use Bellman-Ford, which handles negative edges and detects negative cycles." },
    { mistake: "Deep recursion on a large grid causing StackOverflowError.", fix: "Switch to iterative BFS/DFS with an explicit stack or queue." },
  ],
  interviewQuestions: [
    { q: "BFS vs DFS - when do you pick each?", a: "BFS for shortest paths and level information (O(width) memory); DFS for connectivity, cycles and path enumeration (O(depth) memory)." },
    { q: "How do you detect a cycle in a directed vs undirected graph?", a: "Directed: a back edge to a vertex on the current recursion stack (grey). Undirected: DFS reaching a visited vertex that is not the parent, or union-find reporting an existing root." },
    { q: "Why does Dijkstra fail with negative edges?", a: "It settles a vertex permanently when popped, but a later negative edge could still shorten that distance." },
    { q: "What is the complexity of Dijkstra with a binary heap?", a: "O((V + E) log V); with a Fibonacci heap it drops to O(E + V log V)." },
    { q: "When is topological sort impossible?", a: "When the directed graph contains a cycle, so fewer than V vertices ever reach in-degree zero." },
  ],
  practice: {
    easy: ["Number of islands", "Flood fill", "Find if path exists in graph", "Max area of island", "Clone graph"],
    medium: ["Course schedule I and II", "Rotting oranges", "Surrounded regions", "Pacific Atlantic water flow", "Number of provinces"],
    hard: ["Network delay time (Dijkstra)", "Cheapest flights within k stops", "Word ladder", "Alien dictionary", "Critical connections (bridges)"],
  },
  complexity: [
    { operation: "BFS / DFS (adjacency list)", time: "O(V + E)", space: "O(V)" },
    { operation: "Topological sort (Kahn)", time: "O(V + E)", space: "O(V)" },
    { operation: "Dijkstra (binary heap)", time: "O((V + E) log V)", space: "O(V)" },
    { operation: "Bellman-Ford", time: "O(V * E)", space: "O(V)", note: "Handles negative edges" },
    { operation: "Floyd-Warshall (all pairs)", time: "O(V^3)", space: "O(V^2)" },
    { operation: "Union-Find operation", time: "O(alpha(n)) ~ O(1)", space: "O(V)" },
  ],
  revision: {
    concepts: ["Adjacency list is O(V+E) memory and the default.", "BFS gives unweighted shortest paths; DFS gives depth-first structure.", "Topological sort exists only for DAGs."],
    rules: ["Mark visited on enqueue.", "Both directions for undirected edges.", "Dijkstra needs non-negative weights."],
    patterns: ["Multi-source BFS", "Colour-based cycle detection", "Component counting", "Union-Find connectivity"],
    syntax: ["List<List<Integer>> adjacency", "Queue<Integer> ArrayDeque BFS", "int[] indeg for Kahn", "PriorityQueue<int[]> for Dijkstra"],
    problems: ["Number of islands", "Course schedule", "Rotting oranges", "Network delay time", "Word ladder"],
  },
};
