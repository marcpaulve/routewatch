import { prioritizeRoutes, sortByPriority, matchesPriorityRule, formatPrioritySummary } from './routePrioritizer';
import { Route } from '../index';

const routes: Route[] = [
  { method: 'GET', path: '/api/users' },
  { method: 'POST', path: '/api/users' },
  { method: 'DELETE', path: '/api/admin/users' },
  { method: 'GET', path: '/health' },
];

describe('matchesPriorityRule', () => {
  it('matches by method', () => {
    const rule = { match: { method: 'DELETE' }, priority: 10 };
    expect(matchesPriorityRule({ method: 'DELETE', path: '/api/x' }, rule)).toBe(true);
    expect(matchesPriorityRule({ method: 'GET', path: '/api/x' }, rule)).toBe(false);
  });

  it('matches by pathPrefix', () => {
    const rule = { match: { pathPrefix: '/api/admin' }, priority: 5 };
    expect(matchesPriorityRule({ method: 'GET', path: '/api/admin/users' }, rule)).toBe(true);
    expect(matchesPriorityRule({ method: 'GET', path: '/api/users' }, rule)).toBe(false);
  });

  it('matches by pathPattern', () => {
    const rule = { match: { pathPattern: '^/health' }, priority: 1 };
    expect(matchesPriorityRule({ method: 'GET', path: '/health' }, rule)).toBe(true);
    expect(matchesPriorityRule({ method: 'GET', path: '/api/health' }, rule)).toBe(false);
  });

  it('matches combined conditions', () => {
    const rule = { match: { method: 'GET', pathPrefix: '/api' }, priority: 3 };
    expect(matchesPriorityRule({ method: 'GET', path: '/api/users' }, rule)).toBe(true);
    expect(matchesPriorityRule({ method: 'POST', path: '/api/users' }, rule)).toBe(false);
  });
});

describe('prioritizeRoutes', () => {
  it('assigns priority 0 when no rules match', () => {
    const result = prioritizeRoutes(routes, []);
    result.forEach((r) => expect(r.priority).toBe(0));
  });

  it('assigns highest matching priority', () => {
    const rules = [
      { match: { pathPrefix: '/api' }, priority: 2, label: 'api' },
      { match: { method: 'DELETE' }, priority: 8, label: 'destructive' },
    ];
    const result = prioritizeRoutes(routes, rules);
    const deleteRoute = result.find((r) => r.method === 'DELETE')!;
    expect(deleteRoute.priority).toBe(8);
    expect(deleteRoute.priorityLabel).toBe('destructive');
  });

  it('preserves original route fields', () => {
    const rules = [{ match: { method: 'GET' }, priority: 5 }];
    const result = prioritizeRoutes(routes, rules);
    const get = result.find((r) => r.path === '/health')!;
    expect(get.method).toBe('GET');
    expect(get.path).toBe('/health');
  });
});

describe('sortByPriority', () => {
  it('sorts routes descending by priority', () => {
    const rules = [
      { match: { method: 'DELETE' }, priority: 10 },
      { match: { pathPrefix: '/health' }, priority: 1 },
    ];
    const prioritized = prioritizeRoutes(routes, rules);
    const sorted = sortByPriority(prioritized);
    expect(sorted[0].priority).toBeGreaterThanOrEqual(sorted[1].priority);
  });
});

describe('formatPrioritySummary', () => {
  it('returns a string summary', () => {
    const rules = [{ match: { method: 'GET' }, priority: 5, label: 'read' }];
    const prioritized = prioritizeRoutes(routes, rules);
    const summary = formatPrioritySummary(prioritized);
    expect(summary).toContain('Route Priority Summary');
    expect(summary).toContain('[read]');
  });
});
