import { pinRoutes, matchesPinRule, getPinnedRoutes, formatPinSummary } from './routePinner';
import { Route } from '../index';

const sampleRoutes: Route[] = [
  { method: 'GET', path: '/api/users' },
  { method: 'POST', path: '/api/users' },
  { method: 'GET', path: '/api/orders' },
  { method: 'DELETE', path: '/api/admin/users' },
  { method: 'GET', path: '/health' },
];

describe('matchesPinRule', () => {
  it('matches by method', () => {
    expect(matchesPinRule({ method: 'GET', path: '/api/users' }, { method: 'GET' })).toBe(true);
    expect(matchesPinRule({ method: 'POST', path: '/api/users' }, { method: 'GET' })).toBe(false);
  });

  it('matches by pathPrefix', () => {
    expect(matchesPinRule({ method: 'GET', path: '/api/users' }, { pathPrefix: '/api' })).toBe(true);
    expect(matchesPinRule({ method: 'GET', path: '/health' }, { pathPrefix: '/api' })).toBe(false);
  });

  it('matches by pathPattern', () => {
    const rule = { pathPattern: /\/admin\// };
    expect(matchesPinRule({ method: 'DELETE', path: '/api/admin/users' }, rule)).toBe(true);
    expect(matchesPinRule({ method: 'GET', path: '/api/users' }, rule)).toBe(false);
  });

  it('matches combined method and prefix', () => {
    const rule = { method: 'GET', pathPrefix: '/api' };
    expect(matchesPinRule({ method: 'GET', path: '/api/users' }, rule)).toBe(true);
    expect(matchesPinRule({ method: 'POST', path: '/api/users' }, rule)).toBe(false);
    expect(matchesPinRule({ method: 'GET', path: '/health' }, rule)).toBe(false);
  });
});

describe('pinRoutes', () => {
  it('pins routes matching rules', () => {
    const result = pinRoutes(sampleRoutes, [{ pathPrefix: '/api', label: 'api' }]);
    expect(result.pinned).toHaveLength(4);
    expect(result.skipped).toHaveLength(1);
    expect(result.skipped[0].path).toBe('/health');
  });

  it('assigns pinnedAt timestamp', () => {
    const result = pinRoutes(sampleRoutes, [{ method: 'GET' }]);
    for (const r of result.pinned) {
      expect(r.pinnedAt).toBeTruthy();
      expect(new Date(r.pinnedAt).toISOString()).toBe(r.pinnedAt);
    }
  });

  it('assigns label from matching rule', () => {
    const result = pinRoutes(sampleRoutes, [{ method: 'DELETE', label: 'dangerous' }]);
    expect(result.pinned[0].label).toBe('dangerous');
  });

  it('returns all routes as skipped when no rules match', () => {
    const result = pinRoutes(sampleRoutes, [{ pathPrefix: '/nonexistent' }]);
    expect(result.pinned).toHaveLength(0);
    expect(result.skipped).toHaveLength(sampleRoutes.length);
  });
});

describe('getPinnedRoutes', () => {
  it('returns all pinned routes when no label given', () => {
    const result = pinRoutes(sampleRoutes, [{ pathPrefix: '/api', label: 'api' }, { pathPrefix: '/health', label: 'infra' }]);
    expect(getPinnedRoutes(result.pinned)).toHaveLength(result.pinned.length);
  });

  it('filters by label', () => {
    const result = pinRoutes(sampleRoutes, [{ pathPrefix: '/api', label: 'api' }, { pathPrefix: '/health', label: 'infra' }]);
    const apiOnly = getPinnedRoutes(result.pinned, 'infra');
    expect(apiOnly.every((r) => r.label === 'infra')).toBe(true);
  });
});

describe('formatPinSummary', () => {
  it('includes counts in summary', () => {
    const result = pinRoutes(sampleRoutes, [{ pathPrefix: '/api' }]);
    const summary = formatPinSummary(result);
    expect(summary).toContain('Pinned routes: 4');
    expect(summary).toContain('Skipped routes: 1');
  });

  it('lists pinned routes', () => {
    const result = pinRoutes(sampleRoutes, [{ method: 'DELETE', label: 'dangerous' }]);
    const summary = formatPinSummary(result);
    expect(summary).toContain('DELETE');
    expect(summary).toContain('[dangerous]');
  });
});
