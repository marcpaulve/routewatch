import {
  scoreMethod,
  scorePath,
  countDynamicSegments,
  complexityPenalty,
  scoreRoute,
  scoreRoutes,
} from './routeScorer';
import { Route } from '../index';

const makeRoute = (method: string, path: string): Route => ({ method, path });

describe('scoreMethod', () => {
  it('returns highest score for GET', () => {
    expect(scoreMethod('GET')).toBe(10);
  });

  it('returns lower score for DELETE', () => {
    expect(scoreMethod('DELETE')).toBeLessThan(scoreMethod('GET'));
  });

  it('returns 1 for unknown method', () => {
    expect(scoreMethod('CUSTOM')).toBe(1);
  });

  it('is case-insensitive', () => {
    expect(scoreMethod('get')).toBe(scoreMethod('GET'));
  });
});

describe('scorePath', () => {
  it('returns 10 for root path', () => {
    expect(scorePath('/')).toBe(10);
  });

  it('decreases with depth', () => {
    expect(scorePath('/a')).toBeGreaterThan(scorePath('/a/b/c'));
  });

  it('never returns less than 1', () => {
    expect(scorePath('/a/b/c/d/e/f/g/h/i/j/k')).toBe(1);
  });
});

describe('countDynamicSegments', () => {
  it('counts colon params', () => {
    expect(countDynamicSegments('/users/:id/posts/:postId')).toBe(2);
  });

  it('counts curly brace params', () => {
    expect(countDynamicSegments('/users/{id}')).toBe(1);
  });

  it('returns 0 for static paths', () => {
    expect(countDynamicSegments('/users/list')).toBe(0);
  });
});

describe('complexityPenalty', () => {
  it('increases with depth and dynamic segments', () => {
    const shallow = complexityPenalty('/users');
    const deep = complexityPenalty('/a/b/c/d/:id');
    expect(deep).toBeGreaterThan(shallow);
  });

  it('caps at 10', () => {
    expect(complexityPenalty('/a/b/c/d/e/f/g/h/:id/:sub')).toBe(10);
  });
});

describe('scoreRoute', () => {
  it('returns a score and breakdown', () => {
    const result = scoreRoute(makeRoute('GET', '/users'));
    expect(result.score).toBeGreaterThan(0);
    expect(result.breakdown).toHaveProperty('methodScore');
    expect(result.breakdown).toHaveProperty('pathScore');
  });

  it('score is never negative', () => {
    const result = scoreRoute(makeRoute('OPTIONS', '/a/b/c/d/e/f/g/:id/:sub'));
    expect(result.score).toBeGreaterThanOrEqual(0);
  });
});

describe('scoreRoutes', () => {
  it('returns routes sorted by score descending', () => {
    const routes = [
      makeRoute('DELETE', '/a/b/c/d/:id'),
      makeRoute('GET', '/'),
      makeRoute('POST', '/users'),
    ];
    const scored = scoreRoutes(routes);
    expect(scored[0].score).toBeGreaterThanOrEqual(scored[1].score);
    expect(scored[1].score).toBeGreaterThanOrEqual(scored[2].score);
  });
});
