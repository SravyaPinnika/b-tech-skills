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
  },
};
