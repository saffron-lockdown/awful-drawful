import { getUniquePrompts } from './promptGenerator';

test('get unique prompts returns prompts', () => {
  const prompts = getUniquePrompts(50);
  expect(prompts.length).toBe(50);
  console.log(prompts);
});
