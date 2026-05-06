import { Command } from 'commander';
import { parseRoutes } from '../../parser';
import { generateMocks, printMockSummary, saveMocksToFile } from '../../mock';

export function registerMockCommand(program: Command): void {
  program
    .command('mock <source>')
    .description('Generate mock route handlers from a source file or directory')
    .option('-o, --output <path>', 'Output file path (.json or .js)')
    .option('--default-status <code>', 'Default HTTP status code for all routes', parseInt)
    .option('--post-status <code>', 'Override status code for POST routes', parseInt)
    .option('--delete-status <code>', 'Override status code for DELETE routes', parseInt)
    .action(async (source: string, opts) => {
      try {
        const routes = await parseRoutes(source);
        if (routes.length === 0) {
          console.warn('No routes found in source.');
          return;
        }

        const statusOverrides: Record<string, number> = {};
        if (opts.postStatus) statusOverrides['POST'] = opts.postStatus;
        if (opts.deleteStatus) statusOverrides['DELETE'] = opts.deleteStatus;

        const mocks = generateMocks(routes, {
          defaultStatusCode: opts.defaultStatus,
          statusOverrides: Object.keys(statusOverrides).length ? statusOverrides : undefined,
        });

        if (opts.output) {
          saveMocksToFile(mocks, opts.output);
        } else {
          printMockSummary(mocks);
        }
      } catch (err) {
        console.error('Error generating mocks:', (err as Error).message);
        process.exit(1);
      }
    });
}
