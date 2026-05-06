import { Route } from '../index';
import {
  normalizeRoutes,
  deduplicateRoutes,
  NormalizeOptions,
} from './routeNormalizer';

export { NormalizeOptions, normalizePath, normalizeMethod, normalizeRoute } from './routeNormalizer';

export function normalizeRouteList(
  routes: Route[],
  options: NormalizeOptions = {}
): Route[] {
  return normalizeRoutes(routes, options);
}

export function normalizeAndDeduplicate(
  routes: Route[],
  options: NormalizeOptions = {}
): { routes: Route[]; removed: number } {
  const normalized = normalizeRoutes(routes, options);
  return deduplicateRoutes(normalized);
}

export function printNormalizeSummary(
  original: Route[],
  result: { routes: Route[]; removed: number }
): void {
  console.log(`Normalization complete:`);
  console.log(`  Input routes  : ${original.length}`);
  console.log(`  Output routes : ${result.routes.length}`);
  if (result.removed > 0) {
    console.log(`  Duplicates removed: ${result.removed}`);
  }
}
