import { PF1eStatBlock } from '../types/PF1eStatBlock';
import { ClassStatistics, SizeConstants, XP_Table, CreatureTypeRules, MonsterStatisticsByCR } from '../rules/pf1e-data-tables';

export interface FixLogEntry {
  feature: string;
  oldValue: string | number | undefined;
  newValue: string | number | undefined;
  reason: string;
  /** 'changed' means auto-fixer changed the value. 'preserved' means we kept the published value and added a note. 'warning' means a notable mismatch was detected but no change was made. */
  action?: 'changed' | 'preserved' | 'warning';
}

export interface AutoFixResult {
  block: PF1eStatBlock;
  fixes: FixLogEntry[];
}

export type FixMode = 'fix_math' | 'enforce_cr';

export function autoFixStatBlock(broken: PF1eStatBlock, mode: FixMode = 'fix_math'): AutoFixResult {
  const fixed = JSON.parse(JSON.stringify(broken)) as PF1eStatBlock;
  const fixes: FixLogEntry[] = [];

  // --- MODE 2: ENFORCE CR (Down-Scaling) ---
  if (mode === 'enforce_cr') {
    // 1. Find Target Benchmark
    const targetRow = MonsterStatisticsByCR.find(r => r.cr === fixed.cr);

    if (targetRow) {
       // 2. Calculate required HD to hit Target HP
       // Formula: TargetHP = HD * (AvgDie + ConMod)
       // HD = TargetHP / (AvgDie + ConMod)
       
       const typeRule = CreatureTypeRules[fixed.type] || { hitDieType: 8 };
       const avgDie = (typeRule.hitDieType / 2) + 0.5;
       const conMod = Math.floor((fixed.con - 10) / 2);
       const hpPerDie = Math.max(1, avgDie + conMod); // Prevent divide by zero/negative
       
       const targetHD = Math.round(targetRow.hp / hpPerDie);
       
       // Update the HD
       // If it has class levels, we assume we scale Racial HD first.
       if ((fixed.classLevels || []).length === 0) {
           const oldHD = fixed.racialHD;
           const oldHP = fixed.hp_claimed || fixed.hp;
           
           fixed.racialHD = Math.max(1, targetHD);
           // Update HP to match the new HD
           fixed.hp_claimed = Math.floor(fixed.racialHD * avgDie) + (fixed.racialHD * conMod);
           fixed.hp = fixed.hp_claimed;

           fixes.push({
             feature: 'Hit Dice & HP',
             oldValue: `${oldHD}d${typeRule.hitDieType} (${oldHP} hp)`,
             newValue: `${fixed.racialHD}d${typeRule.hitDieType} (${fixed.hp} hp)`,
             reason: `Enforcing CR ${fixed.cr} (Benchmark HP: ${targetRow.hp}). Reduced HD to match.`,
             action: 'changed'
           });
       }
    }
  }

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

  // Decide whether to overwrite the published BAB or preserve it.
  // In 'enforce_cr' mode, we ALWAYS overwrite BAB because we just changed the HD.
  const hasPublishedBAB = typeof broken.bab_claimed === 'number' && !isNaN(broken.bab_claimed);
  
  if (mode === 'enforce_cr') {
      if (fixed.bab_claimed !== expectedBAB) {
        fixes.push({
          feature: 'Base Attack Bonus',
          oldValue: fixed.bab_claimed || undefined,
          newValue: expectedBAB,
          reason: `Recalculated for new HD (${fixed.racialHD})`,
          action: 'changed'
        });
      }
      fixed.bab_claimed = expectedBAB;
      fixed.bab = expectedBAB;
  }
  else if (hasPublishedBAB) {
    // Preserve canonical published BAB even if it deviates from expectations.
    if (broken.bab_claimed !== expectedBAB) {
      fixes.push({
        feature: 'Base Attack Bonus',
        oldValue: broken.bab_claimed,
        newValue: broken.bab_claimed,
        reason: `Preserved published BAB ${broken.bab_claimed} despite expected ${expectedBAB} (${babReason.trim()})`,
        action: 'preserved'
      });
    }
    fixed.bab_claimed = broken.bab_claimed;
    fixed.bab = broken.bab_claimed;
  } else {
    // No published BAB, so auto-calc & apply
    if (fixed.bab_claimed !== expectedBAB) {
      fixes.push({
        feature: 'Base Attack Bonus',
        oldValue: fixed.bab_claimed || undefined,
        newValue: expectedBAB,
        reason: babReason.trim(),
        action: 'changed'
      });
    }
    fixed.bab_claimed = expectedBAB;
    fixed.bab = expectedBAB;
  }

  // 3. Fix CMD
  const sizeData = SizeConstants[fixed.size] || { acAttackMod: 0, cmbCmdMod: 0 };
  const strMod = Math.floor(((fixed.str ?? 10) - 10) / 2);
  const dexMod = Math.floor(((fixed.dex ?? 10) - 10) / 2);

  const expectedCMD = 10 + expectedBAB + strMod + dexMod + (sizeData.cmbCmdMod || 0);
  
  // CMD: preserve if published, otherwise apply expected.
  // In 'enforce_cr' mode, we ALWAYS overwrite CMD because we just changed BAB/Str/Dex potentially.
  const hasPublishedCMD = typeof broken.cmd_claimed === 'number' && !isNaN(broken.cmd_claimed);
  const cmdReason = `10 + BAB(${expectedBAB}) + Str(${strMod}) + Dex(${dexMod}) + Size(${sizeData.cmbCmdMod || 0})`;
  
  if (mode === 'enforce_cr') {
      if (fixed.cmd_claimed !== expectedCMD) {
        fixes.push({
          feature: 'CMD',
          oldValue: fixed.cmd_claimed || undefined,
          newValue: expectedCMD,
          reason: `Recalculated for new BAB (${expectedBAB})`,
          action: 'changed'
        });
      }
      fixed.cmd_claimed = expectedCMD;
      fixed.cmd = expectedCMD;
  }
  else if (hasPublishedCMD) {
    if (broken.cmd_claimed !== expectedCMD) {
      fixes.push({
        feature: 'CMD',
        oldValue: broken.cmd_claimed,
        newValue: broken.cmd_claimed,
        reason: `Preserved published CMD ${broken.cmd_claimed} despite expected ${expectedCMD} (${cmdReason})`,
        action: 'preserved'
      });
    }
    fixed.cmd_claimed = broken.cmd_claimed;
    fixed.cmd = broken.cmd_claimed;
  } else {
    if (fixed.cmd_claimed !== expectedCMD) {
      fixes.push({
        feature: 'CMD',
        oldValue: fixed.cmd_claimed || undefined,
        newValue: expectedCMD,
        reason: cmdReason,
        action: 'changed'
      });
    }
    fixed.cmd_claimed = expectedCMD;
    fixed.cmd = expectedCMD;
  }

  // 4. Fix CR (The "Reality Check")
  // If the monster's HP/Attack indicates it is WAY stronger than claimed, upgrade the CR.
  // This fixes the "6d10 HD at CR 1" issue by moving the CR to ~4.
  
  // Only run Reality Check in 'fix_math' mode. In 'enforce_cr' mode, we trust the CR.
  const currentHP = fixed.hp_claimed || fixed.hp;
  
  if (mode === 'fix_math' && currentHP > 0) {
      // Find current CR benchmark
      const currentCRKey = fixed.cr;
      const currentBench = MonsterStatisticsByCR.find(s => s.cr === currentCRKey);
      
        if (currentBench) {
          // If Calculated HP dramatically exceeds the benchmark, produce a warning but DO NOT change the published CR.
          if (currentHP > currentBench.hp * 1.5) {
             // Look for a reasonable matching CR for the discussion, but preserve the published value.
             for (const stats of MonsterStatisticsByCR) {
               if (currentHP >= stats.hp * 0.85 && currentHP <= stats.hp * 1.25) {
                 // Found a match (within +/- 15-25%)
                 fixes.push({
                 feature: 'Challenge Rating',
                 oldValue: fixed.cr,
                 newValue: fixed.cr,
                 reason: `HP ${currentHP} is too high for the published CR ${fixed.cr} (Benchmark: ${currentBench.hp}). Suggested match: CR ${stats.cr} (Benchmark: ${stats.hp}). Preserved published CR per authoritative source.`,
                 action: 'warning'
                 });
                 break; // Stop once we find the fit
               }
             }
          }
        }
  }

  // 5. Fix XP (Update based on the NEW CR)
  const crKey = fixed.cr.toString();

  // XP: preserve explicit XP awards in the stat block, otherwise set from CR
  const hasPublishedXP = typeof broken.xp === 'number' && !isNaN(broken.xp);
  if (hasPublishedXP) {
    // If published XP differs from canonical, record a warning but preserve.
    const canonicalXP = XP_Table[crKey];
    if (canonicalXP && canonicalXP !== broken.xp) {
      fixes.push({
        feature: 'XP Award',
        oldValue: broken.xp,
        newValue: broken.xp,
        reason: `Preserved published XP ${broken.xp} despite canonical XP ${canonicalXP} for CR ${fixed.cr}.`,
        action: 'preserved'
      });
    }
    fixed.xp = broken.xp;
  } else if (XP_Table[crKey]) {
    const oldXP = fixed.xp;
    fixed.xp = XP_Table[crKey];
    if (oldXP !== fixed.xp) {
      fixes.push({
        feature: 'XP Award',
        oldValue: oldXP || undefined,
        newValue: fixed.xp,
        reason: `Assigned canonical XP ${fixed.xp} for CR ${fixed.cr}`,
        action: 'changed'
      });
    }
  }

  return { block: fixed, fixes };
}
