import { Route } from '../index';

export type TransformFn = (route: Route) => Route | null;

export interface TransformRule {
  name: string;
  description?: string;
  transform: TransformFn;
}

export interface TransformResult {
  original: Route;
  transformed: Route | null;
  ruleName: string;
  changed: boolean;
}

export interface TransformSummary {
  total: number;
  changed: number;
  removed: number;
  unchanged: number;
  results: TransformResult[];
}

export function applyTransformRule(
  route: Route,
  rule: TransformRule
): TransformResult {
  const transformed = rule.transform(route);
  const changed =
    transformed !== null &&
    (transformed.method !== route.method || transformed.path !== route.path);
  return {
    original: route,
    transformed,
    ruleName: rule.name,
    changed: transformed === null ? true : changed,
  };
}

export function transformRoutes(
  routes: Route[],
  rules: TransformRule[]
): TransformSummary {
  const results: TransformResult[] = [];
  const transformed: Route[] = [];

  for (const route of routes) {
    let current: Route | null = { ...route };
    let lastRuleName = '';
    let anyChanged = false;

    for (const rule of rules) {
      if (current === null) break;
      const result = applyTransformRule(current, rule);
      lastRuleName = rule.name;
      if (result.transformed === null) {
        results.push({ ...result, original: route });
        anyChanged = true;
        current = null;
        break;
      }
      if (result.changed) anyChanged = true;
      current = result.transformed;
    }

    if (current !== null) {
      results.push({
        original: route,
        transformed: current,
        ruleName: lastRuleName || 'none',
        changed: anyChanged,
      });
      transformed.push(current);
    }
  }

  const changed = results.filter((r) => r.changed && r.transformed !== null).length;
  const removed = results.filter((r) => r.transformed === null).length;

  return {
    total: routes.length,
    changed,
    removed,
    unchanged: routes.length - changed - removed,
    results,
  };
}

export function getTransformedRoutes(summary: TransformSummary): Route[] {
  return summary.results
    .filter((r) => r.transformed !== null)
    .map((r) => r.transformed as Route);
}
