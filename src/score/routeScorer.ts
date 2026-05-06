import { Route } from '../index';

export interface RouteScore {
  route: Route;
  score: number;
  breakdown: ScoreBreakdown;
}

export interface ScoreBreakdown {
  methodScore: number;
  pathScore: number;
  complexityPenalty: number;
  dynamicSegmentBonus: number;
}

const METHOD_WEIGHTS: Record<string, number> = {
  GET: 10,
  POST: 9,
  PUT: 8,
  PATCH: 7,
  DELETE: 6,
  HEAD: 4,
  OPTIONS: 3,
};

export function scoreMethod(method: string): number {
  return METHOD_WEIGHTS[method.toUpperCase()] ?? 1;
}

export function scorePath(path: string): number {
  const segments = path.split('/').filter(Boolean);
  if (segments.length === 0) return 10;
  return Math.max(10 - segments.length, 1);
}

export function countDynamicSegments(path: string): number {
  return (path.match(/:[^/]+|\{[^}]+\}/g) ?? []).length;
}

export function complexityPenalty(path: string): number {
  const depth = path.split('/').filter(Boolean).length;
  const dynamic = countDynamicSegments(path);
  return Math.min(depth + dynamic, 10);
}

export function scoreRoute(route: Route): RouteScore {
  const methodScore = scoreMethod(route.method);
  const pathScore = scorePath(route.path);
  const dynamicSegmentBonus = countDynamicSegments(route.path) * 2;
  const penalty = complexityPenalty(route.path);

  const score = methodScore + pathScore + dynamicSegmentBonus - penalty;

  return {
    route,
    score: Math.max(score, 0),
    breakdown: {
      methodScore,
      pathScore,
      complexityPenalty: penalty,
      dynamicSegmentBonus,
    },
  };
}

export function scoreRoutes(routes: Route[]): RouteScore[] {
  return routes
    .map(scoreRoute)
    .sort((a, b) => b.score - a.score);
}
