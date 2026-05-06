import { Command } from 'commander';
import { registerScoreCommand } from './score';
import * as parser from '../../parser';
import * as scoreModule from '../../score';

function buildProgram(): Command {
  const program = new Command();
  program.exitOverride();
  registerScoreCommand(program);
  return program;
}

const mockRoutes = [
  { method: 'GET', path: '/users' },
  { method: 'POST', path: '/users' },
  { method: 'DELETE', path: '/users/:id/posts/:postId/comments/:commentId' },
];

describe('registerScoreCommand', () => {
  let parseRoutesSpy: jest.SpyInstance;
  let printScoreSpy: jest.SpyInstance;
  let computeScoresSpy: jest.SpyInstance;
  let getLowScoreSpy: jest.SpyInstance;

  beforeEach(() => {
    parseRoutesSpy = jest.spyOn(parser, 'parseRoutes').mockResolvedValue(mockRoutes);
    printScoreSpy = jest.spyOn(scoreModule, 'printScoreSummary').mockImplementation(() => {});
    computeScoresSpy = jest.spyOn(scoreModule, 'computeScores').mockReturnValue(
      mockRoutes.map((r) => ({ route: r, score: 8, breakdown: { methodScore: 10, pathScore: 9, complexityPenalty: 2, dynamicSegmentBonus: 0 } }))
    );
    getLowScoreSpy = jest.spyOn(scoreModule, 'getLowScoreRoutes').mockReturnValue([]);
  });

  afterEach(() => jest.restoreAllMocks());

  it('calls parseRoutes with given path', async () => {
    const program = buildProgram();
    await program.parseAsync(['score', 'src/'], { from: 'user' });
    expect(parseRoutesSpy).toHaveBeenCalledWith('src/');
  });

  it('calls printScoreSummary with scored routes', async () => {
    const program = buildProgram();
    await program.parseAsync(['score', 'src/'], { from: 'user' });
    expect(printScoreSpy).toHaveBeenCalled();
  });

  it('uses getLowScoreRoutes when --low-only is passed', async () => {
    const program = buildProgram();
    await program.parseAsync(['score', 'src/', '--low-only'], { from: 'user' });
    expect(getLowScoreSpy).toHaveBeenCalled();
    expect(computeScoresSpy).not.toHaveBeenCalled();
  });

  it('outputs JSON when --json flag is set', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const program = buildProgram();
    await program.parseAsync(['score', 'src/', '--json'], { from: 'user' });
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('score'));
    consoleSpy.mockRestore();
  });

  it('handles empty route list gracefully', async () => {
    parseRoutesSpy.mockResolvedValue([]);
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const program = buildProgram();
    await program.parseAsync(['score', 'src/'], { from: 'user' });
    expect(consoleSpy).toHaveBeenCalledWith('No routes found.');
    consoleSpy.mockRestore();
  });

  it('exits with code 1 on error', async () => {
    parseRoutesSpy.mockRejectedValue(new Error('file not found'));
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const program = buildProgram();
    await expect(program.parseAsync(['score', 'bad/path'], { from: 'user' })).rejects.toThrow();
    expect(exitSpy).toHaveBeenCalledWith(1);
    consoleSpy.mockRestore();
    exitSpy.mockRestore();
  });
});
