import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

/**
 * Onswer Dashboard — app.onswer.app
 *
 * Server-side rendered (Vercel adapter) because every route is auth-gated.
 * Static pre-rendering would force us to ship auth checks to the client,
 * which means flashes of unauthenticated state and a worse experience.
 *
 * i18n mirrors the landing (EN + PT). Default locale is NOT prefixed here
 * (different from the landing) because the dashboard URL is the product
 * surface — `app.onswer.app/dashboard` reads better than `/en/dashboard`.
 */
const SITE = process.env.PUBLIC_SITE_URL || 'https://app.onswer.app';

export default defineConfig({
  site: SITE,
  output: 'server',
  adapter: vercel({
    webAnalytics: { enabled: false },
    maxDuration: 30,
  }),
  trailingSlash: 'never',
  prefetch: { defaultStrategy: 'viewport' },

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'pt'],
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
    },
  },

  // Dev server: bind to app.onswer.local so cookies with Domain=.onswer.local
  // travel between this app and the PHP API at api.onswer.local. Without
  // this, browsers treat localhost:4322 and api.onswer.local as unrelated
  // origins and refuse to share the session cookie.
  server: {
    host: 'app.onswer.local',
    port: 4322,
  },

  vite: {
    plugins: [tailwindcss()],
    server: {
      // Tailwind 4 + Vite default to localhost. Explicitly bind so HMR
      // and dev fetches work over the *.onswer.local hostname.
      host: 'app.onswer.local',
      port: 4322,
      strictPort: true,
    },
  },
});
