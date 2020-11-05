import { adjectives, gerunds, nouns } from './prompts';

function randomChoice(arr) {
  return arr[Math.floor(arr.length * Math.random())];
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

// Return a random prompt
export function getRandomPrompt() {
  const format = randomChoice(formats);
  return format(
    randomChoice(adjectives).toLowerCase(),
    randomChoice(gerunds).toLowerCase(),
    randomChoice(nouns).toLowerCase(),
    randomChoice(nouns).toLowerCase()
  );
}

// Return a list of n unique prompts
export function getUniquePrompts(nPrompts) {
  const prompts = [];

  while (prompts.length < nPrompts) {
    const newPrompt = getRandomPrompt();

    if (!prompts.includes(newPrompt)) {
      prompts.push(newPrompt);
    }
  }

  return prompts;
}
