import { matchesPinRule, pinRoutes, getPinnedRoutes, formatPinSummary, PinRule } from './routePinner';
import { Route } from '../index';

const routes: Route[] = [
  { method: 'GET', path: '/users' },
  { method: 'POST', path: '/users' },
  { method: 'GET', path: '/users/:id' },
  { method: 'DELETE', path: '/admin/users/:id' },
  { method: 'GET', path: '/health' },
];

describe('matchesPinRule', () => {
  it('matches by method', () => {
    const rule: PinRule = { method: 'GET' };
    expect(matchesPinRule(routes[0], rule)).toBe(true);
    expect(matchesPinRule(routes[1], rule)).toBe(false);
  });

  it('matches by string path pattern', () => {
    const rule: PinRule = { pathPattern: '/admin' };
    expect(matchesPinRule(routes[3], rule)).toBe(true);
    expect(matchesPinRule(routes[0], rule)).toBe(false);
  });

  it('matches by regex path pattern', () => {
    const rule: PinRule = { pathPattern: /\/users\/:.+/ };
    expect(matchesPinRule(routes[2], rule)).toBe(true);
    expect(matchesPinRule(routes[0], rule)).toBe(false);
  });

  it('matches by method and path pattern', () => {
    const rule: PinRule = { method: 'GET', pathPattern: '/users' };
    expect(matchesPinRule(routes[0], rule)).toBe(true);
    expect(matchesPinRule(routes[1], rule)).toBe(false);
  });

  it('matches all routes when no constraints given', () => {
    const rule: PinRule = {};
    expect(matchesPinRule(routes[0], rule)).toBe(true);
  });
});

describe('pinRoutes', () => {
  it('pins routes matching rules', () => {
    const rules: PinRule[] = [{ method: 'GET', label: 'read-only' }];
    const pinned = pinRoutes(routes, rules);
    expect(pinned).toHaveLength(3);
    expect(pinned.every((p) => p.route.method === 'GET')).toBe(true);
    expect(pinned[0].label).toBe('read-only');
  });

  it('does not duplicate routes matched by multiple rules', () => {
    const rules: PinRule[] = [
      { method: 'GET', pathPattern: '/users' },
      { pathPattern: '/users' },
    ];
    const pinned = pinRoutes(routes, rules);
    const keys = pinned.map((p) => `${p.route.method}:${p.route.path}`);
    const unique = new Set(keys);
    expect(unique.size).toBe(keys.length);
  });

  it('returns empty array when no rules match', () => {
    const rules: PinRule[] = [{ method: 'PATCH' }];
    expect(pinRoutes(routes, rules)).toHaveLength(0);
  });

  it('stores pinnedAt timestamp', () => {
    const rules: PinRule[] = [{ method: 'GET', pathPattern: '/health' }];
    const pinned = pinRoutes(routes, rules);
    expect(pinned[0].pinnedAt).toBeTruthy();
    expect(new Date(pinned[0].pinnedAt).toString()).not.toBe('Invalid Date');
  });
});

describe('getPinnedRoutes', () => {
  it('extracts route objects from pinned entries', () => {
    const rules: PinRule[] = [{ method: 'DELETE' }];
    const pinned = pinRoutes(routes, rules);
    const extracted = getPinnedRoutes(pinned);
    expect(extracted).toHaveLength(1);
    expect(extracted[0]).toEqual({ method: 'DELETE', path: '/admin/users/:id' });
  });
});

describe('formatPinSummary', () => {
  it('returns message when no routes pinned', () => {
    expect(formatPinSummary([])).toBe('No routes pinned.');
  });

  it('formats pinned routes with labels', () => {
    const rules: PinRule[] = [{ method: 'GET', label: 'safe' }];
    const pinned = pinRoutes(routes, rules);
    const summary = formatPinSummary(pinned);
    expect(summary).toContain('Pinned routes (3)');
    expect(summary).toContain('[safe]');
    expect(summary).toContain('GET /users');
  });

  it('formats pinned routes without labels', () => {
    const rules: PinRule[] = [{ method: 'POST' }];
    const pinned = pinRoutes(routes, rules);
    const summary = formatPinSummary(pinned);
    expect(summary).toContain('POST /users');
    expect(summary).not.toContain('[');
  });
});
