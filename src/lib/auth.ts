/**
 * Auth helpers for Astro SSR routes.
 *
 * The API issues a JWT as `onswer_session` cookie with Domain=.onswer.app
 * after a successful magic-link verify. Every SSR-rendered dashboard page
 * calls `requireSession()` first; if there's no session the user is
 * redirected to /login.
 */
import type { APIContext } from 'astro';
import { api } from './api';

export interface SessionUser {
  id: number;
  email: string;
  name: string;
  locale: string;
  plan: 'free' | 'solo' | 'pro' | 'agency';
  plan_expires_at: string | null;
  is_pro: boolean;
}

/**
 * Resolve the current session by calling /v1/me with the forwarded cookie.
 * Returns null if no valid session. We do NOT decode the JWT here — that's
 * the API's job. The dashboard is a dumb client.
 */
export async function getSession(context: APIContext): Promise<SessionUser | null> {
  const cookie = context.request.headers.get('cookie') ?? '';
  if (!cookie.includes('onswer_session=')) return null;

  const res = await api<SessionUser>('/v1/me', { cookie });
  return res.ok ? res.data : null;
}

/**
 * Page-level guard. Returns the user if logged in, otherwise issues a 302
 * redirect to /login.
 *
 * Usage:
 *   const user = await requireSession(Astro);
 *   if (user instanceof Response) return user;  // narrow type, return redirect
 */
export async function requireSession(
  context: APIContext
): Promise<SessionUser | Response> {
  const user = await getSession(context);
  if (!user) {
    return context.redirect('/login', 302);
  }
  return user;
}
