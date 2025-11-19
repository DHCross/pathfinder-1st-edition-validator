import { PF1eStatBlock } from '../types/PF1eStatBlock';
import { ClassStatistics, SizeConstants, XP_Table } from '../rules/pf1e-data-tables';

export function autoFixStatBlock(broken: PF1eStatBlock): PF1eStatBlock {
  const fixed = JSON.parse(JSON.stringify(broken)) as PF1eStatBlock;

  // 1. Fix Chassis (Hit Dice & BAB)
  let totalHD = (fixed.racialHD || 0);
  let expectedBAB = 0;

  const classLevels = fixed.classLevels || [];
  for (const cls of classLevels) {
    const stats = ClassStatistics[cls.className];
    if (!stats) {
      // if unknown class, still count HD
      totalHD += cls.level || 0;
      continue;
    }
    totalHD += cls.level || 0;

    // Apply strict BAB progression rules
    if (stats.babProgression === 'Fast') expectedBAB += cls.level;
    else if (stats.babProgression === 'Medium') expectedBAB += Math.floor((cls.level || 0) * 0.75);
    else expectedBAB += Math.floor((cls.level || 0) * 0.5);
  }

  // If parser failed to extract HD/class info, preserve any claimed BAB instead
  if (totalHD === 0 && classLevels.length === 0) {
    expectedBAB = fixed.bab_claimed ?? fixed.bab ?? 0;
  }

  fixed.bab_claimed = expectedBAB;
  fixed.bab = expectedBAB;

  // 2. Fix CMD (Combat Maneuver Defense)
  // CMD = 10 + BAB + Str + Dex + Size Mod
  const sizeData = SizeConstants[fixed.size] || { acAttackMod: 0, cmbCmdMod: 0, stealthMod: 0 };
  const strMod = Math.floor(((fixed.str ?? 10) - 10) / 2);
  const dexMod = Math.floor(((fixed.dex ?? 10) - 10) / 2);

  // CMD = 10 + BAB + StrMod + DexMod + size CMB/CMD modifier
  fixed.cmd_claimed = 10 + expectedBAB + strMod + dexMod + (sizeData.cmbCmdMod || 0);
  fixed.cmd = fixed.cmd_claimed;

  // 3. Fix XP based on CR (The "Rules Lawyer" Correction)
  let crKey = fixed.cr as string;
  
  // Overwrite XP with the canonical value from the table
  if (XP_Table[crKey]) {
      fixed.xp = XP_Table[crKey];
  }

  return fixed;
}
