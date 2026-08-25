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
  },
};
