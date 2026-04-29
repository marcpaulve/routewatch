import { Route } from '../index';

export interface RouteGroup {
  prefix: string;
  routes: Route[];
  count: number;
}

export interface GroupedRoutes {
  groups: RouteGroup[];
  ungrouped: Route[];
  totalGroups: number;
  totalRoutes: number;
}

/**
 * Extracts the top-level prefix segment from a path.
 * e.g. '/api/users/123' => '/api'
 */
export function extractTopLevelPrefix(path: string): string {
  const parts = path.split('/').filter(Boolean);
  return parts.length > 0 ? `/${parts[0]}` : '/';
}

/**
 * Groups routes by a shared path prefix.
 * Routes with only one segment or at root are placed in ungrouped.
 */
export function groupRoutesByPrefix(
  routes: Route[],
  minGroupSize = 2
): GroupedRoutes {
  const prefixMap = new Map<string, Route[]>();

  for (const route of routes) {
    const prefix = extractTopLevelPrefix(route.path);
    if (!prefixMap.has(prefix)) {
      prefixMap.set(prefix, []);
    }
    prefixMap.get(prefix)!.push(route);
  }

  const groups: RouteGroup[] = [];
  const ungrouped: Route[] = [];

  for (const [prefix, groupRoutes] of prefixMap.entries()) {
    if (groupRoutes.length >= minGroupSize) {
      groups.push({
        prefix,
        routes: groupRoutes,
        count: groupRoutes.length,
      });
    } else {
      ungrouped.push(...groupRoutes);
    }
  }

  groups.sort((a, b) => b.count - a.count);

  return {
    groups,
    ungrouped,
    totalGroups: groups.length,
    totalRoutes: routes.length,
  };
}

/**
 * Groups routes by HTTP method.
 */
export function groupRoutesByMethod(
  routes: Route[]
): Record<string, Route[]> {
  const methodMap: Record<string, Route[]> = {};

  for (const route of routes) {
    const method = route.method.toUpperCase();
    if (!methodMap[method]) {
      methodMap[method] = [];
    }
    methodMap[method].push(route);
  }

  return methodMap;
}
