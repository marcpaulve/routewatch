import { Command } from 'commander';
import { registerSnapshotCommand } from './snapshot';
import * as parser from '../../parser';
import * as snapshotModule from '../../snapshot';
import * as snapshotManager from '../../snapshot/snapshotManager';
import * as diffIndex from '../../diff';

jest.mock('../../parser');
jest.mock('../../snapshot');
jest.mock('../../snapshot/snapshotManager');
jest.mock('../../diff');

const mockRoutes = [
  { method: 'GET', path: '/users', handler: 'getUsers' },
  { method: 'POST', path: '/users', handler: 'createUser' },
];

describe('registerSnapshotCommand', () => {
  let program: Command;
  let consoleSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;
  let exitSpy: jest.SpyInstance;

  beforeEach(() => {
    program = new Command();
    program.exitOverride();
    registerSnapshotCommand(program);
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    errorSpy = jest.spyOn(console, 'error').mockImplementation();
    exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    errorSpy.mockRestore();
    exitSpy.mockRestore();
  });

  describe('snapshot save', () => {
    it('saves a snapshot and logs success', async () => {
      (parser.parseRoutes as jest.Mock).mockResolvedValue(mockRoutes);
      (snapshotManager.saveSnapshot as jest.Mock).mockResolvedValue(undefined);

      await program.parseAsync(['node', 'test', 'snapshot', 'save', './src']);

      expect(parser.parseRoutes).toHaveBeenCalledWith('./src');
      expect(snapshotManager.saveSnapshot).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('✅ Snapshot saved'));
    });

    it('handles save errors gracefully', async () => {
      (parser.parseRoutes as jest.Mock).mockRejectedValue(new Error('parse error'));

      await program.parseAsync(['node', 'test', 'snapshot', 'save', './src']);

      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('❌'), 'parse error');
      expect(exitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('snapshot list', () => {
    it('lists available snapshots', async () => {
      (snapshotManager.listSnapshots as jest.Mock).mockResolvedValue(['snap-1', 'snap-2']);

      await program.parseAsync(['node', 'test', 'snapshot', 'list']);

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('2 snapshot(s)'));
    });

    it('shows message when no snapshots exist', async () => {
      (snapshotManager.listSnapshots as jest.Mock).mockResolvedValue([]);

      await program.parseAsync(['node', 'test', 'snapshot', 'list']);

      expect(consoleSpy).toHaveBeenCalledWith('No snapshots found.');
    });
  });

  describe('snapshot compare', () => {
    it('outputs formatted diff when snapshot exists', async () => {
      const mockDiff = { added: [], removed: [], changed: [] };
      (snapshotModule.snapshotAndCompare as jest.Mock).mockResolvedValue({ diff: mockDiff });
      (diffIndex.formatDiff as jest.Mock).mockReturnValue('No changes detected.');

      await program.parseAsync(['node', 'test', 'snapshot', 'compare', './src']);

      expect(consoleSpy).toHaveBeenCalledWith('No changes detected.');
    });

    it('notifies when no previous snapshot is found', async () => {
      (snapshotModule.snapshotAndCompare as jest.Mock).mockResolvedValue(null);

      await program.parseAsync(['node', 'test', 'snapshot', 'compare', './src']);

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('No previous snapshot found'));
    });
  });
});
