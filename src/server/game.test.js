import { Game, getPrompt, getUniquePrompts } from './game.js';

test('get-prompt-returns-prompt', () => {
  const prompt = getPrompt();
});

test('get-unique-prompts-returns-prompts', () => {
  const prompts = getUniquePrompts(5);
  expect(prompts.length).toBe(5);
});

test('initialise-game', () => {
  const game = new Game(101, {
    a: { name: 'tom' },
    b: { name: 'wei-zhong' },
    c: { name: 'lucas' },
  });
  expect(game.playerNames()).toBe('tom,\nwei-zhong,\nlucas,\n');
  expect(game.gameplan.length).toBe(game.nRounds);
  expect(game.gameplan[0].length).toBe(3);
});
