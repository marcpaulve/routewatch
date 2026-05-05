import { Route } from '../index';
import {
  TagRule,
  TaggedRoute,
  tagRoutes,
  groupByTag,
  summarizeTags,
} from './routeTagger';

export { TagRule, TaggedRoute };

export function applyTags(routes: Route[], rules: TagRule[]): TaggedRoute[] {
  return tagRoutes(routes, rules);
}

export function getTagGroups(
  routes: Route[],
  rules: TagRule[]
): Record<string, TaggedRoute[]> {
  const tagged = tagRoutes(routes, rules);
  return groupByTag(tagged);
}

export function printTagSummary(routes: Route[], rules: TagRule[]): void {
  const tagged = tagRoutes(routes, rules);
  const summary = summarizeTags(tagged);
  const totalTags = Object.keys(summary).filter((k) => k !== '(untagged)').length;

  console.log(`\nTag Summary (${tagged.length} routes, ${totalTags} tags)`);
  console.log('─'.repeat(40));

  const sorted = Object.entries(summary).sort((a, b) => b[1] - a[1]);
  for (const [tag, count] of sorted) {
    const bar = '█'.repeat(Math.min(count, 20));
    console.log(`  ${tag.padEnd(20)} ${String(count).padStart(3)}  ${bar}`);
  }
  console.log('');
}
