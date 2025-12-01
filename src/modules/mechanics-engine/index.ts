export * from './types';

// Calculate HP based on HD and Constitution modifier
export function calculateHP(hd: number, con: number) {
  const conMod = Math.floor((con - 10) / 2);
  return Math.max(1, hd * (8 + conMod));
}
