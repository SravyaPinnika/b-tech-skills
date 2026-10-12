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
    deepDive: [
      "HTML is not just about making things look right — it carries semantic meaning that browsers, screen readers, and search engine crawlers all rely on. Using a div for everything works visually but tells assistive technology nothing about structure; using nav, main, article and footer lets a screen reader user jump straight to the main content, and lets Google understand what part of the page is the primary content versus navigation.",
      "The CSS box model is the foundation of layout: every element's rendered size is content plus padding plus border, with margin as separate space outside that box. Beginners often forget that setting box-sizing: border-box (widely used as a reset) makes width include padding and border, which avoids a huge class of 'why is my box wider than I set it' bugs.",
      "Flexbox and Grid solve different problems: Flexbox distributes items along a single axis (a row of nav links, a centered button), while Grid defines both rows and columns explicitly, which is what you want for card layouts or page-level structure. Mobile-first design means writing the base (no media query) styles for the smallest screen, then using min-width media queries to add complexity for larger screens — this tends to produce simpler CSS than trying to override desktop styles down to mobile.",
      "Specificity determines which conflicting CSS rule wins: inline styles beat IDs, IDs beat classes, classes beat element selectors. !important overrides all of this and is a maintenance trap because it forces the next developer to use another !important to override it — a specificity war. Keeping selectors simple and consistent (mostly class-based) avoids the problem entirely.",
    ],
    example: {
      title: "Building a responsive 3-card layout mobile-first",
      steps: [
        "Start with the mobile layout: .grid { display: grid; grid-template-columns: 1fr; gap: 1rem; } — one column by default.",
        "Add semantic markup: a main containing a section with three article cards.",
        "Verify on a narrow viewport (375px) that cards stack vertically with consistent spacing.",
        "Add a media query @media (min-width: 768px) that switches grid-template-columns to repeat(3, 1fr).",
        "Resize the browser to 1024px and confirm the layout snaps to 3 equal columns at the breakpoint.",
        "Check box-sizing: border-box is applied globally so padding doesn't overflow the grid track width.",
      ],
      result: "A single markup structure that renders as one column on mobile and three columns on desktop, controlled purely by CSS breakpoints.",
    },
    mistakes: [
      { mistake: "Using div and span for everything instead of semantic tags.", fix: "Use header/nav/main/section/article/footer where appropriate for accessibility and SEO." },
      { mistake: "Forgetting box-sizing: border-box and being surprised when padding increases total element width.", fix: "Set a global box-sizing: border-box reset so declared width always includes padding and border." },
      { mistake: "Writing desktop-first CSS and overriding it downward with max-width queries, producing tangled overrides.", fix: "Write mobile-first base styles and add complexity with min-width media queries as the screen grows." },
      { mistake: "Reaching for !important to fix a style that isn't applying.", fix: "Diagnose the actual specificity conflict and adjust selectors instead of overriding with !important." },
    ],
    interviewQA: [
      { q: "What's the difference between Flexbox and Grid, and when would you use each?", a: "Flexbox lays items out along a single axis (row or column) and is ideal for things like nav bars or button groups; Grid defines rows and columns together and is better for two-dimensional layouts like card grids or full page structure." },
      { q: "Explain the CSS box model.", a: "Every element's total rendered size is content, then padding, then border, then margin outside; box-sizing: border-box changes width/height to include padding and border, which is why it's commonly used as a reset to avoid layout surprises." },
      { q: "Why does semantic HTML matter beyond visual styling?", a: "Screen readers and browsers use semantic tags to understand page structure (letting users jump to main content or navigation), and search engines use them to weigh content importance for SEO, none of which a generic div conveys." },
      { q: "How is CSS specificity calculated, and why should !important be avoided?", a: "Specificity is roughly ranked inline styles > ID selectors > class/attribute selectors > element selectors, with later rules of equal specificity winning; !important overrides this hierarchy entirely and tends to create maintenance issues since fixing it later often requires another !important." },
    ],
    practice: [
      "Rebuild a div-only page using semantic HTML tags and verify it reads sensibly with a screen reader or accessibility tree inspector.",
      "Build a 4-item card grid that is 1 column on mobile, 2 on tablet, and 4 on desktop using min-width media queries.",
      "Create a navbar using Flexbox that centers links and pushes a login button to the right.",
      "Debug a deliberately broken layout with mismatched box-sizing and fix it without adding !important.",
    ],
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
    deepDive: [
      "JavaScript runs on a single thread, so it cannot literally do two things at once, yet it handles thousands of concurrent network requests through the event loop: long-running work (timers, I/O, fetch) is handed off to the browser/Node runtime, and when it completes, a callback is queued to run once the call stack is empty. Understanding this model explains why a synchronous while(true) loop freezes the whole page — it never lets the stack empty so queued callbacks never run.",
      "Scoping rules changed significantly with ES6: var is function-scoped and hoisted with an initial value of undefined, which causes classic bugs like a variable leaking out of an if-block or a loop variable being shared across all closures created inside it. let and const are block-scoped and live in a 'temporal dead zone' until their declaration line, which catches many of those bugs at the language level instead of silently misbehaving.",
      "Closures are the mechanism by which an inner function retains access to variables from its enclosing scope even after that outer function has returned. This is the basis of callbacks, event handlers, memoization, and the module pattern (private variables). A subtle interview favourite is the classic loop-with-var bug: a for (var i...) loop with a setTimeout inside captures the same i for every iteration, whereas let creates a fresh binding per iteration.",
      "The event loop processes two task queues after the current synchronous code finishes: microtasks (Promise callbacks, queueMicrotask) are fully drained before a single macrotask (setTimeout, setInterval, I/O callbacks, UI events) runs, which is why a Promise.resolve().then(...) always fires before a setTimeout(..., 0) even though both are 'asynchronous'. TypeScript sits on top of all this purely as a compile-time layer — types are checked during compilation and then erased, so at runtime you're running plain JavaScript with zero type information left." ,
    ],
    example: {
      title: "Predicting execution order of sync code, a Promise, and setTimeout",
      steps: [
        "Code runs: console.log('A'); setTimeout(() => console.log('B'), 0); Promise.resolve().then(() => console.log('C')); console.log('D');",
        "The call stack executes synchronous lines first: 'A' logs immediately.",
        "setTimeout schedules its callback as a macrotask and returns immediately, not blocking.",
        "Promise.resolve().then(...) schedules its callback as a microtask and also returns immediately.",
        "'D' logs immediately since it's the next synchronous line.",
        "Call stack is now empty, so the event loop drains all microtasks first: 'C' logs.",
        "Only after microtasks are empty does the event loop run the next macrotask: 'B' logs last.",
      ],
      result: "Output order is A, D, C, B — proving microtasks (Promises) always run before the next macrotask (setTimeout), regardless of a 0ms delay.",
    },
    mistakes: [
      { mistake: "Using var inside loops that create closures (e.g. setTimeout in a for loop), expecting each iteration to capture its own value.", fix: "Use let, which creates a new binding per loop iteration, so each closure captures the correct value." },
      { mistake: "Assuming setTimeout(fn, 0) runs immediately after the current code.", fix: "Understand it's queued as a macrotask and will run only after the call stack is empty and all pending microtasks (Promises) are drained." },
      { mistake: "Forgetting to handle rejected promises, causing unhandled promise rejection warnings/crashes.", fix: "Wrap await calls in try/catch or attach a .catch() handler to every promise chain." },
      { mistake: "Believing TypeScript types provide runtime safety (e.g. validating an API response's shape).", fix: "Remember types are erased at compile time; validate untrusted runtime data (like API responses) with a schema library such as Zod." },
    ],
    interviewQA: [
      { q: "What is the difference between var, let, and const?", a: "var is function-scoped and hoisted with an undefined initial value, causing it to leak outside blocks; let and const are block-scoped and sit in a temporal dead zone until declared, catching many scoping bugs; const additionally disallows reassignment of the binding." },
      { q: "Explain the JavaScript event loop and why Promise callbacks run before setTimeout.", a: "JS is single-threaded; after the synchronous call stack empties, the event loop first drains all queued microtasks (like Promise .then callbacks) completely, and only then executes the next macrotask (like a setTimeout callback), so Promises consistently run first even with a 0ms timeout." },
      { q: "What is a closure and give a practical use case.", a: "A closure is a function that retains access to variables from its enclosing scope even after that scope has returned; it's used for private state in the module pattern, memoization caches, and capturing per-iteration values correctly in loops with let." },
      { q: "Does TypeScript provide any runtime type checking?", a: "No — TypeScript types are purely a compile-time construct used for static checking and tooling; they are erased during compilation, so at runtime the code is plain JavaScript with no type enforcement, meaning external/untrusted data still needs runtime validation." },
    ],
    practice: [
      "Write a for loop with var and a setTimeout inside it, observe the bug, then fix it by switching to let.",
      "Predict and then verify the console output order of a script mixing synchronous code, a Promise, and setTimeout.",
      "Implement a private counter using the closure/module pattern (no exposed internal variable).",
      "Write an async function that fetches data, handles a failed response with try/catch, and validates the JSON shape with Zod.",
    ],
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
    deepDive: [
      "React's core idea is that UI = f(state): you describe what the UI should look like for a given state, and React figures out how to update the real DOM to match, rather than you manually mutating elements. When state changes via a setter like setN, React re-runs the component function to get a new virtual DOM tree, diffs it against the previous tree, and applies only the minimal set of real DOM changes — this diffing is why React can be fast even though it 're-renders' on every state change.",
      "useState holds local component state across renders, while useEffect is for synchronising a component with something outside React's render model — subscribing to an event, fetching data, setting a timer. A common conceptual mistake is treating useEffect as a general-purpose 'run this after render' hook rather than specifically for side effects that need cleanup or external synchronisation; anything you can compute directly from existing state/props should be derived during render instead of stored as separate state, since duplicated state can drift out of sync.",
      "The reconciliation algorithm relies on 'keys' to match list items between renders. Using the array index as a key works only if the list never reorders, is never filtered, and items are never inserted/removed from the middle — otherwise React can misattribute state (like an input's focus or a checkbox's checked value) to the wrong item after a reorder. A stable, unique id (like a database id) as the key avoids this entirely.",
      "Data and events flow in one direction: props flow down from parent to child, and children communicate back up by calling functions passed to them as props (since children can't directly modify parent state). When multiple sibling components need to share state, the fix is 'lifting state up' to their common parent; when state needs to be accessed by many distant components without prop drilling, Context or a state/query library (React Query, Redux, Zustand) is used instead, with server data specifically often better handled by a caching data-fetching library than by ad hoc useState/useEffect." ,
    ],
    example: {
      title: "Tracing a click through React's re-render cycle",
      steps: [
        "Component renders initially with state n = 0, producing a button showing '0'.",
        "User clicks the button, triggering the onClick handler which calls setN(n + 1).",
        "React schedules a re-render rather than updating the DOM immediately.",
        "The component function runs again with the new state, n = 1, producing a new virtual DOM tree with the button text '1'.",
        "React diffs the new tree against the previous one and finds only the button's text content changed.",
        "React patches just that text node in the real DOM, leaving everything else untouched.",
        "The user sees the button update from '0' to '1' with no full-page re-render or flicker.",
      ],
      result: "A single, precise DOM text update driven by one state change, demonstrating React's render-diff-patch cycle.",
    },
    mistakes: [
      { mistake: "Storing a value in state that can be computed from existing props/state (e.g. a 'fullName' state derived from firstName and lastName).", fix: "Compute derived values directly during render instead of duplicating them in state, avoiding sync bugs." },
      { mistake: "Using the array index as the key for a reorderable or filterable list.", fix: "Use a stable unique identifier (like a database id) as the key so React can correctly track item identity across renders." },
      { mistake: "Using useEffect to run logic that should just happen during render (like computing a derived value).", fix: "Reserve useEffect for actual side effects/synchronisation with the outside world; compute derived values inline during render." },
      { mistake: "Prop-drilling shared state through many layers of unrelated components.", fix: "Lift state to the common ancestor, or use Context/a state management library when many distant components need access." },
    ],
    interviewQA: [
      { q: "What triggers a React component to re-render?", a: "A state update (via a useState setter or similar), a parent re-rendering and passing new props, or a context value it consumes changing; React then re-runs the function component, diffs the resulting virtual DOM against the previous one, and applies only the minimal real DOM changes." },
      { q: "Why is using array index as a key for list items risky?", a: "If the list can reorder, filter, or have items inserted/removed from the middle, index-based keys cause React to misattribute component state (like input focus, form values) to the wrong item after re-render; a stable unique id avoids this." },
      { q: "When should you use useEffect versus computing something during render?", a: "useEffect is for synchronising with something outside React's render model — subscriptions, timers, data fetching, manual DOM APIs; anything derivable purely from current props/state should be computed directly during render, not stored or handled in an effect." },
      { q: "How do sibling components share state in React?", a: "By lifting the shared state up to their nearest common parent, which then passes the state and updater functions down as props; for state needed across many distant components, Context or a dedicated state/query library is used instead of deep prop drilling." },
    ],
    practice: [
      "Build a Counter component and add console logs to observe the render-diff-patch cycle on each click.",
      "Refactor a component that stores a derived value in state to instead compute it during render.",
      "Create a reorderable list (drag-to-reorder or filter) and demonstrate the bug caused by using index as key, then fix it.",
      "Lift state from two sibling components into a shared parent to synchronise them.",
    ],
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
    deepDive: [
      "REST's central idea is that every piece of data your API exposes is a 'resource' addressed by a URL (like /api/courses/42), and the HTTP verb you use against that URL expresses your intent rather than encoding the action in the URL itself. This is why /api/courses/42 with DELETE is preferred REST style over an endpoint like /api/deleteCourse?id=42 — the verb already says what you want to do.",
      "Status codes are a contract that lets clients handle responses generically without parsing response bodies to know what happened: 2xx means success (200 for a general success, 201 specifically for a successful creation, 204 for success with no body), 4xx means the client did something wrong (400 malformed input, 401 not authenticated at all, 403 authenticated but not permitted, 404 resource doesn't exist, 409 a conflicting state like a duplicate), and 5xx means the server itself failed. Getting these right lets clients build reliable retry and error-handling logic instead of guessing from error message text.",
      "Real-world APIs need versioning (e.g. /api/v1/...) so you can evolve the contract without breaking existing clients, pagination on list endpoints (page/cursor + limit) so responses stay bounded as data grows, and server-side validation on every input regardless of what client-side validation already did, because any client-side check can be bypassed by calling the API directly. Idempotency also matters: GET, PUT, and DELETE should be safe to retry with the same result, while POST typically is not, which affects how clients handle network retries.",
      "On the consuming side, since networks and servers can fail at any time, a client integration is incomplete without explicit loading, error, and empty states — a UI that just shows nothing while waiting, or crashes on a network error, is a broken integration regardless of how correct the API itself is. Good API consumption code also distinguishes retryable failures (timeouts, 5xx) from non-retryable ones (4xx) so it doesn't blindly retry a request that will always fail." ,
    ],
    example: {
      title: "Designing and consuming a 'create course' endpoint end to end",
      steps: [
        "Design: POST /api/v1/courses expects { title: string, price: number } in the body.",
        "Server validates the body with a schema; if invalid, it returns 400 with a field-level error message.",
        "If valid, the server inserts a row and returns 201 Created with a Location header pointing to /api/v1/courses/42.",
        "Client sends the POST request and shows a loading spinner while awaiting the response.",
        "On success (201), the client parses the returned course object and redirects to its detail page.",
        "On failure (400), the client shows the specific validation error next to the relevant form field instead of a generic message.",
        "On a network timeout, the client shows a retry button rather than silently failing.",
      ],
      result: "A clean request/response cycle with correct status-code handling and explicit loading/error UI, rather than a client that assumes the network always succeeds.",
    },
    mistakes: [
      { mistake: "Encoding actions in the URL like /getCourse or /deleteCourse instead of using HTTP verbs.", fix: "Model the URL as a resource (/courses/42) and let the HTTP verb (GET/DELETE) express the action." },
      { mistake: "Returning 200 for every response, including actual errors, and putting error info only in the body.", fix: "Use the correct status code family (2xx/4xx/5xx) so clients and tooling can handle responses generically without parsing text." },
      { mistake: "Trusting client-side validation as the only check before writing to the database.", fix: "Always re-validate every input on the server, since the API can be called directly, bypassing any client UI." },
      { mistake: "Building a client that has no loading or error state, assuming requests always succeed quickly.", fix: "Explicitly handle loading, error, and empty states for every network call in the UI." },
    ],
    interviewQA: [
      { q: "What's the difference between PUT and PATCH?", a: "PUT is typically used to replace an entire resource with the provided representation, while PATCH applies a partial update to only the specified fields; both target an existing resource, unlike POST which is generally for creation." },
      { q: "Why is server-side validation still needed if the client already validates input?", a: "Client-side validation can be bypassed by calling the API directly (via curl, another client, or a malicious actor), so the server must independently validate every request to protect data integrity and security." },
      { q: "Explain the difference between a 401 and a 403 response.", a: "401 Unauthorized means the request lacks valid authentication credentials at all (not logged in / invalid token), while 403 Forbidden means the caller is authenticated but doesn't have permission to perform that action on that resource." },
      { q: "Why should list endpoints be paginated?", a: "Without pagination, a list endpoint's response size grows unbounded as data grows, causing slow responses, high memory/bandwidth use, and poor client performance; pagination (page/limit or cursor-based) keeps each response bounded and predictable." },
    ],
    practice: [
      "Design REST endpoints (with verbs and status codes) for a simple todo list resource (list, create, update, delete).",
      "Add pagination (page + limit) to a mock list endpoint and update the client to fetch subsequent pages.",
      "Write server-side validation for a create endpoint that returns 400 with a field-specific error for bad input.",
      "Build a client fetch wrapper that distinguishes retryable errors (timeouts, 5xx) from non-retryable ones (4xx).",
    ],
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
    deepDive: [
      "Authentication and authorisation are frequently conflated but answer different questions: authentication ('who are you') happens once at login and produces some proof of identity, while authorisation ('what can you do') is checked on every subsequent request against that identity. A system can authenticate a user perfectly and still leak data if it forgets to check authorisation on a specific endpoint.",
      "Passwords must never be stored in a reversible form. Hashing algorithms designed for passwords (bcrypt, argon2, scrypt) are deliberately slow and use a per-user salt, which defeats both rainbow-table attacks and the ability to crack many accounts in parallel with cheap hardware — a fast general-purpose hash like SHA-256 is not appropriate for passwords precisely because it's fast enough to brute-force at scale.",
      "JWTs are a popular session mechanism because they're stateless — the server can verify a JWT's signature without a database lookup, which scales well — but that same property means a JWT can't be revoked before it expires; if a token is stolen, it remains valid until its exp claim passes. The standard mitigation is a short-lived access token (minutes) paired with a longer-lived refresh token that is checked against a stored/revocable record, so a compromised access token has a small blast radius and refresh tokens can be explicitly revoked on logout or on suspected compromise.",
      "Where you store the token matters for attack surface: putting it in localStorage exposes it to any XSS vulnerability (a malicious script can just read it), while an httpOnly cookie is inaccessible to JavaScript entirely, closing that avenue; adding Secure (HTTPS only) and SameSite (limits cross-site sending) attributes further blunts XSS and CSRF respectively. Regardless of authentication mechanism, authorisation checks (does this user own this resource? does this role permit this action?) must be enforced on the server or via database-level policies (like row-level security) — client-side checks like hiding a button are a UX nicety, not a security boundary, since any client-side restriction can be bypassed by calling the API directly." ,
    ],
    example: {
      title: "Tracing a login and an expired-token refresh",
      steps: [
        "User submits email + password on the login form.",
        "Server looks up the stored password hash for that email and verifies it with bcrypt.compare (never comparing plaintext).",
        "On success, server issues a short-lived access token (15 min) and a longer-lived refresh token (7 days), storing the refresh token's identifier server-side.",
        "Both tokens are set as httpOnly, Secure, SameSite cookies so client-side JS can't read them.",
        "Subsequent API requests automatically include the access token cookie; the server verifies its signature and expiry to identify the user.",
        "After 15 minutes the access token expires; the next request fails with 401, so the client calls a refresh endpoint using the refresh token.",
        "The server validates the refresh token against its stored record and issues a new access token, letting the session continue without a full re-login.",
      ],
      result: "The user stays logged in seamlessly across the 15-minute access token expiry, while a stolen access token would only be usable for at most 15 minutes.",
    },
    mistakes: [
      { mistake: "Storing passwords as plaintext or with a fast general-purpose hash like SHA-256.", fix: "Use a slow, salted password hashing algorithm designed for this purpose, like bcrypt or argon2." },
      { mistake: "Issuing long-lived JWTs with no way to revoke them early.", fix: "Use short-lived access tokens with a separate, revocable refresh token so compromise has a limited window." },
      { mistake: "Storing auth tokens in localStorage, exposing them to any XSS vulnerability.", fix: "Store tokens in httpOnly, Secure, SameSite cookies so client-side scripts cannot read them." },
      { mistake: "Enforcing authorisation only by hiding UI elements (e.g. hiding a delete button for non-admins).", fix: "Always re-check authorisation on the server for every request, since client-side UI restrictions can be bypassed by calling the API directly." },
    ],
    interviewQA: [
      { q: "What's the difference between authentication and authorisation?", a: "Authentication verifies who a user is (e.g. via password/login), typically done once per session; authorisation checks what that authenticated user is allowed to do, and must be checked on every relevant request, not just at login." },
      { q: "Why can't a JWT be revoked before it expires?", a: "A JWT is a self-contained, stateless token verified purely by its signature; the server doesn't look it up in a database on each request, so there's no central place to mark it invalid before its own expiry — mitigated by keeping access tokens short-lived and pairing them with a revocable refresh token." },
      { q: "Why use bcrypt instead of SHA-256 for storing passwords?", a: "SHA-256 is designed to be fast, which makes brute-forcing many password guesses cheap at scale; bcrypt (and argon2) are deliberately slow and use a per-user salt, making both dictionary attacks and rainbow tables impractical." },
      { q: "Why is storing an auth token in an httpOnly cookie safer than localStorage?", a: "localStorage is readable by any JavaScript running on the page, so an XSS vulnerability can steal the token directly; an httpOnly cookie is inaccessible to JavaScript entirely, removing that attack vector (though it still needs CSRF protection like SameSite)." },
    ],
    practice: [
      "Implement a login endpoint that hashes and verifies passwords with bcrypt.",
      "Build an access + refresh token flow where the access token expires after 60 seconds for easy testing.",
      "Set an auth token as an httpOnly, Secure, SameSite cookie and confirm it's inaccessible from browser devtools JS console.",
      "Write a server-side authorisation check that rejects a request for a resource the authenticated user doesn't own, even if the client UI hid the button.",
    ],
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
    deepDive: [
      "Regardless of framework (Express/Node, Spring Boot, Django), a well-structured backend separates concerns into layers so that changes in one don't ripple through the whole codebase: routes/controllers translate HTTP into method calls, services hold business rules independent of HTTP or the database, and repositories handle raw data access. This layering means you can swap the database or the web framework without rewriting your business logic, and it makes unit testing services possible without spinning up a real HTTP server or database.",
      "Validating input at the boundary — the moment a request enters the system — with a schema library (Zod in Node, Bean Validation in Spring, DRF serializers in Django) ensures that everything past that point can assume well-formed data, rather than every layer independently re-checking for nulls or wrong types. Returning typed, consistent error responses (not raw stack traces) also makes the API predictable for clients and avoids leaking internal implementation details.",
      "Secrets management is a security fundamental, not an implementation detail: database URLs, API keys, and signing secrets must live in environment variables (or a secrets manager) and never be committed to source control, because a leaked secret in git history is effectively permanent even if removed from the latest commit. Middleware is the natural place to handle cross-cutting concerns like authentication checks, request logging, and rate limiting, since it runs before the specific route handler and keeps that logic out of every individual route.",
      "Observability — structured logging (JSON logs with consistent fields) and request IDs that are generated at the entry point and threaded through every log line and downstream call — is what makes production issues debuggable. Without a request id, correlating 'this user's request failed' across multiple log lines or services during a concurrent-traffic incident becomes nearly impossible; with one, you can grep a single id and see the entire lifecycle of that request." ,
    ],
    example: {
      title: "Tracing a POST /courses request through a layered backend",
      steps: [
        "Request arrives at Express/Spring/Django; a middleware assigns a request id and logs the incoming request.",
        "An auth middleware verifies the bearer token and attaches the authenticated user to the request context.",
        "The route handler passes the request body to CourseSchema.parse (or equivalent), which throws a typed validation error on bad input.",
        "On valid input, the handler calls the service layer's createCourse(user, data), which enforces business rules (e.g. a free-tier user can't create more than 3 courses).",
        "The service calls the repository layer, which runs the actual SQL insert against the database.",
        "The repository returns a plain row/domain object, which the service maps to a response DTO.",
        "The route handler serialises the DTO to JSON and returns 201, while the request id and outcome are logged for later correlation.",
      ],
      result: "A single request cleanly passes through validation, business rules and data access, fully traceable end-to-end via its logged request id.",
    },
    mistakes: [
      { mistake: "Putting database queries and business logic directly inside route handlers.", fix: "Separate into routes -> service -> repository layers so logic is testable and reusable independent of HTTP." },
      { mistake: "Skipping input validation and letting bad data reach the database layer.", fix: "Validate every request at the boundary with a schema library and reject invalid input before it reaches business logic." },
      { mistake: "Committing API keys or database URLs directly into the codebase.", fix: "Store all secrets in environment variables or a secrets manager, and add config files to .gitignore." },
      { mistake: "Logging without a request id, making it impossible to trace one request's full lifecycle in production.", fix: "Generate a request id at the entry middleware and include it in every log line and downstream call for that request." },
    ],
    interviewQA: [
      { q: "Why split a backend into routes, services, and repositories instead of one big handler?", a: "This layering isolates HTTP concerns (routes), business rules (services), and data access (repositories) so each can be tested and changed independently, and business logic can be reused across multiple entry points (HTTP, a background job, a CLI) without duplication." },
      { q: "Where should input validation happen and why?", a: "At the boundary, as early as possible in the request lifecycle, using a schema library; this guarantees every downstream layer can assume well-formed data instead of each layer re-checking types and nulls independently." },
      { q: "How should secrets like database credentials be managed?", a: "They should live in environment variables or a dedicated secrets manager, never committed to source control, since a secret once in git history is effectively permanently exposed even after later removal." },
      { q: "Why are request IDs important for debugging production issues?", a: "Under concurrent traffic, many requests' logs interleave; a request id generated at entry and threaded through every log line and downstream call lets you filter and see the complete lifecycle of one specific request during an incident." },
    ],
    practice: [
      "Refactor a route handler that mixes validation, business logic, and DB queries into separate routes/service/repository layers.",
      "Add schema validation to an endpoint and return a structured 400 error for invalid input.",
      "Move a hardcoded API key into an environment variable and load it via config at startup.",
      "Add request-id middleware and structured JSON logging, then trace a single request's logs end to end.",
    ],
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
    deepDive: [
      "A migration is a small, versioned, ordered script that changes the database schema (creating a table, adding a column, adding an index). A migration tool records which migrations have already run in a special table, so running the migration command is idempotent — already-applied migrations are skipped — and every environment (a new developer's laptop, staging, production) can be brought to the exact same schema state by simply running all pending migrations in order.",
      "Once a migration has shipped to any shared environment, editing it retroactively is dangerous: environments that already ran the old version won't re-run the edited one (since it's recorded as applied), so your team's databases silently diverge. The correct fix for a mistake in an already-shipped migration is always a new migration that corrects it, keeping history append-only and reproducible.",
      "Indexes speed up reads on the columns they cover, but they aren't free — they add write overhead and storage — so the practical approach is to index columns you actually filter (WHERE), join, or sort on, not every column defensively. The EXPLAIN (or EXPLAIN ANALYZE) command shows the database's actual query plan, revealing whether a query is doing an efficient index scan or a slow sequential scan over the whole table, which is the only reliable way to know if an index is helping.",
      "Transactions group multiple statements into a single all-or-nothing unit: if a multi-step operation like 'deduct from account A, add to account B' fails partway through, a transaction ensures neither step is committed, avoiding a corrupted intermediate state. SQL injection — where untrusted input is concatenated directly into a query string, letting an attacker inject arbitrary SQL like ' OR '1'='1 — is prevented entirely by parameterised queries/prepared statements, which treat input strictly as data and never as executable SQL syntax, and this should be non-negotiable in any production code." ,
    ],
    example: {
      title: "Adding a new column safely with a migration",
      steps: [
        "The team needs to add a 'published' boolean column to the existing courses table.",
        "A new migration file 004_add_published_to_courses.sql is created (never editing the earlier 002_add_courses.sql).",
        "The migration runs: ALTER TABLE courses ADD COLUMN published boolean NOT NULL DEFAULT false;",
        "The migration tool records 004 as applied in its tracking table after running successfully.",
        "A teammate pulls the latest code and runs the migration command; only 004 runs for them since 001-003 are already recorded as applied.",
        "Staging and production run the same command during deploy, converging to the identical schema.",
        "A query filtering WHERE published = true is checked with EXPLAIN ANALYZE, and an index is added on published if the plan shows a costly sequential scan.",
      ],
      result: "Every environment ends up with an identical, correctly ordered schema history, and the new filter query is verified to use an efficient plan.",
    },
    mistakes: [
      { mistake: "Editing an already-shipped migration file to fix a mistake.", fix: "Write a new migration that corrects the issue, keeping migration history append-only so environments stay consistent." },
      { mistake: "Adding indexes to every column 'just in case'.", fix: "Index only columns actually used in WHERE/JOIN/ORDER BY, and verify benefit with EXPLAIN ANALYZE, since indexes add write overhead." },
      { mistake: "Running multiple related writes as separate statements without a transaction, risking partial failure.", fix: "Wrap multi-step writes in a transaction so they either all commit or all roll back together." },
      { mistake: "Building SQL queries by concatenating user input directly into the query string.", fix: "Always use parameterised queries/prepared statements so input is treated strictly as data, preventing SQL injection." },
    ],
    interviewQA: [
      { q: "Why shouldn't you edit a migration that's already been run in production?", a: "The migration tracking table already marks it as applied in every environment that ran it, so editing the file has no effect there and creates schema drift; the safe fix is always a new migration on top." },
      { q: "How do you decide which columns to index?", a: "Index columns that are frequently used in WHERE clauses, JOIN conditions, or ORDER BY, and confirm the benefit using EXPLAIN ANALYZE to check the query plan, since unnecessary indexes slow down writes and use extra storage without helping reads." },
      { q: "Why are transactions important for multi-step writes?", a: "Without a transaction, if a multi-step operation fails partway through, the database can be left in an inconsistent intermediate state; a transaction guarantees all statements commit together or none do." },
      { q: "How do parameterised queries prevent SQL injection?", a: "They separate the SQL command structure from the data values, sending user input as parameters rather than concatenating it into the query text, so the database never interprets user input as executable SQL syntax." },
    ],
    practice: [
      "Write two sequential migration files that add a table and then add a column to it, and run them against a local database.",
      "Use EXPLAIN ANALYZE on a query before and after adding an index and compare the query plans.",
      "Write a function that transfers a balance between two rows inside a transaction, and test that a forced error rolls back both changes.",
      "Rewrite a string-concatenated SQL query as a parameterised query and demonstrate it blocks a basic injection attempt.",
    ],
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
    deepDive: [
      "A core deployment principle is 'build once, deploy many': you build a single artifact (a Docker image, a compiled bundle) from a commit, and the same artifact is promoted through staging and production, with only environment-specific configuration (database URLs, feature flags, API keys) changing between them. If you rebuild separately for each environment, you risk subtle differences (a dependency version resolving differently) that make 'it worked in staging' unreliable — the artifact itself must be identical, only its config differs.",
      "Continuous Integration (CI) automates the checks that must pass before code reaches users: linting catches style/simple bugs, type checking catches a class of logic errors at compile time, and automated tests catch regressions in behaviour. Only after all of these pass ('green') does the pipeline build the deployable artifact and proceed to deploy, which turns 'did I break anything' from a manual, error-prone human check into a fast, consistent automated gate.",
      "Once live, the four golden signals — latency (how long requests take), traffic (how many requests are coming in), errors (rate of failed requests), and saturation (how close a resource like CPU/memory/connections is to its limit) — give a compact, high-signal view of system health without needing to stare at every individual log line. Alerting on meaningful thresholds for these (not just 'is the server up') catches degradation before it becomes a full outage.",
      "Because any deploy can introduce a regression despite passing CI, production systems need a fast rollback path defined before an incident, not improvised during one: this might be redeploying the previous artifact, toggling a feature flag off, or using a blue-green/canary deployment strategy that only shifts full traffic to the new version once it's proven healthy. Health check endpoints (a simple /healthz that verifies the app and its critical dependencies are responsive) let load balancers and orchestrators automatically stop routing traffic to an unhealthy instance, which is the first line of defence before a human even needs to intervene." ,
    ],
    example: {
      title: "Shipping a change through CI/CD and catching a bad deploy",
      steps: [
        "A developer pushes a commit; CI runs lint, typecheck, and the test suite automatically.",
        "All checks pass ('green'), so CI builds a single Docker image tagged with the commit hash.",
        "That exact image is deployed to a staging environment with staging's environment variables.",
        "After manual/automated verification on staging, the same image is promoted to production with production's environment variables (no rebuild).",
        "A canary rollout sends 10% of production traffic to the new version while monitoring the four golden signals.",
        "Error rate on the canary spikes compared to the stable version, triggering an alert.",
        "The rollback path is triggered automatically, shifting traffic back to the previous stable version before most users are affected.",
      ],
      result: "A regression is caught and rolled back within minutes via canary monitoring, rather than being discovered by users after a full rollout.",
    },
    mistakes: [
      { mistake: "Rebuilding the artifact separately for each environment instead of promoting one build.", fix: "Build once from a commit and promote that exact artifact through staging to production, changing only configuration." },
      { mistake: "Deploying straight to 100% of production traffic with no canary or gradual rollout.", fix: "Use canary or blue-green deployment to expose a small fraction of traffic first and monitor before a full rollout." },
      { mistake: "Only checking 'is the server up' instead of watching latency, traffic, errors, and saturation.", fix: "Instrument and alert on the four golden signals to catch degradation before it becomes a full outage." },
      { mistake: "Having no defined rollback process, improvising during an active incident.", fix: "Define and rehearse a rollback path (redeploy previous artifact, feature flag toggle) before it's needed." },
    ],
    interviewQA: [
      { q: "Why is 'build once, deploy many' a best practice?", a: "Building a single artifact and promoting it unchanged through environments guarantees staging and production are running byte-identical code, with only config differing; rebuilding per environment risks subtle inconsistencies that make earlier testing unreliable." },
      { q: "What are the four golden signals and why do they matter?", a: "Latency, traffic, errors, and saturation give a compact overview of system health; monitoring and alerting on them (not just uptime) catches performance degradation or partial failures before they escalate into a full outage." },
      { q: "What's the value of a canary or blue-green deployment strategy?", a: "It limits the blast radius of a bad deploy by exposing the new version to a small slice of traffic (or an inactive environment) first, allowing monitoring to catch regressions before the majority of users are affected, and enabling fast rollback." },
      { q: "What should a CI pipeline check before allowing a deploy?", a: "Typically lint (style/simple bug checks), type checking (compile-time correctness), and automated tests (behavioural regressions); only after all pass does the pipeline build the artifact and proceed to deployment." },
    ],
    practice: [
      "Set up a CI pipeline that runs lint, typecheck, and tests on every push, blocking merge on failure.",
      "Containerize an app so the same image can be run with different environment variables for staging vs production.",
      "Add a /healthz endpoint that checks the app and its database connection, and wire it to a load balancer health check.",
      "Simulate a bad deploy in a test setup and practice rolling back to the previous version quickly.",
    ],
  },
};
