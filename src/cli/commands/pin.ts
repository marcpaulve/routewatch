import { Command } from 'commander';
import { parseRoutes } from '../../parser';
import { applyPins, printPinSummary } from '../../pin';
import { PinRule } from '../../pin/routePinner';

export function registerPinCommand(program: Command): void {
  program
    .command('pin <source>')
    .description('Pin specific routes by method and/or path pattern')
    .option('-m, --method <method>', 'Filter by HTTP method')
    .option('-p, --pattern <pattern>', 'Filter by path pattern (string or regex)')
    .option('-l, --label <label>', 'Label for pinned routes')
    .option('--regex', 'Treat --pattern as a regular expression')
    .option('--json', 'Output as JSON')
    .action(async (source: string, opts) => {
      try {
        const routes = await parseRoutes(source);

        const rule: PinRule = {};
        if (opts.method) rule.method = opts.method;
        if (opts.pattern) {
          rule.pathPattern = opts.regex ? new RegExp(opts.pattern) : opts.pattern;
        }
        if (opts.label) rule.label = opts.label;

        const pinned = applyPins(routes, [rule]);

        if (opts.json) {
          console.log(JSON.stringify(pinned, null, 2));
        } else {
          printPinSummary(pinned);
        }
      } catch (err) {
        console.error('Error pinning routes:', (err as Error).message);
        process.exit(1);
      }
    });
}
