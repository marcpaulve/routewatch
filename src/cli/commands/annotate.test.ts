import { Command } from 'commander';
import { registerAnnotateCommand } from './annotate';
import * as parser from '../../parser';
import * as annotateModule from '../../annotate';

jest.mock('../../parser');
jest.mock('../../annotate');

const mockRoutes = [
  { method: 'GET', path: '/users' },
  { method: 'POST', path: '/users' },
];

const mockAnnotated = [
  { method: 'GET', path: '/users', annotations: [{ key: 'cache', value: 'true' }] },
  { method: 'POST', path: '/users', annotations: [] },
];

beforeEach(() => {
  jest.clearAllMocks();
  (parser.parseRoutes as jest.Mock).mockResolvedValue(mockRoutes);
  (annotateModule.applyAnnotations as jest.Mock).mockReturnValue(mockAnnotated);
  (annotateModule.printAnnotatedRoutes as jest.Mock).mockImplementation(() => {});
  (annotateModule.printAnnotationSummary as jest.Mock).mockImplementation(() => {});
});

function buildProgram(): Command {
  const program = new Command();
  program.exitOverride();
  registerAnnotateCommand(program);
  return program;
}

describe('registerAnnotateCommand', () => {
  it('registers the annotate command', () => {
    const program = buildProgram();
    const cmd = program.commands.find((c) => c.name() === 'annotate');
    expect(cmd).toBeDefined();
  });

  it('calls parseRoutes with the provided source', async () => {
    const program = buildProgram();
    await program.parseAsync(['node', 'test', 'annotate', './src']);
    expect(parser.parseRoutes).toHaveBeenCalledWith('./src');
  });

  it('calls applyAnnotations with empty rules when no rules file provided', async () => {
    const program = buildProgram();
    await program.parseAsync(['node', 'test', 'annotate', './src']);
    expect(annotateModule.applyAnnotations).toHaveBeenCalledWith(mockRoutes, []);
  });

  it('calls printAnnotatedRoutes by default', async () => {
    const program = buildProgram();
    await program.parseAsync(['node', 'test', 'annotate', './src']);
    expect(annotateModule.printAnnotatedRoutes).toHaveBeenCalledWith(mockAnnotated);
  });

  it('calls printAnnotationSummary when --summary flag is set', async () => {
    const program = buildProgram();
    await program.parseAsync(['node', 'test', 'annotate', './src', '--summary']);
    expect(annotateModule.printAnnotationSummary).toHaveBeenCalledWith(mockAnnotated);
    expect(annotateModule.printAnnotatedRoutes).not.toHaveBeenCalled();
  });

  it('outputs JSON when --json flag is set', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const program = buildProgram();
    await program.parseAsync(['node', 'test', 'annotate', './src', '--json']);
    expect(consoleSpy).toHaveBeenCalledWith(JSON.stringify(mockAnnotated, null, 2));
    consoleSpy.mockRestore();
  });
});
