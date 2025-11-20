import { PF1eStatBlock } from '../types/PF1eStatBlock';
import { ClassStatistics, SizeConstants, XP_Table, CreatureTypeRules, MonsterStatisticsByCR } from '../rules/pf1e-data-tables';

export interface FixLogEntry {
  feature: string;
  oldValue: string | number;
  newValue: string | number;
  reason: string;
}

export interface AutoFixResult {
  block: PF1eStatBlock;
  fixes: FixLogEntry[];
}

export function autoFixStatBlock(broken: PF1eStatBlock): AutoFixResult {
  const fixed = JSON.parse(JSON.stringify(broken)) as PF1eStatBlock;
  const fixes: FixLogEntry[] = [];

  let expectedBAB = 0;
  let babReason = '';
  
  // 1. Calculate Racial BAB (if any)
  if (fixed.racialHD && fixed.racialHD > 0) {
      const typeRule = CreatureTypeRules[fixed.type]; 
      // Default to Medium if type unknown
      if (typeRule) {
          if (typeRule.babProgression === 'fast') {
            expectedBAB += fixed.racialHD;
            babReason += `Racial HD (${fixed.racialHD} Fast) `;
          }
          else if (typeRule.babProgression === 'medium') {
            expectedBAB += Math.floor(fixed.racialHD * 0.75);
            babReason += `Racial HD (${fixed.racialHD} Medium) `;
          }
          else {
            expectedBAB += Math.floor(fixed.racialHD * 0.5);
            babReason += `Racial HD (${fixed.racialHD} Slow) `;
          }
      } else {
          // Fallback for unknown types like "Chaos-Beast" -> map to Outsider/Fast if high power, or default Medium
          // For now default to Medium to be safe, unless we mapped it in parser
          expectedBAB += Math.floor(fixed.racialHD * 0.75);
          babReason += `Racial HD (${fixed.racialHD} Default Medium) `;
      }
  }

  // 2. Calculate Class BAB
  const classLevels = fixed.classLevels || [];
  for (const cls of classLevels) {
    const stats = ClassStatistics[cls.className];
    if (!stats) continue;
    
    if (stats.babProgression === 'fast') {
      expectedBAB += cls.level;
      babReason += `${cls.className} ${cls.level} (Fast) `;
    }
    else if (stats.babProgression === 'medium') {
      expectedBAB += Math.floor(cls.level * 0.75);
      babReason += `${cls.className} ${cls.level} (Medium) `;
    }
    else {
      expectedBAB += Math.floor(cls.level * 0.5); // Sorcerer uses Slow progression
      babReason += `${cls.className} ${cls.level} (Slow) `;
    }
  }

  // If we found NO data, keep the user's claimed value as a fallback
  if ((fixed.racialHD || 0) === 0 && classLevels.length === 0) {
    expectedBAB = fixed.bab_claimed ?? fixed.bab ?? 0;
    babReason = 'No HD/Levels found, kept original';
  }

  if (fixed.bab_claimed !== expectedBAB) {
    fixes.push({
      feature: 'Base Attack Bonus',
      oldValue: fixed.bab_claimed || 0,
      newValue: expectedBAB,
      reason: babReason.trim()
    });
  }

  fixed.bab_claimed = expectedBAB;
  fixed.bab = expectedBAB;

  // 3. Fix CMD
  const sizeData = SizeConstants[fixed.size] || { acAttackMod: 0, cmbCmdMod: 0 };
  const strMod = Math.floor(((fixed.str ?? 10) - 10) / 2);
  const dexMod = Math.floor(((fixed.dex ?? 10) - 10) / 2);

  const expectedCMD = 10 + expectedBAB + strMod + dexMod + (sizeData.cmbCmdMod || 0);
  
  if (fixed.cmd_claimed !== expectedCMD) {
    fixes.push({
      feature: 'CMD',
      oldValue: fixed.cmd_claimed || 0,
      newValue: expectedCMD,
      reason: `10 + BAB(${expectedBAB}) + Str(${strMod}) + Dex(${dexMod}) + Size(${sizeData.cmbCmdMod || 0})`
    });
  }

  fixed.cmd_claimed = expectedCMD;
  fixed.cmd = fixed.cmd_claimed;

  // 4. Fix CR (The "Reality Check")
  // If the monster's HP/Attack indicates it is WAY stronger than claimed, upgrade the CR.
  // This fixes the "6d10 HD at CR 1" issue by moving the CR to ~4.
  
  const currentHP = fixed.hp_claimed || fixed.hp;
  
  if (currentHP > 0) {
      // Find current CR benchmark
      const currentCRKey = fixed.cr;
      const currentBench = MonsterStatisticsByCR.find(s => s.cr === currentCRKey);
      
      if (currentBench) {
          // If Calculated HP > 1.5x Benchmark HP, Upgrade CR.
          if (currentHP > currentBench.hp * 1.5) {
               // It's too strong. Find the right CR.
               for (const stats of MonsterStatisticsByCR) {
                   if (currentHP >= stats.hp * 0.85 && currentHP <= stats.hp * 1.25) {
                       // Found a match (within +/- 15-25%)
                       const oldCR = fixed.cr;
                       fixed.cr = stats.cr;
                       fixes.push({
                         feature: 'Challenge Rating',
                         oldValue: oldCR,
                         newValue: fixed.cr,
                         reason: `HP ${currentHP} is too high for CR ${oldCR} (Benchmark: ${currentBench.hp}). Matched CR ${fixed.cr} (Benchmark: ${stats.hp}).`
                       });
                       break; // Stop once we find the fit
                   }
               }
          }
      }
  }

  // 5. Fix XP (Update based on the NEW CR)
  const crKey = fixed.cr.toString();

  if (XP_Table[crKey]) {
      const oldXP = fixed.xp;
      fixed.xp = XP_Table[crKey];
      if (oldXP !== fixed.xp) {
        fixes.push({
          feature: 'XP Award',
          oldValue: oldXP || 0,
          newValue: fixed.xp,
          reason: `Updated to match CR ${fixed.cr}`
        });
      }
  }

  return { block: fixed, fixes };
}
