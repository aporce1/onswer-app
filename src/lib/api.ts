/**
 * Thin fetch wrapper for the Onswer API (api.onswer.app).
 *
 * Server-side (Astro endpoints, getStaticProps-style): pass the Astro
 *   `cookies` so we can forward the auth cookie to the API.
 * Client-side: just call — the cookie travels automatically because
 *   the API is at the same parent domain (.onswer.app) and we set
 *   `credentials: 'include'`.
 */

const API_URL = import.meta.env.PUBLIC_API_URL || 'http://api.onswer.local';

export type ApiResponse<T> = {
  ok: true;
  data: T;
} | {
  ok: false;
  error: string;
  code?: string;
};

export interface FetchOpts {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  /** Forward this cookie header when calling from SSR. */
  cookie?: string;
  /** Override the base URL (rare). */
  baseUrl?: string;
}

export async function api<T = unknown>(
  path: string,
  opts: FetchOpts = {}
): Promise<ApiResponse<T>> {
  const url = (opts.baseUrl ?? API_URL) + path;

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (opts.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (opts.cookie) {
    headers['Cookie'] = opts.cookie;
  }

  try {
    const res = await fetch(url, {
      method: opts.method ?? 'GET',
      credentials: 'include',
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });

    // The API uses the {ok, data} / {ok:false, error} envelope on /v1/*.
    const json = await res.json().catch(() => null);
    if (json && typeof json === 'object' && 'ok' in json) {
      return json as ApiResponse<T>;
    }

    // Fallback: treat raw 2xx as success with raw body.
    if (res.ok) {
      return { ok: true, data: json as T };
    }
    return { ok: false, error: `HTTP ${res.status}`, code: 'http_error' };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'Network error',
      code: 'network_error',
    };
  }
}
