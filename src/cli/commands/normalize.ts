import { Command } from 'commander';
import { parseRoutes } from '../../parser';
import { normalizeAndDeduplicate, printNormalizeSummary, NormalizeOptions } from '../../normalize';
import { printSorted } from '../../sort';

export function registerNormalizeCommand(program: Command): void {
  program
    .command('normalize <path>')
    .description('Normalize and optionally deduplicate routes from a file or directory')
    .option('--lowercase-methods', 'Output methods in lowercase', false)
    .option(
      '--trailing-slash <mode>',
      'Trailing slash mode: add | remove | preserve',
      'remove'
    )
    .option('--no-collapse-slashes', 'Disable collapsing of consecutive slashes')
    .option('--dedupe', 'Remove duplicate routes after normalization', false)
    .option('--sort', 'Sort output routes', false)
    .option('--json', 'Output result as JSON', false)
    .action(async (sourcePath: string, opts) => {
      try {
        const routes = await parseRoutes(sourcePath);

        const normalizeOptions: NormalizeOptions = {
          lowercaseMethods: opts.lowercaseMethods,
          trailingSlash: opts.trailingSlash as 'add' | 'remove' | 'preserve',
          collapseSlashes: opts.collapseSlashes !== false,
        };

        const result = normalizeAndDeduplicate(routes, normalizeOptions);

        if (opts.json) {
          console.log(JSON.stringify(result.routes, null, 2));
          return;
        }

        printNormalizeSummary(routes, result);

        if (opts.sort) {
          printSorted(result.routes, { by: 'path' });
        } else {
          result.routes.forEach((r) => {
            console.log(`  ${r.method.padEnd(7)} ${r.path}`);
          });
        }
      } catch (err) {
        console.error('Error during normalization:', (err as Error).message);
        process.exit(1);
      }
    });
}
