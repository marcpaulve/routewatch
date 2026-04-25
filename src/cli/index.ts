#!/usr/bin/env node
import { Command } from 'commander';
import { registerDiffCommand } from './commands/diff';
import { registerSnapshotCommand } from './commands/snapshot';

const pkg = require('../../package.json');

export function createCLI(): Command {
  const program = new Command();

  program
    .name('routewatch')
    .description('Monitor and diff Express/Fastify route tables across deployments')
    .version(pkg.version ?? '0.0.1');

  registerDiffCommand(program);
  registerSnapshotCommand(program);

  program
    .command('help-all')
    .description('Display all available commands and options')
    .action(() => {
      program.outputHelp();
    });

  return program;
}

if (require.main === module) {
  const cli = createCLI();
  cli.parseAsync(process.argv).catch((err: Error) => {
    console.error('Fatal error:', err.message);
    process.exit(1);
  });
}
