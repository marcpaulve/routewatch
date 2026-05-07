import { Route } from '../index';

export interface PriorityRule {
  match: { method?: string; pathPrefix?: string; pathPattern?: string };
  priority: number;
  label?: string;
}

export interface PrioritizedRoute extends Route {
  priority: number;
  priorityLabel?: string;
}

export function matchesPriorityRule(route: Route, rule: PriorityRule): boolean {
  const { match } = rule;
  if (match.method && route.method.toUpperCase() !== match.method.toUpperCase()) {
    return false;
  }
  if (match.pathPrefix && !route.path.startsWith(match.pathPrefix)) {
    return false;
  }
  if (match.pathPattern) {
    const regex = new RegExp(match.pathPattern);
    if (!regex.test(route.path)) {
      return false;
    }
  }
  return true;
}

export function prioritizeRoutes(
  routes: Route[],
  rules: PriorityRule[]
): PrioritizedRoute[] {
  return routes.map((route) => {
    let priority = 0;
    let priorityLabel: string | undefined;

    for (const rule of rules) {
      if (matchesPriorityRule(route, rule)) {
        if (rule.priority > priority) {
          priority = rule.priority;
          priorityLabel = rule.label;
        }
      }
    }

    return { ...route, priority, priorityLabel };
  });
}

export function sortByPriority(routes: PrioritizedRoute[]): PrioritizedRoute[] {
  return [...routes].sort((a, b) => b.priority - a.priority);
}

export function formatPrioritySummary(routes: PrioritizedRoute[]): string {
  const lines: string[] = ['Route Priority Summary:', ''];
  const sorted = sortByPriority(routes);
  for (const route of sorted) {
    const label = route.priorityLabel ? ` [${route.priorityLabel}]` : '';
    lines.push(`  [${route.priority}]${label} ${route.method.toUpperCase()} ${route.path}`);
  }
  return lines.join('\n');
}
