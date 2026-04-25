import { Route } from '../parser';

export type AuditSeverity = 'error' | 'warn' | 'info';

export interface AuditRule {
  id: string;
  description: string;
  severity: AuditSeverity;
  check: (route: Route) => boolean;
}

export interface AuditViolation {
  ruleId: string;
  description: string;
  severity: AuditSeverity;
  route: Route;
}

export interface AuditResult {
  violations: AuditViolation[];
  passed: number;
  failed: number;
}

export const DEFAULT_RULES: AuditRule[] = [
  {
    id: 'no-wildcard-method',
    description: 'Route should not use wildcard HTTP method (*)',
    severity: 'error',
    check: (route) => route.method !== '*',
  },
  {
    id: 'no-unversioned-api',
    description: 'API routes should include a version prefix (e.g. /v1/)',
    severity: 'warn',
    check: (route) =>
      !route.path.startsWith('/api/') || /^\/api\/v\d+\//.test(route.path),
  },
  {
    id: 'no-trailing-slash',
    description: 'Route path should not have a trailing slash',
    severity: 'warn',
    check: (route) => route.path === '/' || !route.path.endsWith('/'),
  },
  {
    id: 'uppercase-method',
    description: 'HTTP method should be uppercase',
    severity: 'error',
    check: (route) => route.method === route.method.toUpperCase(),
  },
];

export function auditRoutes(
  routes: Route[],
  rules: AuditRule[] = DEFAULT_RULES
): AuditResult {
  const violations: AuditViolation[] = [];

  for (const route of routes) {
    for (const rule of rules) {
      if (!rule.check(route)) {
        violations.push({
          ruleId: rule.id,
          description: rule.description,
          severity: rule.severity,
          route,
        });
      }
    }
  }

  const totalChecks = routes.length * rules.length;
  return {
    violations,
    passed: totalChecks - violations.length,
    failed: violations.length,
  };
}
