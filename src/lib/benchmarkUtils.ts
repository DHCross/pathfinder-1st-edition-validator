import { MonsterStatisticsByCR } from '../rules/pf1e-data-tables';

type CRInput = string | number | undefined | null;

export function getBenchmarksForCR(cr: CRInput) {
  if (cr === undefined || cr === null) return null;
  const crString = typeof cr === 'number' ? cr.toString() : String(cr).trim();
  return MonsterStatisticsByCR.find((row) => row.cr === crString || row.cr === crString.replace(/^CR\s+/i, '')) ?? null;
}

export function estimateHDFromBenchmarks(cr: CRInput): number | null {
  const row = getBenchmarksForCR(cr);
  if (!row || !row.hp) return null;
  return Math.max(1, Math.round(row.hp / 4.5));
}

export function compareAgainstBenchmark(actual: number | undefined, expected: number | undefined) {
  if (actual === undefined || expected === undefined) return null;
  const delta = actual - expected;
  const percent = expected === 0 ? 0 : (delta / expected) * 100;
  return { actual, expected, delta, percent };
}
