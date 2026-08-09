# AGENTS.md

Project knowledge for AI agents working in this repo.

## Project

**LostInTranslation API (LIT)** — Express + React (Vite) full-stack app. A
linguistic middleware that detects "cultural meaning loss" in text and enriches
AI prompts with cultural context via Gemini. Serves a marketing SPA, a REST API
for developers (API keys, rate limits, dashboard), and demo widgets.

License: AGPL-3.0. Repo: https://github.com/Mohito-s/LostinTranslation

## Commands (Windows PowerShell: use `npm.cmd`, not `npm`)

```bash
npm.cmd install        # install deps
npm.cmd run dev        # tsx server.ts (HMR + API on :3000)
npm.cmd run lint       # tsc --noEmit  (must stay green)
npm.cmd test           # vitest run     (must stay green)
npm.cmd run build      # vite build + esbuild bundle -> dist/
npm.cmd run start      # node dist/server.cjs
npm.cmd run clean      # node fs.rmSync dist/server.js
```

Note: `npm run build` may fail on this Windows machine because Application
Control blocks the native rollup binary. CI (ubuntu) builds fine. TypeScript and
tests always work locally.

## Key files

- `server.ts` — Express gateway: auth, keys, analyze/enhance endpoints, rate
  limits, static serving. Exports `createApp()` (used by tests) and only listens
  when run as main (`import.meta.url === pathToFileURL(process.argv[1]).href`).
- `src/lib/auth.ts` — PBKDF2 hashing, HMAC session tokens (`userId:email:expires.signature`,
  base64). **Parses tokens with `lastIndexOf('.')`** because emails contain dots.
  `SESSION_SECRET` is REQUIRED in production (throws at import if missing).
- `src/lib/db.ts` — storage: PostgreSQL/Supabase pool, or local `local_db.json`
  (gitignored). Demo keys only seeded when `SEED_DEMO_KEYS=true`. Token IDs use
  `crypto.randomBytes`.
- `src/lib/analyze.ts` / `enhance.ts` — Gemini calls + mock fallback when
  `GEMINI_API_KEY` is absent. Model from `GEMINI_MODEL` (default gemini-3.5-flash).
  Fallback triggers on catch too — beware silent masking of real API failures.
- `src/lib/rateLimit.ts` — per-IP (10/24h), free key (50/24h), paid key (1000/24h).
- `src/lib/logger.ts` — pino; pretty in dev, JSON in prod, silent in tests.
- `src/App.tsx` — big SPA (mostly marketing), do not refactor without a reason.
- `src/server.test.ts`, `src/lib/*.test.ts` — Vitest + supertest.

## Environment (see .env.example)

`GEMINI_API_KEY`, `SESSION_SECRET` (prod-required), `DATABASE_URL` (empty = local
JSON), `SEED_DEMO_KEYS`, `GEMINI_MODEL`, `CORS_ORIGIN` (default `*`),
`TRUST_PROXY`, `LOG_LEVEL`, `PORT`.

## Conventions & gotchas

- TypeScript; `tsc --noEmit` must stay clean. No comments in code unless asked.
- Do NOT commit `.env`, `local_db.json`, `*.log` (gitignored). Never echo real keys.
- Tests isolate storage by `process.chdir()` to a temp dir BEFORE `vi.resetModules()`
  + dynamic `import()` of the module under test.
- `dotenv` is loaded via `import 'dotenv/config'` as the FIRST import in server.ts;
  keep it first — auth/db read env at module init.
- Changes to opencode config/skills take effect only after restarting opencode.
- Respond to the user in Russian.
