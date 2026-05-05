import {
  matchesAnnotationRule,
  annotateRoutes,
  getAnnotationSummary,
  AnnotationRule,
} from './routeAnnotator';
import { Route } from '../index';

const routes: Route[] = [
  { method: 'GET', path: '/users' },
  { method: 'POST', path: '/users' },
  { method: 'GET', path: '/admin/settings' },
  { method: 'DELETE', path: '/users/:id' },
];

describe('matchesAnnotationRule', () => {
  it('matches by method', () => {
    const rule: AnnotationRule = {
      match: { method: 'GET' },
      annotations: [{ key: 'cache', value: 'true' }],
    };
    expect(matchesAnnotationRule(routes[0], rule)).toBe(true);
    expect(matchesAnnotationRule(routes[1], rule)).toBe(false);
  });

  it('matches by pathPrefix', () => {
    const rule: AnnotationRule = {
      match: { pathPrefix: '/admin' },
      annotations: [{ key: 'auth', value: 'admin' }],
    };
    expect(matchesAnnotationRule(routes[2], rule)).toBe(true);
    expect(matchesAnnotationRule(routes[0], rule)).toBe(false);
  });

  it('matches by pathPattern', () => {
    const rule: AnnotationRule = {
      match: { pathPattern: /:\w+/ },
      annotations: [{ key: 'dynamic', value: 'true' }],
    };
    expect(matchesAnnotationRule(routes[3], rule)).toBe(true);
    expect(matchesAnnotationRule(routes[0], rule)).toBe(false);
  });

  it('matches multiple conditions (AND logic)', () => {
    const rule: AnnotationRule = {
      match: { method: ['GET', 'POST'], pathPrefix: '/users' },
      annotations: [{ key: 'scope', value: 'users' }],
    };
    expect(matchesAnnotationRule(routes[0], rule)).toBe(true);
    expect(matchesAnnotationRule(routes[1], rule)).toBe(true);
    expect(matchesAnnotationRule(routes[2], rule)).toBe(false);
  });
});

describe('annotateRoutes', () => {
  it('applies annotations from matching rules', () => {
    const rules: AnnotationRule[] = [
      { match: { method: 'GET' }, annotations: [{ key: 'cache', value: 'true' }] },
      { match: { pathPrefix: '/admin' }, annotations: [{ key: 'auth', value: 'admin' }] },
    ];
    const result = annotateRoutes(routes, rules);
    expect(result[0].annotations).toEqual([{ key: 'cache', value: 'true' }]);
    expect(result[2].annotations).toContainEqual({ key: 'auth', value: 'admin' });
    expect(result[2].annotations).toContainEqual({ key: 'cache', value: 'true' });
  });

  it('deduplicates annotations by key (last rule wins)', () => {
    const rules: AnnotationRule[] = [
      { match: { method: 'GET' }, annotations: [{ key: 'auth', value: 'basic' }] },
      { match: { pathPrefix: '/admin' }, annotations: [{ key: 'auth', value: 'admin' }] },
    ];
    const result = annotateRoutes(routes, rules);
    const adminRoute = result.find((r) => r.path === '/admin/settings')!;
    const authAnn = adminRoute.annotations.find((a) => a.key === 'auth');
    expect(authAnn?.value).toBe('admin');
    expect(adminRoute.annotations.filter((a) => a.key === 'auth')).toHaveLength(1);
  });

  it('returns empty annotations for unmatched routes', () => {
    const rules: AnnotationRule[] = [
      { match: { pathPrefix: '/admin' }, annotations: [{ key: 'auth', value: 'admin' }] },
    ];
    const result = annotateRoutes(routes, rules);
    expect(result[0].annotations).toEqual([]);
  });
});

describe('getAnnotationSummary', () => {
  it('groups routes by annotation key', () => {
    const rules: AnnotationRule[] = [
      { match: { method: 'GET' }, annotations: [{ key: 'cache', value: 'true' }] },
    ];
    const annotated = annotateRoutes(routes, rules);
    const summary = getAnnotationSummary(annotated);
    expect(summary['cache']).toContain('GET /users');
    expect(summary['cache']).toContain('GET /admin/settings');
  });
});
