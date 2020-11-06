import { adjectives, gerunds, nouns } from './prompts';

import { shuffle } from '../utils';

function* loopingGet(arr) {
  let index = 0;
  while (true) {
    yield arr[(index % arr.length) - 1];
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
  const [
    adjectivesIterator,
    gerundsIterator,
    nounsIterator,
    formatsIterator,
  ] = [adjectives, gerunds, nouns, formats].map((arr) => {
    const shuffled = shuffle(arr);
    return loopingGet(shuffled);
  });
  const prompts = new Array(nPrompts).map(() => {
    const format = formatsIterator.next().value;
    return format(
      adjectivesIterator.next().value.toLowerCase(),
      gerundsIterator.next().value.toLowerCase(),
      nounsIterator.next().value.toLowerCase(),
      nounsIterator.next().value.toLowerCase()
    );
  });
  return prompts;
}
