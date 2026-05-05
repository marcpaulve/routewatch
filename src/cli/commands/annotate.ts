import { Command } from 'commander';
import { parseRoutes } from '../../parser';
import { applyAnnotations, printAnnotatedRoutes, printAnnotationSummary, AnnotationRule } from '../../annotate';
import * as fs from 'fs';
import * as path from 'path';

export function registerAnnotateCommand(program: Command): void {
  program
    .command('annotate <source>')
    .description('Apply annotation rules to routes from a file or directory')
    .option('-r, --rules <file>', 'Path to JSON file containing annotation rules')
    .option('-s, --summary', 'Show annotation summary grouped by key', false)
    .option('--json', 'Output annotated routes as JSON', false)
    .action(async (source: string, options) => {
      try {
        const routes = await parseRoutes(source);

        let rules: AnnotationRule[] = [];
        if (options.rules) {
          const rulesPath = path.resolve(options.rules);
          if (!fs.existsSync(rulesPath)) {
            console.error(`Rules file not found: ${rulesPath}`);
            process.exit(1);
          }
          const raw = fs.readFileSync(rulesPath, 'utf-8');
          rules = JSON.parse(raw) as AnnotationRule[];
        }

        const annotated = applyAnnotations(routes, rules);

        if (options.json) {
          console.log(JSON.stringify(annotated, null, 2));
          return;
        }

        if (options.summary) {
          printAnnotationSummary(annotated);
        } else {
          printAnnotatedRoutes(annotated);
        }
      } catch (err) {
        console.error('Error running annotate:', (err as Error).message);
        process.exit(1);
      }
    });
}
