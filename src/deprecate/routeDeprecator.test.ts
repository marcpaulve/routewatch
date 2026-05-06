import { describe, it, expect } from 'vitest';
import {
  matchesDeprecationRule,
  deprecateRoutes,
  formatDeprecationSummary,
  DeprecationRule,
} from './routeDeprecator';
import { Route } from '../index';

const routes: Route[] = [
  { method: 'GET', path: '/api/v1/users' },
  { method: 'POST', path: '/api/v1/users' },
  { method: 'GET', path: '/api/v2/users' },
  { method: 'DELETE', path: '/api/v1/items/:id' },
  { method: 'GET', path: '/health' },
];

describe('matchesDeprecationRule', () => {
  it('matches exact path', () => {
    const rule: DeprecationRule = { pathPattern: '/health' };
    expect(matchesDeprecationRule({ method: 'GET', path: '/health' }, rule)).toBe(true);
  });

  it('matches wildcard path pattern', () => {
    const rule: DeprecationRule = { pathPattern: '/api/v1/*' };
    expect(matchesDeprecationRule({ method: 'GET', path: '/api/v1/users' }, rule)).toBe(true);
    expect(matchesDeprecationRule({ method: 'GET', path: '/api/v2/users' }, rule)).toBe(false);
  });

  it('matches regex path pattern', () => {
    const rule: DeprecationRule = { pathPattern: /^\/api\/v1/ };
    expect(matchesDeprecationRule({ method: 'GET', path: '/api/v1/users' }, rule)).toBe(true);
    expect(matchesDeprecationRule({ method: 'GET', path: '/api/v2/users' }, rule)).toBe(false);
  });

  it('filters by method', () => {
    const rule: DeprecationRule = { method: 'DELETE', pathPattern: '/api/v1/*' };
    expect(matchesDeprecationRule({ method: 'DELETE', path: '/api/v1/items/:id' }, rule)).toBe(true);
    expect(matchesDeprecationRule({ method: 'GET', path: '/api/v1/users' }, rule)).toBe(false);
  });

  it('matches any method with wildcard *', () => {
    const rule: DeprecationRule = { method: '*', pathPattern: '/health' };
    expect(matchesDeprecationRule({ method: 'GET', path: '/health' }, rule)).toBe(true);
    expect(matchesDeprecationRule({ method: 'POST', path: '/health' }, rule)).toBe(true);
  });
});

describe('deprecateRoutes', () => {
  it('marks matching routes as deprecated', () => {
    const rules: DeprecationRule[] = [
      { pathPattern: '/api/v1/*', reason: 'v1 API is deprecated', since: '2024-01-01', replacement: '/api/v2/*' },
    ];
    const result = deprecateRoutes(routes, rules);
    expect(result.deprecatedCount).toBe(3);
    expect(result.active).toHaveLength(2);
    expect(result.deprecated[0].reason).toBe('v1 API is deprecated');
    expect(result.deprecated[0].since).toBe('2024-01-01');
    expect(result.deprecated[0].replacement).toBe('/api/v2/*');
  });

  it('returns all routes as active when no rules match', () => {
    const result = deprecateRoutes(routes, []);
    expect(result.deprecatedCount).toBe(0);
    expect(result.active).toHaveLength(routes.length);
  });

  it('uses default reason when none provided', () => {
    const rules: DeprecationRule[] = [{ pathPattern: '/health' }];
    const result = deprecateRoutes(routes, rules);
    expect(result.deprecated[0].reason).toBe('Marked as deprecated');
  });
});

describe('formatDeprecationSummary', () => {
  it('formats summary with deprecated routes', () => {
    const rules: DeprecationRule[] = [
      { pathPattern: '/api/v1/*', reason: 'v1 deprecated', replacement: '/api/v2' },
    ];
    const result = deprecateRoutes(routes, rules);
    const summary = formatDeprecationSummary(result);
    expect(summary).toContain('3/5 routes deprecated');
    expect(summary).toContain('[DEPRECATED]');
    expect(summary).toContain('v1 deprecated');
    expect(summary).toContain('→ use /api/v2');
  });
});
