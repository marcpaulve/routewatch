import { Route } from '../parser/index';

export type ChangeType = 'added' | 'removed' | 'modified';

export interface RouteDiff {
  changeType: ChangeType;
  route: Route;
  previous?: Route;
}

export interface DiffResult {
  added: RouteDiff[];
  removed: RouteDiff[];
  modified: RouteDiff[];
  unchanged: Route[];
}

function routeKey(route: Route): string {
  return `${route.method.toUpperCase()}:${route.path}`;
}

export function diffRoutes(baseline: Route[], current: Route[]): DiffResult {
  const result: DiffResult = {
    added: [],
    removed: [],
    modified: [],
    unchanged: [],
  };

  const baselineMap = new Map<string, Route>();
  for (const route of baseline) {
    baselineMap.set(routeKey(route), route);
  }

  const currentMap = new Map<string, Route>();
  for (const route of current) {
    currentMap.set(routeKey(route), route);
  }

  for (const [key, currentRoute] of currentMap) {
    if (!baselineMap.has(key)) {
      result.added.push({ changeType: 'added', route: currentRoute });
    } else {
      const baseRoute = baselineMap.get(key)!;
      if (JSON.stringify(baseRoute) !== JSON.stringify(currentRoute)) {
        result.modified.push({
          changeType: 'modified',
          route: currentRoute,
          previous: baseRoute,
        });
      } else {
        result.unchanged.push(currentRoute);
      }
    }
  }

  for (const [key, baseRoute] of baselineMap) {
    if (!currentMap.has(key)) {
      result.removed.push({ changeType: 'removed', route: baseRoute });
    }
  }

  return result;
}

export function hasDifferences(diff: DiffResult): boolean {
  return diff.added.length > 0 || diff.removed.length > 0 || diff.modified.length > 0;
}
