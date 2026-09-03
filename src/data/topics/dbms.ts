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

    deepDive: [
      "ER modelling is the design step before you write a single CREATE TABLE. You identify entities (nouns like Student, Course), their attributes, and relationships between them (enrolls-in), then decide cardinality: one-to-one, one-to-many, or many-to-many. Getting this right on paper saves painful schema migrations later, because changing a live production table's structure is far costlier than redrawing a diagram.",
      "Normalisation is a mechanical process of splitting a table so that each fact is stored exactly once. 1NF forbids repeating groups or multi-valued fields inside a single column \u2014 a 'courses' column holding 'DSA, DBMS' violates it. 2NF only matters when the primary key is composite; it removes attributes that depend on only part of that key. 3NF removes transitive dependencies, i.e. a non-key column that depends on another non-key column rather than the key itself. BCNF is the stricter version of 3NF: every determinant (left side of a functional dependency) must be a candidate key.",
      "In interviews you are frequently asked to normalise a given unnormalised table step by step, or to spot which normal form a table violates. The trick is always to first write down the functional dependencies (X determines Y), then check each rule against them mechanically rather than guessing intuitively.",
      "In real systems, normalisation is not always the end goal. OLTP systems (banking, checkout) favour normalised schemas to avoid update anomalies. OLAP/reporting systems often deliberately denormalise (star schemas, wide tables) because joins across many normalized tables are expensive at read time and the data is not being frequently updated."
    ],
    example: {
      "title": "Normalise a table storing Student, StudentCity, and a comma-separated Courses column",
      "steps": [
        "Start: students(id, name, city, courses) where courses = 'DSA, DBMS'.",
        "Check 1NF: the courses column has repeating values in one cell -> violates 1NF.",
        "Split into students(id, name, city) and student_course(student_id, course_id) to make courses atomic -> now in 1NF.",
        "Check 2NF: primary key of students is just id (not composite), so no partial dependency exists -> already 2NF.",
        "Check 3NF: does city depend on id directly, or transitively via something else? If city depends only on id, it's fine; if a 'zipcode' column existed and city depended on zipcode instead of id, that would be a transitive dependency to remove.",
        "Check BCNF: verify every determinant is a candidate key; if city determines a country column, and city is not a candidate key, split it into its own city table.",
        "Result: students(id, name, city), student_course(student_id, course_id), courses(id, name) \u2014 no redundancy, no anomalies."
      ],
      "result": "A fully normalised schema (up to BCNF) with three related tables instead of one anomaly-prone table."
    },
    mistakes: [
      {
        "mistake": "Treating 1NF as 'no duplicate rows' instead of 'atomic column values'.",
        "fix": "Remember 1NF is about the shape of a single cell \u2014 no lists/repeating groups inside a column, not about row-level duplication."
      },
      {
        "mistake": "Applying 2NF checks even when the primary key is not composite.",
        "fix": "2NF is only a real constraint when the key has multiple columns; with a single-column key, 1NF tables are automatically in 2NF."
      },
      {
        "mistake": "Confusing 3NF and BCNF and assuming they are the same rule.",
        "fix": "3NF allows a rare edge case where a non-candidate-key attribute determines part of the key; BCNF removes even that exception \u2014 learn the one example table where they differ."
      },
      {
        "mistake": "Over-normalising a reporting/analytics table and killing query performance with many joins.",
        "fix": "Normalise the transactional write path, but deliberately denormalise read-heavy analytical tables (star schema) for speed."
      }
    ],
    interviewQA: [
      {
        "q": "What is the difference between 3NF and BCNF?",
        "a": "Both remove transitive dependencies, but BCNF is stricter: it requires every determinant of a functional dependency to be a candidate key, whereas 3NF makes an exception when the dependent attribute is itself part of some candidate key. In practice, most 3NF tables are already BCNF; the difference only shows up with overlapping composite candidate keys."
      },
      {
        "q": "Why would you deliberately denormalise a table?",
        "a": "To reduce the number of joins needed for read-heavy workloads such as dashboards or reports, trading some storage and update complexity for faster reads. It's common in data warehouses using star/snowflake schemas."
      },
      {
        "q": "How do you resolve a many-to-many relationship in a relational schema?",
        "a": "By introducing a junction (bridge) table whose primary key is the composite of the two foreign keys, turning one M:N relationship into two 1:N relationships."
      },
      {
        "q": "What update anomalies does normalisation prevent?",
        "a": "Insertion anomalies (can't add a fact without an unrelated one), update anomalies (same fact stored in multiple rows can go out of sync), and deletion anomalies (deleting one fact accidentally deletes another)."
      }
    ],
    practice: [
      "Take an unnormalised table with repeating groups and normalise it step by step to BCNF, writing down functional dependencies at each stage.",
      "Design an ER diagram for a library system (Book, Member, Loan) and mark cardinalities.",
      "Given a schema, identify which normal form it currently satisfies and which it violates.",
      "Build a denormalised reporting table from a normalised OLTP schema and explain the trade-off."
    ],
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

    deepDive: [
      "Joins are the mechanism SQL uses to reconstruct related facts that normalisation deliberately split apart. An INNER JOIN only returns rows that have a match on both sides, so if a user has no orders they simply disappear from the result. A LEFT JOIN keeps every row from the left table and fills unmatched right-side columns with NULL, which is essential when you need to report on 'all users, even those with zero orders'.",
      "Subqueries let you nest a query inside another, either in the SELECT list, the FROM clause, or a WHERE condition. An uncorrelated subquery runs once and its result is reused; a correlated subquery references a column from the outer query and therefore conceptually re-runs once per outer row, which can be slow. Most correlated subqueries can be rewritten as joins or window functions for better performance, and query planners often do this rewrite automatically, but you should know how to do it manually too.",
      "CTEs (Common Table Expressions), written with WITH, name an intermediate result so the rest of the query can reference it like a temporary view. They make deeply nested queries readable top-to-bottom instead of nested inside-out, and recursive CTEs are the standard tool for hierarchical data such as org charts, category trees or bill-of-materials explosions.",
      "A classic gotcha: if you write a LEFT JOIN to keep unmatched rows, but then filter on a right-table column in the WHERE clause (e.g. WHERE orders.status = 'paid'), any row where the join produced NULL will fail that WHERE condition and get dropped \u2014 silently turning your LEFT JOIN back into an INNER JOIN. The fix is to move that condition into the ON clause instead."
    ],
    example: {
      "title": "Find every user and their total paid amount, including users with zero orders",
      "steps": [
        "Write a CTE: WITH paid AS (SELECT user_id, SUM(amount) total FROM orders GROUP BY user_id).",
        "This aggregates orders per user_id first, producing one row per user who has at least one order.",
        "Now LEFT JOIN users to paid: SELECT u.name, p.total FROM users u LEFT JOIN paid p ON p.user_id = u.id.",
        "For a user with orders, p.total is the summed amount from the CTE.",
        "For a user with no orders at all, there's no matching row in paid, so p.total comes back as NULL.",
        "Wrap with COALESCE(p.total, 0) if you want zero instead of NULL in the report.",
        "Result: every user appears exactly once, with either a real total or 0/NULL."
      ],
      "result": "A complete user list with paid totals, with no user silently dropped."
    },
    mistakes: [
      {
        "mistake": "Filtering a LEFT JOIN's right-table column in WHERE and wondering why unmatched rows vanish.",
        "fix": "Move the filter into the ON clause, or filter after the join is confirmed to keep NULLs, e.g. WHERE p.total IS NULL OR p.total > 0."
      },
      {
        "mistake": "Using a correlated subquery in the SELECT list for every row, causing an N+1-style slowdown.",
        "fix": "Rewrite as a JOIN with GROUP BY, or as a window function, so the database computes it in one pass."
      },
      {
        "mistake": "Forgetting that CTEs are (in most databases) not indexes or materialised by default \u2014 reusing a huge CTE many times can be recomputed each time.",
        "fix": "For Postgres, check if MATERIALIZED is needed for performance-sensitive repeated CTE use, or use a temp table instead."
      },
      {
        "mistake": "Assuming JOIN order in the FROM clause changes results.",
        "fix": "For INNER JOINs the order doesn't change correctness (only possibly performance); for LEFT/RIGHT it changes which side keeps unmatched rows, so be deliberate about direction."
      }
    ],
    interviewQA: [
      {
        "q": "What is the difference between INNER JOIN and LEFT JOIN?",
        "a": "INNER JOIN returns only rows with a match in both tables. LEFT JOIN returns every row from the left table, filling in NULLs for columns from the right table when there is no match."
      },
      {
        "q": "When would you use a CTE instead of a subquery?",
        "a": "When you want to name an intermediate result for readability, reuse it multiple times in the same query, or write a recursive query (e.g. traversing a hierarchy), since only CTEs support recursion in standard SQL."
      },
      {
        "q": "Why can a correlated subquery be slow, and how do you fix it?",
        "a": "Because conceptually it re-evaluates once per outer row instead of once overall. It can often be rewritten as a JOIN combined with GROUP BY or a window function so the database computes the result in a single pass."
      },
      {
        "q": "What is the classic bug when combining LEFT JOIN with a WHERE clause?",
        "a": "Putting a condition on the right-hand table's column in WHERE filters out the NULL rows produced by unmatched left rows, effectively converting the LEFT JOIN into an INNER JOIN. The fix is to put that condition in the ON clause."
      }
    ],
    practice: [
      "Write a query using a LEFT JOIN to list all customers and their most recent order, including customers with none.",
      "Rewrite a correlated subquery that computes 'orders above the customer's average' as a window function instead.",
      "Write a recursive CTE to print an employee-manager hierarchy with depth levels.",
      "Deliberately write a buggy LEFT JOIN + WHERE query, observe it becoming an INNER JOIN, then fix it."
    ],
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

    deepDive: [
      "GROUP BY aggregation and window functions solve related but different problems. GROUP BY collapses many rows into one row per group, so you lose row-level detail \u2014 you can no longer see the individual salary alongside the department average. Window functions solve exactly this: they compute an aggregate or ranking across a set of related rows (the 'window') but keep every original row visible, so you can show 'this employee's salary next to their department's average' in a single row.",
      "The OVER clause defines the window: PARTITION BY divides rows into groups the same way GROUP BY would, and ORDER BY within OVER controls running/cumulative calculations and ranking order. Ranking functions differ subtly: ROW_NUMBER always assigns unique increasing numbers even to ties, RANK gives the same rank to ties but then skips the next rank number (1,2,2,4), and DENSE_RANK gives ties the same rank without skipping (1,2,2,3).",
      "Running and moving calculations use a frame clause, most commonly ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a running total, or ROWS BETWEEN N PRECEDING AND CURRENT ROW for a moving average/window. LAG and LEAD let you pull a value from a previous or following row within the same partition, which is the standard building block for 'growth compared to last month' or 'time since previous event' queries.",
      "A frequent interview task is: 'find the top-N per group', which is elegantly solved with ROW_NUMBER() OVER (PARTITION BY group ORDER BY value DESC) wrapped in an outer query filtering WHERE rn <= N \u2014 something a plain GROUP BY cannot express because it can't return more than one row per group."
    ],
    example: {
      "title": "Find the top-2 highest paid employees per department",
      "steps": [
        "Start with employees(id, name, dept, salary).",
        "Compute a rank within each department: SELECT *, RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS r FROM employees.",
        "PARTITION BY dept resets the ranking counter for every new department.",
        "ORDER BY salary DESC means the highest paid employee in each department gets rank 1.",
        "If two employees tie at the top, both get rank 1, and the next distinct salary gets rank 3 (RANK skips), or rank 2 if using DENSE_RANK.",
        "Wrap this in a CTE or subquery: SELECT * FROM (that query) t WHERE r <= 2.",
        "Result: exactly the top 2 salaries per department, with ties handled according to the ranking function chosen."
      ],
      "result": "A row-level result showing each qualifying employee plus their department rank, not a collapsed one-row-per-department summary."
    },
    mistakes: [
      {
        "mistake": "Using GROUP BY when the task actually needs row-level detail (like top-N per group).",
        "fix": "Recognise that GROUP BY collapses rows; use a window function ranking, then filter in an outer query."
      },
      {
        "mistake": "Confusing RANK and DENSE_RANK and getting unexpected gaps in numbering.",
        "fix": "Remember RANK skips numbers after ties (1,2,2,4); DENSE_RANK does not (1,2,2,3); pick based on whether gaps matter downstream."
      },
      {
        "mistake": "Forgetting you cannot filter directly on a window function's alias in the same-level WHERE clause.",
        "fix": "Window functions are evaluated after WHERE/GROUP BY, so wrap the query in a subquery/CTE and filter in the outer layer."
      },
      {
        "mistake": "Omitting ORDER BY inside OVER() for a running total, producing an undefined or full-table sum instead of cumulative values.",
        "fix": "Always specify ORDER BY inside OVER for running totals/moving windows; without it the default frame can sum the whole partition."
      }
    ],
    interviewQA: [
      {
        "q": "What is the difference between ROW_NUMBER, RANK, and DENSE_RANK?",
        "a": "ROW_NUMBER assigns strictly increasing unique numbers even to tied values. RANK gives tied rows the same rank but skips subsequent rank numbers. DENSE_RANK gives tied rows the same rank without skipping any numbers."
      },
      {
        "q": "How would you get the top 3 salaries per department using SQL?",
        "a": "Use ROW_NUMBER() or RANK() with PARTITION BY department ORDER BY salary DESC in a CTE or subquery, then filter the outer query WHERE rn <= 3, since window functions can't be filtered directly in the same SELECT's WHERE clause."
      },
      {
        "q": "Why can't you filter on a window function result in the WHERE clause of the same query?",
        "a": "Because WHERE is logically evaluated before window functions are computed in SQL's conceptual execution order (FROM/WHERE/GROUP BY/HAVING before SELECT's window functions), so the alias doesn't exist yet at that stage; you must wrap it in a subquery or CTE."
      },
      {
        "q": "How do LAG and LEAD work, and give a use case.",
        "a": "LAG(col) returns the value of col from the previous row in the partition's order, LEAD(col) returns it from the following row. A classic use case is calculating month-over-month growth: current_value - LAG(current_value) OVER (ORDER BY month)."
      }
    ],
    practice: [
      "Write a query that computes each employee's salary alongside their department's average salary in the same row.",
      "Write a running total of daily sales using SUM() OVER with an ORDER BY frame.",
      "Use LAG to compute month-over-month percentage growth in a sales table.",
      "Solve the classic 'top-N per group' problem using ROW_NUMBER wrapped in a subquery."
    ],
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

    deepDive: [
      "An index is an auxiliary data structure, almost always a B-tree (or hash for equality-only lookups), that stores sorted references to rows so the engine can jump straight to matching rows instead of scanning the whole table. Without an index, a WHERE filter forces a sequential scan \u2014 checking every row, an O(n) operation. With a B-tree index, the same lookup becomes roughly O(log n) because the tree narrows the search space at each level.",
      "Indexes are not free: every INSERT/UPDATE/DELETE must also update every index on that table, and each index consumes disk space. This is why you index columns that are frequently filtered, joined, or sorted on, but avoid indexing every column blindly, especially on write-heavy tables.",
      "Composite (multi-column) indexes follow the 'leftmost prefix rule': an index on (a, b) can be used efficiently for WHERE a = ?, and WHERE a = ? AND b = ?, but not for WHERE b = ? alone, because the tree is physically sorted by a first. Similarly, wrapping an indexed column in a function, e.g. WHERE LOWER(email) = 'x', prevents the planner from using a plain index on email, since the stored values are the raw (non-lowercased) values \u2014 you'd need a functional/expression index on LOWER(email) instead.",
      "EXPLAIN (or EXPLAIN ANALYZE) shows the actual plan the optimizer chose: watch for 'Seq Scan' (full table scan) versus 'Index Scan' or 'Index Only Scan', and compare the estimated row count to the actual row count \u2014 a large mismatch usually means stale statistics and is a common reason a query 'should' use an index but doesn't."
    ],
    example: {
      "title": "Diagnose why WHERE user_id = 7 is doing a full table scan on a 1M-row orders table",
      "steps": [
        "Run EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 7;",
        "Observe the plan says 'Seq Scan on orders' with a high actual runtime \u2014 no index is being used.",
        "Check existing indexes with \\d orders (Postgres) \u2014 suppose there's only a primary key index on id, none on user_id.",
        "Create the missing index: CREATE INDEX idx_orders_user_id ON orders(user_id);",
        "Re-run EXPLAIN ANALYZE \u2014 the plan now shows 'Index Scan using idx_orders_user_id', with far fewer rows examined.",
        "If the query also filters by date often, extend it to a composite index (user_id, created_at) to serve both patterns via the leftmost prefix rule.",
        "Confirm with ANALYZE orders; to ensure planner statistics are fresh so future plans stay accurate."
      ],
      "result": "The query now uses an Index Scan instead of a Seq Scan, cutting execution time from scanning 1M rows to a handful."
    },
    mistakes: [
      {
        "mistake": "Adding an index on every column 'just in case'.",
        "fix": "Index only columns used in WHERE/JOIN/ORDER BY on large or frequently-queried tables; excess indexes slow down writes and waste space."
      },
      {
        "mistake": "Expecting a composite index (a, b) to speed up a query that only filters on b.",
        "fix": "Recall the leftmost prefix rule \u2014 either reorder the index to (b, a) if b is more commonly filtered alone, or add a separate index on b."
      },
      {
        "mistake": "Wrapping an indexed column in a function in WHERE, e.g. WHERE LOWER(email) = 'x', then wondering why the index isn't used.",
        "fix": "Create a functional/expression index on LOWER(email), or store a pre-lowercased column separately."
      },
      {
        "mistake": "Trusting EXPLAIN's estimated row counts without ever running ANALYZE.",
        "fix": "Run ANALYZE (or let autovacuum do it) regularly so planner statistics reflect the real data distribution."
      }
    ],
    interviewQA: [
      {
        "q": "How does a B-tree index speed up a query?",
        "a": "It stores keys in a sorted tree structure so the engine can navigate from the root down to the matching leaf in O(log n) comparisons instead of scanning every row (O(n)), and once at the leaf it has a direct pointer to the row(s)."
      },
      {
        "q": "What is the leftmost prefix rule for composite indexes?",
        "a": "A composite index on columns (a, b, c) can be used for lookups that filter on a, or a and b, or a and b and c, in that left-to-right order, but not for a lookup filtering only on b or only on c, because the index is physically sorted by a first."
      },
      {
        "q": "Why might a query not use an available index even though the column is indexed?",
        "a": "Common reasons: the column is wrapped in a function or type cast in the WHERE clause, the query returns a large fraction of the table (a sequential scan can be cheaper than many random index lookups), or the planner statistics are stale, causing it to misestimate costs."
      },
      {
        "q": "What's the trade-off of adding more indexes to a table?",
        "a": "Reads get faster because the engine can avoid scanning the table, but every write (INSERT/UPDATE/DELETE) must also update each index, slowing writes, and each index consumes additional disk space."
      }
    ],
    practice: [
      "Run EXPLAIN ANALYZE on a query before and after adding an index and compare the plans.",
      "Create a composite index and test which column orderings of the WHERE clause it does and doesn't accelerate.",
      "Create a functional index to speed up a case-insensitive search.",
      "Find a query in a sample schema that does a Seq Scan despite an index existing, and diagnose why."
    ],
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

    deepDive: [
      "A transaction groups multiple statements into one logical unit: either every statement's effect is applied (COMMIT), or none of them are (ROLLBACK). ACID summarises the guarantees: Atomicity (all-or-nothing), Consistency (the database moves between valid states, respecting constraints), Isolation (concurrent transactions don't see each other's uncommitted work, to a degree defined by isolation level), and Durability (once committed, changes survive a crash).",
      "Isolation levels exist because full isolation (Serializable) is expensive \u2014 it effectively behaves as if transactions ran one after another. Weaker levels trade correctness guarantees for concurrency: Read Uncommitted allows dirty reads (seeing another transaction's uncommitted changes); Read Committed prevents dirty reads but allows non-repeatable reads (a row you read once might have different values if you read it again in the same transaction); Repeatable Read prevents that but still allows phantom reads (a range query might return new rows that appeared due to another transaction's insert); Serializable prevents all three anomalies.",
      "Most production databases implement MVCC (Multi-Version Concurrency Control): instead of blocking readers with locks, each transaction sees a consistent snapshot of the data as of some point in time, so readers never block writers and vice versa. This is why Postgres's default Read Committed feels quite safe in practice even though it's a 'weaker' isolation level on paper.",
      "The textbook example \u2014 transferring money between two accounts \u2014 is the cleanest illustration of why transactions matter: if you debit account A and the process crashes before crediting account B, the money simply disappears unless both statements are wrapped in one transaction that rolls back entirely on failure."
    ],
    example: {
      "title": "Trace a money transfer transaction that fails halfway",
      "steps": [
        "BEGIN; starts the transaction \u2014 nothing is durable yet.",
        "UPDATE accounts SET bal = bal - 100 WHERE id = 1; \u2014 account 1's balance is decremented in the transaction's working state.",
        "Suppose the application crashes or an exception is thrown here, before the second UPDATE runs.",
        "Because the transaction never reached COMMIT, the database automatically rolls back (or the app explicitly issues ROLLBACK) on reconnect/recovery.",
        "Account 1's balance reverts to its original value \u2014 the partial debit is undone, exactly as if nothing happened.",
        "If instead both UPDATEs succeed, COMMIT; is issued, and both changes become durable together.",
        "Result: the $100 either moves fully from A to B, or stays fully in A \u2014 it can never be deducted from A without appearing in B."
      ],
      "result": "Atomicity guarantees no partial transfer state is ever visible or persisted."
    },
    mistakes: [
      {
        "mistake": "Running the debit and credit as two separate auto-committed statements outside a transaction.",
        "fix": "Wrap related writes in BEGIN...COMMIT so a crash between them cannot leave the database in an inconsistent state."
      },
      {
        "mistake": "Assuming Serializable isolation is always the right choice 'to be safe'.",
        "fix": "Recognise the concurrency/throughput cost; pick the weakest isolation level that still prevents the anomalies your application actually cares about."
      },
      {
        "mistake": "Confusing 'dirty read' with 'non-repeatable read'.",
        "fix": "Dirty read = seeing another transaction's uncommitted data; non-repeatable read = your own transaction re-reads a committed row and gets a different value because someone else committed a change in between."
      },
      {
        "mistake": "Believing MVCC means there is never any locking.",
        "fix": "MVCC avoids reader-writer blocking, but writers can still conflict with other writers on the same row and may need locks or retries (e.g. serialization failures under Serializable/Repeatable Read)."
      }
    ],
    interviewQA: [
      {
        "q": "Explain ACID with a real example.",
        "a": "Using a money transfer: Atomicity ensures both the debit and credit happen or neither does; Consistency ensures constraints like non-negative balances hold before and after; Isolation ensures a concurrent balance check doesn't see a half-completed transfer; Durability ensures once the transfer commits, it survives a server crash."
      },
      {
        "q": "What is the difference between dirty read, non-repeatable read, and phantom read?",
        "a": "A dirty read sees another transaction's uncommitted changes. A non-repeatable read happens when re-reading the same row within a transaction returns different values because another transaction committed an update in between. A phantom read happens when a repeated range query returns different sets of rows because another transaction inserted/deleted rows matching the range."
      },
      {
        "q": "What is MVCC and why is it useful?",
        "a": "Multi-Version Concurrency Control keeps multiple versions of a row so each transaction can read a consistent snapshot without being blocked by concurrent writers, and writers don't have to wait for readers either, improving concurrency compared to lock-based isolation."
      },
      {
        "q": "Why is Serializable isolation the most expensive?",
        "a": "Because it must guarantee the outcome is equivalent to some serial (one-at-a-time) execution of all transactions, which typically requires extra locking, predicate locks, or aborting/retrying transactions that would violate that guarantee, reducing concurrency."
      }
    ],
    practice: [
      "Write a transaction for a bank transfer and simulate a crash after the first UPDATE to confirm rollback behaviour.",
      "Reproduce a non-repeatable read by opening two concurrent transactions under Read Committed.",
      "Reproduce a phantom read under Repeatable Read and show it disappears under Serializable.",
      "Explain, for a given application (e.g. e-commerce checkout), which isolation level you'd choose and why."
    ],
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

    deepDive: [
      "Locks are how a database enforces isolation between concurrent transactions touching the same data. A shared (read) lock allows multiple transactions to read the same row simultaneously, while an exclusive (write) lock blocks all other access to that row, whether for reading or writing, until it's released. This shared/exclusive split is what lets many readers proceed in parallel while still protecting writers from interference.",
      "A deadlock arises when two or more transactions form a cycle of waiting: transaction T1 holds a lock that T2 wants, while T2 holds a lock that T1 wants. Neither can proceed, and without intervention they'd wait forever. Databases handle this by periodically building a wait-for graph, detecting the cycle, and aborting one of the transactions (the 'victim'), which then gets a deadlock error and typically retries.",
      "The practical defense against deadlocks is discipline in application code: always acquire locks on multiple rows in the same, consistent order across all code paths (e.g. always lock the lower ID first), keep transactions as short as possible, and avoid holding locks while waiting on external calls (like an HTTP request) inside a transaction.",
      "SELECT ... FOR UPDATE is the standard way to explicitly take a row lock as part of a read-modify-write pattern, such as reserving a seat or decrementing inventory, ensuring that between reading the current value and writing the updated value, no other transaction can sneak in and read/modify the same row."
    ],
    example: {
      "title": "Trace a classic deadlock between two transactions locking rows in opposite order",
      "steps": [
        "T1 starts: BEGIN; UPDATE seats SET taken=true WHERE id=A; \u2014 T1 now holds an exclusive lock on row A.",
        "T2 starts concurrently: BEGIN; UPDATE seats SET taken=true WHERE id=B; \u2014 T2 now holds an exclusive lock on row B.",
        "T1 then tries: UPDATE seats SET taken=true WHERE id=B; \u2014 T1 must wait because T2 holds B's lock.",
        "T2 then tries: UPDATE seats SET taken=true WHERE id=A; \u2014 T2 must wait because T1 holds A's lock.",
        "Both transactions are now blocked waiting on each other \u2014 a cycle exists in the wait-for graph.",
        "The database's deadlock detector notices the cycle and aborts one transaction (say T2) with a deadlock error.",
        "T1 proceeds and commits normally; the application catches T2's error and retries T2 from the start."
      ],
      "result": "One transaction is sacrificed to break the cycle, and the other completes; the app must handle the retry."
    },
    mistakes: [
      {
        "mistake": "Locking rows/tables in different orders across different code paths.",
        "fix": "Establish and enforce a single, consistent lock acquisition order (e.g. always by ascending primary key) everywhere in the codebase."
      },
      {
        "mistake": "Holding a transaction open while waiting on a slow external call (API request, email send).",
        "fix": "Do slow external work outside the transaction, and keep the transaction itself to just the database statements, minimizing lock hold time."
      },
      {
        "mistake": "Not handling deadlock errors in application code, letting the request just fail.",
        "fix": "Catch the deadlock/serialization error and retry the transaction automatically, since it's an expected, recoverable condition."
      },
      {
        "mistake": "Using SELECT without FOR UPDATE in a read-modify-write flow, causing lost updates under concurrency.",
        "fix": "Use SELECT ... FOR UPDATE (or an atomic UPDATE ... RETURNING) to lock the row for the duration of the read-modify-write."
      }
    ],
    interviewQA: [
      {
        "q": "What are the necessary conditions for a deadlock to occur?",
        "a": "Mutual exclusion (resources can't be shared), hold and wait (a process holds one resource while waiting for another), no preemption (resources can't be forcibly taken away), and circular wait (a cycle of processes each waiting on the next). All four (the Coffman conditions) must hold simultaneously for deadlock."
      },
      {
        "q": "How does a database detect and resolve a deadlock?",
        "a": "It periodically checks the wait-for graph of which transactions are waiting for locks held by which others; if it finds a cycle, it deadlocks, so it aborts one transaction (usually the one that would be cheapest to roll back) to break the cycle, returning an error the application should retry."
      },
      {
        "q": "What's the difference between a shared lock and an exclusive lock?",
        "a": "A shared (read) lock can be held by multiple transactions at once, allowing concurrent reads. An exclusive (write) lock can only be held by one transaction at a time and blocks both reads and writes by others until released."
      },
      {
        "q": "How would you prevent deadlocks in application design?",
        "a": "By always acquiring locks on resources in a fixed, agreed order across the whole codebase, keeping transactions short, avoiding external/slow calls inside a transaction, and using appropriate row-level locking (like SELECT FOR UPDATE) instead of broader table locks where possible."
      }
    ],
    practice: [
      "Simulate a deadlock with two concurrent psql sessions locking rows in opposite order and observe the error.",
      "Fix the deadlock by enforcing a consistent lock order and re-run the same scenario.",
      "Write a SELECT ... FOR UPDATE based seat-reservation flow and test it under concurrent requests.",
      "Implement automatic retry-on-deadlock logic in application code and test it with a script that forces contention."
    ],
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

    deepDive: [
      "Relational databases enforce a fixed schema up front, support arbitrary joins across normalised tables, and typically provide strong ACID transactions. This makes them a natural fit whenever data is highly related (orders reference customers reference addresses) and you need consistent, transactional reads/writes, such as banking, inventory, or booking systems.",
      "NoSQL is an umbrella term for several different data models, each optimised for a different access pattern rather than for generality. Document stores (MongoDB) store semi-structured JSON-like documents and suit data that's naturally self-contained and evolving (product catalogs, user profiles). Key-value stores (Redis, DynamoDB) suit ultra-fast lookups by a single key, ideal for caching and session storage. Wide-column stores (Cassandra) suit massive write-heavy time-series or event data spread across many machines. Graph databases (Neo4j) suit highly connected data like social networks where relationship traversal is the dominant query.",
      "The core trade-off is that NoSQL systems typically sacrifice some combination of joins, strict schema enforcement, and strong consistency in exchange for horizontal scalability and flexible schemas. Instead of normalising, NoSQL data modelling usually starts from the queries you need to answer and duplicates data across documents so each query can be satisfied with a single read, avoiding joins altogether.",
      "In interviews, avoid answering with a blanket 'NoSQL is faster' or naming a favourite product; instead, describe the actual workload \u2014 read/write ratio, consistency requirements, relationship complexity, and expected scale \u2014 and justify the choice against those specifics. Many real systems use both: a relational database for the transactional core and a NoSQL store (cache or search index) alongside it for specific access patterns."
    ],
    example: {
      "title": "Decide between relational and document store for an e-commerce order system",
      "steps": [
        "List the access patterns: 'get an order with all its line items' happens far more often than 'find all orders containing product X across all customers'.",
        "In a normalised relational model, fetching one order needs a join across orders, order_items, and products.",
        "In a document model, you can embed the line items directly inside the order document, so 'get order by id' is a single read with no join.",
        "But now check the second access pattern: 'find all orders containing product X' becomes hard in the document model, since it must scan every order document rather than join through a normalised order_items table.",
        "Weigh which pattern is more frequent/critical: for a checkout flow, 'read one order fast' usually dominates, favouring the embedded document approach for the order-reading service.",
        "However, payments and inventory still need strong transactional guarantees (don't oversell stock), which pushes you back toward a relational database for that part of the system.",
        "Result: many real systems use a relational database for transactional inventory/payments and a document store or cache for fast order/catalog reads \u2014 a polyglot persistence approach."
      ],
      "result": "The choice is justified by access patterns and consistency needs rather than a blanket preference for one technology."
    },
    mistakes: [
      {
        "mistake": "Choosing NoSQL purely because 'it scales better' without checking whether the data is actually relational.",
        "fix": "Model your access patterns first; if you need joins and strong consistency across entities, a relational database is usually simpler and safer."
      },
      {
        "mistake": "Normalising a document database the same way you would a relational one.",
        "fix": "Embrace duplication and embedding in document stores, designing documents around queries rather than around avoiding redundancy."
      },
      {
        "mistake": "Assuming NoSQL means no consistency guarantees at all.",
        "fix": "Understand that many NoSQL systems offer tunable consistency (e.g. eventual vs strong per-operation) \u2014 know the specific guarantees of the system you're using rather than generalising."
      },
      {
        "mistake": "Using a single NoSQL store for everything to avoid 'complexity' of multiple databases.",
        "fix": "Recognise polyglot persistence is normal \u2014 pick the right store per workload (relational for transactions, key-value for cache, search index for full text) rather than forcing one tool to do everything."
      }
    ],
    interviewQA: [
      {
        "q": "When would you choose a relational database over a NoSQL document store?",
        "a": "When the data is highly relational and needs multi-table joins, when you need strong ACID transactions across multiple entities (e.g. financial transfers), or when the schema is stable and well understood in advance."
      },
      {
        "q": "How does data modelling differ between relational and document databases?",
        "a": "Relational modelling normalises data to avoid redundancy and relies on joins at query time. Document modelling is query-driven: you often embed related data directly in a document to avoid joins, accepting some duplication in exchange for fast single-document reads."
      },
      {
        "q": "What is polyglot persistence?",
        "a": "Using multiple different types of databases within one system, each chosen for the specific workload it serves best \u2014 e.g. a relational database for orders/payments, Redis for session caching, and Elasticsearch for full-text search."
      },
      {
        "q": "What do NoSQL databases typically trade off to gain horizontal scalability?",
        "a": "They typically relax strict schema enforcement, reduce or remove support for cross-entity joins, and often offer weaker (eventual) consistency by default in exchange for being able to partition data easily across many commodity servers."
      }
    ],
    practice: [
      "Design a document schema for a blog platform (posts, comments, authors) optimised for reading a post with its comments in one query.",
      "Compare query complexity for 'find all orders for product X' in a normalised relational schema vs an embedded document schema.",
      "Pick a real application (e.g. Instagram) and justify which parts would use relational vs NoSQL storage.",
      "Explain eventual consistency with a concrete example of a stale read in a distributed NoSQL store."
    ],
  },
};
