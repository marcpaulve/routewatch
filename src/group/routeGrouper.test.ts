import {
  extractTopLevelPrefix,
  groupRoutesByPrefix,
  groupRoutesByMethod,
} from './routeGrouper';
import { Route } from '../index';

const sampleRoutes: Route[] = [
  { method: 'GET',    path: '/api/users' },
  { method: 'POST',   path: '/api/users' },
  { method: 'GET',    path: '/api/users/:id' },
  { method: 'DELETE', path: '/api/users/:id' },
  { method: 'GET',    path: '/api/posts' },
  { method: 'POST',   path: '/api/posts' },
  { method: 'GET',    path: '/health' },
  { method: 'GET',    path: '/' },
];

describe('extractTopLevelPrefix', () => {
  it('extracts the first path segment', () => {
    expect(extractTopLevelPrefix('/api/users')).toBe('/api');
    expect(extractTopLevelPrefix('/health')).toBe('/health');
  });

  it('returns / for root path', () => {
    expect(extractTopLevelPrefix('/')).toBe('/');
  });

  it('handles paths without leading slash', () => {
    expect(extractTopLevelPrefix('api/users')).toBe('/api');
  });
});

describe('groupRoutesByPrefix', () => {
  it('groups routes sharing a common prefix', () => {
    const result = groupRoutesByPrefix(sampleRoutes, 2);
    const apiGroup = result.groups.find(g => g.prefix === '/api');
    expect(apiGroup).toBeDefined();
    expect(apiGroup!.count).toBe(6);
  });

  it('places small groups into ungrouped', () => {
    const result = groupRoutesByPrefix(sampleRoutes, 2);
    const ungroupedPaths = result.ungrouped.map(r => r.path);
    expect(ungroupedPaths).toContain('/health');
    expect(ungroupedPaths).toContain('/');
  });

  it('returns correct totalRoutes count', () => {
    const result = groupRoutesByPrefix(sampleRoutes, 2);
    expect(result.totalRoutes).toBe(sampleRoutes.length);
  });

  it('sorts groups by count descending', () => {
    const routes: Route[] = [
      { method: 'GET', path: '/a/1' },
      { method: 'GET', path: '/a/2' },
      { method: 'GET', path: '/b/1' },
      { method: 'GET', path: '/b/2' },
      { method: 'GET', path: '/b/3' },
    ];
    const result = groupRoutesByPrefix(routes, 2);
    expect(result.groups[0].prefix).toBe('/b');
  });

  it('handles empty routes array', () => {
    const result = groupRoutesByPrefix([], 2);
    expect(result.groups).toHaveLength(0);
    expect(result.ungrouped).toHaveLength(0);
    expect(result.totalRoutes).toBe(0);
  });
});

describe('groupRoutesByMethod', () => {
  it('groups routes by HTTP method', () => {
    const result = groupRoutesByMethod(sampleRoutes);
    expect(result['GET']).toHaveLength(5);
    expect(result['POST']).toHaveLength(2);
    expect(result['DELETE']).toHaveLength(1);
  });

  it('normalizes method to uppercase', () => {
    const routes: Route[] = [{ method: 'get', path: '/foo' }];
    const result = groupRoutesByMethod(routes);
    expect(result['GET']).toBeDefined();
    expect(result['get']).toBeUndefined();
  });

  it('returns empty object for empty input', () => {
    expect(groupRoutesByMethod([])).toEqual({});
  });
});
