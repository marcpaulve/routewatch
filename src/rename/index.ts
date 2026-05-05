import { Route } from '../index';
import {
  RenameRule,
  RenameSummary,
  renameRoutes,
  applyRenames,
} from './routeRenamer';

export { RenameRule, RenameResult, RenameSummary } from './routeRenamer';

export function renameRouteList(
  routes: Route[],
  rules: RenameRule[]
): Route[] {
  const summary = renameRoutes(routes, rules);
  return applyRenames(summary);
}

export function printRenameSummary(summary: RenameSummary): void {
  console.log(`\nRename Summary`);
  console.log(`  Total routes : ${summary.totalRoutes}`);
  console.log(`  Renamed      : ${summary.totalRenamed}`);
  console.log(`  Unchanged    : ${summary.unchanged.length}`);

  if (summary.renamed.length > 0) {
    console.log(`\nRenamed Routes:`);
    for (const result of summary.renamed) {
      const method = result.original.method.toUpperCase().padEnd(7);
      console.log(
        `  [${method}] ${result.original.path} → ${result.renamed.path}`
      );
    }
  }
}

export { renameRoutes };
