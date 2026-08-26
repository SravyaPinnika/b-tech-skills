import type { TopicMap } from "../topicContent";

export const webTopics: TopicMap = {
  "HTML, CSS, responsive layout": {
    summary:
      "HTML gives structure and meaning, CSS gives presentation. Responsive layout uses flexible boxes and media queries instead of fixed pixel widths.",
    keyPoints: [
      "Use semantic tags (header, nav, main, section, footer) — they drive SEO and screen readers.",
      "Box model: content -> padding -> border -> margin.",
      "Flexbox for one dimension, Grid for two; mobile-first with min-width media queries.",
      "Specificity: inline > id > class > element; avoid !important.",
    ],
    syntax: {
      lang: "css",
      code: ".grid { display: grid; grid-template-columns: 1fr; gap: 1rem; }\n@media (min-width: 768px) {\n  .grid { grid-template-columns: repeat(3, 1fr); }\n}",
    },
    diagram: `mobile (1 col)        desktop (3 col)
+-----------+         +-----+-----+-----+
|   card    |         |card |card |card |
+-----------+         +-----+-----+-----+
|   card    |
+-----------+`,
  },

  "JavaScript & TypeScript fundamentals": {
    summary:
      "JavaScript is single-threaded with an event loop; TypeScript adds static types that are erased at build time.",
    keyPoints: [
      "let/const are block-scoped; var is function-scoped and hoisted.",
      "Closures capture variables, powering callbacks and module patterns.",
      "Promises/async-await handle asynchrony; the event loop drains microtasks before macrotasks.",
      "TypeScript: interfaces, unions, generics, and no types at runtime.",
    ],
    syntax: {
      lang: "typescript",
      code: "async function getUser(id: string): Promise<User> {\n  const res = await fetch(`/api/users/${id}`);\n  if (!res.ok) throw new Error('failed');\n  return res.json() as Promise<User>;\n}",
    },
    diagram: `call stack  ->  empty?
                   |
        microtasks (promises) drained first
                   |
        macrotasks (setTimeout, events)
                   |
             render frame`,
  },

  "React: components, state, hooks": {
    summary:
      "React renders UI as a function of state. Changing state re-renders the component and React diffs the result against the DOM.",
    keyPoints: [
      "useState for local state; useEffect for synchronising with the outside world.",
      "Derive values during render instead of storing duplicates in state.",
      "Keys must be stable ids, never array indexes for reorderable lists.",
      "Lift shared state up, or use context/query libraries for server data.",
    ],
    syntax: {
      lang: "tsx",
      code: "function Counter() {\n  const [n, setN] = useState(0);\n  return <button onClick={() => setN(n + 1)}>{n}</button>;\n}",
    },
    diagram: `event -> setState -> re-render -> virtual DOM diff -> minimal DOM patch

props flow down  |
events flow up   ^`,
  },

  "REST API design and consumption": {
    summary:
      "REST models resources as URLs and uses HTTP verbs and status codes to express intent and result.",
    keyPoints: [
      "GET read (safe), POST create, PUT/PATCH update, DELETE remove.",
      "Status codes: 200/201, 400 bad input, 401 unauthenticated, 403 forbidden, 404 missing, 409 conflict, 500 server.",
      "Version the API, paginate list endpoints, and validate every input server-side.",
      "Handle loading and error states on the client — networks fail.",
    ],
    syntax: {
      lang: "text",
      code: "GET    /api/courses?page=2\nPOST   /api/courses        201 + Location\nPATCH  /api/courses/42\nDELETE /api/courses/42     204",
    },
    diagram: `client --GET /courses--> server --query--> DB
       <--200 JSON-----        <--rows---
error path: 4xx = client's fault | 5xx = server's fault`,
  },

  "Authentication & session handling": {
    summary:
      "Authentication proves who the user is; authorisation decides what they may do. The session carries that proof between requests.",
    keyPoints: [
      "Hash passwords with bcrypt/argon2 and a per-user salt — never store plaintext or reversible hashes.",
      "JWTs are stateless and cannot be revoked early; keep them short-lived with refresh tokens.",
      "Store tokens in httpOnly, Secure, SameSite cookies to blunt XSS/CSRF.",
      "Enforce authorisation on the server (or with row-level policies), never in the UI alone.",
    ],
    diagram: `login (email+pw) -> verify hash -> issue access(15m) + refresh(7d)
request -> Authorization: Bearer <token> -> verify signature -> user id
expired -> refresh endpoint -> new access token
logout -> revoke refresh token`,
  },

  "Backend with Node / Spring / Django": {
    summary:
      "The backend maps HTTP requests to handlers, validates input, talks to the database, and returns serialised results.",
    keyPoints: [
      "Layer it: routes -> service (business rules) -> repository (data access).",
      "Validate at the boundary with a schema library and return typed errors.",
      "Keep secrets in environment variables, never in the repository.",
      "Add structured logging and request ids for debuggability.",
    ],
    syntax: {
      lang: "typescript",
      code: "app.post('/courses', async (req, res) => {\n  const body = CourseSchema.parse(req.body);\n  const course = await courses.create(body);\n  res.status(201).json(course);\n});",
    },
    diagram: `request -> middleware (auth, log) -> route handler
        -> validate -> service -> repository -> DB
        <- serialise <- domain object <- rows`,
  },

  "Database integration and migrations": {
    summary:
      "Migrations are versioned, ordered SQL files that evolve the schema so every environment converges to the same state.",
    keyPoints: [
      "Never edit a shipped migration — add a new one.",
      "Index the columns you filter and join on; measure with EXPLAIN.",
      "Use transactions so multi-step writes are all-or-nothing.",
      "Prevent SQL injection with parameterised queries, never string concatenation.",
    ],
    syntax: {
      lang: "sql",
      code: "-- 002_add_courses.sql\nCREATE TABLE courses (\n  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),\n  title text NOT NULL,\n  created_at timestamptz DEFAULT now()\n);\nCREATE INDEX courses_title_idx ON courses (title);",
    },
    diagram: `001_init -> 002_add_courses -> 003_add_index
   each applied once, recorded in a migrations table
   dev == staging == prod`,
  },

  "Deployment, environment config, monitoring": {
    summary:
      "Deployment turns a commit into a running service, configured per environment and observable once live.",
    keyPoints: [
      "Same build artifact across environments; only configuration differs.",
      "CI runs lint, typecheck, tests, then builds and deploys on green.",
      "Watch the four signals: latency, traffic, errors, saturation.",
      "Add health checks and a rollback path before you need them.",
    ],
    diagram: `git push -> CI (lint, test, build) -> deploy preview
        -> approve -> production
             |
    logs + metrics + alerts -> rollback if error rate spikes`,
  },
};
