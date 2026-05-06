import { Route } from '../index';
import { scoreRoutes, RouteScore } from './routeScorer';

export { RouteScore, ScoreBreakdown } from './routeScorer';

export function computeScores(routes: Route[]): RouteScore[] {
  return scoreRoutes(routes);
}

export function printScoreSummary(scores: RouteScore[]): void {
  console.log(`\nRoute Scores (${scores.length} routes):\n`);
  for (const { route, score, breakdown } of scores) {
    console.log(
      `  [${score.toString().padStart(3)}] ${route.method.padEnd(7)} ${route.path}`
    );
    console.log(
      `         method=${breakdown.methodScore} path=${breakdown.pathScore} ` +
      `dynamic=+${breakdown.dynamicSegmentBonus} complexity=-${breakdown.complexityPenalty}`
    );
  }
}

export function getTopRoutes(routes: Route[], n = 5): RouteScore[] {
  return computeScores(routes).slice(0, n);
}

export function getLowScoreRoutes(routes: Route[], threshold = 5): RouteScore[] {
  return computeScores(routes).filter((s) => s.score < threshold);
}
