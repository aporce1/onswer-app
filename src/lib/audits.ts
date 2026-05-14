/**
 * Audit detail types + API helpers. Used by /dashboard/audits/[id] and
 * any other view that needs the deep audit payload (answers, recos, citations).
 *
 * Wraps GET /v1/audits/{id} which is publicly accessible for free audits
 * (URL is the access token) and authenticated for paid audits.
 */
import { api } from './api';
import type { APIContext } from 'astro';

export interface AuditLlm {
  slug: string;
  display_name?: string;
  family?: string;
}

export interface AuditGeo {
  code: string;
  name?: string;
}

export interface AuditAnswer {
  id: number;
  query_text: string;
  llm: AuditLlm;
  geo: AuditGeo;
  response_text: string;
  brand_mentioned: boolean;
  mention_position: number | null;
  mention_sentiment: string | null;
  competitors_seen: string | null;
  tokens_used: number;
  cost_usd: number;
  duration_ms: number;
  error: string | null;
}

export interface AuditRecommendation {
  id: number;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low' | string;
  category: string;
  effort: string;
  completed: boolean;
}

export interface AuditCitation {
  domain: string;
  n: number;
}

export interface AuditDetail {
  id: number;
  domain: string;
  kind: string;
  status: string;
  locale: string;
  queries_count: number;
  llms_count: number;
  geos_count: number;
  answers_count: number;
  mentions_count: number;
  visibility_score: number | null;
  tokens_used: number;
  cost_usd: number;
  started_at: string | null;
  completed_at: string | null;
  error: string | null;
  answers: AuditAnswer[];
  top_cited_domains: AuditCitation[];
  recommendations: AuditRecommendation[];
  suggested_competitors: Array<{ name: string; domain?: string }>;
}

export async function getAudit(context: APIContext, id: number) {
  const cookie = context.request.headers.get('cookie') ?? '';
  return api<AuditDetail>(`/v1/audits/${id}`, { cookie });
}
