import { Command } from 'commander';
import { registerDiffCommand } from './diff';
import * as parser from '../../parser';
import * as routeDiffer from '../../diff/routeDiffer';
import * as diffIndex from '../../diff';
import * as snapshotManager from '../../snapshot/snapshotManager';

jest.mock('../../parser');
jest.mock('../../diff/routeDiffer');
jest.mock('../../diff');
jest.mock('../../snapshot/snapshotManager');

const mockRoutes = [
  { method: 'GET', path: '/users' },
  { method: 'POST', path: '/users' },
];

const mockDiff = {
  added: [{ method: 'DELETE', path: '/users/:id' }],
  removed: [],
  unchanged: mockRoutes,
};

describe('diff command', () => {
  let program: Command;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let processExitSpy: jest.SpyInstance;

  beforeEach(() => {
    program = new Command();
    program.exitOverride();
    registerDiffCommand(program);

    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);

    (parser.parseRoutes as jest.Mock).mockResolvedValue(mockRoutes);
    (snapshotManager.getLatestSnapshot as jest.Mock).mockResolvedValue('snapshot-2024-01-01');
    (snapshotManager.loadSnapshot as jest.Mock).mockResolvedValue(mockRoutes);
    (routeDiffer.diffRoutes as jest.Mock).mockReturnValue(mockDiff);
    (routeDiffer.hasDifferences as jest.Mock).mockReturnValue(true);
    (diffIndex.formatDiff as jest.Mock).mockReturnValue('+ DELETE /users/:id');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should print diff when differences exist', async () => {
    await program.parseAsync(['node', 'routewatch', 'diff', './src']);
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Route diff against snapshot'));
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });

  it('should print success message when no differences', async () => {
    (routeDiffer.hasDifferences as jest.Mock).mockReturnValue(false);
    await program.parseAsync(['node', 'routewatch', 'diff', './src']);
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('No route changes detected'));
  });

  it('should exit with error if no snapshots found', async () => {
    (snapshotManager.getLatestSnapshot as jest.Mock).mockResolvedValue(null);
    await program.parseAsync(['node', 'routewatch', 'diff', './src']);
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('No snapshots found'));
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });

  it('should output JSON when --json flag is set', async () => {
    await program.parseAsync(['node', 'routewatch', 'diff', './src', '--json']);
    expect(consoleLogSpy).toHaveBeenCalledWith(JSON.stringify(mockDiff, null, 2));
  });
});
