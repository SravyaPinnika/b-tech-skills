import type { TopicMap } from "../topicContent";

export const languageTopics: TopicMap = {
  "Memory model & references vs values": {
    summary:
      "Value types are copied when assigned; reference types copy only the handle, so two names point at one object. Knowing which is which explains most 'why did my data change?' bugs.",
    keyPoints: [
      "Primitives (int, float, bool) are values; objects, arrays and collections are references.",
      "Python passes object references by value — rebinding a parameter does not affect the caller.",
      "Stack holds frames and value data; heap holds objects until unreachable.",
      "Copy explicitly (copy.deepcopy, clone, new Vector<>(old)) when you need independence.",
    ],
    syntax: {
      lang: "python",
      code: "a = [1, 2]\nb = a        # same object\nb.append(3)  # a is now [1, 2, 3]\nc = a[:]     # shallow copy -> independent list",
    },
    diagram: `STACK                 HEAP
+---------+           +-------------+
| a  ---> |---------> | [1, 2, 3]   |
| b  ---> |----------->             |
| c  ---> |---------> | [1, 2]      |
+---------+           +-------------+`,
    deepDive: [
      "Every language draws the value/reference line somewhere, and the exact placement changes how you reason about function calls. In C, everything is a value including structs, so passing a struct copies the whole thing unless you pass a pointer. In Java, primitives (int, boolean, double) are values while every object — including arrays and boxed types like Integer — is a reference; there is no way to pass an object 'by value' short of copying it yourself. Python goes further: every name is a reference to an object, and 'variables' are just labels in a namespace dictionary pointing at objects on the heap; even integers are objects, just immutable ones, so rebinding never mutates the original.",
      "This is why 'pass by reference vs pass by value' is a slightly misleading debate in languages like Python, Java, and JavaScript. What actually happens is 'pass by value of the reference' — the reference itself (the pointer/handle) is copied into the parameter, so reassigning the parameter to a new object does not affect the caller's variable, but mutating the object through the parameter is visible to the caller because both names point at the same heap object. This single fact resolves the classic interview trip-up: appending to a list parameter changes the caller's list, but reassigning the parameter to a new list does not.",
      "Shallow vs deep copy is the next layer. A shallow copy (list(a), a[:], Object.assign({}, obj), a struct's default copy constructor) duplicates the top-level container but still shares any nested reference types, so mutating a nested list inside a 'copied' object still affects the original. A deep copy recursively duplicates everything reachable, at the cost of time and memory. Interviewers often probe this with a nested list or a dict-of-lists to see if you know the difference.",
      "Understanding stack vs heap also explains lifetime and performance. Stack frames are cheap to allocate and automatically reclaimed when a function returns, which is why local primitives are fast. Heap objects live until nothing references them, which is where garbage collection (Python's reference counting plus cycle collector, Java's generational GC) or manual memory management (C/C++ malloc/free, RAII) comes in — and why keeping a reference alive longer than intended (a growing cache, a closure capturing a large object) is a common source of memory leaks even in garbage-collected languages.",
    ],
    example: {
      title: "Dry-run: mutation vs reassignment inside a function",
      steps: [
        "Start: nums = [1, 2, 3] in the caller's scope; nums points to a heap list object L1.",
        "Call add_and_replace(nums).",
        "Inside the function, parameter n is a new reference also pointing at L1 (reference copied by value).",
        "n.append(4) mutates L1 in place — L1 is now [1, 2, 3, 4]; since nums also points at L1, the caller sees the change.",
        "n = [9, 9] rebinds n to a brand-new list object L2; this does NOT touch L1 or the caller's nums.",
        "Function returns; caller's nums still points at L1.",
      ],
      result: "print(nums) shows [1, 2, 3, 4] — the append was visible, the reassignment inside the function was not.",
    },
    mistakes: [
      { mistake: "Assuming `b = a` for a list/dict creates an independent copy in Python or a similar object in JS.", fix: "Use a[:], list(a), copy.deepcopy(a), or the spread operator [...a] / {...obj} when you need a separate object, and understand whether a shallow copy is enough." },
      { mistake: "Believing that mutating a function parameter never affects the caller because 'Python passes by value'.", fix: "Remember that the value being copied is the reference itself; mutation through that reference is visible, reassignment is not." },
      { mistake: "Using a mutable default argument (def f(items=[])) expecting a fresh list each call.", fix: "Default arguments are evaluated once at function definition time; use None as the default and create the list inside the function body." },
      { mistake: "Comparing objects with == when reference equality (is / ==) versus value equality was intended, or vice versa.", fix: "Know your language's distinction: Python's == calls __eq__ for value equality while is checks identity; Java's == on objects checks reference identity, use .equals() for value equality." },
    ],
    interviewQA: [
      { q: "Why doesn't reassigning a parameter inside a function change the caller's variable, even in a 'pass by reference' language like Python?", a: "The reference is copied into the parameter, not shared as an alias. Reassigning the parameter points it at a new object, leaving the caller's original reference untouched. Only mutating the object the reference points to is visible outside the function." },
      { q: "What is the difference between a shallow copy and a deep copy?", a: "A shallow copy duplicates the outer container but keeps the same nested object references, so mutating a nested object affects both copies. A deep copy recursively duplicates every nested object so the two structures share nothing and are fully independent." },
      { q: "Where do stack and heap allocations differ in lifetime and cost?", a: "Stack frames are allocated and freed automatically as functions are called and return, making them fast and predictable; they hold value data and local references. Heap objects persist as long as something references them and are reclaimed by garbage collection or manual free, making allocation more flexible but slower and requiring lifetime management." },
      { q: "Give an example where forgetting reference semantics causes a real bug.", a: "Storing the same list object in multiple dictionary entries as a 'default' (e.g. defaultdict populated from one shared list) means mutating one entry mutates all of them, because they all reference the same underlying object instead of independent copies." },
    ],
    practice: [
      "Write a function that takes a list, appends to it, then reassigns it, and predict/verify what the caller sees before running it.",
      "Implement a deep copy for a nested list-of-dicts structure without using a library, to understand recursion over references.",
      "In your primary language, write a small program that demonstrates the mutable-default-argument bug and then fix it.",
      "Explain out loud (or write) why Java's String is technically a reference type but behaves like a value type for equality purposes.",
    ],
  },

  "OOP implementation in your language": {
    summary:
      "Objects bundle state with behaviour. Classes define the template; inheritance shares behaviour; polymorphism lets one call site work with many types.",
    keyPoints: [
      "Four pillars: encapsulation, abstraction, inheritance, polymorphism.",
      "Prefer composition over deep inheritance chains.",
      "Override resolution is dynamic (virtual/vtable in C++, always dynamic in Java/Python).",
      "Python has no true private members — `_name` is convention, `__name` is name-mangled.",
    ],
    syntax: {
      lang: "python",
      code: "class Shape:\n    def area(self): raise NotImplementedError\n\nclass Circle(Shape):\n    def __init__(self, r): self.r = r\n    def area(self): return 3.14159 * self.r ** 2",
    },
    diagram: `        Shape (abstract)
        area()
          ^
    +-----+------+
    |            |
  Circle       Square
  area()       area()

shapes = [Circle(2), Square(3)]
for s in shapes: s.area()   <- one call, many bodies`,
    deepDive: [
      "Encapsulation is about hiding implementation details behind a stable interface, not just about access modifiers. A well-encapsulated class lets you change its internal representation (say, switching a list to a set for performance) without breaking any caller, because callers only ever interact through public methods. Abstraction is the sibling idea at a higher level: it defines what an object can do (an interface or abstract base class) separately from how it does it, which is what lets a payment service depend on a Payment interface without caring whether the concrete implementation is Stripe or PayPal.",
      "Inheritance models an 'is-a' relationship and its main value is code reuse plus polymorphic substitution — a Circle 'is-a' Shape and can be used anywhere a Shape is expected (the Liskov Substitution Principle). But deep inheritance hierarchies become brittle: a change in a base class can ripple unpredictably through many subclasses, and multiple inheritance introduces ambiguity (the diamond problem) that languages resolve differently — C++ requires virtual inheritance to avoid duplicate base subobjects, Java disallows multiple class inheritance and instead allows multiple interface implementation, Python uses the C3 linearization (MRO) to pick a deterministic method resolution order.",
      "Composition models a 'has-a' relationship: instead of a Car inheriting from Engine, a Car holds an Engine instance and delegates to it. This is favoured in modern design because it is more flexible — you can swap the Engine implementation at runtime, and you avoid coupling unrelated behaviours together just because they happened to share a superclass. 'Favor composition over inheritance' is one of the most quoted principles in OOP design interviews and pairs naturally with dependency injection.",
      "Polymorphism has two flavours worth distinguishing: runtime (dynamic) polymorphism via method overriding and virtual dispatch, and compile-time (static) polymorphism via method overloading or generics/templates. Dynamic dispatch is implemented differently per language — C++ needs the virtual keyword and uses a vtable lookup per call (with a small runtime cost), while Java and Python always dispatch dynamically for instance methods. Interviewers like to ask what happens when you call an overridden method from inside a base class constructor, because the answer (the subclass's override runs, sometimes before the subclass's own fields are initialized) exposes subtle bugs.",
    ],
    example: {
      title: "Dry-run: polymorphic dispatch over a list of shapes",
      steps: [
        "Define abstract Shape with method area() that raises NotImplementedError.",
        "Define Circle(Shape) with r=2, overriding area() to return pi * r^2.",
        "Define Square(Shape) with side=3, overriding area() to return side^2.",
        "Build shapes = [Circle(2), Square(3)].",
        "Loop: for s in shapes: print(s.area()) — each iteration looks up area() on the object's actual runtime type, not the declared Shape type.",
        "First iteration resolves to Circle.area() -> 12.566; second resolves to Square.area() -> 9.",
      ],
      result: "The same call site s.area() produces two different computations because dispatch is resolved dynamically based on each object's concrete class.",
    },
    mistakes: [
      { mistake: "Building a deep inheritance chain (Animal -> Mammal -> Pet -> Dog -> ServiceDog) to reuse a bit of code at each level.", fix: "Reach for composition or mixins/interfaces first; reserve inheritance for genuine is-a relationships that also satisfy Liskov substitution." },
      { mistake: "Assuming Python's `__name` double-underscore attributes are truly private.", fix: "Understand it is name-mangled to _ClassName__name to avoid accidental subclass collisions, not enforced privacy — it is still accessible if you know the mangled name." },
      { mistake: "Calling an overridable method from a base class constructor and expecting the base implementation to run.", fix: "Know that in Python and Java the override runs even during base construction, which can operate on not-yet-initialized subclass state; avoid virtual calls in constructors." },
      { mistake: "Confusing method overloading (same name, different parameters, resolved at compile time) with method overriding (same signature, subclass replaces behavior, resolved at runtime).", fix: "State clearly: overloading is static/compile-time polymorphism; overriding is dynamic/runtime polymorphism, and Python doesn't support true overloading by signature at all." },
    ],
    interviewQA: [
      { q: "What are the four pillars of OOP and can you give a one-line example of each?", a: "Encapsulation: a BankAccount hides its balance field and only exposes deposit()/withdraw(). Abstraction: a Shape interface exposes area() without exposing how each shape computes it. Inheritance: Circle extends Shape to reuse the contract. Polymorphism: calling shape.area() on a list of mixed shape objects runs different code per object." },
      { q: "Why is composition often preferred over inheritance?", a: "Composition is looser coupling: you can change or swap the composed object's behavior at runtime, avoid fragile base class problems where base changes break subclasses, and avoid forcing an is-a relationship where has-a is more accurate, which keeps hierarchies shallow and testable." },
      { q: "Explain the diamond problem and how your language resolves it.", a: "It occurs when a class inherits from two classes that both inherit from a common base, creating ambiguity about which version of a member to use. C++ resolves it with virtual inheritance so only one base subobject exists; Java avoids it by disallowing multiple class inheritance and only allowing multiple interface implementation; Python uses C3 linearization to compute a single deterministic method resolution order." },
      { q: "How does dynamic dispatch work under the hood in a language like C++ or Java?", a: "Each object with virtual/overridable methods carries (conceptually) a pointer to a vtable — a table of function pointers for its class. A call through a base reference looks up the method in the object's actual vtable at runtime, so the correct overridden implementation runs regardless of the static/declared type of the reference." },
    ],
    practice: [
      "Model a small library system with an abstract Media base class and Book/DVD subclasses, then process a mixed list polymorphically.",
      "Refactor an inheritance-heavy toy design (e.g. FlyingDog extends Dog extends Animal) into a composition-based design using capability interfaces.",
      "Write a class in your language with a name-mangled or 'private' attribute and demonstrate how it can (or cannot) be accessed from outside.",
      "Implement operator/method overloading (e.g. a Vector class with __add__ or operator+) and explain why that is static, not dynamic, polymorphism.",
    ],
  },

  "Standard library / STL / collections": {
    summary:
      "The standard library gives you tested containers and algorithms. Interviewers expect you to pick the right container and justify its complexity.",
    keyPoints: [
      "vector/ArrayList: O(1) index, amortised O(1) append, O(n) middle insert.",
      "hash map (unordered_map/HashMap/dict): average O(1) lookup, no ordering.",
      "tree map (map/TreeMap): O(log n) lookup with sorted iteration.",
      "deque for both-end operations; heap/priority_queue for top-k.",
    ],
    syntax: {
      lang: "cpp",
      code: "vector<int> v{3,1,2};\nsort(v.begin(), v.end());\nunordered_map<string,int> freq;\nfreq[\"a\"]++;",
    },
    diagram: `need                     -> container
--------------------------------------
index by position        -> vector / ArrayList
key -> value, fast       -> hash map
key -> value, sorted     -> tree map
push/pop both ends       -> deque
largest k elements       -> heap`,
    deepDive: [
      "Every container is a set of trade-offs between insertion, deletion, lookup, and ordering, and 'which container' questions are really asking whether you understand those trade-offs, not whether you memorized an API. A vector/ArrayList backed by a contiguous resizable array gives cache-friendly O(1) random access and amortized O(1) append at the end (because doubling capacity means the total cost of n appends is O(n), not O(n^2)), but inserting or deleting in the middle is O(n) because every following element must shift.",
      "Hash-based containers (unordered_map, HashMap, Python dict/set) trade ordering for speed: average O(1) insert/lookup/delete by hashing the key into a bucket, but worst case degrades to O(n) if many keys collide into the same bucket (a concern in adversarial inputs or poor hash functions), and iteration order is unspecified (Python dicts happen to preserve insertion order as an implementation detail since 3.7, but that's not true of hash maps generally). Tree-based containers (map/TreeMap, C++'s std::map which is typically a red-black tree) guarantee O(log n) for all operations and give you sorted iteration and range queries (lowerBound/upperBound, floor/ceiling), which a hash map cannot do at all.",
      "Specialized containers solve specific access patterns efficiently: a deque (double-ended queue, usually implemented as a chunked array) supports O(1) push/pop at both ends, which a plain vector cannot do at the front. A heap/priority_queue maintains a partial order so the min or max is always retrievable in O(1) and insert/extract are O(log n) — the standard tool for 'top-k' or 'always process the smallest/largest next' problems (Dijkstra's algorithm, merge k sorted lists, running median with two heaps).",
      "Choosing well also means knowing the constants and memory behavior, not just big-O. A hash map has real per-entry overhead (bucket arrays, tombstones for deletion, potential resizing/rehashing pauses) that can matter for very large datasets, while a sorted array with binary search can outperform a tree map for read-heavy, rarely-mutated data because of cache locality. Interviewers often probe this with 'why not just use a hash map for everything' — the answer is: no ordering, no range queries, and no guaranteed worst-case bound."
    ],
    example: {
      title: "Dry-run: word frequency count with a hash map, then top-3 with a heap",
      steps: [
        "Input words = ['a','b','a','c','b','a'].",
        "Initialize freq = unordered_map<string,int>.",
        "Iterate words, doing freq[w]++ each time: after the loop freq = {a:3, b:2, c:1}.",
        "Push each (count, word) pair into a min-heap of size at most 3.",
        "After pushing a:3, b:2, c:1, the heap has size 3 and is already the answer since there are only 3 distinct words.",
        "Pop all from the heap; they come out in ascending count order: c:1, b:2, a:3.",
        "Reverse to get descending order for the 'top-3 most frequent' result.",
      ],
      result: "Top words by frequency: a(3), b(2), c(1) — computed in O(n) for the hash pass plus O(k log k) for the heap.",
    },
    mistakes: [
      { mistake: "Using a vector/list and calling contains()/index-of inside a loop, silently turning an O(n) algorithm into O(n^2).", fix: "Swap to a hash set/map for membership tests when you do repeated lookups; reserve linear scans for one-off checks." },
      { mistake: "Assuming a hash map preserves insertion or sorted order across all languages.", fix: "Only rely on ordering guarantees the container documents (e.g. Python dict since 3.7 preserves insertion order, but Java's HashMap does not — use LinkedHashMap or TreeMap explicitly)." },
      { mistake: "Inserting into the middle/front of a vector/ArrayList in a hot loop.", fix: "Use a deque or linked list for frequent front insertions, or restructure to append-then-reverse/sort once." },
      { mistake: "Reaching for a full sort (O(n log n)) to find just the top-k elements.", fix: "Use a fixed-size heap of size k for O(n log k), which is faster when k is much smaller than n." },
    ],
    interviewQA: [
      { q: "When would you choose a TreeMap over a HashMap?", a: "When you need sorted iteration, range queries (all keys between X and Y), or floor/ceiling lookups. HashMap is faster on average (O(1) vs O(log n)) but gives no ordering guarantees and no range operations." },
      { q: "Why is appending to a vector amortized O(1) even though resizing is O(n)?", a: "Because the array doubles in capacity when full, resizes happen exponentially less often as the vector grows; summing the cost of all resizes across n appends totals O(n), so the average (amortized) cost per append is O(1), even though any single resizing append is O(n)." },
      { q: "How would you find the k largest elements in a stream of numbers efficiently?", a: "Maintain a min-heap of size k. For each new number, if the heap has fewer than k elements push it; otherwise compare to the heap's minimum and replace only if the new number is larger. This costs O(log k) per element and O(n log k) overall, versus O(n log n) for sorting everything." },
      { q: "What causes a hash map's worst-case O(n) behavior and how do real implementations mitigate it?", a: "Many keys hashing into the same bucket (collisions) degrade lookups to a linear scan of that bucket. Implementations mitigate this with good hash functions, load-factor-triggered resizing/rehashing, and some (like Java 8+ HashMap) convert long collision chains into balanced trees to bound worst-case lookup at O(log n)." },
    ],
    practice: [
      "Implement a frequency counter and 'top-k frequent elements' using a hash map plus a heap.",
      "Benchmark inserting 100,000 elements at the front of a vector/ArrayList versus a deque and observe the time difference.",
      "Implement a simple LRU cache using a hash map plus a doubly linked list (or OrderedDict/LinkedHashMap) in O(1) per operation.",
      "Write a range-query function (all keys between lo and hi) using a TreeMap/std::map and explain why it cannot be done efficiently with a hash map.",
    ],
  },

  "Exception handling patterns": {
    summary:
      "Exceptions separate the happy path from failure handling. Catch what you can act on, and let everything else surface.",
    keyPoints: [
      "try / catch(except) / finally — finally always runs, even after return.",
      "Never swallow exceptions silently; log with context or rethrow.",
      "Catch narrow types first, broad types last.",
      "Use try-with-resources / `with` / RAII so cleanup cannot be forgotten.",
    ],
    syntax: {
      lang: "python",
      code: "try:\n    with open(path) as f:\n        data = json.load(f)\nexcept FileNotFoundError:\n    data = {}\nfinally:\n    log('read attempted')",
    },
    diagram: ` try block
    |
    +-- no error --> continue --+
    |                           |
    +-- raises ----> matching   |
                     except --> +--> finally --> after`,
    deepDive: [
      "Exceptions exist to separate 'what should happen' from 'what to do when it doesn't', so the main body of code reads like the intended logic while error paths live in dedicated handlers. This is strictly better than the old C-style convention of checking a return code after every call, because it is impossible to accidentally ignore an exception the way you can ignore a return value — an unhandled exception propagates up the call stack and, if nothing catches it, crashes the program with a stack trace, which is loud and debuggable rather than silently wrong.",
      "The propagation model matters for design: when an exception is thrown, the runtime unwinds the call stack frame by frame, running any deferred cleanup (finally blocks, C++ destructors via RAII, Python context managers' __exit__) at each level until a matching catch/except is found or the program terminates. This is why 'catch narrow, let the rest propagate' is good practice — catching Exception or a base class too early can silently absorb bugs (like a NullPointerException from a typo) that should have crashed loudly during development.",
      "Checked vs unchecked exceptions is a real design-philosophy split. Java's checked exceptions (IOException, SQLException) force callers to either catch or declare them, which improves documentation but famously leads to boilerplate and 'catch and ignore' anti-patterns when developers get annoyed by the compiler. Python, C++, JavaScript and Kotlin only have unchecked exceptions — nothing forces you to handle them, which is more ergonomic but means missing error handling is discovered at runtime, not compile time. Interviewers sometimes ask you to compare these two schools of thought.",
      "Resource safety is the other half of the story: any exception can be thrown between acquiring a resource (file handle, socket, lock, DB connection) and releasing it, so cleanup code must run regardless of whether the block succeeded, failed, or returned early. `finally` guarantees this manually; `try-with-resources` in Java, `with` in Python, and RAII (destructors tied to scope) in C++ guarantee it automatically and are strictly preferred because they cannot be forgotten. A common exam question is 'what happens if you return inside a try and also have a finally that returns' — the finally's return silently overrides the try's return, which is considered a code smell.",
    ],
    example: {
      title: "Dry-run: reading a config file with fallback and guaranteed logging",
      steps: [
        "Call load_config('config.json') wrapped in try/except/finally.",
        "try block opens the file with `with open(path) as f` — this registers automatic cleanup regardless of outcome.",
        "Suppose the file does not exist: open() raises FileNotFoundError inside the `with` context.",
        "Python starts unwinding: the `with` block's __exit__ runs first (no-op here since the file never opened), then the exception looks for a matching except clause.",
        "except FileNotFoundError catches it, sets data = {} (the fallback), and does not re-raise.",
        "Regardless of whether the try succeeded or the except ran, the finally block executes: log('read attempted').",
        "Function returns data — either the parsed JSON or the empty-dict fallback.",
      ],
      result: "The caller always gets a usable dict and a log line is always written, whether or not the file existed.",
    },
    mistakes: [
      { mistake: "Writing a bare `except:` (or `catch (Exception e) {}`) that swallows every error including ones you didn't anticipate.", fix: "Catch the specific exception type you expect and know how to recover from; let unexpected exceptions propagate so they surface during testing." },
      { mistake: "Putting a `return` inside a `finally` block.", fix: "Avoid returning from finally — it silently discards any exception or return value from the try block, which is confusing and considered a bug pattern in most style guides." },
      { mistake: "Using exceptions for ordinary control flow (e.g. throwing to break out of nested loops on a normal condition).", fix: "Reserve exceptions for truly exceptional/error conditions; use flags, early returns, or labeled breaks for expected control flow, since exceptions are also comparatively expensive to raise." },
      { mistake: "Forgetting to close a resource when an exception occurs between open and close.", fix: "Always use try-with-resources / `with` / RAII destructors instead of manual open()/close() pairs so cleanup runs even on the exception path." },
    ],
    interviewQA: [
      { q: "What is the difference between checked and unchecked exceptions in Java, and does Python have checked exceptions?", a: "Checked exceptions must be either caught or declared in a method's throws clause, enforced at compile time (e.g. IOException); unchecked exceptions (RuntimeException and subclasses) require no such declaration. Python has no checked/unchecked distinction at all — every exception is effectively unchecked, and there is no compiler check forcing you to handle anything." },
      { q: "Does a finally block always run, even if the try block returns or throws?", a: "Yes, finally runs after the try (and any except/catch) block completes, whether that completion is normal, via an exception, or via a return/break/continue — the only exceptions are JVM/process crashes or System.exit(). This makes it the right place for guaranteed cleanup." },
      { q: "Why is catching narrow exception types before broad ones important?", a: "Because catch/except clauses are checked in order and the first matching one wins; if a broad type like Exception is listed first, it will catch everything below it too, so more specific types placed first ensure precise, intentional handling and prevent accidentally masking unrelated bugs." },
      { q: "How does try-with-resources (or Python's `with`) improve on manual try/finally cleanup?", a: "It guarantees the resource's close()/`__exit__` is called automatically at the end of the block regardless of how the block exits, without requiring the developer to remember a finally clause, and it correctly handles exceptions thrown during close() by attaching them as suppressed exceptions rather than losing the original error." },
    ],
    practice: [
      "Write a function that opens a file, parses JSON, and gracefully falls back to a default on FileNotFoundError and on JSONDecodeError, with distinct handling for each.",
      "Create a custom exception class (e.g. InsufficientFundsError) and raise/catch it with a meaningful message.",
      "Demonstrate, with a small script, that a return inside finally overrides a return inside try.",
      "Implement a context manager (Python `__enter__`/`__exit__` or Java try-with-resources class) that guarantees a lock is released even if the guarded code throws.",
    ],
  },

  "Generics or templates": {
    summary:
      "Generics let one implementation work over many types while keeping compile-time type safety, avoiding casts and duplicated code.",
    keyPoints: [
      "Java uses erasure (types checked, then removed); C++ templates are instantiated per type.",
      "Bounded types (`<T extends Comparable<T>>`) let you call methods on T.",
      "Python uses duck typing plus optional `typing` hints (`List[T]`, `TypeVar`).",
      "Generics remove runtime casts, so mistakes fail at compile time instead.",
    ],
    syntax: {
      lang: "java",
      code: "static <T extends Comparable<T>> T max(List<T> xs) {\n  T best = xs.get(0);\n  for (T x : xs) if (x.compareTo(best) > 0) best = x;\n  return best;\n}",
    },
    diagram: `        max(List<T>)
             |
   +----------+----------+
   |          |          |
 Integer    String     Double
 one source, three type-checked uses`,
    deepDive: [
      "Before generics, a general-purpose container in Java stored everything as Object, which meant every read required an explicit downcast (e.g. (String) list.get(0)) and mistakes only surfaced at runtime as a ClassCastException. Generics (introduced in Java 5) let the compiler check type correctness at every use site while still storing a homogeneous collection, catching the equivalent bug at compile time instead. C++ templates achieve a related goal through a completely different mechanism: instantiation, where the compiler generates a separate concrete version of the function or class for every distinct type it's used with, which allows compile-time specialization and even non-type template parameters (like array sizes) but leads to longer compile times and potential code bloat.",
      "Java's generics are implemented via type erasure: generic type information exists only at compile time for checking, and is erased to raw types (often Object, or the first bound) in the compiled bytecode. This is why you cannot do `new T[]` or `instanceof List<String>` in Java, why a List<Integer> and a List<String> have the same runtime Class object, and why overloading two methods that differ only in generic type parameter is illegal. C++ templates, by contrast, are fully monomorphized — each instantiation is a distinct type at both compile time and runtime, which is why C++ template code can use type-specific optimizations that Java generics cannot.",
      "Bounded type parameters (`<T extends Comparable<T>>` in Java, `template<typename T> requires ...` concepts in modern C++, or a Protocol/TypeVar bound in Python typing) let generic code call methods on the type parameter that wouldn't otherwise be guaranteed to exist on an arbitrary Object. Without a bound, a generic max() function couldn't call compareTo() because Object doesn't define it; with the bound, the compiler guarantees every substituted type provides compareTo(), enabling both type safety and richer behavior.",
      "Python's approach is fundamentally different at runtime — it relies on duck typing, meaning any object with the right methods works regardless of declared type, and there is no compile-time enforcement at all. The `typing` module (TypeVar, Generic, List[T], Protocol) adds optional static annotations that tools like mypy or pyright check, but these annotations are not enforced by the Python interpreter itself; they exist purely for developer tooling and documentation, which is an important distinction to state clearly in interviews about statically vs dynamically typed generics.",
    ],
    example: {
      title: "Dry-run: generic max() over three different types",
      steps: [
        "Call max(List.of(3, 7, 2)) with T inferred as Integer.",
        "Compiler checks Integer implements Comparable<Integer> — bound satisfied.",
        "best starts as 3; loop compares 7.compareTo(3) > 0 -> true, best becomes 7; 2.compareTo(7) > 0 -> false, best stays 7. Returns 7.",
        "Call max(List.of(\"pear\",\"apple\",\"kiwi\")) with T inferred as String.",
        "Compiler checks String implements Comparable<String> — bound satisfied; lexicographic compareTo used.",
        "best starts as 'pear'; 'apple'.compareTo('pear') < 0 so best unchanged; 'kiwi'.compareTo('pear') < 0 so best unchanged. Returns 'pear'.",
        "At runtime, due to erasure, both calls actually execute the same bytecode operating on raw Comparable references — the type-specific checking happened only at compile time.",
      ],
      result: "One source method safely and correctly computes the max for Integer and String lists, with all type errors caught before running.",
    },
    mistakes: [
      { mistake: "Trying to create a generic array (`new T[10]`) in Java.", fix: "Understand this is disallowed due to type erasure (the runtime doesn't know T); use an Object[] internally with an unchecked cast, or accept a Class<T> token, or use a List<T> instead of an array." },
      { mistake: "Assuming Python type hints like List[int] are enforced at runtime.", fix: "Know that Python hints are purely for static analysis tools (mypy, pyright, IDEs); the interpreter does not check or enforce them, so runtime type errors can still happen despite correct-looking hints." },
      { mistake: "Writing a generic method without a bound and then trying to call type-specific methods (like compareTo) on the type parameter.", fix: "Add the appropriate bound (`<T extends Comparable<T>>`) so the compiler knows the method exists on every valid substitution." },
      { mistake: "Expecting C++ template instantiation errors to look like normal, localized compiler errors.", fix: "Expect verbose, sometimes deeply nested error messages pointing into the template body itself, because the error only appears once a specific type is substituted and fails to satisfy the template's implicit requirements — read the innermost error first." },
    ],
    interviewQA: [
      { q: "What is type erasure in Java generics and what limitation does it cause?", a: "The compiler checks generic type correctness at compile time but erases the specific type parameters in the compiled bytecode, replacing them with Object or their bound. This means you cannot create a generic array, cannot use instanceof with a parameterized type, and List<Integer> and List<String> share the same Class object at runtime." },
      { q: "How do C++ templates differ from Java generics in how they're compiled?", a: "C++ templates use instantiation: the compiler generates a distinct concrete version of the code for each type used, so each instantiation is a fully separate type with potential type-specific optimizations, at the cost of longer compile times and larger binaries. Java generics use erasure, sharing one compiled version for all type arguments, which is more compact but loses type information at runtime." },
      { q: "Why would you add a bound like `<T extends Comparable<T>>` to a generic method?", a: "Without a bound, the compiler only knows T is some Object and can't guarantee it supports methods like compareTo(). The bound restricts valid substitutions to types that implement Comparable<T>, letting the generic code safely call compareTo() while still working across many types." },
      { q: "Are Python type hints enforced at runtime?", a: "No. Type hints such as List[int] or a TypeVar bound are purely optional metadata used by static analysis tools like mypy or IDEs; the Python interpreter does not check them at runtime, so passing an incorrectly typed argument will not raise an error unless the code itself does type-dependent operations that fail." },
    ],
    practice: [
      "Write a generic Stack<T> or Pair<T, U> class in Java or C++ and use it with at least two different types.",
      "Add a bound to a generic method so it can call a domain-specific method on its type parameter, and show what compiler error appears without the bound.",
      "Annotate a small Python function with TypeVar-based generics and run mypy on it to see what it catches versus what it misses at runtime.",
      "Explain, using a diagram or short writeup, the difference between erasure and instantiation to a peer.",
    ],
  },

  "Concurrency primitives": {
    summary:
      "Threads share memory, so unsynchronised access corrupts state. Locks, atomics and queues make shared access safe.",
    keyPoints: [
      "Race condition: result depends on thread interleaving.",
      "Mutex gives mutual exclusion; always lock in a consistent order to avoid deadlock.",
      "Prefer message passing (queues, executors) over hand-rolled locks.",
      "Atomics/volatile handle visibility for single-variable updates.",
    ],
    syntax: {
      lang: "python",
      code: "lock = threading.Lock()\ndef deposit(n):\n    with lock:\n        global balance\n        balance += n",
    },
    diagram: `T1 read 100 --+
              |  both write 110 -> 10 lost
T2 read 100 --+

with lock:
T1 [lock] read 100 write 110 [unlock]
T2                    [lock] read 110 write 120 [unlock]`,
    deepDive: [
      "A race condition happens whenever the correctness of a program depends on the timing/order in which multiple threads execute, most commonly when two threads perform a read-modify-write on shared state without synchronization. The classic 'lost update' example is `balance += n`, which is not a single atomic operation at the machine level — it's read balance, add n, write balance back — so if two threads interleave those three steps, one update can be silently overwritten. This is why 'it worked in testing' is meaningless for concurrency bugs: races are timing-dependent and can hide for a long time before appearing under load.",
      "A mutex (mutual exclusion lock) fixes this by ensuring only one thread executes a critical section at a time; any other thread trying to acquire the same lock blocks until it's released. The danger with multiple locks is deadlock: if thread A holds lock1 and waits for lock2 while thread B holds lock2 and waits for lock1, both threads block forever. The standard mitigation is to always acquire multiple locks in a single, globally agreed order across the whole codebase, or to use higher-level constructs (try-lock with timeout, lock-free structures) that can detect and recover from contention.",
      "Beyond mutual exclusion, memory visibility is a separate and subtler problem: even without a data race on a single field, one thread's write might not be visible to another thread promptly due to CPU caching and compiler/JIT reordering optimizations. `volatile` in Java (and similar constructs elsewhere) forces reads/writes to go through main memory and establishes a happens-before relationship, making a single variable's updates visible across threads, though it does not provide the atomicity a lock or an AtomicInteger/AtomicReference gives for compound operations like increment-and-get.",
      "In practice, modern concurrent code increasingly avoids hand-rolled locks altogether in favor of higher-level abstractions: thread-safe queues (BlockingQueue, multiprocessing.Queue) for message passing between producer and consumer threads, executor/thread-pool services that manage worker lifecycles, futures/promises for async results, and immutable data structures that eliminate the need for synchronization entirely because there's nothing to mutate. The general principle taught in interviews is: prefer 'don't share mutable state' (message passing, immutability) over 'share mutable state carefully' (locks), because locks are correct only if used perfectly everywhere, every time.",
    ],
    example: {
      title: "Dry-run: lost update without a lock, then fixed with a lock",
      steps: [
        "Shared balance = 100. Two threads T1 and T2 both call deposit(10) concurrently, without any lock.",
        "T1 reads balance -> 100 into a local register.",
        "Context switch to T2: T2 reads balance -> 100 (T1's write hasn't happened yet).",
        "T1 computes 100 + 10 = 110 and writes balance = 110.",
        "T2 computes 100 + 10 = 110 (using its stale read) and writes balance = 110, overwriting T1's update.",
        "Final balance is 110 instead of the correct 120 — one deposit was lost.",
        "Now wrap the read-modify-write in `with lock:` — T1 acquires the lock, reads 100, writes 110, releases; only then can T2 acquire the lock, read 110, write 120, release.",
      ],
      result: "Without the lock the final balance is incorrectly 110; with the lock serializing the critical section, the final balance is correctly 120.",
    },
    mistakes: [
      { mistake: "Assuming a single line like `counter += 1` is atomic because it looks like one statement.", fix: "Recognize it compiles to separate read, add, and write steps; protect it with a lock or use an atomic type (AtomicInteger, threading with a Lock, or language-level atomics)." },
      { mistake: "Acquiring locks in different orders in different parts of the code, causing occasional deadlocks under load.", fix: "Establish and document a single global lock-acquisition order (e.g. always lock account A before account B, by some fixed id ordering) and follow it everywhere." },
      { mistake: "Holding a lock for longer than necessary, including during slow I/O, which serializes unrelated work and hurts throughput.", fix: "Keep critical sections as small as possible — compute what you can outside the lock, and only hold it around the actual shared-state mutation." },
      { mistake: "Believing Python threads give real CPU parallelism for CPU-bound work because locks are used correctly.", fix: "Remember the GIL means only one thread executes Python bytecode at a time regardless of locking; use multiprocessing or a native extension for CPU-bound parallelism, and threads only for I/O-bound concurrency." },
    ],
    interviewQA: [
      { q: "What is a race condition and how would you detect one?", a: "A race condition is a bug where program behavior depends on the non-deterministic timing/interleaving of concurrent threads accessing shared state, typically a read-modify-write without synchronization. It's detected via code review for unsynchronized shared mutable state, stress-testing with many threads under load, or tools like ThreadSanitizer/Java's race detectors that flag concurrent unsynchronized accesses." },
      { q: "How can deadlock occur and how do you prevent it?", a: "Deadlock occurs when two or more threads each hold a lock the other needs, so all block forever waiting on each other (circular wait). Prevention strategies include always acquiring multiple locks in a consistent global order, using lock timeouts/try-lock to detect and back off, or restructuring to avoid needing multiple locks at once, e.g. via message passing." },
      { q: "What's the difference between a mutex and using atomic operations?", a: "A mutex provides mutual exclusion over an arbitrary block of code (a critical section), blocking other threads entirely while held. Atomic operations (like compare-and-swap, AtomicInteger.incrementAndGet) provide lock-free, hardware-supported atomicity for a single variable or small operation, typically with lower overhead than a full lock but limited to simpler operations." },
      { q: "Why is message passing often preferred over shared-memory locking in concurrent system design?", a: "Message passing (queues, actors, channels) avoids the need for locks altogether by ensuring only one thread/owner mutates a given piece of state at a time, communicating results via immutable messages instead. This eliminates whole classes of bugs — races, deadlocks, forgotten locks — at the cost of some message-passing overhead, and scales more naturally to distributed systems." },
    ],
    practice: [
      "Write a multi-threaded counter increment program without a lock, observe incorrect final counts, then fix it with a Lock/mutex and verify correctness.",
      "Create a two-lock deadlock scenario deliberately (two threads locking two resources in opposite order) and then fix it with consistent lock ordering.",
      "Implement a bounded producer-consumer queue using a thread-safe queue (BlockingQueue, queue.Queue) instead of manual locking.",
      "Research and explain, in your own words, what problem Python's GIL solves and what problems it creates for CPU-bound multithreading.",
    ],
  },

  "Language-specific gotchas (GIL, JVM GC, undefined behaviour)": {
    summary:
      "Each runtime has traps that only show up under load: Python's GIL, the JVM's garbage collector pauses, and C++ undefined behaviour.",
    keyPoints: [
      "Python GIL: one thread runs bytecode at a time — use multiprocessing for CPU-bound work, threads for I/O.",
      "JVM GC: young/old generations; long pauses come from large live sets, not from allocation count.",
      "C++ UB: out-of-bounds access, signed overflow, use-after-free — 'works on my machine' is not correctness.",
      "Mutable default arguments in Python are created once, not per call.",
    ],
    syntax: {
      lang: "python",
      code: "def bad(items=[]):   # created once, shared forever\n    items.append(1)\n    return items\n\ndef good(items=None):\n    items = items or []",
    },
    diagram: `CPU-bound in Python
threads:   [T1][T2][T1][T2]  <- GIL serialises, no speedup
processes: [P1------------]
           [P2------------]  <- real parallelism`,
    deepDive: [
      "The Global Interpreter Lock (GIL) is a single mutex in CPython that ensures only one thread executes Python bytecode at any instant, even on a multi-core machine. It exists primarily to make CPython's memory management (reference counting) simple and thread-safe without fine-grained locking everywhere. The practical consequence is that Python threads give you concurrency (useful for I/O-bound work like network calls, where a thread releases the GIL while waiting on I/O) but not parallelism for CPU-bound work — running four CPU-heavy threads is not meaningfully faster than running one, sometimes slower due to context-switch and lock-contention overhead. The standard workaround is multiprocessing (separate processes with separate interpreters and memory, real parallel CPU usage) or using native-code libraries (NumPy, C extensions) that release the GIL during their heavy lifting.",
      "JVM garbage collection uses generational hypothesis: most objects die young, so the heap is split into a young generation (collected frequently and cheaply with a copying collector) and an old/tenured generation (collected less often but more expensively, since it usually requires scanning a larger live set). Long GC pauses ('stop-the-world' pauses) generally come from having a large amount of live (still-referenced) data that must be traced and possibly compacted, not from the sheer number of allocations — allocating and quickly discarding many short-lived objects is actually the case the young-gen collector is optimized for. This is why memory leaks in Java (objects unintentionally kept alive via static references, listener registrations, or caches without eviction) cause GC pauses to grow over time even though 'Java doesn't have memory leaks' is a common misconception.",
      "Undefined behaviour (UB) in C and C++ is not merely 'unspecified' — the language standard places no requirements whatsoever on what happens once UB is triggered, meaning the compiler is legally allowed to assume UB never happens and optimize accordingly, which can produce results far stranger than a crash (code before the UB can be affected too, because the compiler reasons backward from the assumption of no UB). Common triggers include out-of-bounds array/pointer access, signed integer overflow, dereferencing a null or dangling pointer, data races, and using a variable before initialization. The practical danger is that a program can 'appear to work' on one compiler/optimization level and misbehave catastrophically on another, which is why tools like AddressSanitizer, UndefinedBehaviorSanitizer, and Valgrind are essential in C/C++ development rather than optional.",
      "Mutable default arguments in Python are a language-design gotcha rather than a runtime one: default argument values are evaluated exactly once, at function definition time, and that single object is reused across every call that doesn't override it. If the default is mutable (a list or dict) and the function mutates it, the mutation persists and silently accumulates across unrelated calls — a bug that is notoriously easy to introduce and hard to spot in code review because the function signature looks perfectly innocent.",
    ],
    example: {
      title: "Dry-run: the mutable default argument trap",
      steps: [
        "Define def bad(items=[]): items.append(1); return items — the empty list [] is created once when the function is defined, not each call.",
        "Call bad() the first time: items refers to the shared default list, currently []; append 1 -> [1]; return [1].",
        "Call bad() a second time, with no argument: items again refers to the SAME shared default list object, which is now [1] from the previous call, not a fresh [].",
        "append 1 -> [1, 1]; return [1, 1].",
        "Call bad() a third time: the same object is now [1, 1]; append 1 -> [1, 1, 1]; return [1, 1, 1].",
        "Contrast with good(items=None): items = items or [] creates a brand-new list every call when no argument is passed.",
      ],
      result: "bad() unexpectedly returns growing lists across unrelated calls ([1], then [1,1], then [1,1,1]), while good() correctly returns a fresh [1] every time.",
    },
    mistakes: [
      { mistake: "Using multithreading in Python expecting a speedup for a CPU-bound task like image processing or numeric computation.", fix: "Use the multiprocessing module (or a C-extension/NumPy that releases the GIL) for CPU-bound parallelism; reserve threads for I/O-bound concurrency like network requests." },
      { mistake: "Assuming more RAM automatically fixes long JVM GC pauses.", fix: "Investigate what is keeping objects alive (large caches, listener leaks, static collections) since pause length correlates with live-set size to scan/compact, and consider tuning the collector (e.g. G1, ZGC) or reducing retained data rather than just adding heap." },
      { mistake: "Writing C/C++ code with signed integer overflow or off-by-one array access and treating a lack of a crash as proof of correctness.", fix: "Compile and test with sanitizers (UBSan, ASan) and treat any UB as a real bug regardless of whether it currently 'happens to work', since optimizing compilers can change behavior between versions or flags." },
      { mistake: "Using a mutable default argument (list, dict, set) in a Python function signature.", fix: "Default to None and initialize the mutable object inside the function body on each call." },
    ],
    interviewQA: [
      { q: "What is the GIL and why doesn't it prevent Python from being useful for concurrent programs?", a: "The GIL is a single lock in CPython ensuring only one thread runs Python bytecode at a time, which prevents true multi-core parallelism for pure Python CPU-bound code. It doesn't hurt I/O-bound concurrency because threads release the GIL while blocked on I/O (network, disk), so many threads can be usefully waiting on I/O concurrently even though only one runs Python code at any instant." },
      { q: "Why do JVM GC pauses get longer as an application runs, even without adding new features?", a: "If the application accumulates unintentionally retained objects (caches without eviction, static references, unremoved listeners), the live set the collector must trace and possibly compact grows over time, and pause time is driven by live-set size rather than allocation rate, so pauses lengthen even though nothing 'new' was added intentionally." },
      { q: "Give an example of undefined behavior in C++ and explain why it's dangerous beyond just 'might crash'.", a: "Signed integer overflow is undefined behavior in C++; a compiler is permitted to assume it never happens, which can lead it to eliminate overflow checks or reorder code in ways that produce results inconsistent with a naive mental model of arithmetic — including removing seemingly unrelated bounds checks the compiler judges are only reachable via UB, so the damage isn't localized to the overflowing line." },
      { q: "Why does `def f(items=[])` behave unexpectedly in Python?", a: "Default argument expressions are evaluated once, when the function is defined, not on every call; since [] creates one list object at definition time, every call that omits the argument shares and can mutate that same object, causing state to leak across calls." },
    ],
    practice: [
      "Time a CPU-bound task (e.g. summing squares) using threading versus multiprocessing in Python and compare wall-clock results.",
      "Reproduce the mutable default argument bug, observe the unexpected accumulation, and fix it.",
      "Write a small C++ program with an out-of-bounds array write, compile it with and without optimizations, and observe different behavior; then run it under AddressSanitizer.",
      "Read about one JVM GC algorithm (G1 or ZGC) and summarize in a few sentences how it tries to reduce pause times.",
    ],
  },
};
