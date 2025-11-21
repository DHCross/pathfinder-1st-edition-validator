export type PromptSeed = {
  role?: 'Villain' | 'Helper' | 'Minion';
  motivation?: string;
};

export function seedPrompt(seed: PromptSeed) {
  return `A ${seed.role ?? 'Villain'} motivated by ${seed.motivation ?? 'power'} wants to...`;
}
