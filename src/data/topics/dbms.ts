import type { TopicMap } from "../topicContent";

export const dbmsTopics: TopicMap = {
  "ER modelling & Normalisation (1NF to BCNF)": {
    summary:
      "An ER model describes entities, attributes and relationships before tables exist. Normalisation then splits tables to remove redundancy and update anomalies.",
    keyPoints: [
      "1NF: atomic values, no repeating groups. 2NF: no partial dependency on part of a composite key.",
      "3NF: no transitive dependency (non-key deciding non-key). BCNF: every determinant is a candidate key.",
      "Normalising reduces redundancy but adds joins; denormalise deliberately for read-heavy analytics.",
      "Cardinality notation: 1:1, 1:N, M:N (M:N needs a junction table).",
    ],
    syntax: {
      lang: "sql",
      code: "-- M:N resolved with a junction table\nCREATE TABLE student_course (\n  student_id INT REFERENCES students(id),\n  course_id  INT REFERENCES courses(id),\n  PRIMARY KEY (student_id, course_id)\n);",
    },
    diagram: `unnormalised
 +----+--------+---------------------+
 | id | name   | courses             |
 | 1  | Asha   | DSA, DBMS           |  <- not 1NF
 +----+--------+---------------------+

normalised (3NF)
 students            student_course        courses
 +----+------+       +-----+------+       +----+------+
 | id | name |  1--N | sid | cid  | N--1  | id | name |
 +----+------+       +-----+------+       +----+------+`,
  },

  "Joins, subqueries, CTEs": {
    summary:
      "Joins combine rows from two tables on a condition. Subqueries nest a query inside another; CTEs (WITH) name a subquery so it reads top-to-bottom.",
    keyPoints: [
      "INNER keeps matches only; LEFT keeps all left rows with NULLs; FULL keeps both sides.",
      "Correlated subqueries run per row — often rewritable as a join for speed.",
      "CTEs improve readability and allow recursion (hierarchies, trees).",
      "Beware: a LEFT JOIN filter placed in WHERE silently turns it into an INNER JOIN.",
    ],
    syntax: {
      lang: "sql",
      code: "WITH paid AS (\n  SELECT user_id, SUM(amount) total FROM orders GROUP BY user_id\n)\nSELECT u.name, p.total\nFROM users u LEFT JOIN paid p ON p.user_id = u.id;",
    },
    diagram: `   users        orders
   +----+       +----+
   | A  |-------| A1 |
   | B  |-------| B1 |
   | C  |   x   (none)
   +----+       +----+
INNER JOIN -> A, B
LEFT  JOIN -> A, B, C(NULL)`,
  },

  "Window functions & aggregation": {
    summary:
      "Aggregation collapses rows into groups. A window function computes across a set of rows while keeping every row visible.",
    keyPoints: [
      "OVER (PARTITION BY ... ORDER BY ...) defines the window.",
      "ROW_NUMBER is unique, RANK leaves gaps, DENSE_RANK does not.",
      "Running totals: SUM(x) OVER (ORDER BY d ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW).",
      "LAG/LEAD compare a row to its neighbours — the standard 'growth vs last month' question.",
    ],
    syntax: {
      lang: "sql",
      code: "SELECT dept, name, salary,\n  RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS r\nFROM employees;",
    },
    diagram: `dept | name | salary | RANK() over dept
-----+------+--------+-----------------
 ENG | Asha |  90    | 1  <-+ partition ENG
 ENG | Ravi |  80    | 2    |
 ENG | Sara |  80    | 2  <-+
 OPS | Dev  |  70    | 1  <-- partition OPS restarts`,
  },

  "Indexes and query plans": {
    summary:
      "An index is a B-tree side structure that lets the engine find rows without scanning the table. EXPLAIN shows which access path the planner chose.",
    keyPoints: [
      "Speeds up reads, slows writes, and costs disk space.",
      "Composite index (a,b) helps WHERE a, and WHERE a AND b, but not WHERE b alone (leftmost prefix rule).",
      "Wrapping a column in a function (WHERE LOWER(x)=..) disables the index.",
      "Read plans for Seq Scan vs Index Scan, and check the row-estimate accuracy.",
    ],
    syntax: {
      lang: "sql",
      code: "CREATE INDEX idx_orders_user_date ON orders(user_id, created_at);\nEXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 7;",
    },
    diagram: `without index                with B-tree index
 scan every row               [50]
 row1 row2 ... row1M         /    \\
 O(n)                    [20]      [80]
                         / \\       /  \\
                      [10][30]  [70] [90]   O(log n)`,
  },

  "Transactions, ACID, isolation levels": {
    summary:
      "A transaction is a unit of work that either fully commits or fully rolls back. ACID = Atomicity, Consistency, Isolation, Durability.",
    keyPoints: [
      "Read Uncommitted -> dirty reads; Read Committed -> non-repeatable reads; Repeatable Read -> phantoms; Serializable -> none.",
      "Higher isolation = fewer anomalies, more locking/aborts.",
      "MVCC gives readers a snapshot so they never block writers.",
      "Money transfers must be one transaction, not two statements.",
    ],
    syntax: {
      lang: "sql",
      code: "BEGIN;\nUPDATE accounts SET bal = bal - 100 WHERE id = 1;\nUPDATE accounts SET bal = bal + 100 WHERE id = 2;\nCOMMIT;  -- ROLLBACK on any failure",
    },
    diagram: `level             dirty  non-repeat  phantom
Read Uncommitted   yes      yes        yes
Read Committed     no       yes        yes
Repeatable Read    no       no         yes
Serializable       no       no         no

BEGIN --> work --> COMMIT (durable)
              \\--> ROLLBACK (nothing happened)`,
  },

  "Locking & deadlocks": {
    summary:
      "Locks stop two transactions from corrupting the same row. A deadlock is a cycle where each transaction waits for a lock the other holds.",
    keyPoints: [
      "Shared (read) locks coexist; exclusive (write) locks do not.",
      "Deadlock needs a wait-for cycle; the DB detects it and aborts one victim.",
      "Prevent by locking rows in a consistent order and keeping transactions short.",
      "SELECT ... FOR UPDATE takes a row lock for read-modify-write flows.",
    ],
    syntax: {
      lang: "sql",
      code: "BEGIN;\nSELECT * FROM seats WHERE id = 12 FOR UPDATE; -- lock the row\nUPDATE seats SET taken = true WHERE id = 12;\nCOMMIT;",
    },
    diagram: `T1 holds row A, wants row B
T2 holds row B, wants row A

   T1 ---wants---> B
   ^               |
   |held by        |held by
   A <---wants--- T2      cycle = deadlock -> abort one`,
  },

  "NoSQL vs relational trade-offs": {
    summary:
      "Relational databases enforce a schema and joins with strong consistency. NoSQL stores (document, key-value, wide-column, graph) trade joins and constraints for scale and flexibility.",
    keyPoints: [
      "Use SQL when data is related, transactional and reporting matters.",
      "Use document stores for evolving, self-contained records; key-value for caches and sessions.",
      "NoSQL usually models around access patterns, duplicating data instead of joining.",
      "The real answer in interviews names the workload, not a favourite product.",
    ],
    syntax: {
      lang: "json",
      code: "// document model: order embeds its items\n{ \"id\": 1, \"user\": \"asha\",\n  \"items\": [{ \"sku\": \"A1\", \"qty\": 2 }] }",
    },
    diagram: `relational                     document
 users   orders   items         orders
   |       |        |            { user, items:[...] }
   +--join-+--join--+            single read, no join
 normalised, strong ACID        denormalised, scales out`,
  },
};
