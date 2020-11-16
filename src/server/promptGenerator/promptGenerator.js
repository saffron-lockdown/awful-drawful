import {
  adjectives,
  intransitiveGerunds,
  objects,
  subjects,
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
  (a, tg, itg, s1, s2, o1, o2) => `${s1} ${tg} ${article(o1)} ${o1}`,
  // adorable apple cooking a squirrel
  (a, tg, itg, s1, s2, o1, o2) => `${a} ${s1} ${tg} ${article(o1)} ${o1}`,
  // apple cooking a adorable squirrel
  (a, tg, itg, s1, s2, o1, o2) => `${s1} ${tg} ${article(a)} ${a} ${o1}`,
  // baking stick
  (a, tg, itg, s1, s2, o1) => `${itg} ${s1}`,
  (a, tg, itg, s1, s2, o1) => `${itg} ${o1}`,
  // stick baking
  (a, tg, itg, s1, s2, o1) => `${s1} ${itg}`,
  (a, tg, itg, s1, s2, o1) => `${o1} ${itg}`,
  // adorable squirrel
  (a, tg, itg, s1, s2, o1) => `${a} ${s1}`,
  (a, tg, itg, s1, s2, o1) => `${a} ${o1}`,
];

// Return a list of n unique prompts
export function getUniquePrompts(nPrompts) {
  // prompts should be unique throughout a game, so sort all prompts by random order and loop
  // through them sequentially
  const [
    adjectivesGenerator,
    transitiveGerundsGenerator,
    intransitiveGerundsGenerator,
    subjectGenerator,
    objectGenerator,
    formatsGenerator,
  ] = [
    adjectives,
    transitiveGerunds,
    intransitiveGerunds,
    subjects,
    objects,
    formats,
  ].map((arr) => {
    const shuffled = shuffle(arr);
    return loopingGet(shuffled);
  });

  const prompts = [];
  for (let i = 0; i < nPrompts; i += 1) {
    const format = formatsGenerator.next().value;
    const prompt = format(
      adjectivesGenerator.next().value.toLowerCase(),
      transitiveGerundsGenerator.next().value.toLowerCase(),
      intransitiveGerundsGenerator.next().value.toLowerCase(),
      subjectGenerator.next().value.toLowerCase(),
      subjectGenerator.next().value.toLowerCase(),
      objectGenerator.next().value.toLowerCase(),
      objectGenerator.next().value.toLowerCase()
    );
    prompts.push(prompt);
  }
  return prompts;
}
