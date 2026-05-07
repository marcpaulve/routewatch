import { Route } from '../index';
import {
  TransformRule,
  TransformSummary,
  transformRoutes,
  getTransformedRoutes,
} from './routeTransformer';

export { TransformRule, TransformSummary } from './routeTransformer';

export function applyTransforms(
  routes: Route[],
  rules: TransformRule[]
): { routes: Route[]; summary: TransformSummary } {
  const summary = transformRoutes(routes, rules);
  return { routes: getTransformedRoutes(summary), summary };
}

export function printTransformSummary(summary: TransformSummary): void {
  console.log(`\nTransform Summary`);
  console.log(`  Total   : ${summary.total}`);
  console.log(`  Changed : ${summary.changed}`);
  console.log(`  Removed : ${summary.removed}`);
  console.log(`  Unchanged: ${summary.unchanged}`);

  const changed = summary.results.filter((r) => r.changed);
  if (changed.length > 0) {
    console.log(`\nChanged routes:`);
    for (const r of changed) {
      if (r.transformed === null) {
        console.log(
          `  [-] ${r.original.method.toUpperCase()} ${r.original.path} (removed by '${r.ruleName}')`
        );
      } else {
        console.log(
          `  [~] ${r.original.method.toUpperCase()} ${r.original.path} -> ${r.transformed.method.toUpperCase()} ${r.transformed.path} (via '${r.ruleName}')`
        );
      }
    }
  }
}
