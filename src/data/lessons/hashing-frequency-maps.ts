import type { Lesson } from "./types";

export const hashingLesson: Lesson = {
  slug: "hashing-frequency-maps",
  topic: "Hashing & Frequency Maps",
  title: "Hashing & Frequency Maps",
  blurb: "Trade memory for speed: turn O(n^2) scans into O(n) lookups with HashMap and HashSet.",
  overview: {
    simple: [
      "A hash table stores key-value pairs in an internal array. A hash function turns the key into an index, so lookups do not need any searching.",
      "A frequency map simply counts how many times each value appears. It is the single most reused trick in interviews.",
      "In Java, HashMap gives key -> value and HashSet gives 'have I seen this?' in about O(1) time.",
    ],
    whyLearn: [
      "Most 'find the pair / find the duplicate / count something' problems collapse to one HashMap pass.",
      "Understanding collisions and load factor is a standard theory question.",
      "Hashing is the building block for caches, dedup, and database indexes.",
    ],
    realWorld: [
      "Browser caches map a URL to a stored response.",
      "Word counters in search engines build frequency maps over documents.",
      "Rate limiters store userId -> request count per window.",
    ],
  },
  coreConcepts: [
    {
      heading: "How a hash table works",
      body: [
        "hash(key) produces an integer; index = hash & (capacity - 1) picks a bucket. Two keys may land in the same bucket - that is a collision.",
        "Java resolves collisions by chaining: each bucket holds a linked list which becomes a balanced tree once it grows past 8 nodes, keeping worst case at O(log n).",
        "When size exceeds capacity * loadFactor (0.75), the table doubles and everything is rehashed.",
      ],
      diagram: `buckets
 0 -> null
 1 -> ("cat",3) -> ("act",1)     <- collision chain
 2 -> null
 3 -> ("dog",7)
index = hash(key) & (capacity - 1)`,
    },
    {
      heading: "equals and hashCode contract",
      body: [
        "Objects that are equal must return the same hashCode, otherwise HashMap will store duplicates and lookups will fail.",
        "For custom classes used as keys, always override both methods (or use a record, which does it for you).",
      ],
      code: {
        title: "A safe custom key",
        code: `record Point(int x, int y) {}          // equals + hashCode generated

class Pair {
    final int a, b;
    Pair(int a, int b) { this.a = a; this.b = b; }
    @Override public boolean equals(Object o) {
        return o instanceof Pair p && p.a == a && p.b == b;
    }
    @Override public int hashCode() { return java.util.Objects.hash(a, b); }
}`,
        explain: [
          "record gives value semantics with no boilerplate - preferred for keys.",
          "Objects.hash combines fields safely.",
          "Keys must be effectively immutable; mutating a key after insertion loses it.",
        ],
      },
    },
    {
      heading: "Counting with one line",
      body: [
        "getOrDefault and merge remove the null checks that beginners forget.",
        "For fixed alphabets prefer an int[] array; for arbitrary values use a HashMap.",
      ],
      code: {
        title: "Three ways to count",
        code: `Map<String,Integer> f = new HashMap<>();
f.put(w, f.getOrDefault(w, 0) + 1);
f.merge(w, 1, Integer::sum);
f.computeIfAbsent(key, k -> new ArrayList<>()).add(value);  // grouping`,
        explain: [
          "getOrDefault returns 0 for unseen keys instead of null.",
          "merge is the shortest counting idiom.",
          "computeIfAbsent builds multi-maps (key -> list) without null checks.",
        ],
      },
    },
  ],
  javaSyntax: [
    {
      title: "HashMap operations",
      code: `Map<String,Integer> m = new HashMap<>();
m.put("a", 1);
m.get("a");                 // 1, null if absent
m.containsKey("a");
m.remove("a");
m.size();
for (Map.Entry<String,Integer> e : m.entrySet())
    System.out.println(e.getKey() + "=" + e.getValue());`,
      explain: [
        "get returns null for a missing key - unboxing null into int throws NPE.",
        "entrySet is the cheapest way to iterate keys and values together.",
        "Iteration order is unspecified; use LinkedHashMap for insertion order and TreeMap for sorted keys.",
      ],
    },
    {
      title: "HashSet operations",
      code: `Set<Integer> seen = new HashSet<>();
if (!seen.add(x)) System.out.println("duplicate");
seen.contains(x);
Set<Integer> sorted = new TreeSet<>(seen);   // O(log n) ops, sorted`,
      explain: [
        "add returns false when the element was already present - a one-line duplicate check.",
        "HashSet is a HashMap with dummy values, so the same cost model applies.",
        "TreeSet trades O(1) for ordered operations like first(), ceiling(), floor().",
      ],
    },
  ],
  patterns: [
    {
      name: "Seen-set complement lookup",
      what: "While scanning, ask whether the value you need was already seen.",
      when: "Two Sum, pair with difference k, contains duplicate.",
      identify: "You need two elements satisfying a relation and the array is unsorted.",
      example: "Two Sum in one pass.",
      code: `Map<Integer,Integer> idx = new HashMap<>();
for (int i = 0; i < a.length; i++) {
    Integer j = idx.get(target - a[i]);
    if (j != null) return new int[]{j, i};
    idx.put(a[i], i);
}`,
    },
    {
      name: "Frequency map compare",
      what: "Build counts for both inputs and compare the maps.",
      when: "Anagrams, permutation checks, k most frequent.",
      identify: "The problem cares about how many, not where.",
      example: "Top k frequent elements using a bucket of counts.",
      code: `Map<Integer,Integer> f = new HashMap<>();
for (int v : a) f.merge(v, 1, Integer::sum);
PriorityQueue<Integer> pq = new PriorityQueue<>((x, y) -> f.get(x) - f.get(y));
for (int key : f.keySet()) { pq.add(key); if (pq.size() > k) pq.poll(); }`,
    },
    {
      name: "Prefix sum + map",
      what: "Store counts of prefix sums to count subarrays with a property.",
      when: "Subarray sum equals k, subarray with equal 0s and 1s, divisible by k.",
      identify: "Counting subarrays, not finding a single one.",
      example: "Number of subarrays summing to k.",
      code: `Map<Integer,Integer> c = new HashMap<>(); c.put(0, 1);
int sum = 0, ans = 0;
for (int v : a) { sum += v; ans += c.getOrDefault(sum - k, 0); c.merge(sum, 1, Integer::sum); }`,
    },
  ],
  examples: [
    {
      title: "First non-repeating character",
      input: "s = \"swiss\"",
      steps: [
        "Count: s->3, w->1, i->1.",
        "Scan the string again in order.",
        "'s' has count 3, skip. 'w' has count 1 -> answer.",
      ],
      output: "'w' at index 1",
    },
    {
      title: "Subarray sum equals 6",
      input: "a = [1, 2, 3, 4], k = 6",
      steps: [
        "map = {0:1}, sum = 0.",
        "1 -> sum 1, need -5, none. 2 -> sum 3, need -3, none.",
        "3 -> sum 6, need 0 -> found 1. 4 -> sum 10, need 4, none.",
      ],
      output: "1 subarray ([1,2,3])",
    },
  ],
  problems: [
    {
      id: "hs-1",
      title: "Contains duplicate",
      level: "Beginner",
      statement: "Return true if any value appears at least twice.",
      input: "[1, 2, 3, 1]",
      output: "true",
      approach: "Insert into a HashSet; add returns false on a repeat.",
      steps: ["Create a HashSet.", "For each element, if add returns false return true.", "Return false after the loop."],
      code: `boolean hasDup(int[] a) {
    Set<Integer> s = new HashSet<>();
    for (int v : a) if (!s.add(v)) return true;
    return false;
}`,
      time: "O(n)",
      space: "O(n)",
    },
    {
      id: "hs-2",
      title: "Group anagrams",
      level: "Intermediate",
      statement: "Group strings that are anagrams of each other.",
      input: "[\"eat\",\"tea\",\"tan\",\"ate\"]",
      output: "[[eat, tea, ate], [tan]]",
      approach: "Use the sorted characters (or a 26-count signature) as the map key.",
      steps: ["Sort each word's characters to build a key.", "Append the word to the list for that key.", "Return the map values."],
      code: `List<List<String>> group(String[] strs) {
    Map<String,List<String>> m = new HashMap<>();
    for (String s : strs) {
        char[] c = s.toCharArray(); Arrays.sort(c);
        m.computeIfAbsent(new String(c), k -> new ArrayList<>()).add(s);
    }
    return new ArrayList<>(m.values());
}`,
      time: "O(n k log k)",
      space: "O(n k)",
    },
    {
      id: "hs-3",
      title: "Longest consecutive sequence",
      level: "Interview",
      statement: "Find the length of the longest run of consecutive integers in an unsorted array.",
      input: "[100, 4, 200, 1, 3, 2]",
      output: "4 (1,2,3,4)",
      approach: "Put everything in a set and only start counting from values whose predecessor is absent.",
      steps: [
        "Insert all numbers into a HashSet.",
        "For each v where v-1 is not in the set, walk v+1, v+2, ... counting length.",
        "Track the maximum length; total work is O(n) because each value is visited twice at most.",
      ],
      code: `int longest(int[] a) {
    Set<Integer> s = new HashSet<>();
    for (int v : a) s.add(v);
    int best = 0;
    for (int v : s) {
        if (s.contains(v - 1)) continue;
        int len = 1;
        while (s.contains(v + len)) len++;
        best = Math.max(best, len);
    }
    return best;
}`,
      time: "O(n)",
      space: "O(n)",
    },
  ],
  mistakes: [
    { mistake: "Unboxing a null from map.get into an int.", fix: "Use getOrDefault or check containsKey first." },
    { mistake: "Overriding equals without hashCode.", fix: "Override both, or use a record." },
    { mistake: "Mutating an object after using it as a key.", fix: "Keys must be immutable; store a copy or use immutable value types." },
    { mistake: "Assuming HashMap keeps insertion order.", fix: "Use LinkedHashMap when order matters." },
    { mistake: "Using a HashMap when the key range is 0..25.", fix: "An int[26] is faster and simpler." },
  ],
  interviewQuestions: [
    { q: "What is the average and worst-case complexity of HashMap.get?", a: "O(1) average; O(log n) worst case in modern Java because long collision chains become red-black trees." },
    { q: "What is load factor?", a: "The fill ratio (default 0.75) at which the table doubles capacity and rehashes to keep chains short." },
    { q: "HashMap vs HashTable vs ConcurrentHashMap?", a: "HashMap is unsynchronised and allows one null key; Hashtable is legacy and fully synchronised; ConcurrentHashMap uses fine-grained locking and is the concurrent choice." },
    { q: "How would you make a hash-based LRU cache?", a: "Combine a HashMap for O(1) lookup with a doubly linked list for O(1) recency updates - that is LinkedHashMap with accessOrder true." },
    { q: "Why can a hash map degrade to O(n)?", a: "If a hash function maps everything into one bucket (or an attacker crafts collisions), lookups become a linear scan of the chain." },
  ],
  practice: {
    easy: ["Two Sum", "Contains duplicate", "Valid anagram", "Intersection of two arrays", "First unique character"],
    medium: ["Group anagrams", "Top k frequent elements", "Subarray sum equals k", "Longest consecutive sequence", "Isomorphic strings"],
    hard: ["Minimum window substring", "Substring with concatenation of all words", "LRU cache", "Longest substring with at most k distinct characters"],
  },
  complexity: [
    { operation: "put / get / remove (average)", time: "O(1)", space: "O(n)" },
    { operation: "put / get (worst, treeified)", time: "O(log n)", space: "O(n)" },
    { operation: "Iterate all entries", time: "O(n + capacity)", space: "O(1)" },
    { operation: "Resize / rehash", time: "O(n) amortised", space: "O(n)" },
    { operation: "TreeMap get / floorKey", time: "O(log n)", space: "O(n)", note: "Sorted alternative" },
  ],
  revision: {
    concepts: ["Hash function -> bucket index; collisions resolved by chaining/treeifying.", "Load factor 0.75 triggers doubling.", "equals and hashCode must agree."],
    rules: ["Never unbox a possibly-null get.", "Immutable keys only.", "Fixed alphabet -> int[] instead of map."],
    patterns: ["Seen-set complement", "Frequency map compare", "Prefix sum + count map", "computeIfAbsent grouping"],
    syntax: ["getOrDefault", "merge(k, 1, Integer::sum)", "computeIfAbsent", "set.add returns false on duplicate"],
    problems: ["Two Sum", "Group anagrams", "Top k frequent", "Subarray sum = k", "Longest consecutive sequence"],
  },
};
