import { Command } from 'commander';
import { registerTraceCommand } from './trace';
import * as parser from '../../parser';
import * as traceModule from '../../trace';

function buildProgram(): Command {
  const program = new Command();
  program.exitOverride();
  registerTraceCommand(program);
  return program;
}

const sampleRoutes = [
  { method: 'GET', path: '/api/users' },
  { method: 'POST', path: '/api/users' },
];

describe('registerTraceCommand', () => {
  let parseRoutesSpy: jest.SpyInstance;
  let printTraceSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let processExitSpy: jest.SpyInstance;

  beforeEach(() => {
    parseRoutesSpy = jest
      .spyOn(parser, 'parseRoutes')
      .mockResolvedValue(sampleRoutes);
    printTraceSpy = jest
      .spyOn(traceModule, 'printTraceSummary')
      .mockImplementation(() => {});
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    processExitSpy = jest
      .spyOn(process, 'exit')
      .mockImplementation((() => {}) as never);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('calls parseRoutes with the given path', async () => {
    const program = buildProgram();
    await program.parseAsync(['node', 'test', 'trace', './src']);
    expect(parseRoutesSpy).toHaveBeenCalledWith('./src');
  });

  it('calls printTraceSummary when routes are found', async () => {
    const program = buildProgram();
    await program.parseAsync(['node', 'test', 'trace', './src']);
    expect(printTraceSpy).toHaveBeenCalled();
  });

  it('outputs JSON when --json flag is passed', async () => {
    const program = buildProgram();
    await program.parseAsync(['node', 'test', 'trace', './src', '--json']);
    expect(consoleLogSpy).toHaveBeenCalled();
    const output = consoleLogSpy.mock.calls[0][0];
    expect(() => JSON.parse(output)).not.toThrow();
  });

  it('exits with 0 when no routes are found', async () => {
    parseRoutesSpy.mockResolvedValue([]);
    const program = buildProgram();
    await program.parseAsync(['node', 'test', 'trace', './src']);
    expect(processExitSpy).toHaveBeenCalledWith(0);
  });

  it('exits with 1 on parse error', async () => {
    parseRoutesSpy.mockRejectedValue(new Error('parse failed'));
    const program = buildProgram();
    await program.parseAsync(['node', 'test', 'trace', './src']);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error tracing routes:',
      'parse failed'
    );
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });
});
