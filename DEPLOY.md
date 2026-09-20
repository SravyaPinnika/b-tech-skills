# Deploying B.Tech Skills outside Lovable

The app is a full-stack TanStack Start (React 19 + Vite + Nitro) app with a Lovable Cloud
(Supabase) backend. Both Netlify and Vercel can host it — server-side rendering and
server functions are included, not just a static site.

## 1. Set environment variables

In the hosting dashboard (Netlify: Site settings → Environment variables,
Vercel: Project → Settings → Environment Variables), add:

| Variable | Example | Used for |
|---|---|---|
| `NITRO_PRESET` | `netlify` or `vercel` | Selects the deploy target for the build |
| `VITE_SUPABASE_URL` | `https://xxxx.supabase.co` | Browser code |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_...` | Browser code (public key, safe to expose) |
| `SUPABASE_URL` | `https://xxxx.supabase.co` | Server-side rendering / server functions |
| `SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_...` | Server-side calls (public key, safe to expose) |

Copy the real values from your existing `.env` file (or from the Lovable project).
`.env.example` lists them all — do **not** commit the real `.env`.

## 2. Netlify

`netlify.toml` in this repo already sets the build command, publish directory,
Node 22 and `NITRO_PRESET=netlify`.

1. Push this repo to GitHub (if it isn't already).
2. In Netlify: **Add new site → Import an existing project → pick the repo**.
3. Build settings are read from `netlify.toml` automatically.
4. Add the environment variables from the table above.
5. Deploy.

## 3. Vercel

1. Push this repo to GitHub.
2. In Vercel: **Add New → Project → import the repo**.
   - Framework Preset: **Other**
   - Build Command: `npm run build` (from `vercel.json`)
   - Install Command: `npm install`
3. Add the environment variables from the table above, including `NITRO_PRESET=vercel`.
4. Deploy.

CLI alternative (no git needed):

```sh
npm install
NITRO_PRESET=vercel npm run build
npx vercel deploy --prebuilt
```

## 4. Node version

Both platforms should use Node 22 (Netlify pins it in `netlify.toml`; on Vercel set
"Node.js Version" to 22.x in project settings if needed).

## 5. What works and what needs Lovable

- **Works anywhere**: all pages, auth (email/password + Google), the database
  (profiles, progress, attempts, applications), and the weekly recruiter/tools
  refresh jobs — those run in the Lovable Cloud backend, not on the web host.
- **Lovable-only**: AI-generated content (lessons, roadmaps, mock-interview grading)
  uses the Lovable AI key, which only exists on Lovable hosting. On Netlify/Vercel
  those features will show an "AI is not configured" message unless you swap
  `src/lib/ai.server.ts` to a provider of your own (e.g. OpenAI) with your key set
  as `LOVABLE_API_KEY` in the hosting dashboard.

## 6. Cron / scheduled jobs

The weekly refresh webhooks (`/api/public/hooks/*`) are called by the Lovable Cloud
scheduler against the published `*.lovable.app` URL, so schedules keep working even
when the frontend is hosted elsewhere. If you later point the domain at Netlify or
Vercel, update the scheduler's target URL to the new domain.
