# Onswer Dashboard

Authenticated workspace for [onswer.app](https://onswer.app) users — runs at
[app.onswer.app](https://app.onswer.app).

Astro 5 SSR + Tailwind 4 + ApexCharts + Resend magic links.

## Local dev

```bash
npm install
cp .env.example .env
# Set PUBLIC_API_URL to your local API (default: http://api.onswer.local)
npm run dev
# → http://localhost:4322
```

## Stack

| Layer       | Pick                          | Why                                                |
|-------------|-------------------------------|----------------------------------------------------|
| Framework   | Astro 5 (SSR)                 | Auth-gated routes need server rendering             |
| Adapter     | @astrojs/vercel               | Same hosting story as the landing                  |
| Styling     | Tailwind 4 + custom CSS vars   | Shared brand tokens with the landing               |
| Charts      | ApexCharts                    | Best balance of polish + bundle size               |
| Icons       | Inline SVG (no library)        | Sidebar icons are 5 paths total                    |
| Auth        | Magic link via API + JWT cookie | No password; cookie Domain=.onswer.app shared with API |

## Routes

```
/               → redirect to /dashboard or /login based on cookie
/login          → magic link entry (form + "check your inbox" state)
/auth/verify    → token → cookie → /dashboard
/dashboard      → overview (empty state for new users)
/dashboard/brands/*        (sprint 2)
/dashboard/audits/*        (sprint 3)
/dashboard/settings        (sprint 4)
```

## Design tokens

Light theme premium — see `src/styles/global.css`. Calm neutral grays
(`#FAFAFA` bg, `#18181B` ink) with one indigo accent (`#6366F1`) shared
with the landing. Status colors deliberately desaturated for dashboard calm.

## Deploy

Push to `main` → Vercel auto-deploys to `app.onswer.app`. Required env vars
in Vercel dashboard:

```
PUBLIC_API_URL=https://api.onswer.app
PUBLIC_SITE_URL=https://app.onswer.app
```
