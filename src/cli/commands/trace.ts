import { Command } from 'commander';
import { parseRoutes } from '../../parser';
import { traceRouteList, printTraceSummary, getTraceBySource } from '../../trace';

export function registerTraceCommand(program: Command): void {
  program
    .command('trace <path>')
    .description('Trace routes from a file or directory and display their origin metadata')
    .option('-s, --source <name>', 'filter output to a specific source name')
    .option('--json', 'output as JSON')
    .action(async (inputPath: string, options: { source?: string; json?: boolean }) => {
      try {
        const routes = await parseRoutes(inputPath);

        if (routes.length === 0) {
          console.log('No routes found.');
          process.exit(0);
        }

        let trace = traceRouteList(routes, inputPath);

        if (options.source) {
          trace = getTraceBySource(trace, options.source);
          if (trace.totalCount === 0) {
            console.log(`No routes found for source: ${options.source}`);
            process.exit(0);
          }
        }

        if (options.json) {
          console.log(JSON.stringify(trace, null, 2));
        } else {
          printTraceSummary(trace);
        }
      } catch (err) {
        console.error('Error tracing routes:', (err as Error).message);
        process.exit(1);
      }
    });
}
