import { Route } from '../parser';
import { DiffResult } from '../diff/routeDiffer';
import { diffRoutes } from '../diff/routeDiffer';
import { filterRoutes } from '../filter';
import { FilterOptions } from '../filter/routeFilter';

export interface CompareOptions {
  filter?: FilterOptions;
  ignoreQueryParams?: boolean;
  normalizePaths?: boolean;
}

export interface CompareResult {
  diff: DiffResult;
  baseCount: number;
  headCount: number;
  addedCount: number;
  removedCount: number;
  changedCount: number;
  unchangedCount: number;
}

export function normalizePath(path: string): string {
  return path.replace(/\/{2,}/g, '/').replace(/\/$/, '') || '/';
}

export function normalizeRoute(route: Route, options: CompareOptions): Route {
  const normalized = { ...route };
  if (options.normalizePaths) {
    normalized.path = normalizePath(route.path);
  }
  if (options.ignoreQueryParams) {
    normalized.path = normalized.path.split('?')[0];
  }
  return normalized;
}

export function compareRoutes(
  baseRoutes: Route[],
  headRoutes: Route[],
  options: CompareOptions = {}
): CompareResult {
  const filteredBase = options.filter
    ? filterRoutes(baseRoutes, options.filter)
    : baseRoutes;
  const filteredHead = options.filter
    ? filterRoutes(headRoutes, options.filter)
    : headRoutes;

  const normalizedBase = filteredBase.map((r) => normalizeRoute(r, options));
  const normalizedHead = filteredHead.map((r) => normalizeRoute(r, options));

  const diff = diffRoutes(normalizedBase, normalizedHead);

  return {
    diff,
    baseCount: normalizedBase.length,
    headCount: normalizedHead.length,
    addedCount: diff.added.length,
    removedCount: diff.removed.length,
    changedCount: diff.changed.length,
    unchangedCount: diff.unchanged.length,
  };
}
