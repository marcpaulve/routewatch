import { Command } from 'commander';
import { parseRoutes } from '../../parser';
import { applyTransforms, TransformRule, printTransformSummary } from '../../transform';
import { serializeRoutes } from '../../parser';
import * as fs from 'fs';

export function registerTransformCommand(program: Command): void {
  program
    .command('transform <source>')
    .description('Apply transformation rules to a route file')
    .option('-o, --output <file>', 'Write transformed routes to file')
    .option('--strip-prefix <prefix>', 'Remove a path prefix from all routes')
    .option('--add-prefix <prefix>', 'Add a path prefix to all routes')
    .option('--remove-method <method>', 'Remove all routes matching a method')
    .option('--uppercase-methods', 'Normalize all methods to uppercase')
    .action(async (source: string, opts) => {
      const routes = await parseRoutes(source);
      const rules: TransformRule[] = [];

      if (opts.stripPrefix) {
        rules.push({
          name: 'strip-prefix',
          transform: (r) => ({
            ...r,
            path: r.path.startsWith(opts.stripPrefix)
              ? r.path.slice(opts.stripPrefix.length) || '/'
              : r.path,
          }),
        });
      }

      if (opts.addPrefix) {
        rules.push({
          name: 'add-prefix',
          transform: (r) => ({ ...r, path: `${opts.addPrefix}${r.path}` }),
        });
      }

      if (opts.removeMethod) {
        const method = opts.removeMethod.toLowerCase();
        rules.push({
          name: `remove-${method}`,
          transform: (r) => (r.method.toLowerCase() === method ? null : r),
        });
      }

      if (opts.uppercaseMethods) {
        rules.push({
          name: 'uppercase-methods',
          transform: (r) => ({ ...r, method: r.method.toUpperCase() }),
        });
      }

      const { routes: transformed, summary } = applyTransforms(routes, rules);
      printTransformSummary(summary);

      if (opts.output) {
        fs.writeFileSync(opts.output, serializeRoutes(transformed), 'utf-8');
        console.log(`\nWrote ${transformed.length} routes to ${opts.output}`);
      }
    });
}
