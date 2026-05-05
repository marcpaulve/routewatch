import { Route } from '../index';
import { mergeRoutes, summarizeMerge, MergeOptions, MergeResult } from './routeMerger';

export { MergeOptions, MergeResult };

export function mergeRouteLists(
  left: Route[],
  right: Route[],
  options?: MergeOptions
): MergeResult {
  return mergeRoutes(left, right, options);
}

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
