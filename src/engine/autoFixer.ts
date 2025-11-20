import { PF1eStatBlock } from '../types/PF1eStatBlock';
import { ClassStatistics, SizeConstants, XP_Table, CreatureTypeRules } from '../rules/pf1e-data-tables';

export function autoFixStatBlock(broken: PF1eStatBlock): PF1eStatBlock {
  const fixed = JSON.parse(JSON.stringify(broken)) as PF1eStatBlock;

  let expectedBAB = 0;
  
  // 1. Calculate Racial BAB (if any)
  if (fixed.racialHD && fixed.racialHD > 0) {
      const typeRule = CreatureTypeRules[fixed.type]; 
      // Default to Medium if type unknown
      if (typeRule) {
          if (typeRule.babProgression === 'fast') expectedBAB += fixed.racialHD;
          else if (typeRule.babProgression === 'medium') expectedBAB += Math.floor(fixed.racialHD * 0.75);
          else expectedBAB += Math.floor(fixed.racialHD * 0.5);
      } else {
          expectedBAB += Math.floor(fixed.racialHD * 0.75);
      }
  }

  // 2. Calculate Class BAB
  const classLevels = fixed.classLevels || [];
  for (const cls of classLevels) {
    const stats = ClassStatistics[cls.className];
    if (!stats) continue;
    
    if (stats.babProgression === 'fast') expectedBAB += cls.level;
    else if (stats.babProgression === 'medium') expectedBAB += Math.floor(cls.level * 0.75);
    else expectedBAB += Math.floor(cls.level * 0.5); // Sorcerer uses Slow progression
  }

  // If we found NO data, keep the user's claimed value as a fallback
  if ((fixed.racialHD || 0) === 0 && classLevels.length === 0) {
    expectedBAB = fixed.bab_claimed ?? fixed.bab ?? 0;
  }

  fixed.bab_claimed = expectedBAB;
  fixed.bab = expectedBAB;

  // 3. Fix CMD
  const sizeData = SizeConstants[fixed.size] || { acAttackMod: 0, cmbCmdMod: 0 };
  const strMod = Math.floor(((fixed.str ?? 10) - 10) / 2);
  const dexMod = Math.floor(((fixed.dex ?? 10) - 10) / 2);

  fixed.cmd_claimed = 10 + expectedBAB + strMod + dexMod + (sizeData.cmbCmdMod || 0);
  fixed.cmd = fixed.cmd_claimed;

  // 4. Fix XP
  let crKey = fixed.cr as string;
  if (XP_Table[crKey]) {
      fixed.xp = XP_Table[crKey];
  }

  return fixed;
}
