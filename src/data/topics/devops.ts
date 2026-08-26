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
  },
};
