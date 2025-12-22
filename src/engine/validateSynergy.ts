// src/engine/validateSynergy.ts
// Validates feat/ability synergy and enforces Bestiary 1 Appendix 1 feat-count limits

import type { PF1eStatBlock, ValidationResult, ValidationMessage } from '../types/PF1eStatBlock';

/**
 * Feat synergy rules: maps feat names to a validation function.
 * Each function returns an error message if the feat is "wasted", or null if valid.
 */
const FEAT_SYNERGY_RULES: Record<string, (block: PF1eStatBlock) => string | null> = {
  'Weapon Finesse': (block) => {
    const dex = block.dex ?? 10;
    const str = block.str ?? 10;
    if (dex <= str) {
      return `Weapon Finesse is wasted: DEX ${dex} is not higher than STR ${str}. This is an indecisive build.`;
    }
    return null;
  },
  'Power Attack': (block) => {
    const str = block.str ?? 10;
    if (str < 13) {
      return `Power Attack requires STR 13+, but creature has STR ${str}. Illegal feat selection.`;
    }
    return null;
  },
  'Combat Expertise': (block) => {
    const int = block.int ?? 10;
    if (int < 13) {
      return `Combat Expertise requires INT 13+, but creature has INT ${int}. Illegal feat selection.`;
    }
    return null;
  },
  'Deadly Aim': (block) => {
    const dex = block.dex ?? 10;
    if (dex < 13) {
      return `Deadly Aim requires DEX 13+, but creature has DEX ${dex}. Illegal feat selection.`;
    }
    return null;
  },
  'Dodge': (block) => {
    const dex = block.dex ?? 10;
    if (dex < 13) {
      return `Dodge requires DEX 13+, but creature has DEX ${dex}. Illegal feat selection.`;
    }
    return null;
  },
  'Two-Weapon Fighting': (block) => {
    const dex = block.dex ?? 10;
    if (dex < 15) {
      return `Two-Weapon Fighting requires DEX 15+, but creature has DEX ${dex}. Illegal feat selection.`;
    }
    return null;
  },
  'Improved Two-Weapon Fighting': (block) => {
    const dex = block.dex ?? 10;
    const bab = block.bab ?? 0;
    if (dex < 17) {
      return `Improved Two-Weapon Fighting requires DEX 17+, but creature has DEX ${dex}. Illegal feat selection.`;
    }
    if (bab < 6) {
      return `Improved Two-Weapon Fighting requires BAB +6, but creature has BAB +${bab}. Illegal feat selection.`;
    }
    return null;
  },
  'Cleave': (block) => {
    const str = block.str ?? 10;
    if (str < 13) {
      return `Cleave requires STR 13+ (for Power Attack prerequisite), but creature has STR ${str}. Illegal feat chain.`;
    }
    return null;
  },
  'Great Cleave': (block) => {
    const bab = block.bab ?? 0;
    if (bab < 4) {
      return `Great Cleave requires BAB +4, but creature has BAB +${bab}. Illegal feat selection.`;
    }
    return null;
  },
  'Improved Initiative': () => null, // No prerequisites
  'Toughness': () => null, // No prerequisites
  'Alertness': () => null, // No prerequisites
  'Iron Will': () => null, // No prerequisites
  'Great Fortitude': () => null, // No prerequisites
  'Lightning Reflexes': () => null, // No prerequisites
};

/**
 * Calculate total Hit Dice from racial HD + class levels
 */
function getTotalHD(block: PF1eStatBlock): number {
  const racialHD = block.racialHD ?? 0;
  const classHD = (block.classLevels ?? []).reduce((sum, c) => sum + (c.level ?? 0), 0);
  return racialHD + classHD;
}

/**
 * Calculate legal feat count per Bestiary 1 Appendix 1:
 * Creatures get 1 feat at 1 HD, then +1 feat for every 2 HD thereafter.
 * Formula: 1 + floor((HD - 1) / 2) = floor((HD + 1) / 2)
 */
function getLegalFeatCount(hd: number): number {
  if (hd <= 0) return 0;
  return Math.floor((hd + 1) / 2);
}

