import { Command } from 'commander';
import * as path from 'path';
import { parseRoutes } from '../../parser';
import { diffRoutes, hasDifferences } from '../../diff/routeDiffer';
import { formatDiff } from '../../diff';
import { loadSnapshot, getLatestSnapshot } from '../../snapshot/snapshotManager';

export function registerDiffCommand(program: Command): void {
  program
    .command('diff <sourceDir>')
    .description('Diff current routes against a saved snapshot')
    .option('-s, --snapshot <name>', 'Snapshot name to compare against (defaults to latest)')
    .option('--json', 'Output diff as JSON')
    .action(async (sourceDir: string, options: { snapshot?: string; json?: boolean }) => {
      try {
        const resolvedDir = path.resolve(process.cwd(), sourceDir);

        // Parse current routes from source directory
        const currentRoutes = await parseRoutes(resolvedDir);

        // Determine which snapshot to compare against
        let snapshotName = options.snapshot;
        if (!snapshotName) {
          snapshotName = await getLatestSnapshot();
          if (!snapshotName) {
            console.error('No snapshots found. Run `routewatch snapshot` first.');
            process.exit(1);
          }
        }

        const snapshotRoutes = await loadSnapshot(snapshotName);
        if (!snapshotRoutes) {
          console.error(`Snapshot "${snapshotName}" not found.`);
          process.exit(1);
        }

        const diff = diffRoutes(snapshotRoutes, currentRoutes);

        if (options.json) {
          console.log(JSON.stringify(diff, null, 2));
        } else {
          if (!hasDifferences(diff)) {
            console.log(`✅ No route changes detected compared to snapshot "${snapshotName}".`);
          } else {
            console.log(`📋 Route diff against snapshot "${snapshotName}":\n`);
            console.log(formatDiff(diff));
            process.exit(1);
          }
        }
      } catch (err) {
        console.error('Error running diff:', (err as Error).message);
        process.exit(1);
      }
    });
}
