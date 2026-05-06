import { Command } from 'commander';
import { parseRoutes } from '../../parser';
import { computeScores, printScoreSummary, getLowScoreRoutes } from '../../score';

export function registerScoreCommand(program: Command): void {
  program
    .command('score <path>')
    .description('Score routes by complexity and REST conventions')
    .option('--top <n>', 'Show only top N routes by score', '10')
    .option('--low-only', 'Show only routes below score threshold')
    .option('--threshold <n>', 'Score threshold for --low-only', '5')
    .option('--json', 'Output as JSON')
    .action(async (filePath: string, options) => {
      try {
        const routes = await parseRoutes(filePath);

        if (routes.length === 0) {
          console.log('No routes found.');
          return;
        }

        const threshold = parseInt(options.threshold, 10);
        const topN = parseInt(options.top, 10);

        let scores = options.lowOnly
          ? getLowScoreRoutes(routes, threshold)
          : computeScores(routes).slice(0, topN);

        if (options.json) {
          console.log(JSON.stringify(scores, null, 2));
          return;
        }

        printScoreSummary(scores);

        if (options.lowOnly && scores.length === 0) {
          console.log(`No routes found below score threshold of ${threshold}.`);
        }
      } catch (err) {
        console.error('Error scoring routes:', (err as Error).message);
        process.exit(1);
      }
    });
}
