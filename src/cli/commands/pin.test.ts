import { Command } from 'commander';
import { registerPinCommand } from './pin';
import * as parser from '../../parser';
import * as pinModule from '../../pin';

function buildProgram(): Command {
  const program = new Command();
  program.exitOverride();
  registerPinCommand(program);
  return program;
}

const mockRoutes = [
  { method: 'GET', path: '/users' },
  { method: 'POST', path: '/users' },
  { method: 'GET', path: '/health' },
];

const mockPinned = [
  { route: { method: 'GET', path: '/users' }, label: 'test', pinnedAt: '2024-01-01T00:00:00.000Z' },
  { route: { method: 'GET', path: '/health' }, label: 'test', pinnedAt: '2024-01-01T00:00:00.000Z' },
];

describe('registerPinCommand', () => {
  let parseRoutesSpy: jest.SpyInstance;
  let applyPinsSpy: jest.SpyInstance;
  let printPinSummarySpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    parseRoutesSpy = jest.spyOn(parser, 'parseRoutes').mockResolvedValue(mockRoutes);
    applyPinsSpy = jest.spyOn(pinModule, 'applyPins').mockReturnValue(mockPinned as any);
    printPinSummarySpy = jest.spyOn(pinModule, 'printPinSummary').mockImplementation(() => {});
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => jest.restoreAllMocks());

  it('calls parseRoutes with the source argument', async () => {
    const program = buildProgram();
    await program.parseAsync(['pin', './src'], { from: 'user' });
    expect(parseRoutesSpy).toHaveBeenCalledWith('./src');
  });

  it('applies pin rules with method filter', async () => {
    const program = buildProgram();
    await program.parseAsync(['pin', './src', '--method', 'GET'], { from: 'user' });
    expect(applyPinsSpy).toHaveBeenCalledWith(mockRoutes, [{ method: 'GET' }]);
  });

  it('applies pin rules with string pattern filter', async () => {
    const program = buildProgram();
    await program.parseAsync(['pin', './src', '--pattern', '/users'], { from: 'user' });
    expect(applyPinsSpy).toHaveBeenCalledWith(mockRoutes, [{ pathPattern: '/users' }]);
  });

  it('applies pin rules with regex pattern filter', async () => {
    const program = buildProgram();
    await program.parseAsync(['pin', './src', '--pattern', '/users.*', '--regex'], { from: 'user' });
    const call = applyPinsSpy.mock.calls[0];
    expect(call[1][0].pathPattern).toBeInstanceOf(RegExp);
  });

  it('applies pin rules with label', async () => {
    const program = buildProgram();
    await program.parseAsync(['pin', './src', '--label', 'critical'], { from: 'user' });
    expect(applyPinsSpy).toHaveBeenCalledWith(mockRoutes, [{ label: 'critical' }]);
  });

  it('prints pin summary by default', async () => {
    const program = buildProgram();
    await program.parseAsync(['pin', './src'], { from: 'user' });
    expect(printPinSummarySpy).toHaveBeenCalledWith(mockPinned);
  });

  it('outputs JSON when --json flag is set', async () => {
    const program = buildProgram();
    await program.parseAsync(['pin', './src', '--json'], { from: 'user' });
    expect(consoleLogSpy).toHaveBeenCalledWith(JSON.stringify(mockPinned, null, 2));
    expect(printPinSummarySpy).not.toHaveBeenCalled();
  });

  it('handles errors gracefully', async () => {
    parseRoutesSpy.mockRejectedValue(new Error('file not found'));
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    const program = buildProgram();
    await expect(program.parseAsync(['pin', './missing'], { from: 'user' })).rejects.toThrow();
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error pinning routes:', 'file not found');
    mockExit.mockRestore();
  });
});
