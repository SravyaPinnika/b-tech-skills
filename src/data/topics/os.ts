import type { TopicMap } from "../topicContent";

export const osTopics: TopicMap = {
  "Process vs thread, context switching": {
    summary:
      "A process is a running program with its own memory space. Threads live inside a process and share its heap, so switching between them is cheaper.",
    keyPoints: [
      "Process: separate address space, isolated, expensive to create. Thread: shared heap, own stack and registers.",
      "A context switch saves registers/PC of one task and restores another — pure overhead.",
      "Shared memory is why threads need synchronisation and processes usually do not.",
      "States: new -> ready -> running -> waiting -> terminated.",
    ],
    syntax: {
      lang: "text",
      code: "fork()  -> new process (copy of memory)\npthread_create() / Thread() -> new thread (shared memory)",
    },
    diagram: `PROCESS
+--------------------------------+
| code | data | heap (shared)    |
|  T1 stack   T2 stack   T3 stack|
+--------------------------------+

context switch: [T1 running] -> save regs -> load regs -> [T2 running]`,

    deepDive: [
      "A process is an independent, isolated instance of a running program: it has its own virtual address space (code, data, heap, stack), its own file descriptors, and the OS ensures one process cannot directly read or corrupt another's memory. Creating a process (e.g. via fork()) is relatively expensive because the OS must set up a fresh address space and duplicate various kernel bookkeeping structures.",
      "A thread is a lighter-weight unit of execution that lives inside a process. All threads of a process share the same heap, global variables, and open file descriptors, but each thread gets its own stack and its own set of CPU registers/program counter. Because threads share memory, creating one is much cheaper than creating a process, and communication between threads is as simple as reading/writing a shared variable \u2014 but that same sharing is exactly why threads need explicit synchronisation to avoid race conditions, while separate processes usually do not (since they don't share memory by default).",
      "A context switch happens whenever the CPU stops running one task and starts running another \u2014 whether that's between two processes or two threads. The OS must save the current task's registers and program counter into its Process/Thread Control Block, then load the next task's saved state. This is pure overhead: no useful work is done during the switch itself, and switching between threads is typically cheaper than between processes because the address space (and its associated TLB/cache state) doesn't need to change.",
      "Every process moves through a lifecycle of states: new (being created), ready (waiting for CPU), running (actually executing on a CPU core), waiting/blocked (waiting on I/O or an event), and terminated. The scheduler is responsible for moving processes between ready and running, and understanding this state diagram is essential for reasoning about scheduling algorithms."
    ],
    example: {
      "title": "Trace what happens when two threads of the same process are time-sliced by the OS",
      "steps": [
        "T1 is running on the CPU, executing instructions and holding values in CPU registers.",
        "The OS timer interrupt fires, signalling that T1's time quantum has expired.",
        "The OS saves T1's register values and program counter into T1's Thread Control Block.",
        "The scheduler picks T2 (same process) as the next thread to run from the ready queue.",
        "The OS loads T2's previously saved registers and program counter from its Thread Control Block.",
        "Because T1 and T2 share the same process's address space, no page table / TLB switch is needed \u2014 only register and stack-pointer state changes, making this cheaper than a process switch.",
        "T2 now resumes exactly where it left off, sharing the same heap data T1 was also working with."
      ],
      "result": "The CPU appears to run both threads 'simultaneously' via fast switching, with shared memory but independent stacks/registers."
    },
    mistakes: [
      {
        "mistake": "Assuming threads of the same process have separate memory like processes do.",
        "fix": "Remember threads share the heap and global data; only the stack and registers are private per thread \u2014 shared data needs synchronisation."
      },
      {
        "mistake": "Believing context switches are free or instantaneous.",
        "fix": "Understand a context switch has real overhead (saving/restoring state, possible cache/TLB invalidation), which is why excessive threading or too small a time quantum can hurt performance."
      },
      {
        "mistake": "Thinking multithreading always speeds up CPU-bound work.",
        "fix": "On a single core, threads still take turns via context switching; true parallel speedup for CPU-bound work needs multiple cores, and in languages with a GIL (like CPython) even multiple cores may not help for CPU-bound threads."
      },
      {
        "mistake": "Forgetting that processes can also be scheduled/switched, not just threads.",
        "fix": "Recall that context switching applies at both the process and thread level; process switches are more expensive because the address space (and TLB) changes too."
      }
    ],
    interviewQA: [
      {
        "q": "What is the key difference between a process and a thread?",
        "a": "A process has its own isolated address space and resources; a thread is a unit of execution within a process that shares the process's heap and file descriptors with other threads of the same process, but has its own stack and register state."
      },
      {
        "q": "Why is creating a thread cheaper than creating a process?",
        "a": "Because a new thread reuses the existing process's address space, open files, and other resources \u2014 the OS only needs to allocate a new stack and control block, whereas a new process requires setting up an entirely fresh address space and duplicating kernel-level resource tables."
      },
      {
        "q": "What happens during a context switch?",
        "a": "The OS saves the currently running task's CPU register values and program counter into its control block, selects the next task to run from the ready queue, and loads that task's previously saved register values and program counter so it can resume execution."
      },
      {
        "q": "Why do threads need synchronisation but independent processes usually don't?",
        "a": "Because threads of the same process share memory (heap, globals), so concurrent reads/writes to the same data can race and corrupt state; independent processes have separate address spaces by default, so one process typically can't directly interfere with another's memory."
      }
    ],
    practice: [
      "Write a small program that spawns multiple threads incrementing a shared counter without a lock, and observe the race condition.",
      "Fix the above with a mutex/lock and verify the counter is now always correct.",
      "Compare the time to spawn 1000 threads vs 1000 processes doing the same trivial task.",
      "Draw the process state diagram (new/ready/running/waiting/terminated) and explain a transition example for each edge."
    ],
  },

  "CPU scheduling algorithms": {
    summary:
      "The scheduler picks which ready process gets the CPU next, balancing throughput, waiting time and fairness.",
    keyPoints: [
      "FCFS is simple but suffers convoy effect; SJF gives minimum average waiting but needs burst prediction.",
      "Round Robin uses a time quantum — good response time, more context switches.",
      "Priority scheduling can starve low priority; fix with ageing.",
      "Preemptive = can interrupt a running process (SRTF, RR); non-preemptive cannot.",
    ],
    syntax: {
      lang: "text",
      code: "waiting time = start - arrival\nturnaround   = completion - arrival\navg values are what the exam asks for",
    },
    diagram: `Round Robin, quantum = 2
time 0    2    4    6    8   10
     |P1 |P2 |P3 |P1 |P2 |P3 |
FCFS (P1 burst 6)
     |P1        |P2 |P3 |   <- short jobs wait (convoy)`,

    deepDive: [
      "The CPU scheduler decides, among all ready (runnable) processes, which one gets the CPU next. Different algorithms optimise for different goals: minimising average waiting time, maximising throughput, ensuring fairness, or minimising response time for interactive systems \u2014 and no single algorithm is best at everything, which is why real OS schedulers (like Linux's CFS) blend ideas from several of these classic algorithms.",
      "First-Come-First-Served (FCFS) is the simplest: whichever process arrives first runs to completion. It's easy to implement but suffers from the convoy effect \u2014 a long CPU-bound process at the front of the queue makes every short process behind it wait a long time, hurting average waiting time. Shortest Job First (SJF) fixes this by always picking the process with the smallest remaining burst time, which is provably optimal for average waiting time, but it requires knowing (or predicting) burst times in advance, which is not realistic in general-purpose systems.",
      "Round Robin gives each process a fixed time quantum before switching to the next one in a circular queue, which gives every process reasonably fast response time and is the standard choice for interactive, time-sharing systems. The trade-off is more context switches (overhead) as the quantum gets smaller, and a quantum that's too large degrades RR back toward FCFS behaviour.",
      "Priority scheduling picks the highest-priority ready process, but a naive implementation can starve low-priority processes forever if higher-priority ones keep arriving. Ageing solves this by gradually increasing the priority of processes that have waited a long time, guaranteeing eventual execution. Algorithms are also classified as preemptive (can interrupt a running process, e.g. SRTF and RR) or non-preemptive (a running process keeps the CPU until it voluntarily yields or finishes, e.g. plain FCFS and non-preemptive SJF)."
    ],
    example: {
      "title": "Compute average waiting time for FCFS vs SJF given three processes",
      "steps": [
        "Processes arrive at time 0 with burst times: P1=6, P2=2, P3=4.",
        "Under FCFS (arrival order P1, P2, P3): P1 runs 0-6, P2 runs 6-8, P3 runs 8-12.",
        "Waiting time for FCFS = start time - arrival time: P1 waits 0, P2 waits 6, P3 waits 8 -> average = (0+6+8)/3 = 4.67.",
        "Under SJF (shortest burst first): order becomes P2(2), P3(4), P1(6).",
        "P2 runs 0-2, P3 runs 2-6, P1 runs 6-12.",
        "Waiting time for SJF: P2 waits 0, P3 waits 2, P1 waits 6 -> average = (0+2+6)/3 = 2.67.",
        "Result: SJF gives a lower average waiting time (2.67) than FCFS (4.67) for this same set of processes, illustrating why SJF is optimal for average wait but needs burst-time knowledge FCFS doesn't."
      ],
      "result": "SJF minimises average waiting time versus FCFS, at the cost of needing burst-time estimates in advance."
    },
    mistakes: [
      {
        "mistake": "Computing waiting time as completion time instead of start time minus arrival time.",
        "fix": "Waiting time = start time \u2212 arrival time (or turnaround time \u2212 burst time); don't confuse it with turnaround time = completion time \u2212 arrival time."
      },
      {
        "mistake": "Assuming Round Robin always has lower average waiting time than FCFS.",
        "fix": "RR optimises response time and fairness, not necessarily average waiting time \u2014 for identical burst times FCFS and RR can be similar, and RR adds context-switch overhead."
      },
      {
        "mistake": "Forgetting that SJF requires burst time prediction, and treating it as always practically implementable.",
        "fix": "Note that real systems approximate SJF using historical burst averages (exponential averaging) since true future burst time is unknown."
      },
      {
        "mistake": "Ignoring starvation risk in priority scheduling.",
        "fix": "Always mention ageing as the standard fix when discussing priority scheduling in interviews."
      }
    ],
    interviewQA: [
      {
        "q": "What is the convoy effect in FCFS scheduling?",
        "a": "It's when a long CPU-bound process at the head of the ready queue forces all shorter processes behind it to wait a disproportionately long time, hurting average waiting time even though the algorithm itself is simple and fair in arrival order."
      },
      {
        "q": "Why is SJF optimal for average waiting time, and what is its main drawback?",
        "a": "SJF is provably optimal because running the shortest job first minimises the total accumulated waiting time across all processes. Its drawback is that it needs to know or accurately predict each process's burst time in advance, which is generally not knowable in a real general-purpose OS."
      },
      {
        "q": "How does the time quantum size affect Round Robin's behaviour?",
        "a": "A very small quantum gives excellent response time but increases context-switch overhead significantly; a very large quantum reduces overhead but makes RR behave more like FCFS, hurting response time for interactive processes."
      },
      {
        "q": "How do you prevent starvation in priority scheduling?",
        "a": "By using ageing: gradually increasing the priority of a process the longer it waits in the ready queue, ensuring it will eventually become the highest priority and get scheduled."
      }
    ],
    practice: [
      "Compute waiting and turnaround times for a given set of processes under FCFS, SJF, and Round Robin, and compare averages.",
      "Simulate Round Robin with different quantum sizes and graph how average waiting time changes.",
      "Implement priority scheduling with ageing and show a low-priority process eventually runs.",
      "Explain, with an example, why SRTF (preemptive SJF) can still cause starvation for long processes."
    ],
  },

  "Synchronisation: mutex, semaphore, monitors": {
    summary:
      "Synchronisation stops race conditions when threads touch shared data. A mutex gives mutual exclusion; a semaphore counts permits; a monitor bundles lock + condition variables.",
    keyPoints: [
      "Mutex = binary lock with ownership; only the locker unlocks.",
      "Counting semaphore controls access to N identical resources.",
      "Critical section requirements: mutual exclusion, progress, bounded waiting.",
      "Classic problems: producer-consumer, reader-writer, dining philosophers.",
    ],
    syntax: {
      lang: "python",
      code: "empty = Semaphore(N); full = Semaphore(0); mtx = Lock()\n# producer: empty.acquire(); mtx.acquire(); put(); mtx.release(); full.release()\n# consumer: full.acquire();  mtx.acquire(); get(); mtx.release(); empty.release()",
    },
    diagram: `producer --> [ buffer: X X _ _ ] --> consumer
              full=2  empty=2
mutex guards the buffer itself
semaphores count slots so nobody over/under-runs`,

    deepDive: [
      "When multiple threads access shared data concurrently, a race condition can occur: the final result depends on the unpredictable timing/interleaving of their operations, which usually produces incorrect results. Synchronisation primitives exist to control access to shared data so that only safe interleavings are allowed.",
      "A mutex (mutual exclusion lock) is the simplest primitive: it is binary (locked/unlocked) and has ownership \u2014 only the thread that locked it is allowed to unlock it. It's used to protect a critical section, a piece of code that touches shared data and must only be executed by one thread at a time. A semaphore generalises this with an integer counter: a counting semaphore initialised to N allows up to N threads to hold a 'permit' simultaneously, which is perfect for managing a pool of N identical resources (like N database connections), while a binary semaphore (count of 1) behaves similarly to a mutex but, importantly, doesn't have the ownership restriction \u2014 any thread can release it, not just the one that acquired it.",
      "A monitor bundles a lock together with one or more condition variables, providing a higher-level, safer abstraction: code inside a monitor automatically holds the lock, and a thread can wait() on a condition variable to release the lock and sleep until another thread signal()s that the condition may now be true, then reacquire the lock automatically before continuing. This avoids the classic busy-waiting anti-pattern and is the model behind Java's synchronized/wait/notify and Python's threading.Condition.",
      "Any valid solution to a critical-section problem must satisfy three properties: mutual exclusion (only one thread in the critical section at a time), progress (if no thread is in the critical section, one of the threads wanting to enter must be able to, without indefinite postponement), and bounded waiting (a thread's wait to enter must be bounded \u2014 no other thread should be able to enter more than a fixed number of times before it gets its turn). Classic synchronisation exercises \u2014 producer-consumer, readers-writers, dining philosophers \u2014 are all just structured practice problems that force you to apply these primitives correctly."
    ],
    example: {
      "title": "Dry-run the producer-consumer solution with a bounded buffer of size N",
      "steps": [
        "Initialise: empty = Semaphore(N) (N free slots), full = Semaphore(0) (0 filled slots), mtx = Lock().",
        "Producer wants to add an item: it calls empty.acquire() \u2014 this blocks if the buffer is already full (empty count is 0).",
        "Producer then calls mtx.acquire(), writes the item into the buffer, calls mtx.release().",
        "Producer calls full.release(), signalling one more slot is now filled \u2014 this wakes a waiting consumer if any.",
        "Consumer wants an item: it calls full.acquire() \u2014 this blocks if the buffer is empty (full count is 0).",
        "Consumer then calls mtx.acquire(), removes an item, calls mtx.release(), then calls empty.release() to signal a free slot is available.",
        "The two counting semaphores enforce capacity limits (never overflow/underflow the buffer) while mtx ensures only one thread touches the buffer's internal pointers at a time."
      ],
      "result": "Producers and consumers cooperate safely without ever overwriting data or reading from an empty buffer, and without busy-waiting."
    },
    mistakes: [
      {
        "mistake": "Using a plain boolean flag with a busy-wait loop instead of a semaphore/condition variable.",
        "fix": "Busy-waiting wastes CPU and can even cause priority inversion; use blocking primitives (semaphore, condition variable) so idle threads actually sleep."
      },
      {
        "mistake": "Releasing a mutex from a different thread than the one that acquired it.",
        "fix": "Mutexes have ownership semantics \u2014 only the acquiring thread should release it; use a semaphore if you need release-by-another-thread behaviour."
      },
      {
        "mistake": "Acquiring the mutex before the counting semaphore in producer-consumer, causing potential deadlock.",
        "fix": "Acquire the counting semaphore (empty/full) first, then the mutex, consistently in both producer and consumer, to avoid holding the mutex while blocked waiting for capacity."
      },
      {
        "mistake": "Forgetting to release a lock on an exception/early return path.",
        "fix": "Use language constructs like try/finally, RAII, or `with lock:` context managers so the lock is always released even if an error occurs."
      }
    ],
    interviewQA: [
      {
        "q": "What is the difference between a mutex and a semaphore?",
        "a": "A mutex is a binary lock with ownership \u2014 only the thread that locked it can unlock it, and it's meant purely for mutual exclusion. A semaphore is a counter that can allow more than one holder (counting semaphore) and doesn't enforce ownership \u2014 any thread can signal/release it, making it suitable for signalling between threads and managing pools of resources."
      },
      {
        "q": "What three conditions must a critical-section solution satisfy?",
        "a": "Mutual exclusion (only one process/thread in the critical section at a time), progress (the decision of who enters next can't be postponed indefinitely when the section is free and some process wants in), and bounded waiting (a limit on how many times other processes can enter before a waiting process gets its turn)."
      },
      {
        "q": "What is a monitor, and how does it differ from using raw semaphores?",
        "a": "A monitor is a higher-level construct that bundles a lock with condition variables and ensures mutual exclusion automatically for any code inside it; threads wait() on a condition to release the lock and sleep, and signal() wakes a waiter which then reacquires the lock. It's generally safer and less error-prone than manually managing raw semaphores because the locking is implicit."
      },
      {
        "q": "Explain the producer-consumer problem and how semaphores solve it.",
        "a": "Producers add items to a shared bounded buffer and consumers remove them; without synchronisation, producers could overflow the buffer or consumers could read from an empty buffer. Two counting semaphores (empty, full) track available slots and available items respectively, blocking producers/consumers appropriately, while a mutex protects the buffer's internal state during the actual insert/remove operation."
      }
    ],
    practice: [
      "Implement the producer-consumer problem with semaphores in Python or C, using a fixed-size buffer.",
      "Implement the readers-writers problem allowing multiple concurrent readers but exclusive writers.",
      "Implement dining philosophers and demonstrate a naive version deadlocking, then fix it with resource ordering.",
      "Convert a semaphore-based solution into a monitor-based one using condition variables."
    ],
  },

  "Deadlock conditions & avoidance": {
    summary:
      "Deadlock is a state where every process in a set waits for a resource held by another, so none can proceed.",
    keyPoints: [
      "Four Coffman conditions: mutual exclusion, hold and wait, no preemption, circular wait — all must hold.",
      "Prevention breaks one condition (e.g. request all resources at once, or global lock ordering).",
      "Avoidance uses Banker's algorithm to stay in a safe state.",
      "Detection + recovery: build the wait-for graph, find a cycle, kill or roll back a victim.",
    ],
    syntax: {
      lang: "text",
      code: "safe state  = an ordering exists in which all processes finish\nBanker's: grant a request only if the result is still safe",
    },
    diagram: ` P1 --request--> R2
  ^                |
 held              held
  |                v
 R1 <--request-- P2

cycle present -> deadlock. Break by ordering: always take R1 then R2.`,

    deepDive: [
      "Deadlock is a specific failure mode in concurrent systems: a set of processes each hold some resource while waiting for another resource held by a different process in the same set, forming a cycle where none can ever proceed. Unlike a simple bug, deadlock is a structural property of how resources were requested and granted, which is why it can be reasoned about formally.",
      "The four Coffman conditions are necessary for deadlock to occur, and all four must hold simultaneously: mutual exclusion (at least one resource must be held in a non-shareable way), hold and wait (a process holds at least one resource while waiting to acquire more), no preemption (resources can't be forcibly taken away from a process), and circular wait (there's a cycle of processes each waiting for a resource held by the next). Break any single one of these and deadlock becomes impossible.",
      "Prevention strategies attack one of these conditions directly: requiring processes to request all needed resources at once (removes hold-and-wait), imposing a global ordering on resource acquisition (removes circular wait), or allowing preemption of resources. Avoidance is more dynamic \u2014 the Banker's algorithm checks, before granting any resource request, whether the resulting state is still 'safe' (i.e. there exists some order in which all processes could still finish), and only grants the request if so; this requires knowing each process's maximum future resource needs in advance, which limits its practicality outside of controlled/exam settings.",
      "Detection and recovery is the pragmatic real-world approach: let deadlocks happen occasionally, periodically build a wait-for or resource-allocation graph, detect cycles, and recover by killing or rolling back one of the involved processes (the 'victim') to break the cycle \u2014 similar to how database deadlock detection works."
    ],
    example: {
      "title": "Apply the Banker's algorithm to decide if a resource request is safe",
      "steps": [
        "Given: 3 processes P1, P2, P3 and one resource type with 10 total units currently allocated as P1=3, P2=2, P3=2 (7 used, 3 available).",
        "Maximum future needs are declared as P1 max=9, P2 max=4, P3 max=7, so remaining needs are P1=6, P2=2, P3=5.",
        "P2 requests 1 more unit. Tentatively grant it: available becomes 2, P2 allocation becomes 3, P2's remaining need becomes 1.",
        "Check if this new state is safe: can we find an order to finish all processes without exceeding available units at each step?",
        "P2 needs only 1 more and 2 are available, so P2 can finish; when it finishes it releases its 3 units, making available = 2+3 = 5.",
        "With available=5, check P3 (needs 5) \u2014 it can now finish, releasing its 2 units, making available = 5+2 = 7.",
        "With available=7, P1 (needs 6) can finish too \u2014 a full safe sequence P2, P3, P1 exists, so the original request from P2 is granted."
      ],
      "result": "Because a safe finishing sequence exists after tentatively granting the request, the Banker's algorithm approves it; if no such sequence existed, the request would be deferred."
    },
    mistakes: [
      {
        "mistake": "Believing that satisfying three of the four Coffman conditions is enough to call it a potential deadlock.",
        "fix": "All four conditions (mutual exclusion, hold and wait, no preemption, circular wait) must hold simultaneously for deadlock to be possible \u2014 breaking any one prevents it."
      },
      {
        "mistake": "Confusing deadlock prevention with deadlock avoidance.",
        "fix": "Prevention statically restricts how resources can be requested (e.g. resource ordering); avoidance dynamically checks each request against a safety criterion (Banker's algorithm) using knowledge of maximum future needs."
      },
      {
        "mistake": "Assuming the Banker's algorithm is practical for general-purpose operating systems.",
        "fix": "Note it requires processes to declare maximum resource needs in advance, which is rarely realistic outside specific controlled systems \u2014 hence most real OSes use detection & recovery instead."
      },
      {
        "mistake": "Assuming a wait-for graph cycle is only possible with two processes.",
        "fix": "Cycles can span any number of processes and resources; always check the full graph rather than only pairs."
      }
    ],
    interviewQA: [
      {
        "q": "What are the four necessary conditions for deadlock?",
        "a": "Mutual exclusion (a resource can only be held by one process at a time), hold and wait (a process holds resources while requesting more), no preemption (resources cannot be forcibly taken from a process), and circular wait (a cycle of processes each waiting on the next). All four must hold together for deadlock to occur."
      },
      {
        "q": "What is the difference between deadlock prevention and deadlock avoidance?",
        "a": "Prevention statically designs the system so that at least one Coffman condition can never occur (e.g. enforcing a global resource ordering to prevent circular wait). Avoidance dynamically evaluates each resource request against known maximum future needs (Banker's algorithm) and only grants requests that keep the system in a 'safe' state."
      },
      {
        "q": "What is a 'safe state' in the context of Banker's algorithm?",
        "a": "A state is safe if there exists at least one ordering in which every process can obtain its maximum remaining resource need, run to completion, and release its resources, allowing all subsequent processes to also complete in turn \u2014 even in the worst case where every process asks for its declared maximum."
      },
      {
        "q": "How does deadlock detection and recovery work in practice?",
        "a": "The system periodically builds a resource-allocation or wait-for graph representing which process holds and waits for which resources, checks for cycles, and if one is found, recovers by aborting or rolling back one or more processes involved in the cycle to release resources and break the deadlock."
      }
    ],
    practice: [
      "Given a resource allocation table, draw the wait-for graph and determine if a deadlock exists.",
      "Run the Banker's algorithm by hand for a given allocation/max/available table and determine if a new request is safe.",
      "Design a resource-ordering scheme for a system with multiple lock types to prevent circular wait.",
      "Explain how you'd choose a 'victim' process to abort when a deadlock is detected, and what factors matter."
    ],
  },

  "Memory management, paging, segmentation": {
    summary:
      "The OS maps each process's logical addresses onto physical memory. Paging uses fixed-size pages/frames; segmentation uses variable logical units.",
    keyPoints: [
      "Paging removes external fragmentation but causes internal fragmentation.",
      "Page table maps page number -> frame number; TLB caches recent translations.",
      "Segmentation matches program structure (code, stack, heap) and eases protection.",
      "Logical address = page number + offset.",
    ],
    syntax: {
      lang: "text",
      code: "logical addr = [ page no | offset ]\nphysical addr = frame(page no) * page_size + offset",
    },
    diagram: `logical pages         page table        physical frames
 P0 --------------> [ P0 -> F3 ] -----> F0 | other
 P1 --------------> [ P1 -> F0 ]        F1 | free
 P2 --------------> [ P2 -> F5 ]        F3 | P0
                                        F5 | P2
TLB sits in front of the page table for O(1) hits`,

    deepDive: [
      "Every process operates in its own logical (virtual) address space, and the OS/hardware together are responsible for translating those logical addresses into physical RAM addresses. This indirection is what allows multiple processes to each believe they have their own private, contiguous memory, and lets the OS relocate, protect, and share memory flexibly.",
      "Paging divides both logical address space and physical memory into fixed-size blocks: pages (logical) and frames (physical), typically 4KB each. A page table, maintained per process, maps each page number to the frame currently holding it. Because block sizes are fixed, a process's last page is often only partially used, wasting some space \u2014 this is internal fragmentation. The major benefit is that paging eliminates external fragmentation entirely, since any free frame can hold any page, with no need for contiguous physical memory.",
      "Segmentation instead divides memory into variable-sized logical units that map to how a programmer actually thinks about a program: a code segment, a data segment, a stack segment, a heap segment. This makes protection and sharing more natural (e.g. mark the code segment read-only, share it across processes running the same program) but reintroduces external fragmentation, since segments of varying sizes must still be fit into contiguous physical memory. Many real systems (like x86 in practice) combine both: segmentation for logical organisation, paging underneath for physical allocation.",
      "A logical address under paging splits into a page number and an offset within that page; the page number is looked up in the page table to get a frame number, and the physical address is computed as frame_number * page_size + offset. Because looking up the page table on every single memory access would be slow, hardware includes a TLB (Translation Lookaside Buffer), a small associative cache of recent page-to-frame translations, so most accesses skip the full page table walk entirely."
    ],
    example: {
      "title": "Translate a logical address using a page table and TLB",
      "steps": [
        "Assume page size = 4KB (4096 bytes), and logical address 0x2050 is requested.",
        "Split the address into page number and offset: page number = 0x2050 / 4096 = 2, offset = 0x2050 mod 4096 = 0x50.",
        "Check the TLB first for page number 2 \u2014 suppose it's a TLB hit, returning frame number 5 immediately.",
        "If it had been a TLB miss, the OS/MMU would walk the page table entry for page 2, find frame 5 there, and then cache that mapping into the TLB for next time.",
        "Compute the physical address: frame_number * page_size + offset = 5 * 4096 + 0x50 = 20480 + 80 = 20560.",
        "The memory controller fetches the actual byte(s) at physical address 20560 in RAM.",
        "If page 2 had not been resident in any frame (page table marks it invalid), this would instead trigger a page fault, handled by virtual memory machinery rather than a direct translation."
      ],
      "result": "The logical address 0x2050 correctly resolves to physical address 20560 via the TLB/page table, transparently to the running process."
    },
    mistakes: [
      {
        "mistake": "Confusing internal and external fragmentation.",
        "fix": "Internal fragmentation is wasted space inside an allocated fixed-size block (paging); external fragmentation is wasted space between allocated blocks of varying size that's too small to be useful (segmentation, or contiguous allocation generally)."
      },
      {
        "mistake": "Assuming the page table lookup happens for literally every memory access with no caching.",
        "fix": "Remember the TLB caches recent translations specifically so most accesses avoid a full page table walk, which would otherwise be a significant slowdown."
      },
      {
        "mistake": "Believing segmentation and paging are mutually exclusive design choices.",
        "fix": "Many real architectures combine both \u2014 segments for logical structure/protection, paging underneath each segment for physical allocation flexibility."
      },
      {
        "mistake": "Forgetting that a page table itself takes memory, and for large address spaces can become large (an argument for multi-level or hierarchical page tables).",
        "fix": "Understand why multi-level page tables exist: they avoid allocating one giant flat table per process when most of the address space is unused."
      }
    ],
    interviewQA: [
      {
        "q": "What is the difference between paging and segmentation?",
        "a": "Paging divides memory into fixed-size blocks (pages/frames), eliminating external fragmentation but causing some internal fragmentation. Segmentation divides memory into variable-sized logical units matching program structure (code, data, stack), which aids protection and sharing but can suffer external fragmentation since segment sizes vary."
      },
      {
        "q": "What is a TLB and why is it important?",
        "a": "A Translation Lookaside Buffer is a small, fast hardware cache of recent page-number-to-frame-number translations. Without it, every memory access would require a full page table lookup (possibly multiple memory accesses for multi-level tables), which would be far too slow; the TLB makes most translations essentially free."
      },
      {
        "q": "How do you compute a physical address from a logical address under paging?",
        "a": "Split the logical address into a page number and an offset (determined by the page size). Look up the page number in the page table to get the corresponding frame number, then compute physical address = frame_number * page_size + offset."
      },
      {
        "q": "Why does paging cause internal fragmentation?",
        "a": "Because memory is allocated in fixed-size page units, a process's actual data rarely fills its last page exactly, so the unused remainder of that final page is wasted \u2014 this waste is called internal fragmentation, unlike external fragmentation which occurs between allocations, not within one."
      }
    ],
    practice: [
      "Given a logical address and page size, manually compute the page number, offset, and resulting physical address.",
      "Explain, with a diagram, why segmentation can suffer external fragmentation while paging cannot.",
      "Research and describe how a multi-level (hierarchical) page table reduces memory overhead for sparse address spaces.",
      "Explain how the OS enforces protection between processes using page table permission bits (read/write/execute)."
    ],
  },

  "Virtual memory & page replacement": {
    summary:
      "Virtual memory lets a process use more address space than RAM by keeping inactive pages on disk and loading them on demand.",
    keyPoints: [
      "A page fault traps to the OS, which loads the page and may evict another.",
      "Replacement policies: FIFO (Belady's anomaly), LRU, Optimal (theoretical bound), Clock (practical LRU).",
      "Thrashing = more time paging than executing; fix by reducing the degree of multiprogramming or adding RAM.",
      "Working set = pages a process needs in the current phase.",
    ],
    syntax: {
      lang: "text",
      code: "effective access = (1-p) * mem_time + p * fault_time\np = page fault rate (tiny p still dominates the average)",
    },
    diagram: `refs: 1 2 3 1 4 2 5   frames = 3   (LRU)
 [1]  [1 2]  [1 2 3]  hit(1)  [1 3 4]  [3 4 2]  [4 2 5]
faults:  *     *   *            *        *        *
thrashing: CPU util drops as page faults climb`,

    deepDive: [
      "Virtual memory is the abstraction that lets a process behave as though it has access to more memory than physically exists, by keeping only the actively used portion of its address space in RAM and the rest on disk (in a swap area or backing file). This also enables running more processes than would otherwise fit in physical memory simultaneously, and lets each process have a large, contiguous-looking address space regardless of how fragmented physical RAM actually is.",
      "When a process accesses a page that isn't currently in RAM, the hardware raises a page fault, trapping into the OS. The OS finds a free frame (or evicts an occupied one), loads the required page from disk into that frame, updates the page table, and resumes the process \u2014 all transparent to the program itself, aside from the time cost.",
      "When RAM is full and a new page must be loaded, the OS must choose an existing page to evict, governed by a page replacement policy. FIFO evicts the oldest-loaded page, is simple but can suffer Belady's anomaly (adding more frames can, counter-intuitively, increase the fault rate). LRU (Least Recently Used) evicts the page that hasn't been touched for the longest time, which performs well in practice because it exploits temporal locality, but is expensive to implement exactly. Optimal replacement (evict the page that won't be used for the longest time in the future) is only computable in hindsight and serves as a theoretical best-case benchmark. Clock (second-chance) approximates LRU cheaply using a reference bit and a circular scan, and is what most real operating systems actually implement.",
      "Thrashing occurs when the system spends more time servicing page faults (swapping pages in and out) than doing actual useful computation, typically because too many processes are competing for too little RAM. The fix is to reduce the degree of multiprogramming (run fewer processes concurrently), add more RAM, or ensure each process's working set (the pages it actively needs during its current phase of execution) fits comfortably in memory."
    ],
    example: {
      "title": "Dry-run LRU page replacement for a reference string with 3 frames",
      "steps": [
        "Reference string: 1 2 3 1 4 2 5, with 3 available frames, initially empty.",
        "Access 1: not in memory -> fault. Frames: [1]. (fault #1)",
        "Access 2: not in memory -> fault. Frames: [1, 2]. (fault #2)",
        "Access 3: not in memory -> fault. Frames: [1, 2, 3]. (fault #3, frames now full)",
        "Access 1: already in memory -> hit, and 1 becomes the most recently used (order becomes 2,3,1 by recency).",
        "Access 4: not in memory and frames full -> fault; evict the least recently used page, which is 2 -> Frames become [3, 1, 4]. (fault #4)",
        "Access 2: not in memory -> fault; evict least recently used (3) -> Frames become [1, 4, 2]. (fault #5). Access 5: fault again, evict LRU (1) -> Frames become [4, 2, 5]. (fault #6)"
      ],
      "result": "6 page faults out of 7 references for this string under LRU with 3 frames \u2014 only the repeated access to page 1 was a hit."
    },
    mistakes: [
      {
        "mistake": "Assuming more physical frames always reduces the number of page faults.",
        "fix": "Know Belady's anomaly: under FIFO specifically, adding more frames can sometimes increase faults \u2014 this is a classic 'gotcha' fact examiners like to test."
      },
      {
        "mistake": "Implementing 'true' LRU in a real system without realising the overhead.",
        "fix": "Understand why practical systems use Clock/second-chance as a cheap approximation of LRU rather than tracking exact access recency for every page, which would need extra hardware/software bookkeeping on every memory access."
      },
      {
        "mistake": "Diagnosing high CPU utilisation drop as a scheduling problem when it's actually thrashing.",
        "fix": "Check the page fault rate; if it's very high alongside low CPU utilisation despite many ready processes, the real fix is reducing the multiprogramming degree or adding memory, not tweaking the scheduler."
      },
      {
        "mistake": "Confusing 'working set' with 'total memory used by a process'.",
        "fix": "Working set specifically means the pages actively needed during the current phase/time window of execution, which can be much smaller than the process's total virtual memory footprint."
      }
    ],
    interviewQA: [
      {
        "q": "What is a page fault and what happens when one occurs?",
        "a": "A page fault is a trap raised by hardware when a process accesses a virtual page that isn't currently mapped to a physical frame. The OS's fault handler finds or frees a frame, loads the required page from disk into it, updates the page table, and then resumes the process at the faulting instruction."
      },
      {
        "q": "Compare FIFO, LRU, and Optimal page replacement.",
        "a": "FIFO evicts the oldest-loaded page \u2014 simple but can suffer Belady's anomaly. LRU evicts the least recently accessed page, exploiting temporal locality and generally performing well, but exact tracking is costly. Optimal evicts the page that will not be used for the longest time in the future, giving the theoretical minimum number of faults, but it requires future knowledge so it's only usable for analysis/benchmarking, not real systems."
      },
      {
        "q": "What is thrashing and how do you fix it?",
        "a": "Thrashing is when a system spends most of its time handling page faults rather than doing useful work, typically because too many processes are competing for too little physical memory, causing each process's working set to constantly get evicted before it can make progress. Fixes include reducing the degree of multiprogramming, adding more RAM, or tuning per-process memory limits so working sets fit in memory."
      },
      {
        "q": "What is Belady's anomaly?",
        "a": "It's the counter-intuitive result, specific to certain algorithms like FIFO, where increasing the number of available page frames can actually increase the number of page faults for some reference strings, rather than decreasing or leaving it unchanged as one would naturally expect."
      }
    ],
    practice: [
      "Given a reference string and number of frames, compute the number of page faults under FIFO, LRU, and Optimal, and compare.",
      "Construct a reference string and frame count that demonstrates Belady's anomaly under FIFO.",
      "Explain how the Clock (second-chance) algorithm approximates LRU using a reference bit.",
      "Given system metrics (high fault rate, low CPU utilisation), diagnose thrashing and propose two concrete fixes."
    ],
  },

  "File systems and I/O": {
    summary:
      "A file system organises blocks on disk into files and directories, tracking metadata in structures such as inodes.",
    keyPoints: [
      "Allocation strategies: contiguous (fast, fragmenting), linked, indexed (inode).",
      "An inode stores permissions, size, timestamps and block pointers — not the name.",
      "Journalling writes intent first so a crash can be replayed safely.",
      "I/O paths: programmed, interrupt-driven, DMA (device writes to memory directly).",
    ],
    syntax: {
      lang: "text",
      code: "open() -> read()/write() -> close()\nfd table (per process) -> inode table -> disk blocks",
    },
    diagram: ` directory entry            inode 42            data blocks
 "notes.txt" -> 42 ---> [ perms, size,   ] ---> [ b1 ][ b2 ]
                        [ ptr b1, ptr b2 ] ---> [ indirect ] -> more`,

    deepDive: [
      "A file system is the layer of the OS responsible for organising raw disk blocks into a structure of files and directories, and for tracking metadata about each file, such as its size, permissions, and timestamps, separately from its actual content. Most Unix-like file systems store this metadata in a structure called an inode, while the directory itself only stores a mapping from filename to inode number \u2014 this is why a file can have multiple hard links (different names) pointing to the same inode, and why renaming a file doesn't touch its data blocks at all.",
      "Different allocation strategies exist for mapping a file's logical blocks onto physical disk blocks. Contiguous allocation stores a file's blocks sequentially on disk, giving very fast sequential access, but suffers from external fragmentation and requires knowing the file's size in advance (or being willing to move it later). Linked allocation stores each block with a pointer to the next block, eliminating external fragmentation but making random access slow (you must follow the chain from the start) and wasting space on pointers. Indexed allocation (used by inodes) keeps an index block listing pointers to all of a file's data blocks, giving fast random access; when a file grows very large, an indirect block (a block full of pointers to other data blocks, potentially several levels deep) extends this scheme.",
      "Journalling file systems (like ext4, NTFS) improve crash resilience by first writing a description of an intended change (the 'journal' or 'log') before actually modifying the real file system structures. If the system crashes mid-operation, the journal can be replayed on reboot to either complete or cleanly undo the interrupted operation, avoiding the corrupted, inconsistent states that older non-journalling file systems were prone to after a crash.",
      "I/O can happen in a few different ways with increasing efficiency: programmed I/O has the CPU actively poll the device status in a busy loop, wasting CPU cycles; interrupt-driven I/O lets the CPU do other work and only handle the device once it raises an interrupt signalling completion, which is far more efficient; and DMA (Direct Memory Access) goes a step further by letting the device controller transfer data directly to/from main memory without the CPU copying each byte itself, only interrupting the CPU once the whole transfer is complete \u2014 essential for high-throughput devices like disks and network cards."
    ],
    example: {
      "title": "Trace opening and reading a file through the OS's I/O stack",
      "steps": [
        "The application calls open(\"notes.txt\"), which the OS resolves by looking up the directory entry mapping the filename 'notes.txt' to inode number 42.",
        "The OS reads inode 42 from disk (or cache), which contains metadata (permissions, size, timestamps) and pointers to the file's actual data blocks.",
        "The OS creates an entry in the process's per-process file descriptor table pointing to a system-wide open file table entry, and returns a file descriptor (e.g. fd=3) to the application.",
        "The application calls read(fd, buffer, size); the OS uses the file descriptor to find inode 42 again, and determines which data blocks correspond to the requested byte range.",
        "The OS issues a request to the disk driver to fetch those specific blocks \u2014 if DMA is available, the disk controller transfers the data directly into a kernel buffer without CPU involvement for each byte.",
        "Once the transfer completes (signalled via an interrupt), the OS copies the data from the kernel buffer into the application's user-space buffer, and read() returns the number of bytes read.",
        "The application calls close(fd), which removes the file descriptor table entry and, if no other process references it, releases the open file table entry."
      ],
      "result": "The file's content is read into the application's buffer via inode lookup, block mapping, and an efficient DMA + interrupt-driven transfer, without the CPU busy-polling the disk."
    },
    mistakes: [
      {
        "mistake": "Thinking a directory entry stores the file's actual content or metadata directly.",
        "fix": "Remember a directory entry only maps a filename to an inode number; all metadata and block pointers live in the inode itself, which is why hard links work."
      },
      {
        "mistake": "Assuming contiguous allocation is always best because it's fastest for sequential reads.",
        "fix": "Recognise its major weakness \u2014 external fragmentation and difficulty growing a file in place \u2014 which is why most modern file systems use indexed allocation (inodes) instead."
      },
      {
        "mistake": "Confusing interrupt-driven I/O with DMA as if they were the same thing.",
        "fix": "Interrupt-driven I/O is about the CPU being notified instead of polling; DMA is about the actual data transfer bypassing CPU-driven copying \u2014 real systems typically combine both (DMA transfer, then an interrupt on completion)."
      },
      {
        "mistake": "Underestimating what journalling protects against.",
        "fix": "Journalling protects file-system metadata (and optionally data) consistency across crashes by replaying an intent log \u2014 it does not prevent data loss for writes that were never flushed/acknowledged before a crash."
      }
    ],
    interviewQA: [
      {
        "q": "What is an inode, and what does it store?",
        "a": "An inode is a data structure that stores a file's metadata \u2014 permissions, owner, size, timestamps, and pointers to its data blocks \u2014 but not the filename itself; the filename-to-inode mapping is stored separately in the directory, which is why multiple directory entries (hard links) can point to the same inode."
      },
      {
        "q": "Compare contiguous, linked, and indexed file allocation.",
        "a": "Contiguous allocation places a file's blocks sequentially, giving fast sequential access but causing external fragmentation and making growth hard. Linked allocation chains blocks with pointers, avoiding external fragmentation but making random access slow and wasting space on pointers. Indexed allocation (e.g. inodes) keeps a list/index of block pointers for a file, giving efficient random access and being the most common approach in modern file systems, extended with indirect blocks for very large files."
      },
      {
        "q": "What is journalling and why does it matter?",
        "a": "Journalling file systems record an intended change to a write-ahead log before applying it to the actual file system structures. If the system crashes mid-write, the journal can be replayed on recovery to complete or cleanly roll back the operation, preventing the file system from being left in a corrupted, inconsistent state."
      },
      {
        "q": "What is the advantage of DMA over programmed I/O?",
        "a": "In programmed I/O, the CPU must actively poll the device and copy each byte itself, wasting CPU cycles on a slow mechanical operation. DMA lets the device controller transfer data directly to/from main memory independently, only interrupting the CPU once the whole transfer completes, freeing the CPU to do other useful work during the transfer."
      }
    ],
    practice: [
      "Draw the full path from open() to close() showing the file descriptor table, open file table, and inode.",
      "Compare how contiguous vs indexed allocation would handle a file that needs to grow from 10 blocks to 1000 blocks.",
      "Explain, step by step, how a journalling file system recovers after a crash mid-write.",
      "Compare programmed I/O, interrupt-driven I/O, and DMA in terms of CPU involvement, with a diagram."
    ],
  },
};
