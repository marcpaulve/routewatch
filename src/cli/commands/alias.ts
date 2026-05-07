import { Command } from 'commander';
import { parseRoutes } from '../../parser';
import { applyAliases, printAliasSummary, AliasRule } from '../../alias';

export function registerAliasCommand(program: Command): void {
  program
    .command('alias <source>')
    .description('Apply path aliases to routes extracted from a file or directory')
    .option(
      '-r, --rule <rules...>',
      'Alias rules in the format FROM:TO or FROM:TO:METHOD (e.g. /users:/members or /users:/members:GET)'
    )
    .option('--only-aliased', 'Print only aliased routes', false)
    .option('--json', 'Output as JSON', false)
    .action(async (source: string, options) => {
      const routes = await parseRoutes(source);

      const rules: AliasRule[] = (options.rule ?? []).map((r: string) => {
        const parts = r.split(':');
        if (parts.length < 2) {
          console.error(`Invalid alias rule: "${r}". Expected FROM:TO[:METHOD,...]`);
          process.exit(1);
        }
        const [from, to, methodList] = parts;
        return {
          from,
          to,
          methods: methodList ? methodList.split(',') : undefined,
        };
      });

      const aliased = applyAliases(routes, rules);
      const output = options.onlyAliased
        ? aliased.filter(r => r.alias)
        : aliased;

      if (options.json) {
        console.log(JSON.stringify(output, null, 2));
      } else {
        printAliasSummary(aliased, rules);
      }
    });
}
