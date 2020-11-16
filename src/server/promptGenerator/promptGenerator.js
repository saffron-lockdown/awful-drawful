import {
  adjectives,
  intransitiveGerunds,
  nouns,
  transitiveGerunds,
} from './prompts';

import { shuffle } from '../utils';

function* loopingGet(arr) {
  let index = 0;
  while (true) {
    yield arr[index % arr.length];
    index += 1;
  }
}

function article(word) {
  if (['a', 'e', 'i', 'o', 'u'].includes(word.substring(0, 1))) {
    return 'an';
  }
  return 'a';
}

const formats = [
  // apple cooking a squirrel
  (a, tg, itg, n1, n2) => `${n1} ${tg} ${article(n2)} ${n2}`,
  // adorable apple cooking a squirrel
  (a, tg, itg, n1, n2) => `${a} ${n1} ${tg} ${article(n2)} ${n2}`,
  // apple cooking a adorable squirrel
  (a, tg, itg, n1, n2) => `${n1} ${tg} ${article(a)} ${a} ${n2}`,
  // baking stick
  (a, tg, itg, n1) => `${itg} ${n1}`,
  // stick baking
  (a, tg, itg, n1) => `${n1} ${itg}`,
  // adorable squirrel
  (a, tg, itg, n1) => `${a} ${n1}`,
];

// Return a list of n unique prompts
export function getUniquePrompts(nPrompts) {
  // prompts should be unique throughout a game, so sort all prompts by random order and loop
  // through them sequentially
  const [
    adjectivesGenerator,
    transitiveGerundsGenerator,
    intransitiveGerundsGenerator,
    nounsGenerator,
    formatsGenerator,
  ] = [adjectives, transitiveGerunds, intransitiveGerunds, nouns, formats].map(
    (arr) => {
      const shuffled = shuffle(arr);
      return loopingGet(shuffled);
    }
  );

  const prompts = [];
  for (let i = 0; i < nPrompts; i += 1) {
    const format = formatsGenerator.next().value;
    const prompt = format(
      adjectivesGenerator.next().value.toLowerCase(),
      transitiveGerundsGenerator.next().value.toLowerCase(),
      intransitiveGerundsGenerator.next().value.toLowerCase(),
      nounsGenerator.next().value.toLowerCase(),
      nounsGenerator.next().value.toLowerCase()
    );
    prompts.push(prompt);
  }
  return prompts;
}
