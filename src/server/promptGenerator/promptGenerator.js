import { adjectives, gerunds, nouns } from './prompts';

import { shuffle } from '../utils';

function* loopingGet(arr) {
  let index = 0;
  while (true) {
    yield arr[index % arr.length];
    index += 1;
  }
}

const formats = [
  // adorable apple cooking a squirrel
  (a, g, n1, n2) => `${a} ${n1} ${g} a ${n2}`,
  // apple cooking a adorable squirrel
  (a, g, n1, n2) => `${n1} ${g} a ${a} ${n2}`,
  // baking stick
  (a, g, n1) => `${g} ${n1}`,
  // stick baking
  (a, g, n1) => `${n1} ${g}`,
  // adorable squirrel
  (a, g, n1) => `${a} ${n1}`,
];

// Return a list of n unique prompts
export function getUniquePrompts(nPrompts) {
  // prompts should be unique throughout a game, so sort all prompts by random order and loop
  // through them sequentially
  const [
    adjectivesGenerator,
    gerundsGenerator,
    nounsGenerator,
    formatsGenerator,
  ] = [adjectives, gerunds, nouns, formats].map((arr) => {
    const shuffled = shuffle(arr);
    return loopingGet(shuffled);
  });

  const prompts = [];
  for (let i = 0; i < nPrompts; i += 1) {
    const format = formatsGenerator.next().value;
    const prompt = format(
      adjectivesGenerator.next().value.toLowerCase(),
      gerundsGenerator.next().value.toLowerCase(),
      nounsGenerator.next().value.toLowerCase(),
      nounsGenerator.next().value.toLowerCase()
    );
    prompts.push(prompt);
  }
  return prompts;
}
