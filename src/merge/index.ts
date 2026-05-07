import { Route } from '../index';
import { mergeRoutes, summarizeMerge, MergeOptions, MergeResult } from './routeMerger';

export { MergeOptions, MergeResult };

/**
 * Merges two lists of routes, identifying routes that are shared, left-only, or right-only.
 * @param left - The first list of routes.
 * @param right - The second list of routes.
 * @param options - Optional configuration for the merge behavior.
 * @returns A MergeResult containing categorized routes.
 */
export function mergeRouteLists(
  left: Route[],
  right: Route[],
  options?: MergeOptions
): MergeResult {
  return mergeRoutes(left, right, options);
}

/**
 * Prints a human-readable summary of a merge result to the console,
 * including routes that appear only in the left or right list.
 * @param result - The MergeResult to summarize.
 */
export function printMergeSummary(result: MergeResult): void {
  console.log(summarizeMerge(result));

  if (result.leftOnly.length > 0) {
    console.log('\nLeft only:');
    result.leftOnly.forEach(r => console.log(`  [${r.method.toUpperCase()}] ${r.path}`));
  }

  if (result.rightOnly.length > 0) {
    console.log('\nRight only:');
    result.rightOnly.forEach(r => console.log(`  [${r.method.toUpperCase()}] ${r.path}`));
  }
}
