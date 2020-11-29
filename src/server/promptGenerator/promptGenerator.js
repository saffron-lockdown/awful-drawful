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

function addArticle(word) {
  if (['a', 'e', 'i', 'o', 'u'].includes(word.substring(0, 1).toLowerCase())) {
    return `an ${word}`;
  }
  return `a ${word}`;
}

const formats = [
  // apple cooking a squirrel
  (a, tg, itg, n, s, o) =>
    `${s.next().value} ${tg.next().value} ${addArticle(o.next().value)}`,
  // adorable apple cooking a squirrel
  (a, tg, itg, n, s, o) =>
    `${a.next().value} ${s.next().value} ${tg.next().value} ${addArticle(
      o.next().value
    )}`,
  // apple cooking an adorable squirrel
  (a, tg, itg, n, s, o) =>
    `${s.next().value} ${tg.next().value} ${addArticle(a.next().value)} ${
      o.next().value
    }`,
  // (adorable) baking stick
  (a, tg, itg, n) => `${itg.next().value} ${n.next().value}`,
  (a, tg, itg, n) => `${a.next().value} ${itg.next().value} ${n.next().value}`,

  // stick baking
  (a, tg, itg, n) => `${n.next().value} ${itg.next().value}`,

  // (adorable) squirrel
  (a, tg, itg, n) => `${a.next().value} ${n.next().value}`,
  (a, tg, itg, n) => `${n.next().value}`,

  // (adorable) chicken boy
  (a, tg, itg, n) => `${n.next().value} ${n.next().value}`,
  (a, tg, itg, n) => `${a.next().value} ${n.next().value} ${n.next().value}`,
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
    nounGenerator,
    formatsGenerator,
  ] = [
    adjectives,
    transitiveGerunds,
    intransitiveGerunds,
    subjects,
    objects,
    subjects.concat(objects),
    formats,
  ].map((arr) => {
    const shuffled = shuffle(arr);
    return loopingGet(shuffled);
  });

  const prompts = [];
  for (let i = 0; i < nPrompts; i += 1) {
    const format = formatsGenerator.next().value;
    const prompt = format(
      adjectivesGenerator,
      transitiveGerundsGenerator,
      intransitiveGerundsGenerator,
      nounGenerator,
      subjectGenerator,
      objectGenerator
    );

    // Sometimes add 'a' or 'an' to the start of the prompt
    if (Math.random() < 0.1) {
      prompts.push(addArticle(prompt).toLowerCase());
    } else {
      prompts.push(prompt.toLowerCase());
    }
  }
  return prompts;
}
