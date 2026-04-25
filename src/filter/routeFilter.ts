import { Route } from '../parser/index';

export interface FilterOptions {
  methods?: string[];
  pathPrefix?: string;
  pathPattern?: RegExp;
  tags?: string[];
}

/**
 * Normalize HTTP method to uppercase for comparison.
 */
export function normalizeMethod(method: string): string {
  return method.toUpperCase();
}

/**
 * Filter routes by HTTP method(s).
 */
export function filterByMethod(routes: Route[], methods: string[]): Route[] {
  const normalized = methods.map(normalizeMethod);
  return routes.filter((r) => normalized.includes(normalizeMethod(r.method)));
}

/**
 * Filter routes whose path starts with the given prefix.
 */
export function filterByPathPrefix(routes: Route[], prefix: string): Route[] {
  return routes.filter((r) => r.path.startsWith(prefix));
}

/**
 * Filter routes whose path matches the given regular expression.
 */
export function filterByPathPattern(routes: Route[], pattern: RegExp): Route[] {
  return routes.filter((r) => pattern.test(r.path));
}

/**
 * Apply all provided filter options to a list of routes.
 * Filters are combined with AND semantics.
 */
export function applyFilters(routes: Route[], options: FilterOptions): Route[] {
  let result = [...routes];

  if (options.methods && options.methods.length > 0) {
    result = filterByMethod(result, options.methods);
  }

  if (options.pathPrefix) {
    result = filterByPathPrefix(result, options.pathPrefix);
  }

  if (options.pathPattern) {
    result = filterByPathPattern(result, options.pathPattern);
  }

  return result;
}
