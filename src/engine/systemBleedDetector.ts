import type { PF1eStatBlock, ValidationMessage } from '../types/PF1eStatBlock';

// Detects D&D 5e terminology or other non-PF1e system-bleed terms and returns
// ValidationMessages to be surfaced to the user.
export function detectSystemBleed(block: PF1eStatBlock): ValidationMessage[] {
  const messages: ValidationMessage[] = [];

  const sources: string[] = [];
  if (block.melee_line) sources.push(block.melee_line);
  if (block.ranged_line) sources.push(block.ranged_line);
  if (block.special_abilities_block) sources.push(block.special_abilities_block);
  if (block.spells_block) sources.push(block.spells_block);
  if (block.skills_line) sources.push(block.skills_line);
  if (block.feats && block.feats.length) sources.push(block.feats.join(', '));
  if (block.speed_line) sources.push(block.speed_line);
  if ((block as any).raw_text) sources.push((block as any).raw_text);

  const hay = sources.join('\n').toLowerCase();

  const push = (sev: ValidationMessage['severity'], category: string, message: string, expected?: any, actual?: any) => {
    messages.push({ severity: sev, category, message, expected, actual });
  };

  // Actions
  if (hay.includes('bonus action')) push('critical', 'system-bleed', 'Found "Bonus Action" terminology. Pathfinder 1e uses "Swift Action" instead.', 'Swift Action', 'Bonus Action');
  if (hay.includes('reaction')) push('critical', 'system-bleed', 'Found "Reaction" terminology. Pathfinder 1e uses "Immediate Action" or Attack of Opportunity semantics.', 'Immediate Action / AoO', 'Reaction');
  if (hay.match(/\b\baction\b\b/) && !hay.includes('standard action') && hay.includes(' action')) push('warning', 'system-bleed', 'Found ambiguous "Action" wording; prefer "Standard Action" in PF1e stat blocks.', 'Standard Action', 'Action');

  // Skills (5e → PF1e mapping)
  if (hay.includes('deception')) push('warning', 'system-bleed', 'Found 5e skill "Deception"; PF1e uses "Bluff".', 'Bluff', 'Deception');
  if (hay.includes('persuasion')) push('warning', 'system-bleed', 'Found 5e skill "Persuasion"; PF1e uses "Diplomacy" or "Intimidate" depending on context.', 'Diplomacy/Intimidate', 'Persuasion');
  if (hay.includes('insight')) push('warning', 'system-bleed', 'Found 5e skill "Insight"; PF1e uses "Sense Motive".', 'Sense Motive', 'Insight');
  if (hay.includes('athletics')) push('warning', 'system-bleed', 'Found 5e skill "Athletics"; PF1e splits these across "Climb" and "Swim" or others.', 'Climb/Swim', 'Athletics');
  if (hay.includes('acrobatics')) push('warning', 'system-bleed', 'Found "Acrobatics"—ensure usage is PF1e-conformant (Jump/Tumble context).', 'Jump/Tumble', 'Acrobatics');

  // Saves
  if (hay.includes('wisdom save') || hay.includes('wisdom saving throw')) push('critical', 'system-bleed', 'Found "Wisdom Save" wording. PF1e uses "Will" saves.', 'Will Save', 'Wisdom Save');
  if (hay.includes('dexterity save') || hay.includes('dexterity saving throw')) push('critical', 'system-bleed', 'Found "Dexterity Save" wording. PF1e uses "Reflex" saves.', 'Reflex Save', 'Dexterity Save');
  if (hay.includes('constitution save') || hay.includes('constitution saving throw')) push('critical', 'system-bleed', 'Found "Constitution Save" wording. PF1e uses "Fortitude" saves.', 'Fortitude Save', 'Constitution Save');

  // Mechanics
  if (hay.includes('advantage') || hay.includes('disadvantage')) push('critical', 'system-bleed', 'Found "Advantage/Disadvantage" mechanics text which is D&D 5e specific; translate to static bonuses/penalties for PF1e.', 'Bonus/Penalty', 'Advantage/Disadvantage');
  if (hay.includes('short rest')) push('critical', 'system-bleed', 'Found "Short Rest"—PF1e does not use the 5e short/long rest nomenclature.', 'N/A', 'Short Rest');

  // Specific nonstandard mechanics: Reflex DC grapples etc.
  if (hay.includes('reflex dc') || /reflex\s*dc\s*\d+/i.test(hay)) push('critical', 'system-bleed', 'Found a "Reflex DC" style mechanic (e.g., "Grapple Reflex DC 13"). Grapples normally use CMB/CMD in PF1e; this is nonstandard.', 'Use CMB/CMD or special ability text', 'Reflex DC Grapple');

  return messages;
}

export default detectSystemBleed;
