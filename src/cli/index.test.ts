import { createCLI } from './index';
import { Command } from 'commander';

jest.mock('./commands/diff', () => ({
  registerDiffCommand: jest.fn(),
}));

jest.mock('./commands/snapshot', () => ({
  registerSnapshotCommand: jest.fn(),
}));

import { registerDiffCommand } from './commands/diff';
import { registerSnapshotCommand } from './commands/snapshot';

describe('createCLI', () => {
  it('returns a Command instance', () => {
    const cli = createCLI();
    expect(cli).toBeInstanceOf(Command);
  });

  it('registers the diff command', () => {
    createCLI();
    expect(registerDiffCommand).toHaveBeenCalled();
  });

  it('registers the snapshot command', () => {
    createCLI();
    expect(registerSnapshotCommand).toHaveBeenCalled();
  });

  it('sets the program name to routewatch', () => {
    const cli = createCLI();
    expect(cli.name()).toBe('routewatch');
  });

  it('includes a help-all subcommand', () => {
    const cli = createCLI();
    const commands = cli.commands.map((c) => c.name());
    expect(commands).toContain('help-all');
  });

  it('includes diff and snapshot top-level commands via registration', () => {
    const cli = createCLI();
    // Both register fns are called with the program instance
    expect(registerDiffCommand).toHaveBeenCalledWith(cli);
    expect(registerSnapshotCommand).toHaveBeenCalledWith(cli);
  });
});
