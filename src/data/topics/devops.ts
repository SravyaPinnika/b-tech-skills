import type { TopicMap } from "../topicContent";

export const devopsTopics: TopicMap = {
  "Linux command line & shell scripting": {
    summary:
      "Servers are driven from a shell. Composing small commands with pipes solves most operational tasks without writing a program.",
    keyPoints: [
      "Navigation and inspection: ls, cd, cat, less, tail -f, grep, find, ps, top, df.",
      "Pipes pass stdout to stdin; redirect with > (overwrite) and >> (append).",
      "Permissions are user/group/other with r=4 w=2 x=1 (chmod 755).",
      "Scripts start with #!/usr/bin/env bash and should use set -euo pipefail.",
    ],
    syntax: {
      lang: "bash",
      code: "#!/usr/bin/env bash\nset -euo pipefail\ngrep -c ERROR /var/log/app.log\ntail -f app.log | grep --line-buffered TIMEOUT",
    },
    diagram: `cat log | grep ERROR | awk '{print $1}' | sort | uniq -c | sort -rn
  \\____/   \\________/   \\_____________/   \\__________________/
  source     filter        transform            aggregate`,
    deepDive: [
      "The Unix philosophy is: each tool does one thing well, and tools compose through plain text streams. This is why grep, awk, sort and uniq feel like a single language once you learn pipes — stdout of one command becomes stdin of the next, and the shell just wires file descriptors together. Understanding exit codes (0 = success, non-zero = failure) matters as much as the commands themselves, because scripts branch and chain on them with && and ||.",
      "Shell scripts are glue code for operations: cron jobs, deployment steps, log rotation, health checks. The three safety flags — set -e (exit on error), set -u (error on unset variable), set -o pipefail (a pipeline fails if any stage fails, not just the last one) — turn a fragile script into one that fails loudly instead of silently continuing with bad data. Quoting variables (\"$var\" not $var) avoids word-splitting bugs when values contain spaces.",
      "Permissions and process inspection are the two skills that separate someone who can read a shell script from someone who can operate a production box. chmod/chown decide who can read, write or execute a file; ps, top and df tell you whether a box is out of CPU, memory or disk, which is the first triage step for almost every incident before you even open an APM dashboard.",
    ],
    example: {
      title: "Find the top 3 IPs hitting an endpoint from an access log",
      steps: [
        "Start with the raw log: cat access.log",
        "Filter to the endpoint of interest: grep '/api/login' access.log",
        "Extract the IP column (say field 1): awk '{print $1}'",
        "Count and rank: sort | uniq -c | sort -rn | head -3",
        "Full pipeline: grep '/api/login' access.log | awk '{print $1}' | sort | uniq -c | sort -rn | head -3",
      ],
      result: "Prints the 3 IPs making the most login requests, each with its hit count, useful for spotting brute-force attempts.",
    },
    mistakes: [
      { mistake: "Forgetting to quote variables, e.g. rm $file when $file has a space.", fix: "Always quote: rm \"$file\"; run scripts through shellcheck." },
      { mistake: "Writing scripts without set -euo pipefail so a failed step is silently ignored.", fix: "Add the safety header at the top of every script and check exit codes explicitly where needed." },
      { mistake: "Using chmod 777 to 'fix' a permission error.", fix: "Grant the minimum permission the specific user/group needs, e.g. chmod 750 or chown to the right owner." },
    ],
    interviewQA: [
      { q: "What is the difference between > and >> in bash?", a: "> overwrites the target file (truncates then writes); >> appends to the end of the file without deleting existing content." },
      { q: "What does set -euo pipefail do?", a: "-e exits the script on any command failure, -u treats unset variables as errors, and -o pipefail makes a pipeline's exit code reflect the first failing stage instead of only the last one." },
      { q: "How do you find which process is using the most memory on a server?", a: "Run top or htop and sort by %MEM, or use ps aux --sort=-%mem | head to list the top memory consumers." },
      { q: "What do the three permission digits in chmod 755 mean?", a: "Each digit is owner/group/other as a sum of read(4)+write(2)+execute(1); 755 means owner has rwx, group and others have r-x." },
    ],
    practice: [
      "Write a script that tails a log file and emails/prints an alert when 'ERROR' appears 5+ times in a minute.",
      "Use find to list all files older than 30 days in /tmp and delete them safely.",
      "Practice chmod/chown on a scratch directory until the numeric and symbolic forms feel equivalent.",
      "Parse a CSV with awk to sum a numeric column.",
      "Write a script with set -euo pipefail that fails intentionally and observe the exit code with echo $?.",
    ],
  },

  "Git branching and PR workflow": {
    summary:
      "Git stores snapshots as commits on branches. Feature branches keep main deployable and make review the default.",
    keyPoints: [
      "Branch per change, small commits with meaningful messages.",
      "merge preserves history; rebase rewrites it into a straight line — never rebase shared branches.",
      "Resolve conflicts by editing the marked region, then add and continue.",
      "Protect main: required reviews plus passing CI.",
    ],
    syntax: {
      lang: "bash",
      code: "git switch -c feat/tools-feed\ngit add -p && git commit -m \"add weekly tools feed\"\ngit push -u origin feat/tools-feed   # open PR",
    },
    diagram: `main    A---B-----------M
             \\         /
feature       C---D---E   (PR reviewed, then merged)`,
    deepDive: [
      "Git is a content-addressed graph of commits, not a list of diffs. Each commit is a snapshot pointing to a parent (or two, for a merge), identified by a SHA hash of its content. Branches are just movable pointers to a commit; this is why branching in Git is instant and cheap compared to older version control systems that copied files. Understanding this model explains why 'moving' a branch pointer (reset), 'adding a new commit that undoes changes' (revert), and 'rewriting commits' (rebase, amend) are fundamentally different operations with different safety guarantees.",
      "Merge vs rebase is a trade-off between honesty and readability of history. A merge commit records exactly when and how two lines of work joined, which is valuable for shared branches and audits. Rebase replays your commits on top of the latest main, producing a linear history that is easier to read with git log, but it rewrites commit hashes — which is destructive if anyone else has already pulled the old commits. The rule 'never rebase a branch others are using' exists purely to avoid diverging histories that force everyone into painful manual reconciliation.",
      "The PR (pull request) workflow turns Git into a collaboration and quality gate tool, not just a backup mechanism. Small, focused commits with clear messages make review fast and bisecting bugs (git bisect) reliable. Branch protection rules (required reviews, required passing CI, no force-push to main) exist because a single bad merge to main can break deployment for the whole team; the cost of that gate is a few minutes per PR, which is cheap insurance.",
    ],
    example: {
      title: "Resolve a merge conflict while rebasing a feature branch",
      steps: [
        "Update main and start the rebase: git fetch origin && git rebase origin/main",
        "Git stops at a commit with a conflict and marks the file with <<<<<<<, =======, >>>>>>> markers.",
        "Open the file, decide which lines to keep (or combine both), and remove the conflict markers.",
        "Stage the resolved file: git add <file>",
        "Continue the rebase: git rebase --continue, repeating for any further conflicts, then force-push your own branch: git push --force-with-lease",
      ],
      result: "Feature branch now sits cleanly on top of the latest main with a linear, conflict-free history, ready for review.",
    },
    mistakes: [
      { mistake: "Rebasing a branch that teammates have already pulled from.", fix: "Only rebase your own private feature branch; use merge for shared/team branches." },
      { mistake: "Making one giant commit with an unrelated bundle of changes.", fix: "Commit small, related changes with git add -p and write a message describing the 'why'." },
      { mistake: "Force-pushing with --force after a rebase, overwriting a teammate's new commits.", fix: "Use --force-with-lease, which refuses to push if the remote has commits you have not seen." },
    ],
    interviewQA: [
      { q: "What is the difference between git merge and git rebase?", a: "Merge creates a new commit joining two histories and preserves both branches' commit order; rebase replays your commits on top of another branch, producing a linear history but rewriting commit hashes." },
      { q: "How do you resolve a merge conflict?", a: "Open the conflicting file, look for the <<<<<<< / ======= / >>>>>>> markers, edit the content to the desired final state, remove the markers, then git add the file and continue the merge or rebase." },
      { q: "Why should you never rebase a shared/public branch?", a: "Rebase rewrites commit hashes; anyone who already pulled the old commits will have a diverging history and get conflicts or duplicate commits when they try to sync." },
      { q: "What does git cherry-pick do?", a: "It applies a specific commit from one branch onto another branch without merging the whole branch, useful for backporting a single fix." },
    ],
    practice: [
      "Create a feature branch, make 3 small commits, and open a PR against main.",
      "Intentionally cause a merge conflict between two branches and resolve it manually.",
      "Practice git rebase -i to squash 3 commits into one with a clean message.",
      "Use git bisect to find which commit introduced a bug in a sample repo.",
      "Set up branch protection on a personal repo requiring PR review before merge.",
    ],
  },

  "Docker images, volumes, compose": {
    summary:
      "An image is an immutable filesystem plus a start command; a container is a running instance of it. Compose wires several containers together.",
    keyPoints: [
      "Layers are cached — copy the lockfile and install dependencies before copying source.",
      "Containers are ephemeral; persist data in named volumes.",
      "Multi-stage builds keep the runtime image small; run as a non-root user.",
      "Pass configuration through environment variables, never bake secrets into the image.",
    ],
    syntax: {
      lang: "dockerfile",
      code: "FROM node:20-alpine AS build\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\n\nFROM node:20-alpine\nCOPY --from=build /app/dist ./dist\nCMD [\"node\", \"dist/server.js\"]",
    },
    diagram: `Dockerfile -> build -> image -> run -> container
                                    |
                          volume (data survives restart)

compose: [web] -> [api] -> [postgres+volume]`,
    deepDive: [
      "A Docker image is built as a stack of read-only layers, each corresponding to a Dockerfile instruction, and Docker caches each layer by hashing its inputs. This is why instruction order matters: if you COPY the full source before RUN npm ci, any source change invalidates the cache and forces a full reinstall of dependencies on every build. Ordering steps from least-frequently-changed (base image, lockfile install) to most-frequently-changed (application source) keeps builds fast.",
      "Containers are meant to be disposable — you should be able to kill one and start a fresh one from the same image with no data loss for anything that matters. Anything a container writes to its own writable layer disappears when the container is removed, so databases, uploaded files, and other durable state must live in a named volume or bind mount, which exists independently of the container's lifecycle. This separation of 'code image' from 'data volume' is what makes rolling upgrades of a container safe.",
      "Multi-stage builds solve the problem that build tooling (compilers, dev dependencies, source maps) does not belong in a production image: it bloats the image and increases attack surface. The first stage builds the artifact, and the final stage copies only the compiled output into a slim base image. Combined with running as a non-root USER and never embedding secrets (which end up baked into image layers and pushed to a registry), this keeps images small, fast to pull, and safer to run.",
    ],
    example: {
      title: "Run a Node app with Postgres using Docker Compose",
      steps: [
        "Write a docker-compose.yml with two services: 'api' (built from your Dockerfile) and 'db' (image: postgres:16).",
        "Give 'db' a named volume: volumes: - pgdata:/var/lib/postgresql/data, and declare pgdata: under top-level volumes.",
        "Set DATABASE_URL as an environment variable on 'api' pointing to db:5432 (the service name resolves via Compose's internal DNS).",
        "Run docker compose up --build; Compose builds the api image and starts both containers on a shared network.",
        "Stop and restart with docker compose down && docker compose up — the database data in pgdata survives because it lives in the volume, not the container.",
      ],
      result: "A two-container app where the API can reach Postgres by service name, and database data persists across container restarts.",
    },
    mistakes: [
      { mistake: "Copying the whole project before installing dependencies, breaking layer caching.", fix: "COPY package*.json first, RUN npm ci, then COPY the rest of the source." },
      { mistake: "Storing database files inside the container's writable layer with no volume.", fix: "Mount a named volume at the database's data directory so data survives container recreation." },
      { mistake: "Hardcoding secrets (API keys, passwords) directly in the Dockerfile or image.", fix: "Inject secrets at runtime via environment variables or a secrets manager, never bake them into a layer." },
    ],
    interviewQA: [
      { q: "What is the difference between an image and a container?", a: "An image is an immutable, versioned filesystem snapshot plus metadata (like the default command); a container is a running (or stopped) instance of that image with its own writable layer and process namespace." },
      { q: "Why use multi-stage builds?", a: "To keep the final runtime image small and secure by excluding build tools, dev dependencies and source code that were only needed to produce the compiled artifact." },
      { q: "How does Docker Compose let containers talk to each other?", a: "Compose creates a shared user-defined network for the services and gives each container a DNS entry equal to its service name, so 'api' can reach Postgres at host 'db'." },
      { q: "Why should a container run as a non-root user?", a: "If an attacker exploits the app inside the container, running as non-root limits what they can do within the container and reduces the risk of container-breakout style privilege escalation." },
    ],
    practice: [
      "Write a multi-stage Dockerfile for a small app and compare image size before/after.",
      "Create a docker-compose.yml with an app and a database, using a named volume for the DB.",
      "Deliberately reorder COPY/RUN instructions and observe build cache behavior with docker build.",
      "Use docker exec -it <container> sh to inspect a running container's filesystem.",
      "Set an environment variable via docker-compose.yml and read it from your app code.",
    ],
  },

  "CI/CD pipelines (GitHub Actions)": {
    summary:
      "CI runs checks on every push; CD deploys the artifact once those checks pass. Both live as YAML in the repository.",
    keyPoints: [
      "Trigger on push and pull_request; run lint, typecheck and tests in parallel jobs.",
      "Cache dependencies keyed on the lockfile hash to keep runs fast.",
      "Store credentials as encrypted repository secrets.",
      "Gate deploys on the checks and keep the deploy step idempotent.",
    ],
    syntax: {
      lang: "yaml",
      code: "on: [push, pull_request]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: npm ci\n      - run: npm test",
    },
    diagram: `push -> [lint] [typecheck] [test]  (parallel)
                    all green
                       |
                    [build] -> [deploy staging] -> approve -> [prod]`,
    deepDive: [
      "CI (continuous integration) exists to catch problems the moment they are introduced rather than days later. Every push runs the same checks a developer would run locally — lint, typecheck, unit tests, sometimes integration tests — on a clean, reproducible machine, removing 'it works on my machine' as an excuse. Running independent checks (lint, typecheck, test) as parallel jobs instead of sequential steps in one job cuts wall-clock time significantly, since GitHub Actions can schedule them on separate runners simultaneously.",
      "CD (continuous delivery/deployment) extends the pipeline so that once checks pass, the artifact is automatically pushed toward production, either fully automatically (continuous deployment) or with a manual approval gate (continuous delivery). Environments are usually staged: deploy to a staging environment automatically, then require a human approval step before promoting to production, which balances speed with safety. Idempotent deploy steps (running the same deploy twice produces the same end state, not duplicated resources) are essential because pipelines sometimes retry.",
      "Performance and security are the two things that separate a toy pipeline from a production one. Dependency caching keyed on a lockfile hash means npm ci only re-downloads packages when dependencies actually change, saving minutes per run across hundreds of runs per day. Secrets (API keys, deploy tokens) must live in the CI provider's encrypted secret store, injected as environment variables at run time, and never be printed to logs or committed to the YAML file itself, since workflow files are visible to anyone with repo read access.",
    ],
    example: {
      title: "Add a GitHub Actions workflow that tests every PR and deploys main to staging",
      steps: [
        "Create .github/workflows/ci.yml triggered on: [push, pull_request].",
        "Add a 'test' job with steps: checkout, setup-node with cache: 'npm', npm ci, npm run lint, npm run typecheck, npm test.",
        "Add a 'deploy' job with needs: test and an if: github.ref == 'refs/heads/main' condition so it only runs on main.",
        "In the deploy job, pull the deploy token from secrets.DEPLOY_TOKEN (set in repo Settings > Secrets) rather than hardcoding it.",
        "Push a commit to a feature branch and confirm only the test job runs; merge to main and confirm deploy also runs.",
      ],
      result: "Every PR is automatically checked before merge, and only main automatically deploys to staging using a securely stored token.",
    },
    mistakes: [
      { mistake: "Putting lint, typecheck and test sequentially in one job, wasting time.", fix: "Split them into separate jobs so GitHub Actions runs them in parallel on different runners." },
      { mistake: "Hardcoding an API token directly in the workflow YAML file.", fix: "Store it as an encrypted repository/environment secret and reference it as secrets.TOKEN_NAME." },
      { mistake: "Deploying on every push without gating on test results.", fix: "Use needs: test (or a workflow dependency) so the deploy job only runs after tests pass." },
    ],
    interviewQA: [
      { q: "What is the difference between continuous delivery and continuous deployment?", a: "Continuous delivery means every change is automatically built and tested and is deployable, but a human approves the actual production release; continuous deployment removes that manual gate and releases automatically once checks pass." },
      { q: "How do you speed up a slow CI pipeline?", a: "Run independent checks as parallel jobs, cache dependencies keyed on the lockfile hash, only run heavy/integration tests on relevant changes, and use a matrix build only where genuinely needed." },
      { q: "Where should secrets live in a CI/CD pipeline?", a: "In the CI provider's encrypted secret store (e.g. GitHub Actions repository or environment secrets), injected as environment variables at runtime, never committed to the repository or printed in logs." },
      { q: "What does it mean for a deploy step to be idempotent?", a: "Running it multiple times with the same inputs produces the same final state without creating duplicate resources or side effects, which matters because pipelines can retry a failed step." },
    ],
    practice: [
      "Write a GitHub Actions workflow with separate parallel jobs for lint, typecheck and test.",
      "Add dependency caching keyed on package-lock.json and measure the speed difference.",
      "Add a deploy job gated with needs: test that only runs on the main branch.",
      "Store a fake secret in repo settings and reference it safely in a workflow step.",
      "Add a manual approval environment before a 'deploy to production' job.",
    ],
  },

  "Kubernetes basics": {
    summary:
      "Kubernetes runs containers declaratively: you describe the desired state and controllers converge the cluster towards it.",
    keyPoints: [
      "Pod = smallest unit; Deployment manages replica pods and rolling updates.",
      "Service gives a stable virtual IP/DNS name; Ingress routes external HTTP.",
      "ConfigMap for configuration, Secret for credentials.",
      "Set resource requests/limits and liveness/readiness probes.",
    ],
    syntax: {
      lang: "yaml",
      code: "kind: Deployment\nspec:\n  replicas: 3\n  template:\n    spec:\n      containers:\n        - name: api\n          image: myapp/api:1.4.0",
    },
    diagram: `Ingress -> Service -> [Pod][Pod][Pod]  (Deployment keeps 3 alive)
                          ^
             pod dies -> controller starts a replacement`,
    deepDive: [
      "Kubernetes is a control loop system: you submit a desired state (a YAML manifest) to the API server, and controllers continuously compare actual cluster state to desired state, taking action to close any gap. A Deployment says 'I want 3 replicas of this pod spec running'; if a pod crashes, the ReplicaSet controller notices the count dropped to 2 and schedules a new one — you never manually restart anything. This reconciliation model is what makes Kubernetes self-healing and is fundamentally different from imperative scripts that run once and stop.",
      "Networking in Kubernetes is layered to solve the problem that pods are ephemeral and get new IPs every time they restart. A Service provides a stable virtual IP and DNS name that load-balances across whichever pods currently match its label selector, so other services never need to track individual pod IPs. Ingress sits one layer above Services and handles routing of external HTTP(S) traffic — host/path-based routing, TLS termination — to the right Service, which is why a typical request path is Ingress -> Service -> Pod.",
      "Two more concerns every real deployment needs: configuration/secrets separation and resource governance. ConfigMaps hold non-sensitive configuration (feature flags, URLs) and Secrets hold sensitive values (base64-encoded, and ideally backed by a real secret manager), both injected into pods as environment variables or mounted files, keeping the container image itself environment-agnostic. Resource requests/limits tell the scheduler how much CPU/memory a pod needs and caps how much it can consume, preventing one noisy pod from starving others on the same node; liveness probes restart a pod that has hung, and readiness probes stop sending traffic to a pod that is not yet ready to serve.",
    ],
    example: {
      title: "Roll out a new version of an API with zero downtime",
      steps: [
        "Deployment currently runs 3 pods on image myapp/api:1.4.0 with readiness probes configured.",
        "Update the manifest's image to myapp/api:1.5.0 and apply: kubectl apply -f deployment.yaml.",
        "The Deployment controller starts new 1.5.0 pods one (or a few) at a time based on the rolling update strategy (maxSurge/maxUnavailable).",
        "Each new pod must pass its readiness probe before the Service starts sending it traffic; old pods are only terminated after replacements are ready.",
        "If the new version's pods keep crashing (liveness probe failing repeatedly), roll back with kubectl rollout undo deployment/api.",
      ],
      result: "The API is upgraded to 1.5.0 with no downtime, since traffic is always served by pods that have proven they are healthy.",
    },
    mistakes: [
      { mistake: "Deploying pods directly without a Deployment/ReplicaSet controller.", fix: "Always wrap pods in a Deployment (or StatefulSet for stateful workloads) so Kubernetes can self-heal and roll out updates." },
      { mistake: "Skipping resource requests/limits, letting one pod consume a whole node's CPU.", fix: "Set sensible requests and limits for every container so the scheduler can place pods safely and enforce fairness." },
      { mistake: "Using a liveness probe that is too aggressive, causing healthy-but-slow pods to be killed in a restart loop.", fix: "Tune probe timeouts/thresholds realistically, and prefer a readiness probe to gate traffic rather than restarting a slow-starting pod." },
    ],
    interviewQA: [
      { q: "What is the difference between a Pod, a ReplicaSet and a Deployment?", a: "A Pod is the smallest deployable unit (one or more tightly-coupled containers); a ReplicaSet ensures a specified number of pod replicas are running; a Deployment manages ReplicaSets and adds rolling update/rollback capability on top." },
      { q: "What is the difference between a Service and an Ingress?", a: "A Service provides a stable internal (or optionally external) virtual IP/DNS name that load-balances to a set of pods; an Ingress is a layer above that routes external HTTP(S) traffic to different Services based on host or path, and can terminate TLS." },
      { q: "What is the difference between liveness and readiness probes?", a: "A liveness probe checks if a container is alive and should be restarted if it fails; a readiness probe checks if a container is ready to receive traffic, and failing it just removes the pod from the Service's endpoints without restarting it." },
      { q: "How does Kubernetes achieve self-healing?", a: "Controllers run continuous reconciliation loops comparing actual state to desired state stored in etcd; if a pod dies or a node fails, the relevant controller schedules replacement pods automatically." },
    ],
    practice: [
      "Deploy a simple app to a local cluster (minikube/kind) with 3 replicas and kill a pod to watch it get replaced.",
      "Expose the Deployment with a Service and reach it from another pod using its DNS name.",
      "Add a ConfigMap and Secret, and mount both into the pod as environment variables.",
      "Perform a rolling update by changing the image tag and watch kubectl rollout status.",
      "Intentionally set a bad liveness probe and observe the CrashLoopBackOff behaviour, then fix it.",
    ],
  },

  "Cloud primitives: compute, storage, IAM": {
    summary:
      "Every cloud offers the same building blocks: compute to run code, storage for data, networking to connect it, and IAM to control who may do what.",
    keyPoints: [
      "Compute: VMs, containers, serverless functions — trade control for operational load.",
      "Storage: object (S3/blob) for files, block for disks, managed databases for relational data.",
      "IAM: identities, roles and policies; grant least privilege and prefer roles over long-lived keys.",
      "Design for failure across availability zones and watch the cost of egress.",
    ],
    diagram: `                +--------- IAM (who can do what) ---------+
users -> CDN -> load balancer -> compute -> managed DB
                                    |
                              object storage`,
    deepDive: [
      "Compute options exist on a spectrum of control versus operational effort. A raw VM gives full control of the OS but you patch, scale and monitor it yourself. Containers on a managed orchestrator (ECS/EKS/GKE) hand scheduling and restart logic to the platform while you still manage the image. Serverless functions (Lambda, Cloud Functions) remove infrastructure management entirely and bill per invocation, but constrain execution time, cold starts, and runtime environment. Choosing the right tier is about matching workload shape (steady traffic vs bursty vs long-running) to operational appetite.",
      "Storage is split by access pattern, not just by 'where data lives'. Object storage (S3, Blob Storage) is built for storing large numbers of immutable files accessed over HTTP, with virtually unlimited scale but higher per-request latency — ideal for images, backups, logs, static assets. Block storage attaches to a single compute instance like a virtual hard disk, giving low-latency random access needed by databases and OS volumes. Managed database services (RDS, Cloud SQL) offload backups, patching, and failover for structured relational or key-value data, trading some configuration flexibility for reduced operational burden.",
      "IAM is the security backbone tying everything together: it answers 'which identity can perform which action on which resource'. Roles are temporary, assumable identities with a defined policy attached, and are strongly preferred over long-lived access keys because a stolen role credential expires quickly and can be scoped tightly to a single task (e.g. 'this EC2 instance can only read from this one S3 bucket'). Designing for failure means spreading resources across multiple availability zones so a single data-center outage does not take the whole service down, and being conscious that cloud providers usually charge for data leaving the network (egress) even though inbound traffic and same-region transfer are often free or cheap.",
    ],
    example: {
      title: "Design a simple 3-tier web app on cloud primitives",
      steps: [
        "Static frontend assets (JS/CSS/images) are uploaded to an object storage bucket and served through a CDN for low latency worldwide.",
        "API requests hit a load balancer that spreads traffic across multiple compute instances (or containers) running in at least two availability zones.",
        "Each compute instance is given an IAM role (not a hardcoded key) that grants only the specific permissions it needs, e.g. read/write to one database and one bucket.",
        "Application data is stored in a managed relational database with automated backups and a standby replica in a second availability zone.",
        "If one availability zone fails, the load balancer routes all traffic to healthy instances in the remaining zone, and the database fails over to its standby.",
      ],
      result: "A resilient architecture that survives a single-zone outage, with least-privilege access enforced through IAM roles instead of shared keys.",
    },
    mistakes: [
      { mistake: "Using long-lived static access keys embedded in application code or config files.", fix: "Attach an IAM role to the compute resource so credentials are short-lived and automatically rotated." },
      { mistake: "Granting a broad 'admin' or '*' policy to a service because it is easier than scoping permissions.", fix: "Apply least privilege: list exactly the actions and resources the service needs and grant only those." },
      { mistake: "Putting all resources in a single availability zone for simplicity.", fix: "Spread compute and database replicas across at least two availability zones so a zone failure does not cause an outage." },
    ],
    interviewQA: [
      { q: "What is the difference between object, block and file storage?", a: "Object storage stores files as objects accessed via an HTTP API, ideal for unstructured data at scale; block storage presents raw disk volumes attached to one instance for low-latency random access; file storage provides a shared filesystem mountable by multiple instances at once." },
      { q: "Why prefer IAM roles over access keys?", a: "Roles provide temporary, automatically-rotated credentials scoped to specific permissions and attached to a resource or session, drastically reducing the blast radius if credentials leak, unlike long-lived static keys that must be manually rotated and can be copied anywhere." },
      { q: "What does 'least privilege' mean in IAM?", a: "Granting an identity only the exact permissions it needs to do its job and nothing more, so a compromised identity can cause the smallest possible damage." },
      { q: "Why can 'designing for failure' mean spreading resources across availability zones?", a: "Each availability zone is a physically separate data center with independent power/network; if one fails, resources in other zones keep serving traffic, so the application avoids a single point of failure." },
    ],
    practice: [
      "Create an object storage bucket, upload a file, and make it accessible via a CDN.",
      "Launch two compute instances in different availability zones behind a load balancer.",
      "Write an IAM policy granting read-only access to a single storage bucket, and attach it as a role.",
      "Set up a managed database with an automated backup and a read replica.",
      "Estimate the egress cost of serving 100 GB of video per month from object storage.",
    ],
  },

  "Logging, metrics, alerting": {
    summary:
      "Logs explain individual events, metrics show aggregate trends, traces follow one request across services. Alerts fire on symptoms users feel.",
    keyPoints: [
      "Emit structured JSON logs with a request id; never log secrets or PII.",
      "Track latency percentiles (p50/p95/p99), not averages.",
      "Alert on user-visible symptoms with a defined threshold and duration to avoid noise.",
      "Every alert needs an owner and a runbook.",
    ],
    diagram: `app -> logs ---> search (grep the incident)
    -> metrics -> dashboard -> alert -> on-call
    -> traces --> which service added the 400ms?`,
    deepDive: [
      "Logs, metrics and traces are the three pillars of observability, and each answers a different question. Logs answer 'what exactly happened in this one event' — structured JSON logs with a consistent schema and a request/correlation id let you grep or query for every log line belonging to one user request across multiple services, which is invaluable during incident debugging. Metrics answer 'how is the system behaving overall' — numeric time series like request count, error rate and latency, aggregated cheaply over millions of events, which is what dashboards and alerting are built on. Traces answer 'where did the time go for this one request' by following it across service boundaries with timed spans, pinpointing which downstream call added latency.",
      "Averages lie about latency because response time distributions are heavily skewed — a handful of very slow requests can be invisible in an average but devastating for the users who experience them. Percentiles fix this: p50 (median) shows the typical experience, p95 shows what the slower 5% of users see, and p99 exposes the tail that often correlates with timeouts, GC pauses, or contention. Most SLOs are defined on p95/p99 latency precisely because that is where user pain concentrates, while p50 alone would look fine even during a partial outage.",
      "Alerting is a discipline, not just wiring a threshold to a metric. Alerts should fire on symptoms the user actually feels (elevated error rate, high p99 latency, failed checkouts) rather than every internal cause (a single server's CPU spike), because symptom-based alerts have fewer false positives and map directly to what needs fixing. A duration window (e.g. 'error rate > 2% for 5 minutes') filters out normal noise/blips. Every alert must route to a specific on-call owner and link to a runbook describing likely causes and first response steps, otherwise alerts become noise that gets ignored — a state known as alert fatigue, which is more dangerous than having no alerts at all.",
    ],
    example: {
      title: "Set up an alert for degraded checkout latency",
      steps: [
        "Instrument the checkout endpoint to emit request duration as a metric, tagged by route and status code.",
        "Build a dashboard panel showing p50, p95 and p99 latency for the checkout route over the last 24 hours.",
        "Define an alert rule: 'p99 latency for checkout > 2 seconds, sustained for 5 minutes'.",
        "Route the alert to the on-call engineer's phone/Slack with a link to a runbook titled 'Checkout latency spike'.",
        "The runbook lists first checks: is the payment provider slow, is the database under load, has a recent deploy gone out.",
      ],
      result: "The team is paged only when checkout is genuinely degraded for real users, with a clear next step instead of guesswork.",
    },
    mistakes: [
      { mistake: "Logging full request bodies including passwords or personal data.", fix: "Redact or omit secrets/PII before logging; log only what is needed to debug, plus a correlation id." },
      { mistake: "Alerting on raw averages, missing latency spikes affecting a slice of users.", fix: "Alert on p95/p99 percentiles, since averages smooth out the tail where user pain actually shows up." },
      { mistake: "Creating alerts with no owner or runbook, so they get silenced or ignored.", fix: "Every alert must have a named on-call owner and a linked runbook with concrete first steps." },
    ],
    interviewQA: [
      { q: "What is the difference between logs, metrics and traces?", a: "Logs are discrete event records useful for debugging a specific incident; metrics are aggregated numeric time series useful for trends and alerting; traces follow a single request across services to show where time was spent." },
      { q: "Why do we track p95/p99 latency instead of average latency?", a: "Latency distributions are skewed; a few very slow requests can be hidden inside an average but represent real user pain, so percentiles expose the tail experience that averages mask." },
      { q: "What makes a good alert?", a: "It fires on a user-visible symptom, has a threshold and duration tuned to avoid noise, has a clear owner, and links to a runbook with diagnostic and remediation steps." },
      { q: "What is alert fatigue and how do you avoid it?", a: "It is when too many low-value or noisy alerts cause on-call engineers to start ignoring pages; avoid it by alerting on symptoms rather than every possible cause, and tuning thresholds/durations to real incidents." },
    ],
    practice: [
      "Add structured JSON logging with a request id to a small sample API.",
      "Instrument an endpoint to record latency and compute p50/p95/p99 from sample data.",
      "Write an alert rule definition (in words or YAML) for 'error rate > 5% for 5 minutes'.",
      "Draft a one-page runbook for a hypothetical 'database connection pool exhausted' alert.",
      "Identify which of a list of metrics are symptom-based vs cause-based, and justify the split.",
    ],
  },
};
