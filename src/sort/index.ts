import { Route } from '../index';
import {
  sortByMethod,
  sortByPath,
  sortByDepth,
  sortRoutes,
  SortField,
  SortOrder,
} from './routeSorter';

export type { SortField, SortOrder };

export interface SortOptions {
  field?: SortField;
  order?: SortOrder;
}

/**
 * Sort routes by the given field and order.
 */
export function sortRouteList(
  routes: Route[],
  options: SortOptions = {}
): Route[] {
  const { field = 'path', order = 'asc' } = options;
  return sortRoutes(routes, field, order);
}

/**
 * Print a sorted list of routes to stdout.
 */
export function printSorted(routes: Route[], options: SortOptions = {}): void {
  const sorted = sortRouteList(routes, options);
  const { field = 'path', order = 'asc' } = options;
  console.log(`Routes sorted by ${field} (${order}):`);
  sorted.forEach((r) => {
    const middleware =
      r.middleware && r.middleware.length > 0
        ? ` [${r.middleware.join(', ')}]`
        : '';
    console.log(`  ${r.method.padEnd(7)} ${r.path}${middleware}`);
  });
}

export { sortByMethod, sortByPath, sortByDepth, sortRoutes };
