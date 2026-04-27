/**
 * routeValidator.ts
 *
 * Validates route definitions for correctness and consistency.
 * Checks for duplicate routes, invalid HTTP methods, malformed paths,
 * and other common issues that could indicate configuration problems.
 */

import { Route } from '../parser';

export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationIssue {
  severity: ValidationSeverity;
  code: string;
  message: string;
  route?: Route;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  errorCount: number;
  warningCount: number;
}

const VALID_HTTP_METHODS = new Set([
  'GET', 'POST', 'PUT', 'PATCH', 'DELETE',
  'HEAD', 'OPTIONS', 'CONNECT', 'TRACE',
]);

/**
 * Checks whether an HTTP method string is a recognized standard method.
 */
export function isValidMethod(method: string): boolean {
  return VALID_HTTP_METHODS.has(method.toUpperCase());
}

/**
 * Checks whether a route path is well-formed.
 * Paths must start with '/' and must not contain consecutive slashes.
 */
export function isValidPath(path: string): boolean {
  if (!path.startsWith('/')) return false;
  if (/\/\//.test(path)) return false;
  // Ensure param segments like :id are non-empty
  if (/:\s*(?=\/|$)/.test(path)) return false;
  return true;
}

/**
 * Detects duplicate routes (same method + path combination).
 */
export function findDuplicates(routes: Route[]): Route[][] {
  const seen = new Map<string, Route[]>();

  for (const route of routes) {
    const key = `${route.method.toUpperCase()}:${route.path}`;
    if (!seen.has(key)) {
      seen.set(key, []);
    }
    seen.get(key)!.push(route);
  }

  return Array.from(seen.values()).filter((group) => group.length > 1);
}

/**
 * Validates a list of routes and returns a structured result
 * containing all discovered issues.
 */
export function validateRoutes(routes: Route[]): ValidationResult {
  const issues: ValidationIssue[] = [];

  // Per-route checks
  for (const route of routes) {
    if (!isValidMethod(route.method)) {
      issues.push({
        severity: 'error',
        code: 'INVALID_METHOD',
        message: `Invalid HTTP method "${route.method}" on route ${route.path}`,
        route,
      });
    }

    if (!isValidPath(route.path)) {
      issues.push({
        severity: 'error',
        code: 'INVALID_PATH',
        message: `Malformed path "${route.path}" for ${route.method} route`,
        route,
      });
    }

    // Warn about routes with no handler metadata (if source info is available)
    if (route.file === undefined || route.file === '') {
      issues.push({
        severity: 'info',
        code: 'MISSING_SOURCE',
        message: `Route ${route.method} ${route.path} has no associated source file`,
        route,
      });
    }
  }

  // Cross-route checks
  const duplicates = findDuplicates(routes);
  for (const group of duplicates) {
    issues.push({
      severity: 'warning',
      code: 'DUPLICATE_ROUTE',
      message: `Duplicate route detected: ${group[0].method.toUpperCase()} ${group[0].path} (${group.length} occurrences)`,
      route: group[0],
    });
  }

  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;

  return {
    valid: errorCount === 0,
    issues,
    errorCount,
    warningCount,
  };
}
