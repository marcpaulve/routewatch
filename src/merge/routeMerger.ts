import { Route } from '../index';

export interface MergeOptions {
  strategy: 'left' | 'right' | 'union' | 'intersection';
  deduplicateByKey?: boolean;
}

export interface MergeResult {
  routes: Route[];
  leftOnly: Route[];
  rightOnly: Route[];
  merged: Route[];
}

export function routeKey(route: Route): string {
  return `${route.method.toUpperCase()}:${route.path}`;
}

export function mergeRoutes(
  left: Route[],
  right: Route[],
  options: MergeOptions = { strategy: 'union' }
): MergeResult {
  const leftMap = new Map<string, Route>(left.map(r => [routeKey(r), r]));
  const rightMap = new Map<string, Route>(right.map(r => [routeKey(r), r]));

  const leftOnly: Route[] = left.filter(r => !rightMap.has(routeKey(r)));
  const rightOnly: Route[] = right.filter(r => !leftMap.has(routeKey(r)));
  const merged: Route[] = left.filter(r => rightMap.has(routeKey(r)));

  let routes: Route[];

  switch (options.strategy) {
    case 'left':
      routes = [...left];
      break;
    case 'right':
      routes = [...right];
      break;
    case 'intersection':
      routes = [...merged];
      break;
    case 'union':
    default:
      routes = [...left, ...rightOnly];
      break;
  }

  if (options.deduplicateByKey) {
    const seen = new Set<string>();
    routes = routes.filter(r => {
      const key = routeKey(r);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  return { routes, leftOnly, rightOnly, merged };
}

export function summarizeMerge(result: MergeResult): string {
  const lines = [
    `Merge summary:`,
    `  Total routes: ${result.routes.length}`,
    `  Left only:    ${result.leftOnly.length}`,
    `  Right only:   ${result.rightOnly.length}`,
    `  In both:      ${result.merged.length}`,
  ];
  return lines.join('\n');
}
