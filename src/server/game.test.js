import { Game, getPrompt, getUniquePrompts } from './game.js';

test('get-prompt-returns-prompt', () => {
  getPrompt();
});

test('get-unique-prompts-returns-prompts', () => {
  const prompts = getUniquePrompts(5);
  expect(prompts.length).toBe(5);
});

test('initialise-game', () => {
  expect(new Game(101)).toBeInstanceOf(Game);
});
