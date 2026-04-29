import { Route } from '../index';
import {
  groupRoutesByPrefix,
  groupRoutesByMethod,
  GroupedRoutes,
} from './routeGrouper';

export { groupRoutesByPrefix, groupRoutesByMethod };
export type { RouteGroup, GroupedRoutes } from './routeGrouper';

/**
 * Groups routes by prefix and returns the structured result.
 */
export function groupByPrefix(
  routes: Route[],
  minGroupSize = 2
): GroupedRoutes {
  return groupRoutesByPrefix(routes, minGroupSize);
}

/**
 * Groups routes by HTTP method and returns a record.
 */
export function groupByMethod(
  routes: Route[]
): Record<string, Route[]> {
  return groupRoutesByMethod(routes);
}

/**
 * Prints a human-readable summary of grouped routes to stdout.
 */
export function printGroupSummary(grouped: GroupedRoutes): void {
  console.log(`\nRoute Groups (${grouped.totalGroups} groups, ${grouped.totalRoutes} total routes)`);
  console.log('='.repeat(50));

  for (const group of grouped.groups) {
    console.log(`\n  ${group.prefix}  (${group.count} routes)`);
    for (const route of group.routes) {
      console.log(`    ${route.method.padEnd(7)} ${route.path}`);
    }
  }

  if (grouped.ungrouped.length > 0) {
    console.log(`\n  (ungrouped)  (${grouped.ungrouped.length} routes)`);
    for (const route of grouped.ungrouped) {
      console.log(`    ${route.method.padEnd(7)} ${route.path}`);
    }
  }

  console.log();
}
