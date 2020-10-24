import { Game, getPrompt, getUniquePrompts } from './game.js';

test('get-prompt-returns-prompt', () => {
  getPrompt();
});

test('get-unique-prompts-returns-prompts', () => {
  const prompts = getUniquePrompts(5);
  expect(prompts.length).toBe(5);
});

test('initialise-game', () => {
  const game = new Game(101);
  game.addPlayer({ name: 'tom' });
  game.addPlayer({ name: 'wz' });

  expect(game.listPlayers()).toBe('tom, wz');
});
