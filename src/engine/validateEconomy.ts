// src/engine/validateEconomy.ts

import type { PF1eStatBlock, ValidationMessage, ValidationResult } from '../types/PF1eStatBlock';
import { WealthByLevel, TreasureByCR, ClassStatistics } from '../rules/pf1e-data-tables';

/**
 * Validates a creature's economy/wealth based on the Three Economic Tiers:
 * - Tier A: Heroic NPCs (PC classes) - use WealthByLevel.heroicNpc
 * - Tier B: Basic NPCs (NPC classes) - use WealthByLevel.basicNpc
 * - Tier C: Monsters (racial HD) - use TreasureByCR
 */
export function validateEconomy(statBlock: PF1eStatBlock): ValidationResult {
  const messages: ValidationMessage[] = [];

  // Skip validation if no gear value is provided
  if (statBlock.gearValue === undefined) {
    return {
      valid: true,
      messages: [
        {
          severity: 'info',
          category: 'economy',
          message: 'No gear value provided; skipping economy validation.',
        },
      ],
    };
  }

  // Determine economic tier
  const tier = determineEconomicTier(statBlock);
  const expectedWealth = getExpectedWealth(statBlock, tier);

  if (expectedWealth === null) {
    messages.push({
      severity: 'warning',
      category: 'economy',
      message: `Unable to determine expected wealth for ${tier} tier.`,
    });
    return { valid: true, messages };
  }

  // Calculate deviation
  const actualWealth = statBlock.gearValue;
  const deviation = actualWealth - expectedWealth;
  const deviationPercent = (deviation / expectedWealth) * 100;

  // Tolerance: ±15% is considered "on target"
  const TOLERANCE_PERCENT = 15;

  if (Math.abs(deviationPercent) <= TOLERANCE_PERCENT) {
    messages.push({
      severity: 'info',
      category: 'economy',
      message: `Wealth is on target for ${tier} (${actualWealth} gp vs expected ${expectedWealth} gp).`,
      expected: expectedWealth,
      actual: actualWealth,
    });
  } else if (deviationPercent > TOLERANCE_PERCENT) {
    messages.push({
      severity: 'warning',
      category: 'economy',
      message: `Over-geared: ${tier} has ${actualWealth} gp, expected ~${expectedWealth} gp (+${deviationPercent.toFixed(1)}%).`,
      expected: expectedWealth,
      actual: actualWealth,
    });
  } else {
    messages.push({
      severity: 'warning',
      category: 'economy',
      message: `Under-geared: ${tier} has ${actualWealth} gp, expected ~${expectedWealth} gp (${deviationPercent.toFixed(1)}%).`,
      expected: expectedWealth,
      actual: actualWealth,
    });
  }

  return {
    valid: Math.abs(deviationPercent) <= TOLERANCE_PERCENT,
    messages,
  };
}

/**
 * Determine which economic tier the creature belongs to:
 * - Heroic NPC: Has PC class levels >= racial HD
 * - Basic NPC: Has NPC class levels
 * - Monster: Primarily racial HD
 */
function determineEconomicTier(statBlock: PF1eStatBlock): string {
  // If explicitly set, use that
  if (statBlock.economicTier) {
    return statBlock.economicTier;
  }

  const racialHD = statBlock.racialHD || 0;
  const classLevels = statBlock.classLevels || [];

  // NPC class names
  const npcClasses = ['Warrior', 'Expert', 'Commoner', 'Adept', 'Aristocrat'];

  // Check for PC classes
  const pcClassLevels = classLevels.filter((cl) => !npcClasses.includes(cl.className));
  const totalPCLevels = pcClassLevels.reduce((sum, cl) => sum + cl.level, 0);

  // Check for NPC classes
  const npcClassLevels = classLevels.filter((cl) => npcClasses.includes(cl.className));
  const totalNPCLevels = npcClassLevels.reduce((sum, cl) => sum + cl.level, 0);

  if (totalPCLevels >= racialHD && totalPCLevels > 0) {
    return 'Heroic NPC';
  } else if (totalNPCLevels > 0) {
    return 'Basic NPC';
  } else {
    return 'Monster';
  }
}

/**
 * Get the expected wealth for a creature based on its tier.
 * - Heroic NPC / Basic NPC: Look up by effective level in WealthByLevel
 * - Monster: Look up by CR in TreasureByCR (medium track)
 */
function getExpectedWealth(statBlock: PF1eStatBlock, tier: string): number | null {
  if (tier === 'Heroic NPC') {
    const effectiveLevel = calculateEffectiveLevel(statBlock);
    if (effectiveLevel < 1 || effectiveLevel > 20) return null;
    return WealthByLevel.heroicNpc[effectiveLevel as keyof typeof WealthByLevel.heroicNpc] || null;
  }

  if (tier === 'Basic NPC') {
    const effectiveLevel = calculateEffectiveLevel(statBlock);
    if (effectiveLevel < 1 || effectiveLevel > 20) return null;
    return WealthByLevel.basicNpc[effectiveLevel as keyof typeof WealthByLevel.basicNpc] || null;
  }

  if (tier === 'Monster') {
    // For monsters, use TreasureByCR based on the creature's CR
    const cr = statBlock.cr;
    const treasureEntry = TreasureByCR[cr];

    if (!treasureEntry) {
      return null;
    }

    // Use the "medium" progression by default
    // Apply treasure type multiplier if specified
    let baseValue = treasureEntry.medium;

    if (statBlock.treasureType === 'Double') {
      baseValue *= 2;
    } else if (statBlock.treasureType === 'Triple') {
      baseValue *= 3;
    } else if (statBlock.treasureType === 'Incidental') {
      baseValue *= 0.5;
    } else if (statBlock.treasureType === 'None') {
      baseValue = 0;
    }

    return baseValue;
  }

  return null;
}

/**
 * Calculate the effective level for NPC wealth lookup.
 * Effective Level = Racial HD + Total Class Levels
 */
function calculateEffectiveLevel(statBlock: PF1eStatBlock): number {
  // Use claimed effective level if provided
  if (statBlock.claimedEffectiveLevel !== undefined) {
    return statBlock.claimedEffectiveLevel;
  }

  const racialHD = statBlock.racialHD || 0;
  const classLevels = statBlock.classLevels || [];
  const totalClassLevels = classLevels.reduce((sum, cl) => sum + cl.level, 0);

  return racialHD + totalClassLevels;
}
