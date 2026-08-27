import type { TopicMap } from "../topicContent";

export const systemDesignTopics: TopicMap = {
  "OOP & SOLID principles": {
    summary:
      "OOP models software as objects with state and behaviour. SOLID is five design rules that keep those objects changeable.",
    keyPoints: [
      "Four pillars: encapsulation, abstraction, inheritance, polymorphism.",
      "S: one reason to change. O: extend without editing. L: subtypes substitutable.",
      "I: small focused interfaces. D: depend on abstractions, not concretions.",
      "Prefer composition over inheritance when behaviour varies independently.",
    ],
    syntax: {
      lang: "typescript",
      code: "interface Payment { pay(amount: number): void }\nclass Upi implements Payment { pay(a: number) {} }\nclass Checkout { constructor(private p: Payment) {} } // DIP",
    },
    diagram: `        <<interface>> Payment
                 ^
      +----------+----------+
    Upi        Card       Wallet
Checkout --> Payment   (depends on abstraction)
adding Netbanking touches zero existing classes (OCP)`,
  },

  "Low-level design: parking lot, splitwise, cache": {
    summary:
      "LLD turns a requirement into classes, responsibilities and relationships — the fresher-level design round at product companies.",
    keyPoints: [
      "Start from nouns (entities) and verbs (behaviours), then draw a class diagram.",
      "Parking lot: Lot -> Levels -> Spots by size, plus Ticket and pricing strategy.",
      "Splitwise: Expense with a split strategy (equal, exact, percent) and a balance sheet per user.",
      "LRU cache: HashMap + doubly linked list for O(1) get and put.",
    ],
    syntax: {
      lang: "typescript",
      code: "class LRU {\n  private map = new Map<string, number>(); // Map keeps insertion order\n  get(k: string) { const v = this.map.get(k); if (v === undefined) return -1;\n    this.map.delete(k); this.map.set(k, v); return v; }\n}",
    },
    diagram: `LRU cache
 head(most recent) [D] <-> [C] <-> [B] <-> [A] tail(evict here)
 hashmap: key -> node pointer
 get: move node to head (O(1))
 put full: drop tail, insert at head`,
  },

  "Design patterns: factory, observer, strategy, singleton": {
    summary:
      "Patterns are named solutions to recurring design problems, grouped as creational, structural and behavioural.",
    keyPoints: [
      "Factory hides which concrete class is constructed.",
      "Observer notifies many subscribers of a state change (pub/sub, event listeners).",
      "Strategy swaps an algorithm at runtime instead of using if-else chains.",
      "Singleton allows one instance — the most over-used pattern; it hurts testability.",
    ],
    syntax: {
      lang: "typescript",
      code: "type Sort = (a: number[]) => number[];\nclass Sorter { constructor(private s: Sort) {} run(a: number[]) { return this.s(a) } }",
    },
    diagram: `Observer
 Subject --notify()--> [Obs A]
        \\-----------> [Obs B]
        \\-----------> [Obs C]

Strategy
 Context --uses--> <<Strategy>> --+-- Quick
                                  +-- Merge`,
  },

  "Load balancing & horizontal scaling": {
    summary:
      "Horizontal scaling adds more machines; a load balancer spreads traffic across them and removes unhealthy nodes.",
    keyPoints: [
      "Algorithms: round robin, least connections, IP hash, weighted.",
      "L4 balances by IP/port, L7 can route by path or header.",
      "Health checks + a stateless app tier are what make scaling out work.",
      "Sticky sessions are a smell — externalise session state instead.",
    ],
    syntax: {
      lang: "text",
      code: "vertical  : one bigger box (limit, single point of failure)\nhorizontal: N boxes behind an LB (needs statelessness)",
    },
    diagram: `        clients
           |
      [ load balancer ]
       /     |      \\
   [app1] [app2]  [app3]     stateless
       \\     |      /
       [ cache ] [ db + replicas ]`,
  },

  "Caching layers and invalidation": {
    summary:
      "A cache stores hot data closer to the reader. The hard part is not caching, it is deciding when the cached copy is wrong.",
    keyPoints: [
      "Layers: browser, CDN, application (Redis), database buffer pool.",
      "Patterns: cache-aside (lazy), write-through, write-behind.",
      "Eviction: LRU, LFU, TTL. Metric to quote: hit ratio.",
      "Failure modes: stale reads, thundering herd on expiry, cache stampede after deploy.",
    ],
    syntax: {
      lang: "text",
      code: "value = cache.get(key)\nif value is None:\n    value = db.query(key)\n    cache.set(key, value, ttl=300)   # cache-aside",
    },
    diagram: `request -> [CDN] -> [app cache] -> [DB]
             hit        hit          miss path
 read ratio: 95% served before the DB
 invalidate on write: delete key, or set new value (write-through)`,
  },

  "Database sharding & replication": {
    summary:
      "Replication copies data to more nodes for reads and failover. Sharding splits data across nodes so each holds a slice.",
    keyPoints: [
      "Primary-replica: writes to primary, reads from replicas, with replication lag.",
      "Shard keys: hash (even spread), range (good scans, hotspots), directory.",
      "Cross-shard joins and transactions are the price of sharding.",
      "Rebalancing is easier with consistent hashing.",
    ],
    syntax: {
      lang: "text",
      code: "shard_id = hash(user_id) % N        // hash sharding\nrange: users A-M -> s1, N-Z -> s2   // range sharding",
    },
    diagram: `replication                  sharding
 [primary] --write            hash(user_id) % 3
   |  \\  \\                    +------+------+------+
 [r1][r2][r3]  reads          |shard0|shard1|shard2|
 lag = eventual reads         +------+------+------+`,
  },

  "CAP theorem and consistency models": {
    summary:
      "In a partitioned distributed system you can keep Consistency or Availability, not both. CAP is about behaviour during a network partition.",
    keyPoints: [
      "CP: reject requests to stay correct (banking). AP: answer with possibly stale data (feeds).",
      "Strong consistency: read sees the latest write. Eventual: converges later.",
      "PACELC extends CAP: without a partition, choose latency or consistency.",
      "Quorum: R + W > N gives strong reads.",
    ],
    syntax: {
      lang: "text",
      code: "N=3 replicas, W=2, R=2 -> R+W>N -> strong read\nW=1, R=1 -> fast but eventual",
    },
    diagram: `        Consistency
           /\\
          /  \\   pick two
         /    \\
 Availability--Partition tolerance
 (partitions are unavoidable, so it is really CP vs AP)`,
  },

  "Message queues and async processing": {
    summary:
      "A queue decouples producers from consumers so slow work happens in the background and traffic spikes are absorbed.",
    keyPoints: [
      "Queue = one consumer group per message; pub/sub topic = fan-out to many.",
      "Delivery: at-most-once, at-least-once (needs idempotent consumers), exactly-once (expensive).",
      "Dead-letter queues capture repeatedly failing messages.",
      "Kafka keeps an ordered, replayable log per partition.",
    ],
    syntax: {
      lang: "text",
      code: "POST /order -> enqueue(order_created) -> 202 Accepted\nworker: send email, generate invoice, update search index",
    },
    diagram: `producer --> [ msg | msg | msg ] --> consumer1
                    queue        \\--> consumer2
 spike absorbed by queue depth
 failed 5x -> [dead letter queue]`,
  },

  "API design & rate limiting": {
    summary:
      "A good API is predictable: resource URLs, correct verbs and status codes, versioning, pagination — plus limits so one client cannot starve the rest.",
    keyPoints: [
      "REST resources are nouns; use plural paths and nested relations sparingly.",
      "Paginate with cursors for large or changing data sets.",
      "Rate limit algorithms: fixed window, sliding window, token bucket, leaky bucket.",
      "Return 429 with Retry-After; make writes idempotent with an idempotency key.",
    ],
    syntax: {
      lang: "http",
      code: "GET /v1/tools?limit=20&cursor=abc\n429 Too Many Requests\nX-RateLimit-Remaining: 0\nRetry-After: 30",
    },
    diagram: `token bucket (capacity 5, refill 1/s)
 tokens [* * * * *]  request -> take 1 token
        [* * * *  ]  refill adds tokens over time
 empty bucket -> 429 (burst allowed, average capped)`,
  },

  "Two Sum problem theory": {
    summary:
      "Two Sum asks for two elements whose values add to a target. It is the canonical example of trading memory for speed: a hash map turns an O(n^2) search into O(n) — the same trade-off behind caches, indexes and dedup tables in system design.",
    keyPoints: [
      "Brute force: try every pair -> O(n^2) time, O(1) space.",
      "Hash map: store value -> index while scanning; for each x check if (target - x) was seen -> O(n) time, O(n) space.",
      "If the array is sorted, two pointers from both ends solve it in O(n) time and O(1) space.",
      "Design lesson: the map is a read-through index — the same idea as a DB index or Redis cache in front of a slow scan.",
      "Follow-ups asked: return all pairs, handle duplicates, Three Sum, and Two Sum on a stream (design the data structure).",
    ],
    syntax: {
      lang: "java",
      code: `int[] twoSum(int[] a, int target) {
    Map<Integer, Integer> seen = new HashMap<>();   // value -> index
    for (int i = 0; i < a.length; i++) {
        int need = target - a[i];
        if (seen.containsKey(need)) return new int[]{seen.get(need), i};
        seen.put(a[i], i);
    }
    return new int[]{-1, -1};
}`,
    },
    diagram: `a = [2, 7, 11, 15], target = 9

scan i=0: need 9-2=7  -> not in map -> store {2:0}
scan i=1: need 9-7=2  -> FOUND at index 0 -> return [0, 1]

map grows like an index:
 { 2 -> 0 }          one lookup replaces a full inner loop

brute force:        hash map (index):
 i \ j 0 1 2 3      lookup "need" in O(1)
   0   . X X X       |
   1   . . X X       v
   2   . . . X     found pair in one pass`,
  },
};
