import { Route } from '../index';

export interface PinRule {
  method?: string;
  pathPattern?: string | RegExp;
  label?: string;
}

export interface PinnedRoute {
  route: Route;
  label?: string;
  pinnedAt: string;
}

export function matchesPinRule(route: Route, rule: PinRule): boolean {
  if (rule.method && route.method.toUpperCase() !== rule.method.toUpperCase()) {
    return false;
  }
  if (rule.pathPattern) {
    if (rule.pathPattern instanceof RegExp) {
      return rule.pathPattern.test(route.path);
    }
    return route.path.includes(rule.pathPattern);
  }
  return true;
}

export function pinRoutes(routes: Route[], rules: PinRule[]): PinnedRoute[] {
  const pinned: PinnedRoute[] = [];
  const seen = new Set<string>();

  for (const route of routes) {
    for (const rule of rules) {
      if (matchesPinRule(route, rule)) {
        const key = `${route.method}:${route.path}`;
        if (!seen.has(key)) {
          seen.add(key);
          pinned.push({
            route,
            label: rule.label,
            pinnedAt: new Date().toISOString(),
          });
        }
        break;
      }
    }
  }

  return pinned;
}

export function getPinnedRoutes(pinned: PinnedRoute[]): Route[] {
  return pinned.map((p) => p.route);
}

export function formatPinSummary(pinned: PinnedRoute[]): string {
  if (pinned.length === 0) return 'No routes pinned.';
  const lines = [`Pinned routes (${pinned.length}):`, ''];
  for (const p of pinned) {
    const label = p.label ? ` [${p.label}]` : '';
    lines.push(`  ${p.route.method.toUpperCase()} ${p.route.path}${label}`);
  }
  return lines.join('\n');
}
