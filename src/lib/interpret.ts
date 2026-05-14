/**
 * Interpretation engine — rules-based.
 *
 * The whole reason this file exists: don't show a number without telling
 * the user what it means and what to do next. Radar's mistake was data
 * without narrative. Onswer's promise is the opposite.
 *
 * Each helper returns ONE short, declarative sentence + an optional
 * action label. The dashboard prints them as the line directly under
 * the KPI — no tooltips, no toggles. Permanent visible interpretation.
 */

export interface ScoreInterpretation {
  /** One sentence, present tense, never starts with "The" or "Your". */
  headline: string;
  /** Status color hint for the UI: 'good'|'okay'|'bad'|'neutral'. */
  tone: 'good' | 'okay' | 'bad' | 'neutral';
  /** Optional action label, e.g. "See recommendations". Caller wires the link. */
  cta?: string;
}

/**
 * Visibility score (0–100). Anchored to the AEO category norms we've
 * seen in our own corpus: <40 = struggling, 40–69 = average, 70+ = strong.
 */
export function interpretScore(score: number | null): ScoreInterpretation {
  if (score === null) {
    return {
      headline: 'No score yet — your first scan will produce one in a few minutes.',
      tone: 'neutral',
    };
  }
  if (score >= 80) {
    return {
      headline: 'Strong AI visibility — LLMs mention you in most relevant queries.',
      tone: 'good',
      cta: 'Defend your position',
    };
  }
  if (score >= 60) {
    return {
      headline: 'Solid visibility, with room to climb. LLMs mention you in over half of category queries.',
      tone: 'good',
      cta: 'See recommendations',
    };
  }
  if (score >= 40) {
    return {
      headline: 'Average visibility for your category. Targeted content + citations can move this fast.',
      tone: 'okay',
      cta: 'See recommendations',
    };
  }
  if (score >= 20) {
    return {
      headline: "LLMs rarely mention you. The recommendations below are where to start.",
      tone: 'bad',
      cta: 'See recommendations',
    };
  }
  return {
    headline: 'Nearly invisible to LLMs in your category. This is fixable — start with the top 3 recommendations.',
    tone: 'bad',
    cta: 'See recommendations',
  };
}

/**
 * Score delta interpretation: comparing current to N-days-ago. Returns
 * null when we don't have enough audits to compare (need ≥ 2).
 */
export function interpretScoreDelta(current: number | null, previous: number | null): ScoreInterpretation | null {
  if (current === null || previous === null) return null;
  const delta = current - previous;
  const absDelta = Math.abs(delta);

  if (absDelta < 2) {
    return {
      headline: 'Visibility steady week-over-week.',
      tone: 'neutral',
    };
  }
  if (delta >= 10) {
    return {
      headline: `Up ${delta.toFixed(1)} points — something is working. Double down on whatever changed this week.`,
      tone: 'good',
    };
  }
  if (delta > 0) {
    return {
      headline: `Up ${delta.toFixed(1)} points — slow but real progress.`,
      tone: 'good',
    };
  }
  if (delta <= -10) {
    return {
      headline: `Down ${absDelta.toFixed(1)} points — likely a competitor surge or content gap. Investigate the failed queries.`,
      tone: 'bad',
    };
  }
  return {
    headline: `Down ${absDelta.toFixed(1)} points. Worth watching but not yet alarming.`,
    tone: 'okay',
  };
}

/**
 * Cadence interpretation — tells the user what they're getting and what
 * upgrading would unlock.
 */
export function interpretCadence(scanFrequency: string, plan: string): string {
  if (scanFrequency === 'paused') {
    if (plan === 'free') {
      return 'No automatic scans — your free plan only includes one-off audits. Upgrade to monitor changes daily.';
    }
    return 'Auto-scans are paused. Re-enable to track how your visibility shifts.';
  }
  const human: Record<string, string> = {
    weekly:         'You\'ll get a fresh report every 7 days.',
    three_per_week: 'You\'ll get a fresh report every ~2 days.',
    daily:          'You\'ll get a fresh report every 24 hours.',
    twice_daily:    'You\'ll get a fresh report every 12 hours.',
  };
  return human[scanFrequency] ?? 'Active monitoring.';
}

/**
 * Plan-level interpretation for the dashboard sidebar / empty states.
 */
export function interpretPlan(plan: string): { headline: string; cta?: string } {
  switch (plan) {
    case 'pro':
      return { headline: 'Pro plan · daily monitoring across 8 LLMs and 13 geographies.' };
    case 'solo':
      return { headline: 'Solo plan · weekly monitoring across 4 LLMs.', cta: 'Upgrade to Pro' };
    case 'agency':
      return { headline: 'Agency plan · 5 brands · daily monitoring.' };
    default:
      return {
        headline: 'Free plan — one-off audits only, no continuous monitoring.',
        cta: 'See paid plans',
      };
  }
}
