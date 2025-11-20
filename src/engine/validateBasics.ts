import type { PF1eStatBlock, ValidationMessage, ValidationResult } from '../types/PF1eStatBlock';
import { SizeConstants, ClassStatistics, XP_Table, CreatureTypeRules } from '../rules/pf1e-data-tables';

/**
 * Smart basics validator adapted to this repo's data shapes.
 * - Calculates total HD and expected BAB from class levels AND racial HD
 * - Computes expected CMD using size modifiers
 * - Validates feat counts and XP vs CR (when possible)
 */
export function validateBasics(block: PF1eStatBlock | any): ValidationResult {
  const messages: ValidationMessage[] = [];

  if (!block) {
    messages.push({ severity: 'error', category: 'basics', message: 'No stat block provided.' });
    return { valid: false, messages, status: 'FAIL' } as any;
  }

  // Normalize alternate field names that sometimes appear in demo data
  const classLevels = block.classLevels || block.class_levels || [];
  const racialHD = block.racialHD ?? block.racial_hd_count ?? 0;
  const creatureType = block.type || 'Humanoid';

  // --- 1. CHASSIS CALCULATION (HD & BAB) ---
  let totalHD = 0;
  let expectedBAB = 0;

  // Racial BAB
  if (racialHD && typeof racialHD === 'number') {
    totalHD += racialHD;
    
    const typeRule = CreatureTypeRules[creatureType];
    if (typeRule) {
        if (typeRule.babProgression === 'fast') expectedBAB += racialHD;
        else if (typeRule.babProgression === 'medium') expectedBAB += Math.floor(racialHD * 0.75);
        else expectedBAB += Math.floor(racialHD * 0.5);
    } else {
        // Fallback
        expectedBAB += Math.floor(racialHD * 0.75);
    }
  }

  // Class BAB
  for (const cls of classLevels) {
    const className = cls.className || cls.class_name;
    const levelCount = cls.level ?? cls.level_count ?? cls.level_count ?? 0;
    const stats = ClassStatistics[className];

    if (!stats) {
      messages.push({
        severity: 'warning',
        category: 'basics',
        message: `Class '${className}' not found in data tables.`,
      });
      totalHD += levelCount;
      continue;
    }

    totalHD += levelCount;

    const prog = (stats.babProgression || '').toString().toLowerCase();
    if (prog === 'fast') expectedBAB += levelCount;
    else if (prog === 'medium') expectedBAB += Math.floor(levelCount * 0.75);
    else expectedBAB += Math.floor(levelCount * 0.5);
  }

  // --- 2. DERIVED STATS & SIZE MODIFIERS ---
  const sizeEntry = SizeConstants[block.size] || { acAttackMod: 0, cmbCmdMod: 0, stealthMod: 0 };
  const sizeSpecial = (sizeEntry.cmbCmdMod ?? sizeEntry.cmbCmdMod) || 0;

  const str = block.str ?? block.ability_scores?.str ?? 10;
  const dex = block.dex ?? block.ability_scores?.dex ?? 10;
  const strMod = Math.floor((str - 10) / 2);
  const dexMod = Math.floor((dex - 10) / 2);

  const expectedCMD = 10 + expectedBAB + strMod + dexMod + sizeSpecial;
  const claimedCMD = block.cmd_claimed ?? block.cmd ?? undefined;

  if (claimedCMD !== undefined && claimedCMD !== null && claimedCMD !== expectedCMD) {
    messages.push({
      severity: 'error',
      category: 'basics',
      message: `Calculated CMD is ${expectedCMD} (10 + BAB ${expectedBAB} + Str ${strMod} + Dex ${dexMod} + Size ${sizeSpecial}), but stat block claims ${claimedCMD}.`,
    });
  }

  // --- 3. FEAT COUNT ---
  // Rule: 1 feat at 1 HD, then +1 feat for every 2 HD thereafter (approximation)
  const expectedFeats = Math.ceil(totalHD / 2);
  const featsCount = (block.feats || []).length || 0;
  if (featsCount < expectedFeats) {
    messages.push({
      severity: 'warning',
      category: 'basics',
      message: `Creature has ${totalHD} HD and should have at least ${expectedFeats} feats, but only lists ${featsCount}.`,
    });
  }

  // --- 4. XP vs CR (The "Rules Lawyer" Check) ---
  const crKey = String(block.cr);
  const expectedXP = XP_Table[crKey];
  
  if (block.xp !== undefined && expectedXP !== undefined) {
    if (block.xp !== expectedXP) {
      messages.push({ 
        severity: 'warning', 
        category: 'basics', 
        message: `XP ${block.xp} does not match canonical value ${expectedXP} for CR ${crKey}. (Source: Core Rulebook Experience Point Awards table)` 
      });
    }
  }

  const hasError = messages.some((m) => m.severity === 'error');
  const hasWarning = messages.some((m) => m.severity === 'warning');

  return {
    valid: !hasError,
    messages,
    status: hasError ? 'FAIL' : hasWarning ? 'WARN' : 'PASS',
  } as any;
}

export default validateBasics;
