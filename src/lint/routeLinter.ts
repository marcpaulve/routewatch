import { Route } from '../index';

export type LintSeverity = 'error' | 'warn' | 'info';

export interface LintRule {
  id: string;
  description: string;
  severity: LintSeverity;
  check: (route: Route) => string | null;
}

export interface LintViolation {
  ruleId: string;
  severity: LintSeverity;
  message: string;
  route: Route;
}

export interface LintResult {
  violations: LintViolation[];
  errorCount: number;
  warnCount: number;
  infoCount: number;
}

export const defaultRules: LintRule[] = [
  {
    id: 'no-trailing-slash',
    description: 'Route paths should not have a trailing slash',
    severity: 'warn',
    check: (route) =>
      route.path.length > 1 && route.path.endsWith('/')
        ? `Path "${route.path}" has a trailing slash`
        : null,
  },
  {
    id: 'no-double-slash',
    description: 'Route paths should not contain double slashes',
    severity: 'error',
    check: (route) =>
      route.path.includes('//')
        ? `Path "${route.path}" contains a double slash`
        : null,
  },
  {
    id: 'uppercase-method',
    description: 'HTTP methods should be uppercase',
    severity: 'error',
    check: (route) =>
      route.method !== route.method.toUpperCase()
        ? `Method "${route.method}" should be uppercase`
        : null,
  },
  {
    id: 'no-wildcard-method',
    description: 'Avoid using wildcard (*) as HTTP method',
    severity: 'warn',
    check: (route) =>
      route.method === '*' ? `Route uses wildcard method on path "${route.path}"` : null,
  },
  {
    id: 'path-starts-with-slash',
    description: 'Route paths must start with a forward slash',
    severity: 'error',
    check: (route) =>
      !route.path.startsWith('/')
        ? `Path "${route.path}" does not start with a slash`
        : null,
  },
];

export function lintRoutes(routes: Route[], rules: LintRule[] = defaultRules): LintResult {
  const violations: LintViolation[] = [];

  for (const route of routes) {
    for (const rule of rules) {
      const message = rule.check(route);
      if (message) {
        violations.push({ ruleId: rule.id, severity: rule.severity, message, route });
      }
    }
  }

  return {
    violations,
    errorCount: violations.filter((v) => v.severity === 'error').length,
    warnCount: violations.filter((v) => v.severity === 'warn').length,
    infoCount: violations.filter((v) => v.severity === 'info').length,
  };
}
