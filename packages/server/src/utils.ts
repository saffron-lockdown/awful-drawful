// takes an array a copy in a random order
export function shuffle<T>(arr: T[]): T[] {
  // slice to clone
  return arr.slice(0).sort(() => Math.random() - 0.5);
}
