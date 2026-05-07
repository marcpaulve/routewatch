import { checkRouteHealth, checkRoutesHealth } from './routeHealthChecker';
import { Route } from '../index';

const makeRoute = (method: string, path: string): Route => ({ method, path } as Route);

describe('checkRouteHealth', () => {
  it('returns healthy for a clean route', () => {
    const result = checkRouteHealth(makeRoute('GET', '/api/users'));
    expect(result.healthy).toBe(true);
    expect(result.issues).toHaveLength(0);
    expect(result.score).toBe(100);
  });

  it('flags missing method', () => {
    const result = checkRouteHealth(makeRoute('', '/api/users'));
    expect(result.healthy).toBe(false);
    expect(result.issues.some(i => i.includes('method'))).toBe(true);
    expect(result.score).toBeLessThan(100);
  });

  it('flags missing path', () => {
    const result = checkRouteHealth(makeRoute('GET', ''));
    expect(result.healthy).toBe(false);
    expect(result.issues.some(i => i.includes('path'))).toBe(true);
  });

  it('flags path not starting with /', () => {
    const result = checkRouteHealth(makeRoute('GET', 'api/users'));
    expect(result.healthy).toBe(false);
    expect(result.issues.some(i => i.includes('"/'))).toBe(true);
  });

  it('flags deeply nested path', () => {
    const result = checkRouteHealth(makeRoute('GET', '/a/b/c/d/e/f/g'));
    expect(result.healthy).toBe(false);
    expect(result.issues.some(i => i.includes('depth'))).toBe(true);
  });

  it('flags suspicious debug path', () => {
    const result = checkRouteHealth(makeRoute('GET', '/api/debug/info'));
    expect(result.healthy).toBe(false);
    expect(result.issues.some(i => i.includes('suspicious'))).toBe(true);
  });

  it('flags DELETE without dynamic segment', () => {
    const result = checkRouteHealth(makeRoute('DELETE', '/api/users'));
    expect(result.healthy).toBe(false);
    expect(result.issues.some(i => i.includes('DELETE'))).toBe(true);
  });

  it('does not flag DELETE with dynamic segment', () => {
    const result = checkRouteHealth(makeRoute('DELETE', '/api/users/:id'));
    expect(result.healthy).toBe(true);
  });

  it('score never goes below 0', () => {
    const result = checkRouteHealth(makeRoute('', ''));
    expect(result.score).toBeGreaterThanOrEqual(0);
  });
});

describe('checkRoutesHealth', () => {
  it('returns correct summary for mixed routes', () => {
    const routes: Route[] = [
      makeRoute('GET', '/api/users'),
      makeRoute('GET', '/api/debug'),
      makeRoute('DELETE', '/api/items'),
    ];
    const summary = checkRoutesHealth(routes);
    expect(summary.total).toBe(3);
    expect(summary.healthy).toBe(1);
    expect(summary.unhealthy).toBe(2);
    expect(summary.averageScore).toBeLessThan(100);
  });

  it('handles empty route list', () => {
    const summary = checkRoutesHealth([]);
    expect(summary.total).toBe(0);
    expect(summary.averageScore).toBe(0);
  });

  it('returns full score for all healthy routes', () => {
    const routes: Route[] = [
      makeRoute('GET', '/api/users'),
      makeRoute('POST', '/api/users'),
    ];
    const summary = checkRoutesHealth(routes);
    expect(summary.healthy).toBe(2);
    expect(summary.averageScore).toBe(100);
  });
});