/**
 * Validates a creature's feat selection for:
 * 1. Synergy: Feats that require ability score prerequisites
 * 2. Legality: Total feat count does not exceed HD-based limit
 * 3. Wasted Potential: Feats that don't match the creature's combat style
 */
export function validateSynergy(block: PF1eStatBlock): ValidationResult {
  const messages: ValidationMessage[] = [];
  const feats = block.feats ?? [];
  const totalHD = getTotalHD(block);
  const legalFeatCount = getLegalFeatCount(totalHD);

  // 1. Check feat count legality
  if (feats.length > legalFeatCount) {
    messages.push({
      severity: 'critical',
      category: 'synergy',
      message: `Illegal feat count: ${feats.length} feats claimed, but ${totalHD} HD allows only ${legalFeatCount} feats (1 + floor((HD-1)/2)).`,
      expected: legalFeatCount,
      actual: feats.length,
    });
  } else if (feats.length < legalFeatCount && feats.length > 0) {
    // Not an error, but note that creature has unused feat slots
    messages.push({
      severity: 'note',
      category: 'synergy',
      message: `Creature has ${feats.length} feats but could have up to ${legalFeatCount} for ${totalHD} HD. Consider adding more feats.`,
      expected: legalFeatCount,
      actual: feats.length,
    });
  }

  // 2. Check each feat for synergy/prerequisites
  for (const feat of feats) {
    // Normalize feat name for lookup (trim, title case)
    const normalizedFeat = feat.trim();
    
    // Check against known synergy rules
    for (const [ruleFeat, validate] of Object.entries(FEAT_SYNERGY_RULES)) {
      if (normalizedFeat.toLowerCase() === ruleFeat.toLowerCase()) {
        const error = validate(block);
        if (error) {
          messages.push({
            severity: 'warning',
            category: 'synergy',
            message: error,
            expected: `Valid prerequisites for ${ruleFeat}`,
            actual: normalizedFeat,
          });
        }
        break;
      }
    }
  }

  // 3. Combat Role Synergy Checks
  // If creature has high DEX but uses STR-based attacks and doesn't have Weapon Finesse
  const dexMod = Math.floor(((block.dex ?? 10) - 10) / 2);
  const strMod = Math.floor(((block.str ?? 10) - 10) / 2);
  
  if (dexMod > strMod + 2) {
    // DEX is significantly higher than STR
    const hasFinesse = feats.some(f => f.toLowerCase().includes('weapon finesse'));
    const hasAgileWeapon = (block.equipment_line ?? '').toLowerCase().includes('agile');
    
    if (!hasFinesse && !hasAgileWeapon) {
      messages.push({
        severity: 'note',
        category: 'synergy',
        message: `DEX ${block.dex} (+${dexMod}) is significantly higher than STR ${block.str} (+${strMod}), but creature lacks Weapon Finesse or Agile weapons. Consider adding Weapon Finesse for optimal melee attacks.`,
        expected: 'Weapon Finesse or Agile weapon',
        actual: 'Neither present',
      });
    }
  }

  // 4. Check for wasted Multiattack (requires 3+ natural attacks)
  if (feats.some(f => f.toLowerCase() === 'multiattack')) {
    const naturalAttacks = (block.melee_line ?? '').split(',').filter(a => 
      /\b(bite|claw|slam|gore|tail|wing|tentacle|hoof|talon)\b/i.test(a)
    );
    if (naturalAttacks.length < 3) {
      messages.push({
        severity: 'warning',
        category: 'synergy',
        message: `Multiattack is only beneficial with 3+ natural attacks, but only ${naturalAttacks.length} detected. Consider replacing with a more useful feat.`,
        expected: '3+ natural attacks',
        actual: naturalAttacks.length,
      });
    }
  }

  const hasError = messages.some(m => m.severity === 'critical');

  return {
    valid: !hasError,
    messages,
    status: hasError ? 'FAIL' : messages.some(m => m.severity === 'warning') ? 'WARN' : 'PASS',
  };
}

export default validateSynergy;
