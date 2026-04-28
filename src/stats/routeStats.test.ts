import { computeRouteStats, getPathDepth, extractPrefix } from './routeStats';
import { Route } from '../index';

const sampleRoutes: Route[] = [
  { method: 'GET', path: '/users' },
  { method: 'POST', path: '/users' },
  { method: 'GET', path: '/users/:id' },
  { method: 'DELETE', path: '/users/:id' },
  { method: 'GET', path: '/products' },
  { method: 'GET', path: '/products/:id/reviews' },
];

describe('getPathDepth', () => {
  it('returns 0 for root path', () => {
    expect(getPathDepth('/')).toBe(0);
  });

  it('returns correct depth for simple path', () => {
    expect(getPathDepth('/users')).toBe(1);
  });

  it('returns correct depth for nested path', () => {
    expect(getPathDepth('/products/:id/reviews')).toBe(3);
  });
});

describe('extractPrefix', () => {
  it('extracts first segment as prefix', () => {
    expect(extractPrefix('/users/:id')).toBe('/users');
  });

  it('returns / for root', () => {
    expect(extractPrefix('/')).toBe('/');
  });
});

describe('computeRouteStats', () => {
  it('returns zeroed stats for empty routes', () => {
    const stats = computeRouteStats([]);
    expect(stats.total).toBe(0);
    expect(stats.uniquePaths).toBe(0);
    expect(stats.mostCommonMethod).toBe('');
  });

  it('counts total routes', () => {
    const stats = computeRouteStats(sampleRoutes);
    expect(stats.total).toBe(6);
  });

  it('groups routes by method', () => {
    const stats = computeRouteStats(sampleRoutes);
    expect(stats.byMethod['GET']).toBe(4);
    expect(stats.byMethod['POST']).toBe(1);
    expect(stats.byMethod['DELETE']).toBe(1);
  });

  it('identifies the most common method', () => {
    const stats = computeRouteStats(sampleRoutes);
    expect(stats.mostCommonMethod).toBe('GET');
  });

  it('groups routes by prefix', () => {
    const stats = computeRouteStats(sampleRoutes);
    expect(stats.byPrefix['/users']).toBe(4);
    expect(stats.byPrefix['/products']).toBe(2);
  });

  it('detects duplicate paths', () => {
    const stats = computeRouteStats(sampleRoutes);
    expect(stats.duplicatePaths).toContain('/users');
    expect(stats.duplicatePaths).toContain('/users/:id');
  });

  it('computes average path depth', () => {
    const stats = computeRouteStats(sampleRoutes);
    expect(stats.averagePathDepth).toBeCloseTo(1.67, 1);
  });

  it('finds the deepest path', () => {
    const stats = computeRouteStats(sampleRoutes);
    expect(stats.deepestPath).toBe('/products/:id/reviews');
  });
});
