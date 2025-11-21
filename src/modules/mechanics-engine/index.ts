export * from './types';

// Placeholder: basic API surface for the engine
export function calculateHP(hd: number, conMod: number) {
  return Math.max(1, (Math.ceil(hd) * (Math.max(1, (Math.ceil(hd)) ) + 0)) );
}
