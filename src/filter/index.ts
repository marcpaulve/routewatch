export {
  FilterOptions,
  normalizeMethod,
  filterByMethod,
  filterByPathPrefix,
  filterByPathPattern,
  applyFilters,
} from './routeFilter';
import { Route } from '../parser/index';
import { applyFilters, FilterOptions } from './routeFilter';

/**
 * High-level helper that parses filter flags from CLI string inputs
 * and applies them to the provided route list.
 *
 * @param routes   - Full list of routes to filter.
 * @param methods  - Comma-separated method string, e.g. "GET,POST".
 * @param prefix   - Path prefix string, e.g. "/api".
 * @param pattern  - Regex pattern string, e.g. "^/api/users".
 * @returns Filtered routes.
 */
export function filterRoutes(
  routes: Route[],
  methods?: string,
  prefix?: string,
  pattern?: string
): Route[] {
  const options: FilterOptions = {};

  if (methods) {
    options.methods = methods.split(',').map((m) => m.trim()).filter(Boolean);
  }

  if (prefix) {
    options.pathPrefix = prefix;
  }

  if (pattern) {
    try {
      options.pathPattern = new RegExp(pattern);
    } catch {
      console.warn(`[routewatch] Invalid path pattern "${pattern}", ignoring.`);
    }
  }

  return applyFilters(routes, options);
}
