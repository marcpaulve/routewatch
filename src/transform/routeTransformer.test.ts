import {
  applyTransformRule,
  transformRoutes,
  getTransformedRoutes,
  TransformRule,
} from './routeTransformer';
import { Route } from '../index';

const routes: Route[] = [
  { method: 'get', path: '/api/v1/users' },
  { method: 'post', path: '/api/v1/users' },
  { method: 'get', path: '/api/v1/orders' },
  { method: 'delete', path: '/internal/admin' },
];

describe('applyTransformRule', () => {
  it('returns unchanged route when no change occurs', () => {
    const rule: TransformRule = {
      name: 'noop',
      transform: (r) => r,
    };
    const result = applyTransformRule(routes[0], rule);
    expect(result.changed).toBe(false);
    expect(result.transformed).toEqual(routes[0]);
  });

  it('returns null when route is removed', () => {
    const rule: TransformRule = {
      name: 'remove-delete',
      transform: (r) => (r.method === 'delete' ? null : r),
    };
    const result = applyTransformRule(routes[3], rule);
    expect(result.transformed).toBeNull();
    expect(result.changed).toBe(true);
  });

  it('marks changed when path is modified', () => {
    const rule: TransformRule = {
      name: 'strip-v1',
      transform: (r) => ({ ...r, path: r.path.replace('/v1', '') }),
    };
    const result = applyTransformRule(routes[0], rule);
    expect(result.changed).toBe(true);
    expect(result.transformed?.path).toBe('/api/users');
  });
});

describe('transformRoutes', () => {
  it('applies multiple rules in sequence', () => {
    const rules: TransformRule[] = [
      {
        name: 'strip-v1',
        transform: (r) => ({ ...r, path: r.path.replace('/v1', '') }),
      },
      {
        name: 'remove-internal',
        transform: (r) => (r.path.startsWith('/internal') ? null : r),
      },
    ];
    const summary = transformRoutes(routes, rules);
    expect(summary.removed).toBe(1);
    expect(summary.changed).toBeGreaterThanOrEqual(2);
    expect(summary.total).toBe(4);
  });

  it('counts unchanged routes correctly', () => {
    const rules: TransformRule[] = [
      { name: 'noop', transform: (r) => r },
    ];
    const summary = transformRoutes(routes, rules);
    expect(summary.unchanged).toBe(routes.length);
    expect(summary.changed).toBe(0);
    expect(summary.removed).toBe(0);
  });
});

describe('getTransformedRoutes', () => {
  it('filters out removed routes', () => {
    const rules: TransformRule[] = [
      {
        name: 'remove-delete',
        transform: (r) => (r.method === 'delete' ? null : r),
      },
    ];
    const summary = transformRoutes(routes, rules);
    const result = getTransformedRoutes(summary);
    expect(result.every((r) => r.method !== 'delete')).toBe(true);
    expect(result.length).toBe(routes.length - 1);
  });
});
