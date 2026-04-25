import { Command } from 'commander';
import { parseRoutes } from '../../parser';
import { snapshotAndCompare } from '../../snapshot';
import { saveSnapshot, listSnapshots, getLatestSnapshot } from '../../snapshot/snapshotManager';
import { formatDiff } from '../../diff';

export function registerSnapshotCommand(program: Command): void {
  const snapshot = program
    .command('snapshot')
    .description('Manage route snapshots');

  snapshot
    .command('save <source>')
    .description('Save a snapshot of current routes from source file or directory')
    .option('-n, --name <name>', 'Snapshot name', 'snapshot')
    .option('-d, --snapshot-dir <dir>', 'Snapshot directory', '.routewatch')
    .action(async (source: string, options: { name: string; snapshotDir: string }) => {
      try {
        const routes = await parseRoutes(source);
        const timestamp = Date.now();
        const snapshotName = `${options.name}-${timestamp}`;
        await saveSnapshot(snapshotName, routes, options.snapshotDir);
        console.log(`✅ Snapshot saved: ${snapshotName} (${routes.length} routes)`);
      } catch (err) {
        console.error('❌ Failed to save snapshot:', (err as Error).message);
        process.exit(1);
      }
    });

  snapshot
    .command('list')
    .description('List all saved snapshots')
    .option('-d, --snapshot-dir <dir>', 'Snapshot directory', '.routewatch')
    .action(async (options: { snapshotDir: string }) => {
      try {
        const snapshots = await listSnapshots(options.snapshotDir);
        if (snapshots.length === 0) {
          console.log('No snapshots found.');
          return;
        }
        console.log(`Found ${snapshots.length} snapshot(s):`);
        snapshots.forEach((name) => console.log(`  - ${name}`));
      } catch (err) {
        console.error('❌ Failed to list snapshots:', (err as Error).message);
        process.exit(1);
      }
    });

  snapshot
    .command('compare <source>')
    .description('Compare current routes against the latest snapshot')
    .option('-d, --snapshot-dir <dir>', 'Snapshot directory', '.routewatch')
    .option('--json', 'Output diff as JSON')
    .action(async (source: string, options: { snapshotDir: string; json: boolean }) => {
      try {
        const result = await snapshotAndCompare(source, options.snapshotDir);
        if (!result) {
          console.log('No previous snapshot found. Run `snapshot save` first.');
          return;
        }
        if (options.json) {
          console.log(JSON.stringify(result.diff, null, 2));
        } else {
          console.log(formatDiff(result.diff));
        }
      } catch (err) {
        console.error('❌ Comparison failed:', (err as Error).message);
        process.exit(1);
      }
    });
}
