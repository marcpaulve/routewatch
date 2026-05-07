import { Route } from '../index';
import { checkRoutesHealth, HealthSummary, HealthCheckResult } from './routeHealthChecker';

export { checkRoutesHealth, HealthSummary, HealthCheckResult };

export function runHealthCheck(routes: Route[]): HealthSummary {
  return checkRoutesHealth(routes);
}

export function getUnhealthyRoutes(summary: HealthSummary): HealthCheckResult[] {
  return summary.results.filter(r => !r.healthy);
}

export function printHealthSummary(summary: HealthSummary): void {
  console.log(`\n🏥 Route Health Check`);
  console.log(`  Total:     ${summary.total}`);
  console.log(`  Healthy:   ${summary.healthy}`);
  console.log(`  Unhealthy: ${summary.unhealthy}`);
  console.log(`  Avg Score: ${summary.averageScore}/100`);

  const unhealthy = getUnhealthyRoutes(summary);
  if (unhealthy.length > 0) {
    console.log(`\n⚠️  Issues Found:`);
    for (const result of unhealthy) {
      const label = `${result.route.method?.toUpperCase() ?? 'UNKNOWN'} ${result.route.path ?? '(no path)'}`;
      console.log(`  [${result.score}/100] ${label}`);
      for (const issue of result.issues) {
        console.log(`    - ${issue}`);
      }
    }
  } else {
    console.log(`\n✅ All routes are healthy!`);
  }
}
