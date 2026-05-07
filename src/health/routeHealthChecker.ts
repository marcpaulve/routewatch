import { Route } from '../index';

export interface HealthCheckResult {
  route: Route;
  healthy: boolean;
  issues: string[];
  score: number;
}

export interface HealthSummary {
  total: number;
  healthy: number;
  unhealthy: number;
  averageScore: number;
  results: HealthCheckResult[];
}

const SUSPICIOUS_PATHS = [/\/test/i, /\/debug/i, /\/dev/i, /\/temp/i];
const RISKY_METHODS = ['DELETE', 'PUT'];
const MAX_PATH_DEPTH = 6;
const MAX_SEGMENT_LENGTH = 40;

export function checkRouteHealth(route: Route): HealthCheckResult {
  const issues: string[] = [];
  let score = 100;

  if (!route.method || route.method.trim() === '') {
    issues.push('Missing or empty HTTP method');
    score -= 30;
  }

  if (!route.path || route.path.trim() === '') {
    issues.push('Missing or empty path');
    score -= 30;
  } else {
    if (!route.path.startsWith('/')) {
      issues.push('Path does not start with "/"');
      score -= 20;
    }

    const segments = route.path.split('/').filter(Boolean);
    if (segments.length > MAX_PATH_DEPTH) {
      issues.push(`Path depth ${segments.length} exceeds recommended max of ${MAX_PATH_DEPTH}`);
      score -= 10;
    }

    for (const seg of segments) {
      const clean = seg.startsWith(':') ? seg.slice(1) : seg;
      if (clean.length > MAX_SEGMENT_LENGTH) {
        issues.push(`Path segment "${clean.slice(0, 20)}..." is too long`);
        score -= 5;
        break;
      }
    }

    for (const pattern of SUSPICIOUS_PATHS) {
      if (pattern.test(route.path)) {
        issues.push(`Path matches suspicious pattern: ${pattern}`);
        score -= 15;
        break;
      }
    }
  }

  if (route.method && RISKY_METHODS.includes(route.method.toUpperCase())) {
    const hasDynamicSegment = route.path && route.path.includes(':');
    if (!hasDynamicSegment) {
      issues.push(`${route.method.toUpperCase()} without a dynamic segment may affect all resources`);
      score -= 10;
    }
  }

  const finalScore = Math.max(0, score);
  return {
    route,
    healthy: issues.length === 0,
    issues,
    score: finalScore,
  };
}

export function checkRoutesHealth(routes: Route[]): HealthSummary {
  const results = routes.map(checkRouteHealth);
  const healthy = results.filter(r => r.healthy).length;
  const totalScore = results.reduce((sum, r) => sum + r.score, 0);

  return {
    total: routes.length,
    healthy,
    unhealthy: routes.length - healthy,
    averageScore: routes.length > 0 ? Math.round(totalScore / routes.length) : 0,
    results,
  };
}
