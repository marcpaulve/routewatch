import { matchesAliasRule, aliasRoutes, getAliasedRoutes, formatAliasSummary } from './routeAliaser';
import { Route } from '../index';

const routes: Route[] = [
  { method: 'GET', path: '/users' },
  { method: 'POST', path: '/users' },
  { method: 'GET', path: '/products' },
  { method: 'DELETE', path: '/admin/users' },
];

describe('matchesAliasRule', () => {
  it('matches by path', () => {
    expect(matchesAliasRule({ method: 'GET', path: '/users' }, { from: '/users', to: '/members' })).toBe(true);
  });

  it('does not match different path', () => {
    expect(matchesAliasRule({ method: 'GET', path: '/orders' }, { from: '/users', to: '/members' })).toBe(false);
  });

  it('matches by path and method', () => {
    const rule = { from: '/users', to: '/members', methods: ['GET'] };
    expect(matchesAliasRule({ method: 'GET', path: '/users' }, rule)).toBe(true);
    expect(matchesAliasRule({ method: 'POST', path: '/users' }, rule)).toBe(false);
  });

  it('is case-insensitive for methods', () => {
    const rule = { from: '/users', to: '/members', methods: ['get'] };
    expect(matchesAliasRule({ method: 'GET', path: '/users' }, rule)).toBe(true);
  });
});

describe('aliasRoutes', () => {
  it('applies alias to matching routes', () => {
    const rules = [{ from: '/users', to: '/members' }];
    const result = aliasRoutes(routes, rules);
    const aliased = result.filter(r => r.alias);
    expect(aliased).toHaveLength(2);
    expect(aliased[0].alias).toBe('/members');
    expect(aliased[0].originalPath).toBe('/users');
  });

  it('leaves non-matching routes unchanged', () => {
    const rules = [{ from: '/nonexistent', to: '/other' }];
    const result = aliasRoutes(routes, rules);
    expect(result.every(r => r.alias === undefined)).toBe(true);
  });

  it('applies method-scoped alias', () => {
    const rules = [{ from: '/users', to: '/members', methods: ['POST'] }];
    const result = aliasRoutes(routes, rules);
    const aliased = result.filter(r => r.alias);
    expect(aliased).toHaveLength(1);
    expect(aliased[0].method).toBe('POST');
  });
});

describe('getAliasedRoutes', () => {
  it('returns only aliased routes', () => {
    const rules = [{ from: '/users', to: '/members' }];
    const aliased = aliasRoutes(routes, rules);
    expect(getAliasedRoutes(aliased)).toHaveLength(2);
  });
});

describe('formatAliasSummary', () => {
  it('computes summary correctly', () => {
    const rules = [{ from: '/users', to: '/members' }];
    const aliased = aliasRoutes(routes, rules);
    const summary = formatAliasSummary(aliased, rules);
    expect(summary.total).toBe(4);
    expect(summary.aliased).toBe(2);
    expect(summary.unaliased).toBe(2);
    expect(summary.rules).toHaveLength(1);
  });
});
