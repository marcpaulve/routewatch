import { auditRoutes, DEFAULT_RULES, AuditRule } from './routeAuditor';
import { Route } from '../parser';

const makeRoute = (method: string, path: string): Route => ({ method, path });

describe('auditRoutes', () => {
  it('returns no violations for clean routes', () => {
    const routes: Route[] = [
      makeRoute('GET', '/api/v1/users'),
      makeRoute('POST', '/api/v1/orders'),
    ];
    const result = auditRoutes(routes);
    expect(result.violations).toHaveLength(0);
    expect(result.failed).toBe(0);
    expect(result.passed).toBe(routes.length * DEFAULT_RULES.length);
  });

  it('flags wildcard HTTP method', () => {
    const routes: Route[] = [makeRoute('*', '/api/v1/items')];
    const result = auditRoutes(routes);
    const v = result.violations.find((v) => v.ruleId === 'no-wildcard-method');
    expect(v).toBeDefined();
    expect(v?.severity).toBe('error');
  });

  it('flags unversioned api routes', () => {
    const routes: Route[] = [makeRoute('GET', '/api/users')];
    const result = auditRoutes(routes);
    const v = result.violations.find((v) => v.ruleId === 'no-unversioned-api');
    expect(v).toBeDefined();
    expect(v?.severity).toBe('warn');
  });

  it('does not flag non-api routes for versioning', () => {
    const routes: Route[] = [makeRoute('GET', '/health')];
    const result = auditRoutes(routes);
    const v = result.violations.find((v) => v.ruleId === 'no-unversioned-api');
    expect(v).toBeUndefined();
  });

  it('flags trailing slash', () => {
    const routes: Route[] = [makeRoute('GET', '/api/v1/users/')];
    const result = auditRoutes(routes);
    const v = result.violations.find((v) => v.ruleId === 'no-trailing-slash');
    expect(v).toBeDefined();
  });

  it('allows root path without trailing slash violation', () => {
    const routes: Route[] = [makeRoute('GET', '/')];
    const result = auditRoutes(routes);
    const v = result.violations.find((v) => v.ruleId === 'no-trailing-slash');
    expect(v).toBeUndefined();
  });

  it('flags lowercase HTTP method', () => {
    const routes: Route[] = [makeRoute('get', '/api/v1/users')];
    const result = auditRoutes(routes);
    const v = result.violations.find((v) => v.ruleId === 'uppercase-method');
    expect(v).toBeDefined();
    expect(v?.severity).toBe('error');
  });

  it('supports custom rules', () => {
    const customRule: AuditRule = {
      id: 'no-delete',
      description: 'DELETE routes are not allowed',
      severity: 'error',
      check: (route) => route.method !== 'DELETE',
    };
    const routes: Route[] = [makeRoute('DELETE', '/api/v1/users/1')];
    const result = auditRoutes(routes, [customRule]);
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0].ruleId).toBe('no-delete');
  });
});
