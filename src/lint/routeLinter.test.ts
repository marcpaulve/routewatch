import { lintRoutes, defaultRules, LintRule } from './routeLinter';
import { Route } from '../index';

const makeRoute = (method: string, path: string): Route => ({ method, path });

describe('lintRoutes', () => {
  it('returns no violations for clean routes', () => {
    const routes: Route[] = [
      makeRoute('GET', '/users'),
      makeRoute('POST', '/users'),
      makeRoute('DELETE', '/users/:id'),
    ];
    const result = lintRoutes(routes, defaultRules);
    expect(result.violations).toHaveLength(0);
    expect(result.errorCount).toBe(0);
    expect(result.warnCount).toBe(0);
  });

  it('detects trailing slash', () => {
    const routes: Route[] = [makeRoute('GET', '/users/')];
    const result = lintRoutes(routes, defaultRules);
    const violation = result.violations.find((v) => v.ruleId === 'no-trailing-slash');
    expect(violation).toBeDefined();
    expect(violation?.severity).toBe('warn');
  });

  it('detects double slash', () => {
    const routes: Route[] = [makeRoute('GET', '/users//profile')];
    const result = lintRoutes(routes, defaultRules);
    const violation = result.violations.find((v) => v.ruleId === 'no-double-slash');
    expect(violation).toBeDefined();
    expect(violation?.severity).toBe('error');
  });

  it('detects lowercase method', () => {
    const routes: Route[] = [makeRoute('get', '/users')];
    const result = lintRoutes(routes, defaultRules);
    const violation = result.violations.find((v) => v.ruleId === 'uppercase-method');
    expect(violation).toBeDefined();
    expect(violation?.severity).toBe('error');
  });

  it('detects wildcard method', () => {
    const routes: Route[] = [makeRoute('*', '/users')];
    const result = lintRoutes(routes, defaultRules);
    const violation = result.violations.find((v) => v.ruleId === 'no-wildcard-method');
    expect(violation).toBeDefined();
    expect(violation?.severity).toBe('warn');
  });

  it('detects path not starting with slash', () => {
    const routes: Route[] = [makeRoute('GET', 'users')];
    const result = lintRoutes(routes, defaultRules);
    const violation = result.violations.find((v) => v.ruleId === 'path-starts-with-slash');
    expect(violation).toBeDefined();
    expect(violation?.severity).toBe('error');
  });

  it('counts severities correctly', () => {
    const routes: Route[] = [
      makeRoute('get', '/users/'),   // error (uppercase) + warn (trailing slash)
      makeRoute('GET', 'noslash'),   // error (no leading slash)
    ];
    const result = lintRoutes(routes, defaultRules);
    expect(result.errorCount).toBeGreaterThanOrEqual(2);
    expect(result.warnCount).toBeGreaterThanOrEqual(1);
  });

  it('supports custom rules', () => {
    const customRule: LintRule = {
      id: 'no-admin-routes',
      description: 'Disallow /admin routes',
      severity: 'error',
      check: (route) =>
        route.path.startsWith('/admin') ? `Admin route detected: ${route.path}` : null,
    };
    const routes: Route[] = [makeRoute('GET', '/admin/users')];
    const result = lintRoutes(routes, [customRule]);
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0].ruleId).toBe('no-admin-routes');
  });
});
