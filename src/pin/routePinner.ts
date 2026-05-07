import { Route } from '../index';

export interface PinnedRoute extends Route {
  pinnedAt: string;
  label?: string;
}

export interface PinResult {
  pinned: PinnedRoute[];
  skipped: Route[];
}

export interface PinMatchRule {
  method?: string;
  pathPrefix?: string;
  pathPattern?: RegExp;
  label?: string;
}

export function matchesPinRule(route: Route, rule: PinMatchRule): boolean {
  if (rule.method && route.method.toUpperCase() !== rule.method.toUpperCase()) {
    return false;
  }
  if (rule.pathPrefix && !route.path.startsWith(rule.pathPrefix)) {
    return false;
  }
  if (rule.pathPattern && !rule.pathPattern.test(route.path)) {
    return false;
  }
  return true;
}

export function pinRoutes(routes: Route[], rules: PinMatchRule[]): PinResult {
  const pinnedAt = new Date().toISOString();
  const pinned: PinnedRoute[] = [];
  const skipped: Route[] = [];

  for (const route of routes) {
    const matchingRule = rules.find((rule) => matchesPinRule(route, rule));
    if (matchingRule) {
      pinned.push({ ...route, pinnedAt, label: matchingRule.label });
    } else {
      skipped.push(route);
    }
  }

  return { pinned, skipped };
}

export function getPinnedRoutes(routes: PinnedRoute[], label?: string): PinnedRoute[] {
  if (!label) return routes;
  return routes.filter((r) => r.label === label);
}

export function formatPinSummary(result: PinResult): string {
  const lines: string[] = [
    `Pinned routes: ${result.pinned.length}`,
    `Skipped routes: ${result.skipped.length}`,
  ];

  if (result.pinned.length > 0) {
    lines.push('');
    lines.push('Pinned:');
    for (const r of result.pinned) {
      const labelStr = r.label ? ` [${r.label}]` : '';
      lines.push(`  ${r.method.toUpperCase().padEnd(7)} ${r.path}${labelStr}`);
    }
  }

  return lines.join('\n');
}
