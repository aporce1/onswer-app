/**
 * Brand types + thin API wrapper for the dashboard. Matches the JSON shape
 * served by /v1/brands/* in onswer-api.
 */
import { api } from './api';
import type { APIContext } from 'astro';

export type ScanFrequency = 'paused' | 'weekly' | 'three_per_week' | 'daily' | 'twice_daily';

export interface PlanLimits {
  max_brands: number;
  max_frequency: ScanFrequency;
  queries_per_audit: number;
  max_llms: number;
  max_geos: number;
  reco_max: number;
  reco_quality: boolean;
}

export interface BrandListItem {
  id: number;
  name: string;
  domain: string;
  status: string;
  scan_frequency: ScanFrequency;
  next_scan_at: string | null;
  last_scan_at: string | null;
  created_at: string;
  latest_audit: {
    id: number;
    visibility_score: number | null;
    completed_at: string | null;
    status: string;
  } | null;
}

export interface BrandDetail {
  id: number;
  user_id: number;
  name: string;
  domain: string;
  description: string | null;
  industry: string | null;
  status: string;
  scan_frequency: ScanFrequency;
  next_scan_at: string | null;
  last_scan_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditTimelineEntry {
  id: number;
  kind: string;
  status: string;
  visibility_score: number | null;
  mentions_count: number;
  answers_count: number;
  tokens_used: number;
  cost_usd: number;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

/** Used by SSR to forward the auth cookie when calling the API. */
function ctxCookie(context: APIContext): string {
  return context.request.headers.get('cookie') ?? '';
}

export async function listBrands(context: APIContext) {
  return api<{ brands: BrandListItem[]; limits: PlanLimits }>('/v1/brands', {
    cookie: ctxCookie(context),
  });
}

export async function getBrand(context: APIContext, id: number) {
  return api<{ brand: BrandDetail; audits: AuditTimelineEntry[]; limits: PlanLimits }>(
    `/v1/brands/${id}`,
    { cookie: ctxCookie(context) }
  );
}

export async function createBrand(
  context: APIContext,
  payload: { domain: string; name?: string; scan_frequency?: ScanFrequency }
) {
  return api<{
    brand: BrandDetail;
    first_audit: { id: number; status: string } | null;
  }>('/v1/brands', {
    method: 'POST',
    cookie: ctxCookie(context),
    body: payload,
  });
}

export async function updateBrandSchedule(
  context: APIContext,
  id: number,
  scan_frequency: ScanFrequency
) {
  return api<{ brand: BrandDetail; clamped: boolean; limits: PlanLimits }>(
    `/v1/brands/${id}/schedule`,
    { method: 'PUT', cookie: ctxCookie(context), body: { scan_frequency } }
  );
}

export async function deleteBrand(context: APIContext, id: number) {
  return api<{ deleted: boolean }>(`/v1/brands/${id}`, {
    method: 'DELETE',
    cookie: ctxCookie(context),
  });
}

export const frequencyLabels: Record<ScanFrequency, string> = {
  paused:         'Paused',
  weekly:         'Weekly',
  three_per_week: '3× per week',
  daily:          'Daily',
  twice_daily:    'Twice daily',
};
