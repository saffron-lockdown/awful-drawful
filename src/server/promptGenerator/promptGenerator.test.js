import { getRandomPrompt, getUniquePrompts } from './promptGenerator';

test('get prompt returns prompt', () => {
  expect(typeof getRandomPrompt()).toBe('string');
});

test('get unique prompts returns prompts', () => {
  const prompts = getUniquePrompts(5);
  expect(prompts.length).toBe(5);
});
