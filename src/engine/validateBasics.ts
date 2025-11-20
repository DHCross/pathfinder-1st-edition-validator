import { PF1eStatBlock, ValidationResult, ValidationMessage } from '../types/PF1eStatBlock';
import { SizeConstants, ClassStatistics, XP_Table, CreatureTypeRules } from '../rules/pf1e-data-tables'; 

export function validateBasics(block: PF1eStatBlock): ValidationResult {
  const messages: ValidationMessage[] = [];
  let isCritical = false; // Track if we hit any red flags
  
  // --- 1. CHASSIS CALCULATION ---
  let totalHD = (block.racialHD || 0);
  let expectedBAB = 0;
  
  // Racial BAB
  if (block.racialHD && block.racialHD > 0) {
      const typeRule = CreatureTypeRules[block.type];
      if (typeRule) {
          if (typeRule.babProgression === 'fast') expectedBAB += block.racialHD;
          else if (typeRule.babProgression === 'medium') expectedBAB += Math.floor(block.racialHD * 0.75);
          else expectedBAB += Math.floor(block.racialHD * 0.5);
      } else {
           expectedBAB += Math.floor(block.racialHD * 0.75);
      }
  }

  // Class BAB
  for (const cls of block.classLevels || []) {
    const stats = ClassStatistics[cls.className];
    if (stats) {
        totalHD += cls.level;
        if (stats.babProgression === 'fast') expectedBAB += cls.level;
        else if (stats.babProgression === 'medium') expectedBAB += Math.floor(cls.level * 0.75);
        else expectedBAB += Math.floor(cls.level * 0.5);
    }
  }

  // --- 2. DERIVED STATS & SIZE MODIFIERS ---
  const sizeData = SizeConstants[block.size] || { acAttackMod: 0, cmbCmdMod: 0 };
  const strMod = Math.floor(((block.str || 10) - 10) / 2);
  const dexMod = Math.floor(((block.dex || 10) - 10) / 2);

  // A. Validate BAB (Critical)
  let babStatus: 'MATCH' | 'MISMATCH' = 'MATCH';
  
  if (block.bab_claimed !== undefined && block.bab_claimed !== expectedBAB) {
      babStatus = 'MISMATCH';
      isCritical = true;
      messages.push({
          category: 'basics',
          severity: 'critical', // RED ZONE
          message: `Base Attack Bonus (BAB) +${block.bab_claimed} is illegal for ${totalHD} HD. It must be +${expectedBAB} according to ${block.type} progression.`,
          expected: expectedBAB,
          actual: block.bab_claimed
      });
  }

  // B. Validate CMD (Warning/Note)
  // Calculate Expected CMD based on legal math (using EXPECTED BAB)
  const legalCMD = 10 + expectedBAB + strMod + dexMod + sizeData.cmbCmdMod;
  
  // Calculate "Source Logic" CMD (using CLAIMED BAB) - did they do the math right, even if BAB is wrong?
  const sourceMathCMD = 10 + (block.bab_claimed || 0) + strMod + dexMod + sizeData.cmbCmdMod;

  if (block.cmd_claimed) {
      if (block.cmd_claimed === legalCMD) {
          // Perfect Match
      } else if (block.cmd_claimed === sourceMathCMD && babStatus === 'MISMATCH') {
          // Their math is internally consistent, but based on bad BAB.
          messages.push({
              category: 'basics',
              severity: 'warning', // ORANGE ZONE
              message: `CMD ${block.cmd_claimed} matches the source's (incorrect) BAB of +${block.bab_claimed}. If BAB were corrected to +${expectedBAB}, CMD would be ${legalCMD}.`,
              expected: legalCMD,
              actual: block.cmd_claimed
          });
      } else {
          // It's just wrong everywhere
          isCritical = true;
          messages.push({
              category: 'basics',
              severity: 'critical', // RED ZONE
              message: `Calculated CMD is ${legalCMD} (10 + Legal BAB ${expectedBAB} + Str ${strMod} + Dex ${dexMod} + Size ${sizeData.cmbCmdMod}), but stat block claims ${block.cmd_claimed}.`,
              expected: legalCMD,
              actual: block.cmd_claimed
          });
      }
  }

  // C. Validate Feat Count
  const expectedFeats = Math.ceil(totalHD / 2); 
  const actualFeats = block.feats?.length || 0;
  
  if (actualFeats < expectedFeats) {
      messages.push({
          category: 'basics',
          severity: 'warning',
          message: `Creature has ${totalHD} HD and should have at least ${expectedFeats} feats, but only lists ${actualFeats}.`,
          expected: expectedFeats,
          actual: actualFeats
      });
  }

  // --- 3. XP & CR VALIDATION ---
  const expectedXP = XP_Table[block.cr as string]; 
  if (expectedXP && block.xp !== expectedXP) {
      isCritical = true;
      messages.push({
          category: 'basics',
          severity: 'critical',
          message: `XP ${block.xp} does not match canonical value ${expectedXP} for CR ${block.cr}. (Source: Core Rulebook Experience Point Awards table)`,
          expected: expectedXP,
          actual: block.xp
        }); 
  }

  return {
    valid: !isCritical,
    status: isCritical ? 'FAIL' : (messages.length > 0 ? 'WARN' : 'PASS'),
    messages: messages,
  };
}

export default validateBasics;
