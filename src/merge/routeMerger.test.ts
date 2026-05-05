import { mergeRoutes, summarizeMerge, routeKey } from './routeMerger';
import { Route } from '../index';

const left: Route[] = [
  { method: 'GET', path: '/users' },
  { method: 'POST', path: '/users' },
  { method: 'GET', path: '/posts' },
];

const right: Route[] = [
  { method: 'GET', path: '/users' },
  { method: 'DELETE', path: '/users/:id' },
  { method: 'GET', path: '/comments' },
];

describe('routeKey', () => {
  it('produces METHOD:path key', () => {
    expect(routeKey({ method: 'get', path: '/foo' })).toBe('GET:/foo');
  });
});

describe('mergeRoutes', () => {
  it('union strategy includes all unique routes', () => {
    const result = mergeRoutes(left, right, { strategy: 'union' });
    expect(result.routes).toHaveLength(5);
  });

  it('intersection strategy returns only shared routes', () => {
    const result = mergeRoutes(left, right, { strategy: 'intersection' });
    expect(result.routes).toHaveLength(1);
    expect(result.routes[0].path).toBe('/users');
    expect(result.routes[0].method.toUpperCase()).toBe('GET');
  });

  it('left strategy returns only left routes', () => {
    const result = mergeRoutes(left, right, { strategy: 'left' });
    expect(result.routes).toEqual(left);
  });

  it('right strategy returns only right routes', () => {
    const result = mergeRoutes(left, right, { strategy: 'right' });
    expect(result.routes).toEqual(right);
  });

  it('identifies leftOnly routes', () => {
    const result = mergeRoutes(left, right, { strategy: 'union' });
    expect(result.leftOnly).toHaveLength(2);
    const keys = result.leftOnly.map(routeKey);
    expect(keys).toContain('POST:/users');
    expect(keys).toContain('GET:/posts');
  });

  it('identifies rightOnly routes', () => {
    const result = mergeRoutes(left, right, { strategy: 'union' });
    expect(result.rightOnly).toHaveLength(2);
    const keys = result.rightOnly.map(routeKey);
    expect(keys).toContain('DELETE:/users/:id');
    expect(keys).toContain('GET:/comments');
  });

  it('deduplicates when deduplicateByKey is true', () => {
    const dupes: Route[] = [...left, { method: 'GET', path: '/users' }];
    const result = mergeRoutes(dupes, right, { strategy: 'left', deduplicateByKey: true });
    const keys = result.routes.map(routeKey);
    const unique = new Set(keys);
    expect(unique.size).toBe(keys.length);
  });
});

describe('summarizeMerge', () => {
  it('returns a formatted summary string', () => {
    const result = mergeRoutes(left, right, { strategy: 'union' });
    const summary = summarizeMerge(result);
    expect(summary).toContain('Total routes: 5');
    expect(summary).toContain('Left only:    2');
    expect(summary).toContain('Right only:   2');
    expect(summary).toContain('In both:      1');
  });
});
