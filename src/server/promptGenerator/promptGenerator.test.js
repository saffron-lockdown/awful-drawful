import { getUniquePrompts } from './promptGenerator';

describe('get unique prompts', () => {
  test(' returns the right number of prompts', () => {
    const prompts = getUniquePrompts(8);
    expect(prompts).toHaveLength(8);
  });

  test('all prompts are unique', () => {
    const prompts = getUniquePrompts(8);
    expect([...new Set(prompts)]).toHaveLength(8);
  });
});
