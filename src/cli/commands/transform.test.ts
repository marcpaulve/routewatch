import { Command } from 'commander';
import { registerTransformCommand } from './transform';
import * as parser from '../../parser';
import * as transformModule from '../../transform';
import * as fs from 'fs';

function buildProgram(): Command {
  const program = new Command();
  program.exitOverride();
  registerTransformCommand(program);
  return program;
}

const mockRoutes = [
  { method: 'get', path: '/api/v1/users' },
  { method: 'post', path: '/api/v1/users' },
  { method: 'delete', path: '/api/v1/users/1' },
];

describe('registerTransformCommand', () => {
  beforeEach(() => {
    jest.spyOn(parser, 'parseRoutes').mockResolvedValue(mockRoutes);
    jest.spyOn(transformModule, 'printTransformSummary').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('registers the transform command', () => {
    const program = buildProgram();
    const cmd = program.commands.find((c) => c.name() === 'transform');
    expect(cmd).toBeDefined();
  });

  it('calls parseRoutes with source path', async () => {
    const program = buildProgram();
    await program.parseAsync(['node', 'test', 'transform', './routes.ts']);
    expect(parser.parseRoutes).toHaveBeenCalledWith('./routes.ts');
  });

  it('applies strip-prefix rule', async () => {
    const applySpy = jest
      .spyOn(transformModule, 'applyTransforms')
      .mockReturnValue({
        routes: mockRoutes,
        summary: { total: 3, changed: 3, removed: 0, unchanged: 0, results: [] },
      });
    const program = buildProgram();
    await program.parseAsync([
      'node', 'test', 'transform', './routes.ts', '--strip-prefix', '/api/v1',
    ]);
    expect(applySpy).toHaveBeenCalled();
    const [, rules] = applySpy.mock.calls[0];
    expect(rules.some((r: any) => r.name === 'strip-prefix')).toBe(true);
  });

  it('writes output file when --output is specified', async () => {
    jest.spyOn(transformModule, 'applyTransforms').mockReturnValue({
      routes: mockRoutes,
      summary: { total: 3, changed: 0, removed: 0, unchanged: 3, results: [] },
    });
    jest.spyOn(parser, 'serializeRoutes').mockReturnValue('[]');
    const writeSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
    const program = buildProgram();
    await program.parseAsync([
      'node', 'test', 'transform', './routes.ts', '--output', 'out.json',
    ]);
    expect(writeSpy).toHaveBeenCalledWith('out.json', '[]', 'utf-8');
  });
});
