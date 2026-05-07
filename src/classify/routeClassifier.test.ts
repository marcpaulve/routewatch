import { classifyRoute, classifyRoutes, groupByClassification, formatClassificationSummary } from './routeClassifier';
import { Route } from '../index';

const makeRoute = (method: string, path: string): Route => ({ method, path });

describe('classifyRoute', () => {
  it('classifies health check routes', () => {
    const result = classifyRoute(makeRoute('GET', '/health'));
    expect(result.classification).toBe('health');
    expect(result.confidence).toBeGreaterThanOrEqual(0.9);
  });

  it('classifies /ping as health', () => {
    const result = classifyRoute(makeRoute('GET', '/ping'));
    expect(result.classification).toBe('health');
  });

  it('classifies auth routes', () => {
    const result = classifyRoute(makeRoute('POST', '/auth/login'));
    expect(result.classification).toBe('auth');
  });

  it('classifies /login as auth', () => {
    const result = classifyRoute(makeRoute('POST', '/login'));
    expect(result.classification).toBe('auth');
  });

  it('classifies webhook routes', () => {
    const result = classifyRoute(makeRoute('POST', '/webhook/github'));
    expect(result.classification).toBe('webhook');
  });

  it('classifies static asset routes', () => {
    const result = classifyRoute(makeRoute('GET', '/static/app.js'));
    expect(result.classification).toBe('static');
  });

  it('classifies GET resource routes', () => {
    const result = classifyRoute(makeRoute('GET', '/users/:id'));
    expect(result.classification).toBe('resource');
  });

  it('classifies POST routes as action', () => {
    const result = classifyRoute(makeRoute('POST', '/orders/process'));
    expect(result.classification).toBe('action');
  });

  it('returns unknown for unrecognized routes', () => {
    const result = classifyRoute(makeRoute('GET', '/x'));
    expect(['resource', 'unknown']).toContain(result.classification);
  });

  it('preserves original route fields', () => {
    const route = makeRoute('GET', '/health');
    const result = classifyRoute(route);
    expect(result.method).toBe('GET');
    expect(result.path).toBe('/health');
  });
});

describe('classifyRoutes', () => {
  it('classifies an array of routes', () => {
    const routes = [
      makeRoute('GET', '/health'),
      makeRoute('POST', '/login'),
      makeRoute('GET', '/users'),
    ];
    const results = classifyRoutes(routes);
    expect(results).toHaveLength(3);
    expect(results[0].classification).toBe('health');
    expect(results[1].classification).toBe('auth');
  });
});

describe('groupByClassification', () => {
  it('groups classified routes by type', () => {
    const classified = classifyRoutes([
      makeRoute('GET', '/health'),
      makeRoute('POST', '/login'),
      makeRoute('GET', '/users'),
    ]);
    const groups = groupByClassification(classified);
    expect(groups.health).toHaveLength(1);
    expect(groups.auth).toHaveLength(1);
  });

  it('includes all classification keys', () => {
    const groups = groupByClassification([]);
    expect(Object.keys(groups)).toContain('resource');
    expect(Object.keys(groups)).toContain('unknown');
  });
});

describe('formatClassificationSummary', () => {
  it('returns a non-empty summary string', () => {
    const groups = groupByClassification(
      classifyRoutes([makeRoute('GET', '/health'), makeRoute('GET', '/users')])
    );
    const summary = formatClassificationSummary(groups);
    expect(summary).toContain('Route Classification Summary');
    expect(summary).toContain('health');
  });
});
