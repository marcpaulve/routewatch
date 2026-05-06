import { Command } from 'commander';
import { registerMockCommand } from './mock';
import * as parser from '../../parser';
import * as mockIndex from '../../mock';

function buildProgram(): Command {
  const program = new Command();
  program.exitOverride();
  registerMockCommand(program);
  return program;
}

describe('registerMockCommand', () => {
  let parseSpy: jest.SpyInstance;
  let generateSpy: jest.SpyInstance;
  let printSpy: jest.SpyInstance;
  let saveSpy: jest.SpyInstance;

  beforeEach(() => {
    parseSpy = jest.spyOn(parser, 'parseRoutes').mockResolvedValue([
      { method: 'GET', path: '/items' },
      { method: 'POST', path: '/items' },
    ]);
    generateSpy = jest.spyOn(mockIndex, 'generateMocks').mockReturnValue([
      { method: 'GET', path: '/items', statusCode: 200, responseBody: [] },
      { method: 'POST', path: '/items', statusCode: 201, responseBody: { id: 1 } },
    ]);
    printSpy = jest.spyOn(mockIndex, 'printMockSummary').mockImplementation(() => {});
    saveSpy = jest.spyOn(mockIndex, 'saveMocksToFile').mockImplementation(() => {});
  });

  afterEach(() => jest.restoreAllMocks());

  it('calls parseRoutes with source', async () => {
    const program = buildProgram();
    await program.parseAsync(['node', 'test', 'mock', './src']);
    expect(parseSpy).toHaveBeenCalledWith('./src');
  });

  it('prints mock summary when no output flag', async () => {
    const program = buildProgram();
    await program.parseAsync(['node', 'test', 'mock', './src']);
    expect(printSpy).toHaveBeenCalled();
    expect(saveSpy).not.toHaveBeenCalled();
  });

  it('saves to file when --output is provided', async () => {
    const program = buildProgram();
    await program.parseAsync(['node', 'test', 'mock', './src', '--output', 'mocks.json']);
    expect(saveSpy).toHaveBeenCalledWith(expect.any(Array), 'mocks.json');
    expect(printSpy).not.toHaveBeenCalled();
  });

  it('passes status overrides to generateMocks', async () => {
    const program = buildProgram();
    await program.parseAsync(['node', 'test', 'mock', './src', '--post-status', '202']);
    expect(generateSpy).toHaveBeenCalledWith(
      expect.any(Array),
      expect.objectContaining({ statusOverrides: { POST: 202 } })
    );
  });

  it('warns when no routes found', async () => {
    parseSpy.mockResolvedValue([]);
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const program = buildProgram();
    await program.parseAsync(['node', 'test', 'mock', './src']);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('No routes found'));
    warnSpy.mockRestore();
  });
});
