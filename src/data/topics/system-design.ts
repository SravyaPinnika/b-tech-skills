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
    deepDive: [
      "SOLID is not a checklist to satisfy for its own sake; each letter is a defense against a specific way codebases rot. Single Responsibility means a class changes for one reason only — if your Invoice class both calculates totals and formats a PDF, a change to the PDF layout forces a change (and re-test) of billing logic, which is the smell SRP fixes. Open/Closed means new behaviour should be added by writing new code, not editing tested code, typically achieved via interfaces or strategy objects that plug in without touching the existing switch/if chain.",
      "Liskov Substitution is the most misunderstood: it says any subtype must be usable wherever its parent type is expected without breaking correctness, not just without a compile error. The classic violation is Square extending Rectangle and overriding setWidth/setHeight to keep both sides equal — this breaks a caller that expects setWidth to change only the width. Interface Segregation pushes you to build several small interfaces (Printable, Scannable) instead of one fat interface, because forcing an implementer to stub out unused methods is a coupling smell. Dependency Inversion flips the usual dependency direction: high-level modules (business logic) should depend on abstractions, and both high-level and low-level modules depend on that same abstraction, not on each other directly — this is what makes a class testable with mocks and swappable at runtime.",
      "In practice, composition over inheritance is the pragmatic default: inheritance is a strong, rigid coupling appropriate only for true is-a relationships with stable hierarchies; when behaviour needs to vary independently along multiple axes (e.g. payment method and currency and logging), composing small objects (has-a) avoids combinatorial subclass explosion and keeps each piece independently testable.",
    ],
    example: {
      title: "Refactoring a payment class to follow SOLID",
      steps: [
        "Start: Checkout class has an if/else chain for UPI, Card and Wallet payments, all in one method — a Single Responsibility and Open/Closed violation.",
        "Extract a Payment interface with a single pay(amount) method.",
        "Create Upi, Card, Wallet classes implementing Payment, each owning only its own logic.",
        "Checkout now takes a Payment in its constructor and calls payment.pay(amount) — Dependency Inversion, Checkout depends on the interface, not concrete classes.",
        "Adding Netbanking means writing one new class implementing Payment; Checkout's code is untouched, satisfying Open/Closed.",
      ],
      result: "Checkout became stable and testable (you can inject a mock Payment in tests), and new payment methods can be added without editing or retesting existing ones.",
    },
    mistakes: [
      { mistake: "Treating SOLID as five unrelated rules to memorize for interviews.", fix: "Understand each principle as a fix for a specific maintenance pain (rigidity, fragility, immobility) so you can recognize the smell in real code, not just recite definitions." },
      { mistake: "Applying inheritance whenever two classes share some fields or methods.", fix: "Only use inheritance for genuine is-a relationships with stable behaviour; prefer composition when behaviour needs to vary independently." },
      { mistake: "Assuming Liskov Substitution is only about method signatures matching.", fix: "LSP is about behavioural compatibility — a subtype must not strengthen preconditions or weaken postconditions in a way that breaks callers relying on the parent's contract." },
    ],
    interviewQA: [
      { q: "Give a real example of a Single Responsibility Principle violation and how you'd fix it.", a: "A User class that both validates input and sends welcome emails has two reasons to change; split it into a User entity, a UserValidator, and an EmailService, each with one responsibility." },
      { q: "What is the difference between Open/Closed Principle and just writing generic code?", a: "OCP specifically means you can add new behaviour by adding new code (new classes/strategies) without modifying and re-testing existing, already-verified code; generic code alone doesn't guarantee this unless it's structured around abstractions that new implementations can plug into." },
      { q: "Why is composition often preferred over inheritance?", a: "Inheritance creates a tight, fixed coupling at compile time and can lead to fragile hierarchies when behaviour needs to vary along multiple independent dimensions; composition lets you assemble behaviour from independent, swappable, and more easily testable objects." },
      { q: "What does Dependency Inversion actually invert?", a: "Normally high-level modules depend directly on low-level modules' concrete implementations; DIP inverts this so both depend on a shared abstraction (interface), and the low-level implementation depends on satisfying that abstraction — this is what enables dependency injection and mocking in tests." },
    ],
    practice: [
      "Take a class with an if/else chain choosing behaviour and refactor it into a Strategy pattern satisfying OCP.",
      "Write an example of an LSP violation and explain exactly which caller expectation it breaks.",
      "Design two small interfaces instead of one large interface for a Printer/Scanner/FaxMachine scenario.",
      "Explain in your own words why DIP makes unit testing easier.",
      "Pick one class from a personal project and identify how many 'reasons to change' it currently has.",
    ],
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
    deepDive: [
      "LLD interviews test whether you can translate an ambiguous English requirement into concrete classes, fields and methods, applying OOP and SOLID as you go. The standard approach is to first list the entities (nouns: ParkingSpot, Ticket, Vehicle) and the actions (verbs: parkVehicle, calculateFee), then decide relationships between entities (has-a, is-a) and finally which class owns which piece of state and behaviour. Interviewers are usually more interested in your reasoning process and how you handle follow-up twists than the exact class names.",
      "The parking lot problem tests handling of hierarchy (Lot contains Levels contains Spots), polymorphism (different spot sizes for motorcycle/car/bus, matched by a vehicle-to-spot compatibility rule), and a pluggable pricing strategy (flat rate vs hourly vs different rate per vehicle type), which is a textbook Strategy pattern application. Splitwise tests a similar strategy pattern for splitting an expense (equal, exact amounts, percentages must sum to 100), plus a balance sheet abstraction that tracks net amounts owed between every pair of users and must support 'simplify debts' as a graph-reduction follow-up.",
      "The LRU cache is different in flavor — it is really a data structure design problem requiring O(1) get and put. A hash map alone gives O(1) lookup but no notion of recency; a plain linked list gives ordering but O(n) lookup. Combining a hash map (key to node pointer) with a doubly linked list (to reorder nodes to the front on access and evict from the tail in O(1)) gives both. In practice, many languages let you shortcut this with an ordered map/dict (like JavaScript's Map or Python's OrderedDict) that preserves insertion order and supports re-insertion to move an entry to the most-recent position, but understanding the underlying two-structure design is still expected in interviews.",
    ],
    example: {
      title: "Dry run of LRU cache with capacity 2",
      steps: [
        "put(1, 'A') -> cache: {1:A}, order (MRU->LRU): [1]",
        "put(2, 'B') -> cache: {1:A, 2:B}, order: [2, 1]",
        "get(1) -> returns 'A', moves 1 to most-recently-used, order: [1, 2]",
        "put(3, 'C') -> cache is full (capacity 2), evict LRU (key 2), insert 3, order: [3, 1]",
        "get(2) -> returns -1 because key 2 was evicted",
      ],
      result: "The cache always keeps the 2 most recently used keys, correctly evicting key 2 once a third key is inserted after key 2 became the least recently used.",
    },
    mistakes: [
      { mistake: "Jumping straight to code without first listing entities and their relationships.", fix: "Spend the first few minutes identifying nouns/verbs and drawing a rough class diagram before writing any method bodies." },
      { mistake: "Hardcoding pricing/splitting logic with if/else inside the main class.", fix: "Extract a Strategy interface (PricingStrategy, SplitStrategy) so new rules can be added without touching existing classes." },
      { mistake: "Implementing LRU with only a hash map or only a linked list.", fix: "Combine both: hash map gives O(1) lookup, doubly linked list gives O(1) reordering and eviction; together they give O(1) get and put." },
    ],
    interviewQA: [
      { q: "How would you design the parking spot allocation for different vehicle sizes?", a: "Model each ParkingSpot with a size (motorcycle/compact/large) and each Vehicle with a required size; when parking, search the levels for the smallest compatible free spot, encapsulating the matching rule so new vehicle/spot types can be added without changing the search logic." },
      { q: "In Splitwise, how would you support both 'equal split' and 'exact amount split'?", a: "Define a SplitStrategy interface with a method that takes the total amount and participants and returns each participant's share; EqualSplit divides evenly, ExactSplit takes explicit amounts and validates they sum to the total — the Expense class just calls whichever strategy was chosen." },
      { q: "Why does LRU cache need both a hash map and a doubly linked list?", a: "The hash map gives O(1) lookup of a node by key; the doubly linked list gives O(1) removal and re-insertion needed to track recency, since a singly linked list or array would need O(n) to move an arbitrary node." },
      { q: "How would you extend the parking lot design to support multiple pricing rates for weekdays vs weekends?", a: "Keep pricing behind a PricingStrategy interface and inject a strategy that reads the day of week, so weekday/weekend pricing is a new strategy implementation rather than a change to the Ticket or ParkingLot classes." },
    ],
    practice: [
      "Design the class diagram for a parking lot supporting motorcycles, cars and buses.",
      "Implement an LRU cache from scratch using a Map, then explain the eviction logic aloud.",
      "Extend the Splitwise design to support 'settle up' between two users and update the balance sheet.",
      "List the entities and verbs you would extract for a 'BookMyShow'-style movie ticket booking system.",
      "Explain how you would test the pricing strategy in isolation from the rest of the parking lot system.",
    ],
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
    deepDive: [
      "Design patterns are a shared vocabulary: saying 'use a Factory here' communicates an entire solution shape instantly to another engineer, which is why interviewers ask about them — they want to see you recognize the underlying problem, not just recite the GoF book. Factory pattern centralizes object creation logic so callers depend on an interface/return type, not a concrete constructor; this matters when construction is conditional (choose a class based on config or input) or expensive, and it keeps 'which concrete class' decisions in one place instead of scattered across the codebase.",
      "Observer and Strategy both solve decoupling problems but in different directions. Observer decouples a subject from an unknown number of interested parties — the subject just calls notify() and does not need to know who is listening or how many, which is the basis of event systems, pub/sub, and reactive UI frameworks. Strategy decouples an algorithm from the context using it, letting you swap the algorithm at runtime (e.g. different sorting, pricing, or compression strategies) instead of writing a long if/else or switch chain that has to be edited every time a new variant is needed — this is Open/Closed Principle applied concretely.",
      "Singleton guarantees exactly one instance of a class exists, accessed through a global point — useful for things like a single configuration object or connection pool — but it is widely over-used because it introduces hidden global state, makes unit testing hard (you cannot easily inject a fake instance), and can hide dependencies that should be explicit constructor parameters. Modern preference is often dependency injection of a single shared instance managed by a container, rather than a hardcoded Singleton class with a static getInstance() method, because it keeps the same 'one instance' benefit while remaining testable and explicit about dependencies.",
    ],
    example: {
      title: "Refactoring a sort call site to use Strategy",
      steps: [
        "Start: a function has `if (type === 'quick') quickSort(a); else if (type === 'merge') mergeSort(a);` — adding a new sort means editing this function.",
        "Define a Sort type (a function or interface) representing 'sort an array'.",
        "Implement quickSort and mergeSort as functions/classes matching that type.",
        "Sorter class takes a Sort in its constructor and calls it in run(a).",
        "Adding heapSort now means writing one new function and passing it in — Sorter's code never changes.",
      ],
      result: "New sorting algorithms can be added without touching the Sorter class, and each algorithm can be unit tested independently.",
    },
    mistakes: [
      { mistake: "Using Singleton just to avoid passing a parameter through several layers.", fix: "Use dependency injection instead, passing the shared instance explicitly (or via a DI container), keeping dependencies visible and testable." },
      { mistake: "Confusing Factory pattern with just calling `new` inside any function.", fix: "A Factory earns its name when it encapsulates a decision about which concrete class to instantiate based on input/config, hiding that decision from the caller." },
      { mistake: "Implementing Observer without a way to unsubscribe.", fix: "Always provide a way to remove a listener/subscriber to avoid memory leaks and callbacks firing on destroyed objects." },
    ],
    interviewQA: [
      { q: "When would you use a Factory pattern instead of calling a constructor directly?", a: "When the exact class to instantiate depends on runtime input or configuration, or when construction logic is complex/expensive enough that you want it centralized in one place rather than duplicated at every call site." },
      { q: "What is the difference between Strategy and State patterns?", a: "Strategy lets client code choose an algorithm explicitly and the chosen strategy typically doesn't change other strategies' behaviour; State pattern lets an object change its own behaviour as its internal state changes, often with the state objects themselves triggering transitions to other states." },
      { q: "Why is Singleton considered an anti-pattern by many engineers?", a: "It introduces global mutable state and a hidden dependency that is hard to mock or replace in tests, and it can hide true architectural needs — the same benefit (one shared instance) can usually be achieved more safely via dependency injection." },
      { q: "How does Observer pattern relate to pub/sub systems and event listeners in frameworks like React?", a: "They're the same core idea: a subject (event emitter/state) notifies a list of registered listeners without knowing their concrete types; addEventListener/removeEventListener and React's useEffect subscriptions are Observer pattern in practice." },
    ],
    practice: [
      "Implement a simple Observer pattern with subscribe/unsubscribe/notify in your language of choice.",
      "Refactor a nested if/else that chooses a discount rule into a Strategy pattern.",
      "Write a Factory function that returns different Shape objects based on a string input.",
      "Explain, without code, why Singleton makes unit tests harder to write and how DI fixes it.",
      "Identify one pattern used inside a framework you already use (e.g. React, Express) and explain which pattern it is.",
    ],
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
    deepDive: [
      "Vertical scaling (bigger CPU/RAM on one box) is simple but hits a hard ceiling and remains a single point of failure; horizontal scaling (more boxes) has no practical ceiling and survives individual node failure, but only works if the application tier can run identically on any node — which requires the app to be stateless, pushing session data, uploaded files, and cached state out to shared stores (Redis, S3, a database) rather than keeping them in a server's local memory or disk.",
      "The load balancer's algorithm choice matters for both fairness and correctness. Round robin is simplest but ignores load differences; least connections adapts better when requests have very different processing times; IP hash sends a given client consistently to the same backend (useful for simple stickiness without a shared session store, but it clusters unevenly if client IPs aren't evenly distributed, e.g. behind a corporate NAT); weighted variants let you send more traffic to more powerful nodes. Layer 4 load balancers work purely on IP/TCP information and are fast but blind to content; layer 7 load balancers understand HTTP and can route by path, header, or cookie, enabling patterns like routing /api to one service and /static to a CDN-backed pool.",
      "Health checks are what make horizontal scaling resilient rather than just distributed: the load balancer periodically probes each backend (a lightweight /health endpoint) and stops sending traffic to any node that fails checks, so a crashed or overloaded instance is automatically removed from rotation without a human intervening. Sticky sessions (routing a client to the same backend based on a cookie) are sometimes used as a shortcut to avoid building shared session storage, but they reintroduce a coupling between client and server that undermines the whole point of scaling out — if that one server dies, that user's session dies with it, and load balancing skews unevenly toward long-lived sessions.",
    ],
    example: {
      title: "Scaling a login service from one server to three behind a load balancer",
      steps: [
        "Start: one app server stores session data in local memory; it becomes a bottleneck under load.",
        "Move session data to a shared Redis store, so any server can read any user's session — this makes the app tier stateless.",
        "Deploy two more identical app server instances behind a layer 7 load balancer using round robin.",
        "Configure a /health endpoint on each instance that checks DB and Redis connectivity; the load balancer polls it every few seconds.",
        "One instance's health check starts failing (e.g. DB connection pool exhausted); the load balancer stops routing traffic to it until it recovers.",
      ],
      result: "Traffic is spread across three servers, any one server can crash or be redeployed without affecting logged-in users, since session state lives in Redis rather than in any one server's memory.",
    },
    mistakes: [
      { mistake: "Scaling horizontally while still storing session/cache state in each server's local memory.", fix: "Externalize shared state to a store like Redis before adding more instances, otherwise different requests from the same user hit different, inconsistent state." },
      { mistake: "Relying on sticky sessions as a permanent fix instead of fixing statelessness.", fix: "Treat sticky sessions as a temporary workaround; the real fix is shared/externalized session storage so any instance can serve any request." },
      { mistake: "Assuming a load balancer alone prevents downtime without health checks.", fix: "Configure real health checks (checking dependencies, not just 'process is running') so unhealthy nodes are actually removed from rotation." },
    ],
    interviewQA: [
      { q: "What is the difference between vertical and horizontal scaling?", a: "Vertical scaling increases the resources (CPU/RAM) of a single machine and hits a hardware ceiling with a single point of failure; horizontal scaling adds more machines and can scale near-linearly, but requires the application to be stateless so any instance can serve any request." },
      { q: "What is the difference between L4 and L7 load balancing?", a: "L4 balances based on IP/TCP information without understanding the application protocol, making it fast but unable to route by content; L7 understands HTTP and can route based on path, header, or cookie, enabling more intelligent routing at some added overhead." },
      { q: "Why are sticky sessions considered an anti-pattern for scalable systems?", a: "They tie a user's session to one specific backend, which defeats the resilience benefit of having multiple backends (that server's failure logs the user out) and can create uneven load distribution; externalizing session state avoids both issues." },
      { q: "How does a load balancer detect and handle an unhealthy backend?", a: "It periodically sends health check requests (often to a dedicated /health endpoint) and stops routing traffic to any backend that fails enough consecutive checks, resuming once it passes checks again." },
    ],
    practice: [
      "Explain the trade-off between round robin and least-connections load balancing algorithms.",
      "Describe how you would migrate a stateful app server's session storage to Redis without downtime.",
      "Design a /health endpoint that checks database and cache connectivity, not just process liveness.",
      "Compare IP hash load balancing's pros and cons for a service used mostly through corporate networks.",
      "Explain why horizontal scaling requires the application layer to be stateless.",
    ],
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
    deepDive: [
      "Caching works because most systems have a small hot set of data accessed far more often than the rest, and every layer closer to the user that can serve that hot set avoids a slower round trip further down the stack. A browser cache avoids a network request entirely; a CDN avoids hitting your origin server; an application cache like Redis avoids a database query; a database's buffer pool avoids a disk read. Each layer trades a little staleness risk for a lot of latency and load reduction, and picking the right layer for a given piece of data is itself a design decision — static assets belong in a CDN, per-user computed results belong in an application cache.",
      "The three classic write patterns handle the read/write trade-off differently. Cache-aside (lazy loading) only populates the cache on a read miss, keeping the cache simple and only holding data that's actually been requested, but the first request after invalidation is always slow and there is a window where cache and DB can briefly disagree. Write-through updates the cache synchronously with every write, keeping it always fresh at the cost of write latency. Write-behind (write-back) acknowledges the write immediately and updates the cache first, flushing to the database asynchronously — fastest writes, but risks data loss if the cache crashes before flushing, so it needs durability safeguards.",
      "Invalidation is famously one of the two hard problems in computer science because a stale cache silently returns wrong data with no error to alert you. Simple strategies use a TTL (data expires automatically after N seconds, bounding staleness but not eliminating it) or explicit invalidation (delete or update the cache key exactly when the underlying data changes). Two dangerous failure modes to know: thundering herd, where a popular key expires and many concurrent requests all miss the cache simultaneously and hammer the database at once (fixed by locking/single-flight or staggered TTLs), and cache stampede after a deploy or cache flush, where the entire cache is cold and every request becomes a DB hit at once (fixed by warming the cache before cutover or using a fallback with jitter).",
    ],
    example: {
      title: "Cache-aside pattern handling a product page read",
      steps: [
        "Request for product 42 arrives; app checks Redis for key 'product:42'.",
        "Cache miss (key not present or expired); app queries the database for product 42.",
        "App stores the result in Redis with a TTL of 300 seconds as key 'product:42'.",
        "The next 300 seconds of requests for product 42 are served directly from Redis without touching the database.",
        "An admin updates product 42's price; the app explicitly deletes the 'product:42' cache key so the next read repopulates fresh data instead of waiting out the stale TTL.",
      ],
      result: "Most reads are served from cache with sub-millisecond latency, and the explicit delete-on-write ensures the price update is visible immediately instead of up to 300 seconds late.",
    },
    mistakes: [
      { mistake: "Caching data with a long TTL and no invalidation-on-write path.", fix: "Explicitly invalidate (delete or update) the cache entry whenever the underlying data changes, using TTL only as a safety net, not the primary freshness mechanism." },
      { mistake: "Not handling a cache miss stampede, letting every concurrent request hit the database when a hot key expires.", fix: "Use a lock/single-flight pattern so only one request repopulates the cache while others wait briefly, or use staggered/jittered TTLs to avoid many keys expiring at the same instant." },
      { mistake: "Assuming a higher cache hit ratio is always better regardless of what's cached.", fix: "A high hit ratio on unimportant data doesn't help; measure hit ratio alongside the actual latency/load reduction it provides on your hottest, most expensive queries." },
    ],
    interviewQA: [
      { q: "What is the difference between cache-aside, write-through, and write-behind?", a: "Cache-aside only populates the cache on a read miss, leaving the app to manage cache population; write-through writes to cache and DB synchronously on every write, keeping the cache always fresh at some write latency cost; write-behind writes to cache first and flushes to the DB asynchronously, giving the fastest writes but risking data loss if the cache fails before flushing." },
      { q: "What causes a thundering herd and how do you prevent it?", a: "A popular cache key expires and many concurrent requests miss the cache at the same instant, all hitting the database simultaneously; prevent it with a lock so only one request repopulates the cache while others wait, or by staggering TTLs with jitter." },
      { q: "How would you invalidate a cache when the underlying data changes?", a: "Delete or update the specific cache key as part of the same write transaction/operation that changes the database, rather than relying solely on TTL expiry, so stale data isn't served for the remainder of the TTL window." },
      { q: "What eviction policy would you choose for a cache with limited memory, and why?", a: "LRU is a good general default because it evicts the least recently used item, matching the common pattern that recently accessed data is likely to be accessed again soon; LFU is better when access frequency matters more than recency (e.g. some items are consistently popular over long periods)." },
    ],
    practice: [
      "Implement a simple cache-aside function in pseudocode with a TTL.",
      "Explain the trade-off between write-through and write-behind caching for a high-write system like a counter service.",
      "Describe how you'd prevent a thundering herd on a very popular product page's cache key.",
      "Compare LRU vs LFU eviction with a concrete example where each would perform better.",
      "Explain why a CDN cache and an application-level Redis cache solve different problems even though both are 'caching'.",
    ],
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
    deepDive: [
      "Replication and sharding solve different problems and are often used together. Replication copies the entire dataset to multiple nodes so you can survive a node failure (failover) and spread read traffic across replicas, but every replica still holds all the data, so replication does not help once your dataset or write throughput outgrows a single machine. The classic primary-replica setup routes all writes to one primary (to keep a single source of truth and avoid write conflicts) and lets replicas serve reads, at the cost of replication lag — replicas are eventually consistent with the primary, so a read immediately after a write on a different connection might not see that write yet, which is a common source of confusing bugs like 'I just saved this but it's not showing up.'",
      "Sharding, by contrast, splits the dataset itself so each node holds only a slice, which is what lets you scale storage and write throughput beyond one machine's limits. The shard key choice has real consequences: hash-based sharding (hash(key) % N) spreads data evenly and avoids hotspots, but makes range queries (e.g. 'all users created this month') expensive because they must fan out to every shard; range-based sharding (A-M on shard1, N-Z on shard2) makes range scans efficient on one shard but risks hotspots if data or access is not uniformly distributed across the key range (e.g. all new signups landing on the same shard). Directory-based sharding adds a lookup service mapping keys to shards explicitly, offering flexibility at the cost of that lookup being a potential bottleneck or single point of failure.",
      "The price of sharding is that operations spanning shards become hard: a join across two shards, or a transaction that must atomically update rows on two different shards, requires distributed coordination (two-phase commit, sagas) that is slower and more failure-prone than a local transaction. This is why schema design for sharded systems tries hard to keep related data (e.g. a user and their own orders) on the same shard, so most queries stay single-shard. Consistent hashing solves a separate but related pain: with plain hash(key) % N, adding or removing a shard changes almost every key's mapping, forcing a massive data reshuffle; consistent hashing arranges shards and keys on a ring so adding/removing one shard only remaps roughly 1/N of the keys, making rebalancing far cheaper.",
    ],
    example: {
      title: "Adding a replica and later sharding a growing user table",
      steps: [
        "Start: one database handles both reads and writes; read load grows until CPU is maxed.",
        "Add a read replica that continuously applies the primary's write-ahead log; route read-only queries (e.g. profile views) to the replica, keeping writes on the primary.",
        "Over time the users table itself grows too large for one machine's storage/write throughput even with replicas.",
        "Choose a shard key (user_id) and hash it into 4 shards: shard_id = hash(user_id) % 4.",
        "Migrate data so each shard holds roughly a quarter of users; the application now routes each query to the correct shard based on the hashed user_id.",
      ],
      result: "Read load is spread across replicas, and once storage/write limits are hit, sharding lets the system scale further by distributing both storage and write throughput across 4 independent database nodes.",
    },
    mistakes: [
      { mistake: "Reading immediately after writing from a replica and being surprised the data isn't there.", fix: "Understand replication lag; read your own writes from the primary (or a replica guaranteed to be caught up) when immediate consistency is required." },
      { mistake: "Choosing a shard key that creates hotspots, like sharding by signup date when most traffic is for recent users.", fix: "Pick a shard key that distributes both data and access load evenly, often a hashed user or entity ID rather than a naturally skewed field like date." },
      { mistake: "Designing a schema that frequently needs cross-shard joins or transactions.", fix: "Co-locate related data (e.g. a user and their orders) on the same shard so most queries stay within one shard, avoiding expensive distributed joins/transactions." },
    ],
    interviewQA: [
      { q: "What is the difference between replication and sharding?", a: "Replication copies the full dataset to multiple nodes for redundancy and read scaling, while sharding splits the dataset into slices across nodes so no single node needs to hold or process all the data, scaling storage and write throughput." },
      { q: "What is replication lag and why does it matter?", a: "It's the delay between a write being committed on the primary and that write being visible on a replica; it matters because reads from replicas can return stale data during that window, which can confuse users or break logic that assumes immediate consistency." },
      { q: "Compare hash-based and range-based sharding.", a: "Hash-based sharding spreads data evenly and avoids hotspots but makes range queries expensive because they must query every shard; range-based sharding makes range scans efficient on one shard but risks uneven load if access patterns are skewed within the key range." },
      { q: "Why is consistent hashing preferred over simple modulo hashing for sharding?", a: "With hash(key) % N, adding or removing a shard changes N and remaps almost every key, forcing a huge data migration; consistent hashing places shards and keys on a ring so changing the number of shards only remaps about 1/N of the keys, making rebalancing much cheaper." },
    ],
    practice: [
      "Explain why a read immediately after a write can return stale data in a replicated system.",
      "Design a shard key for a multi-tenant SaaS app storing each company's data, and justify your choice.",
      "Compare the cost of a cross-shard join versus a single-shard join in a sharded orders table.",
      "Explain how consistent hashing reduces data movement when a shard is added.",
      "Describe a scenario where you would add replicas first and only shard later.",
    ],
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
    deepDive: [
      "CAP theorem is frequently misstated as 'pick any two of Consistency, Availability, Partition tolerance', but in any real distributed system spanning more than one node, network partitions will eventually happen, so partition tolerance is not really optional — the real choice CAP forces is what to do during a partition: stay Consistent by rejecting or blocking requests that can't be safely answered (CP), or stay Available by answering anyway, possibly with stale or conflicting data (AP). Outside of a partition, a well-designed system can actually offer both consistency and availability simultaneously, which is a nuance the simplistic 'pick two' phrasing misses.",
      "Consistency here has a specific distributed-systems meaning distinct from the C in ACID. Strong consistency means any read after a write is guaranteed to see that write (or a later one) everywhere in the system, which typically requires coordination (like waiting for a quorum of replicas to acknowledge) and therefore costs latency. Eventual consistency means replicas will converge to the same value given enough time with no new writes, but a read shortly after a write might return stale data — acceptable for things like social media likes or view counts, unacceptable for a bank balance shown right after a withdrawal.",
      "PACELC is a more complete framework: it says that even without a Partition, there is still a tradeoff between Latency and Consistency (ELC) — a system can wait for full replica agreement (high consistency, higher latency) or respond as soon as one node has the data (low latency, weaker consistency). Quorum-based systems make this tunable per operation: with N replicas, if you require W replicas to acknowledge a write and R replicas to agree on a read, and R + W > N, you are mathematically guaranteed the read set and write set overlap on at least one replica, giving strong reads even in a system that is eventually consistent by default; lowering R or W trades that guarantee for lower latency.",
    ],
    example: {
      title: "Choosing quorum settings for a 3-replica system",
      steps: [
        "System has N=3 replicas of each piece of data.",
        "For strong reads, choose W=2 and R=2 so W+R=4 > N=3, guaranteeing any read quorum overlaps with any write quorum on at least one replica.",
        "A write succeeds once 2 of 3 replicas acknowledge it; the third may lag briefly.",
        "A read queries 2 of 3 replicas and takes the most recent value among them, guaranteed to include at least one replica that has the latest acknowledged write.",
        "If the team instead sets W=1, R=1 for lower latency, writes and reads are faster but a read might hit the one replica that hasn't received the latest write yet, becoming eventually consistent instead of strongly consistent.",
      ],
      result: "With W=2, R=2 the system trades a bit of latency for a mathematical guarantee of strong reads; with W=1, R=1 it trades that guarantee for lower latency and eventual consistency.",
    },
    mistakes: [
      { mistake: "Saying a system 'chooses 2 of 3' from CAP as if partition tolerance were optional.", fix: "In real distributed systems, network partitions will happen, so the real design choice is CP vs AP behaviour during a partition, not whether to tolerate partitions at all." },
      { mistake: "Assuming eventual consistency means data is wrong or unreliable.", fix: "Eventual consistency guarantees convergence given no new writes; it is a deliberate, appropriate trade-off for systems where slightly stale reads are acceptable in exchange for higher availability and lower latency." },
      { mistake: "Forgetting that consistency/availability trade-offs exist even without a partition.", fix: "Use PACELC: even in the normal case (no partition), there is still a latency vs consistency trade-off depending on how much replica coordination a read/write waits for." },
    ],
    interviewQA: [
      { q: "Explain CAP theorem and why 'pick any two' is a common misconception.", a: "CAP says that during a network partition you must choose between consistency (reject/delay requests to stay correct) and availability (answer anyway, possibly stale); it's a misconception because partition tolerance isn't really optional in a real distributed system, so the practical choice is CP vs AP during a partition, not freely picking any two of the three." },
      { q: "What is the difference between strong and eventual consistency, with an example of when each is appropriate?", a: "Strong consistency guarantees a read always reflects the latest acknowledged write, appropriate for a bank balance; eventual consistency guarantees convergence over time but may return stale data briefly, appropriate for a social media like counter where slight staleness is harmless." },
      { q: "What does the quorum condition R + W > N guarantee?", a: "It guarantees that any set of R replicas read from and any set of W replicas written to must overlap in at least one replica, so a read is guaranteed to see the most recent acknowledged write, giving strong consistency without needing all N replicas to participate in every operation." },
      { q: "How does PACELC extend CAP theorem?", a: "It adds that even when there is no partition (P), a system still has to trade off Latency versus Consistency (ELC) — waiting for more replicas to agree improves consistency but increases latency, and this trade-off exists independently of the partition-time CP/AP choice." },
    ],
    practice: [
      "Explain, in your own words, why partition tolerance is not really an optional third choice in CAP.",
      "Give one real system that is CP and one that is AP, with justification.",
      "Compute whether R=1, W=2, N=3 satisfies the strong-read quorum condition.",
      "Explain a scenario where eventual consistency is completely acceptable to end users.",
      "Describe how PACELC differs from CAP in your own words with an example.",
    ],
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
    deepDive: [
      "The core value of a message queue is decoupling in both time and load: the producer does not need the consumer to be available right now, and it does not need to wait for the consumer to finish slow work before responding to the original caller. This is why a POST /order endpoint can enqueue an order_created event and return 202 Accepted immediately, while a background worker handles sending confirmation emails, generating invoices, and updating a search index — the user gets a fast response and slow, non-critical work happens asynchronously without blocking them.",
      "The distinction between a queue and a pub/sub topic is about fan-out. A traditional queue delivers each message to exactly one consumer within a consumer group (useful for distributing work items across a pool of workers, e.g. resizing uploaded images); a pub/sub topic delivers each message to every subscribed consumer group independently (useful when multiple unrelated systems need to react to the same event, e.g. 'order placed' triggering both an email service and an analytics pipeline). Kafka blurs this by keeping an ordered, durable, replayable log per partition — multiple consumer groups can each read the same log independently at their own pace, and a new consumer can replay history, which neither a classic queue nor a simple pub/sub system typically offers.",
      "Delivery guarantees are a real design decision, not a solved problem to ignore. At-most-once means a message might be lost but is never processed twice (fire and forget); at-least-once means a message will eventually be processed but might be delivered more than once (e.g. after a consumer crashes mid-processing before acknowledging), which is the most common real-world default and requires consumers to be idempotent — processing the same message twice should have the same effect as processing it once (e.g. by checking if an order ID was already handled before applying it again). Exactly-once delivery is theoretically the most convenient but requires careful coordination (transactional writes tying the consume-offset-commit and the side effect together) and is expensive or sometimes practically approximated rather than truly guaranteed. Dead-letter queues catch messages that fail processing repeatedly, so a single poison message doesn't block the whole queue or get silently dropped — it is diverted for manual inspection or later reprocessing.",
    ],
    example: {
      title: "Processing an order asynchronously with idempotent consumers",
      steps: [
        "User submits an order; the API validates it, writes it to the database, enqueues an order_created message with a unique order_id, and immediately returns 202 Accepted.",
        "A worker consumer picks up the message and starts sending a confirmation email.",
        "The worker crashes after sending the email but before acknowledging the message.",
        "Because the message was not acknowledged, the queue redelivers it to another worker (at-least-once delivery).",
        "The second worker checks 'has order_id X already had its email sent?' before sending again, avoiding a duplicate email despite the redelivery.",
      ],
      result: "The order is processed reliably even after a worker crash, and the idempotency check prevents the customer from receiving two confirmation emails.",
    },
    mistakes: [
      { mistake: "Writing consumers that assume a message will only ever be delivered exactly once.", fix: "Design consumers to be idempotent (e.g. check a processed-order-ids table) since most real systems use at-least-once delivery by default." },
      { mistake: "Letting one repeatedly failing message block the entire queue indefinitely.", fix: "Configure a retry limit and a dead-letter queue so poison messages are diverted for manual handling instead of stalling all processing." },
      { mistake: "Using a plain queue when multiple independent systems need to react to the same event.", fix: "Use a pub/sub topic (or Kafka with multiple consumer groups) so every interested system gets its own copy of each message, instead of one queue where only one consumer wins each message." },
    ],
    interviewQA: [
      { q: "What problem does a message queue solve that a direct API call doesn't?", a: "It decouples the producer from the consumer in both time and availability, letting the producer respond quickly while slow or unreliable downstream work happens asynchronously, and it naturally absorbs traffic spikes by buffering work in the queue instead of overwhelming downstream services." },
      { q: "What is the difference between at-least-once and exactly-once delivery, and why is at-least-once more common?", a: "At-least-once guarantees a message is eventually processed but may be delivered more than once; exactly-once guarantees single processing but requires expensive coordination between message consumption and side effects, so at-least-once combined with idempotent consumers is the more common, cheaper real-world approach." },
      { q: "What is a dead-letter queue and why is it needed?", a: "It's a separate queue where messages that repeatedly fail processing are diverted after a retry limit, preventing one bad message from blocking the main queue indefinitely and giving engineers a place to inspect and manually resolve failures." },
      { q: "How does Kafka differ from a traditional message queue like a simple task queue?", a: "Kafka retains an ordered, durable, replayable log per partition that multiple independent consumer groups can read at their own pace and even replay from an earlier offset, whereas a traditional queue typically removes a message once it's been consumed and delivered to one consumer." },
    ],
    practice: [
      "Design an idempotency check for a payment-processing consumer that might receive the same message twice.",
      "Explain the difference between a queue and a pub/sub topic with a real example of each.",
      "Describe when you would configure a dead-letter queue and what you'd do with messages that land there.",
      "Compare at-most-once, at-least-once, and exactly-once delivery with a one-line trade-off for each.",
      "Explain why Kafka's replay capability is useful for adding a brand-new consumer to an existing system.",
    ],
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
    deepDive: [
      "Good REST API design treats URLs as nouns identifying resources (/orders/123) and HTTP methods as the verbs acting on them (GET to read, POST to create, PUT/PATCH to update, DELETE to remove), which makes the API predictable to any client without reading custom documentation for every endpoint. Versioning (e.g. /v1/orders) exists because APIs inevitably need breaking changes over time, and putting the version in the URL (or a header) lets old clients keep working against v1 while new clients adopt v2, rather than breaking everyone simultaneously.",
      "Pagination matters once a collection grows large or changes frequently. Offset-based pagination (page=3&limit=20) is simple but breaks under concurrent writes — if an item is inserted before page 3 is fetched, the same item can appear twice or be skipped across pages. Cursor-based pagination instead returns an opaque pointer (often an encoded last-seen ID or timestamp) marking where the next page should start, which stays correct even as the underlying data changes, at the cost of not supporting 'jump to page 10' directly.",
      "Rate limiting protects a service from being overwhelmed by one client, whether malicious or just buggy. Fixed window (e.g. 100 requests per minute clock-aligned) is simple but allows a burst of 2x the limit right at the window boundary; sliding window smooths this out by considering a rolling time range; token bucket allows controlled bursts (tokens accumulate up to a capacity and are spent per request, refilling at a steady rate) which is a common practical default because it tolerates occasional bursts while capping the sustained average rate; leaky bucket instead smooths output to a strictly constant rate regardless of burst input. Whichever algorithm is used, a well-designed API communicates its state via headers (X-RateLimit-Remaining) and responds 429 with a Retry-After header so well-behaved clients back off correctly instead of hammering the server harder. Idempotency keys solve a related but different problem: if a client's request to create an order times out and it retries, an idempotency key lets the server recognize 'this exact request was already processed' and return the original result instead of creating a duplicate order.",
    ],
    example: {
      title: "Designing rate limiting with a token bucket for a public API",
      steps: [
        "Configure each API key with a bucket capacity of 5 tokens and a refill rate of 1 token per second.",
        "Client sends 5 requests in quick succession; each consumes one token, emptying the bucket, and all 5 succeed (a legitimate burst is allowed).",
        "A 6th request arrives immediately after; the bucket is empty, so the server returns 429 Too Many Requests with Retry-After: 1.",
        "One second passes and the bucket refills by 1 token; the next request now succeeds.",
        "Sustained traffic above 1 request/second will keep hitting 429s because the refill rate caps the long-run average, even though short bursts up to 5 requests are tolerated.",
      ],
      result: "Clients can burst briefly (helpful for legitimate spiky usage) while the sustained average rate is capped, protecting the backend from being overwhelmed.",
    },
    mistakes: [
      { mistake: "Using offset-based pagination for a frequently-changing dataset and getting duplicate or missing items across pages.", fix: "Use cursor-based pagination keyed off a stable, ordered field so results remain correct even as new items are inserted concurrently." },
      { mistake: "Making POST endpoints non-idempotent, so a client's network retry after a timeout creates duplicate resources.", fix: "Accept an idempotency key from the client and store which keys have already been processed, returning the original result on a repeat request instead of creating a duplicate." },
      { mistake: "Returning 429 with no Retry-After header, leaving clients to guess when to retry.", fix: "Always include Retry-After (and ideally X-RateLimit-Remaining/Reset headers) so well-behaved clients back off for the correct duration." },
    ],
    interviewQA: [
      { q: "Why is cursor-based pagination generally preferred over offset-based pagination for large datasets?", a: "Offset-based pagination can skip or duplicate items when the underlying data changes between page fetches, because 'offset 40' shifts meaning as rows are inserted/deleted; cursor-based pagination anchors to a specific, stable position (like the last seen ID) so results stay consistent even under concurrent writes." },
      { q: "Compare fixed window, sliding window, and token bucket rate limiting.", a: "Fixed window is simple but allows a burst of up to 2x the limit at window boundaries; sliding window smooths this by evaluating a rolling time range; token bucket allows controlled short bursts up to a capacity while capping the long-run average rate via a steady refill, which is often the best practical balance." },
      { q: "How do idempotency keys prevent duplicate resource creation?", a: "The client generates a unique key per logical request and sends it with the request; the server records which keys have been processed and, if the same key arrives again (e.g. due to a client retry after a timeout), returns the original response instead of performing the action again." },
      { q: "Why should an API version be included in the URL or headers?", a: "APIs inevitably need breaking changes; versioning lets existing clients keep working against the version they were built for while new clients can adopt a newer version, avoiding a hard break for everyone at once." },
    ],
    practice: [
      "Design a REST API for a bookstore with proper nouns, verbs, and status codes for create/read/update/delete/list operations.",
      "Implement a token bucket rate limiter in pseudocode with capacity and refill rate as parameters.",
      "Explain why offset pagination can show duplicate results when items are being inserted concurrently.",
      "Design an idempotency-key mechanism for a payment API endpoint.",
      "Write example response headers you would return alongside a 429 status code.",
    ],
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
 i \\ j 0 1 2 3      lookup "need" in O(1)
   0   . X X X       |
   1   . . X X       v
   2   . . . X     found pair in one pass`,
    deepDive: [
      "Two Sum is small enough to solve in a few minutes but it teaches a pattern used constantly in system design: trade memory for time by maintaining an auxiliary index while you scan. The brute-force nested loop checks every pair, redoing work because it forgets what it has already seen; the hash-map solution instead remembers every value it has passed as {value: index}, so checking 'have I seen the complement already?' becomes an O(1) lookup instead of an O(n) inner scan. This exact idea — keep a fast lookup structure so you never rescan raw data — is the same reasoning behind database indexes (avoid a full table scan) and caches (avoid recomputing or re-fetching).",
      "The two-pointer variant only works if the array is sorted (or you sort it first, paying O(n log n) but then using O(1) extra space): with pointers at both ends, if the sum is too small you move the left pointer right (increase sum), if too large you move the right pointer left (decrease sum), converging in O(n) additional steps after the sort. This shows a recurring trade-off table: brute force is O(n^2) time and O(1) space; hash map is O(n) time and O(n) space; sorted + two pointers is O(n log n) time (dominated by the sort) and O(1) extra space if sorting in place — the 'best' answer depends on whether the array is already sorted and whether extra memory is a constraint.",
      "Interviewers escalate Two Sum specifically to test whether you can generalize a pattern rather than memorize a solution. Returning all pairs (not just one) requires handling duplicate values carefully so you don't double-count or miss pairs; Three Sum extends the two-pointer idea by fixing one element and doing two-sum-on-sorted-array for the rest, which is O(n^2) overall; Two Sum on a stream (numbers arriving one at a time, unknown in advance) forces you to realize the hash-map approach is the only one that naturally extends, since you can't sort or two-pointer a stream you haven't fully seen yet — this connects directly to system design intuition about designing structures for data you receive incrementally.",
    ],
    example: {
      title: "Dry run of hash map Two Sum on [3, 2, 4], target 6",
      steps: [
        "i=0, a[0]=3, need = 6-3 = 3, map is empty so not found, store {3:0}.",
        "i=1, a[1]=2, need = 6-2 = 4, map has {3:0}, 4 not found, store {3:0, 2:1}.",
        "i=2, a[2]=4, need = 6-4 = 2, map has {3:0, 2:1}, 2 IS found at index 1.",
        "Return [1, 2] as the pair of indices.",
      ],
      result: "a[1] + a[2] = 2 + 4 = 6, confirming the correct pair was found in a single O(n) pass without any nested loop.",
    },
    mistakes: [
      { mistake: "Checking the map for the current element's own value before storing it, accidentally matching an element with itself.", fix: "Compute 'need' first, check the map, and only insert the current element into the map afterward, so an element never pairs with itself unless it genuinely appears twice." },
      { mistake: "Using the sorted two-pointer approach when the problem requires original indices, then losing track of them after sorting.", fix: "If original indices are required, sort a list of (value, originalIndex) pairs, not the raw array, so indices survive the sort." },
      { mistake: "Assuming the hash map approach generalizes trivially to Three Sum with the same time complexity.", fix: "Three Sum is typically solved by sorting first and fixing one element, then two-pointer on the rest, giving O(n^2) total — not O(n) — because you must consider every choice of the fixed element." },
    ],
    interviewQA: [
      { q: "Why is the hash map approach to Two Sum O(n) instead of O(n^2)?", a: "Because checking whether the complement of the current element has already been seen is an O(1) hash map lookup, replacing what would otherwise be an O(n) inner loop scanning the rest of the array for every element." },
      { q: "When would you prefer the two-pointer approach over the hash map approach?", a: "When the array is already sorted, or when extra O(n) space is not acceptable, since two-pointer uses only O(1) extra space (aside from the O(n log n) sort cost if it isn't already sorted)." },
      { q: "How would you extend this approach to Three Sum?", a: "Sort the array, then for each element fix it and run the two-pointer Two Sum technique on the remaining sorted subarray to find pairs that sum to (target - fixed element), giving O(n^2) overall while carefully skipping duplicate values to avoid duplicate triplets." },
      { q: "How is the Two Sum hash-map trick similar to a database index or cache in system design?", a: "Both maintain an auxiliary fast-lookup structure built incrementally so future queries don't need to rescan the raw underlying data; a DB index avoids a full table scan and a cache avoids recomputation, exactly like the hash map avoids an O(n) rescan for each element." },
    ],
    practice: [
      "Implement Two Sum with a hash map and dry run it on [1, 5, 3, 7] target 8.",
      "Implement Two Sum on a sorted array using two pointers and compare time/space complexity to the hash map version.",
      "Extend your Two Sum solution to return all unique pairs, handling duplicate values correctly.",
      "Solve Three Sum using the sort-plus-two-pointer approach and explain its time complexity.",
      "Design a TwoSum class supporting add(number) and find(target) calls one at a time, as if numbers arrive on a stream.",
    ],
  },
};
