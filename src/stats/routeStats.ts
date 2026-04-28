import { Route } from '../index';

export interface RouteStats {
  total: number;
  byMethod: Record<string, number>;
  byPrefix: Record<string, number>;
  uniquePaths: number;
  duplicatePaths: string[];
  averagePathDepth: number;
  deepestPath: string;
  mostCommonMethod: string;
}

export function getPathDepth(path: string): number {
  return path.split('/').filter(Boolean).length;
}

export function extractPrefix(path: string): string {
  const parts = path.split('/').filter(Boolean);
  return parts.length > 0 ? `/${parts[0]}` : '/';
}

export function computeRouteStats(routes: Route[]): RouteStats {
  if (routes.length === 0) {
    return {
      total: 0,
      byMethod: {},
      byPrefix: {},
      uniquePaths: 0,
      duplicatePaths: [],
      averagePathDepth: 0,
      deepestPath: '',
      mostCommonMethod: '',
    };
  }

  const byMethod: Record<string, number> = {};
  const byPrefix: Record<string, number> = {};
  const pathCounts: Record<string, number> = {};
  let totalDepth = 0;
  let deepestPath = '';
  let maxDepth = -1;

  for (const route of routes) {
    const method = route.method.toUpperCase();
    byMethod[method] = (byMethod[method] ?? 0) + 1;

    const prefix = extractPrefix(route.path);
    byPrefix[prefix] = (byPrefix[prefix] ?? 0) + 1;

    pathCounts[route.path] = (pathCounts[route.path] ?? 0) + 1;

    const depth = getPathDepth(route.path);
    totalDepth += depth;
    if (depth > maxDepth) {
      maxDepth = depth;
      deepestPath = route.path;
    }
  }

  const duplicatePaths = Object.entries(pathCounts)
    .filter(([, count]) => count > 1)
    .map(([path]) => path);

  const uniquePaths = Object.keys(pathCounts).length;

  const mostCommonMethod = Object.entries(byMethod).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';

  return {
    total: routes.length,
    byMethod,
    byPrefix,
    uniquePaths,
    duplicatePaths,
    averagePathDepth: totalDepth / routes.length,
    deepestPath,
    mostCommonMethod,
  };
}
