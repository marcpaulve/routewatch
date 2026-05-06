import { Route } from '../index';

export interface DeprecationRule {
  method?: string;
  pathPattern: string | RegExp;
  reason?: string;
  since?: string;
  replacement?: string;
}

export interface DeprecatedRoute {
  route: Route;
  reason: string;
  since?: string;
  replacement?: string;
}

export interface DeprecationResult {
  deprecated: DeprecatedRoute[];
  active: Route[];
  totalRoutes: number;
  deprecatedCount: number;
}

export function matchesDeprecationRule(route: Route, rule: DeprecationRule): boolean {
  if (rule.method) {
    const ruleMethod = rule.method.toUpperCase();
    const routeMethod = route.method.toUpperCase();
    if (ruleMethod !== '*' && ruleMethod !== routeMethod) return false;
  }

  if (rule.pathPattern instanceof RegExp) {
    return rule.pathPattern.test(route.path);
  }

  if (rule.pathPattern.includes('*')) {
    const escaped = rule.pathPattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
    return new RegExp(`^${escaped}$`).test(route.path);
  }

  return route.path === rule.pathPattern;
}

export function deprecateRoutes(routes: Route[], rules: DeprecationRule[]): DeprecationResult {
  const deprecated: DeprecatedRoute[] = [];
  const active: Route[] = [];

  for (const route of routes) {
    const matchedRule = rules.find(rule => matchesDeprecationRule(route, rule));
    if (matchedRule) {
      deprecated.push({
        route,
        reason: matchedRule.reason ?? 'Marked as deprecated',
        since: matchedRule.since,
        replacement: matchedRule.replacement,
      });
    } else {
      active.push(route);
    }
  }

  return {
    deprecated,
    active,
    totalRoutes: routes.length,
    deprecatedCount: deprecated.length,
  };
}

export function formatDeprecationSummary(result: DeprecationResult): string {
  const lines: string[] = [
    `Deprecation Summary: ${result.deprecatedCount}/${result.totalRoutes} routes deprecated`,
  ];
  for (const d of result.deprecated) {
    const since = d.since ? ` (since ${d.since})` : '';
    const replacement = d.replacement ? ` → use ${d.replacement}` : '';
    lines.push(`  [DEPRECATED] ${d.route.method.toUpperCase()} ${d.route.path}${since}: ${d.reason}${replacement}`);
  }
  return lines.join('\n');
}
