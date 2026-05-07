import { Command } from 'commander';
import { parseRoutes } from '../../parser';
import { applyPriorities, printPrioritySummary, PriorityRule } from '../../priority';

export function registerPriorityCommand(program: Command): void {
  program
    .command('priority <path>')
    .description('Assign and display route priorities based on configurable rules')
    .option('-m, --method <method>', 'Match routes by HTTP method')
    .option('-p, --prefix <prefix>', 'Match routes by path prefix')
    .option('--pattern <pattern>', 'Match routes by path regex pattern')
    .option('--score <number>', 'Priority score to assign to matched routes', '10')
    .option('--label <label>', 'Label for the priority rule')
    .option('--top <n>', 'Show only top N routes by priority', '0')
    .option('--json', 'Output as JSON')
    .action(async (routePath, options) => {
      const routes = await parseRoutes(routePath);

      const rule: PriorityRule = {
        match: {
          ...(options.method ? { method: options.method } : {}),
          ...(options.prefix ? { pathPrefix: options.prefix } : {}),
          ...(options.pattern ? { pathPattern: options.pattern } : {}),
        },
        priority: parseInt(options.score, 10),
        label: options.label,
      };

      const rules: PriorityRule[] = Object.keys(rule.match).length > 0 ? [rule] : [];
      const prioritized = applyPriorities(routes, rules);

      const topN = parseInt(options.top, 10);
      const output = topN > 0 ? prioritized.slice(0, topN) : prioritized;

      if (options.json) {
        console.log(JSON.stringify(output, null, 2));
      } else {
        printPrioritySummary(routes, rules);
      }
    });
}
