# PUBLIC Outdoors

Phase 2 of the PUBLIC Outdoors website. The project now runs on Next.js with
the App Router, preserves the Phase 1 animated React frontend, and adds a
server-side boundary for the online catalog API.

Production domain: [publicoutdoors.com](https://publicoutdoors.com)

## Stack

- Next.js 16 with App Router and TypeScript.
- React 19, GSAP, and the existing responsive UI.
- Next.js Route Handlers for backend/API integration.
- Netlify hosting through its automatically managed OpenNext adapter.
- Node.js 24.22.1 LTS, pinned for local and Netlify builds.

## Local development

Use the Node version declared in `.nvmrc`, then install and run the app:

```bash
nvm use
npm ci
npm run dev
```

The local site is available at `http://localhost:3000`.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server. |
| `npm run build` | Create the optimized production build. |
| `npm run start` | Serve the production build locally. |
| `npm run lint` | Run ESLint. |
| `npm run typecheck` | Run TypeScript without emitting files. |
| `npm run check` | Run lint, typecheck, and production build. |

## Architecture

```text
app/
├── [[...slug]]/page.tsx  # Existing public routes and route metadata
├── api/
│   ├── catalog/route.ts  # Server-only catalog API gateway
│   └── health/route.ts   # Deployment/readiness endpoint
├── layout.tsx            # Root document and global styles
├── robots.ts             # Environment-aware crawler policy
└── sitemap.ts            # Production sitemap
src/
├── ClientApp.tsx         # Client boundary for the existing animated frontend
├── server/               # Server-only API clients
└── ...                   # Phase 1 components, views, data, and animations
```

The current React Router frontend remains behind a client boundary during the
first Phase 2 setup. This keeps all existing modal navigation and GSAP behavior
stable while Next.js owns server rendering, metadata, backend endpoints, and
deployment. Individual routes can be migrated incrementally to native App
Router pages as the catalog UI is implemented.

## Environment variables

Copy `.env.example` to `.env.local` for local overrides.

| Variable | Visibility | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Public | Canonical production origin. |
| `NEXT_PUBLIC_ALLOW_INDEXING` | Public | Set to `true` only in production. |
| `CATALOG_API_URL` | Server only | HTTPS endpoint used by `/api/catalog`. |
| `CATALOG_API_TOKEN` | Server only | Optional bearer token for the catalog API. |

Never prefix API secrets with `NEXT_PUBLIC_`. Netlify Deploy Previews and branch
deploys explicitly disable indexing in `netlify.toml`.

## Backend endpoints

- `GET /api/health` reports application readiness and whether a catalog URL is
  configured. It never exposes credentials.
- `GET /api/catalog` forwards query parameters to the configured HTTPS catalog
  endpoint from the server. If the endpoint is not configured it returns `503`;
  upstream failures return `502`.

The gateway applies a 10-second timeout, requires JSON responses, disables
caching for now, and keeps `CATALOG_API_TOKEN` off the client. Authentication,
response validation, caching, and catalog-specific query rules can be tightened
once the final API contract is available.

## Netlify

`netlify.toml` runs `npm run lint && npm run build`, publishes `.next`, and pins
Node.js 24.22.1. Netlify detects Next.js and provisions its OpenNext adapter
automatically, including serverless functions for Route Handlers; do not pin a
legacy `@netlify/plugin-nextjs` package.

Configure production values in Netlify under environment variables:

```dotenv
NEXT_PUBLIC_SITE_URL=https://publicoutdoors.com
NEXT_PUBLIC_ALLOW_INDEXING=true
CATALOG_API_URL=https://api.example.com/catalog
CATALOG_API_TOKEN=<secret>
```

After changing an environment variable, trigger a new deploy. Keep preview
tokens scoped separately from production credentials.

## Dependency security

The repository commits `package-lock.json` for reproducible installs. Before a
release, run:

```bash
npm ci
npm audit
npm run check
```

Dependabot is configured to propose weekly npm and GitHub Actions updates.
Review major framework updates in a Deploy Preview before merging them.
