import { PF1eStatBlock } from '../types/PF1eStatBlock';
import { ClassStatistics, SizeConstants, XP_Table } from '../rules/pf1e-data-tables';

export function autoFixStatBlock(broken: PF1eStatBlock): PF1eStatBlock {
  const fixed = JSON.parse(JSON.stringify(broken)) as PF1eStatBlock;

  // 1. Fix Chassis (Hit Dice & BAB)
  let totalHD = (fixed.racialHD || 0);
  let expectedBAB = 0; 

  for (const cls of (fixed.classLevels || [])) {
    const stats = ClassStatistics[cls.className];
    if (!stats) continue;
    totalHD += cls.level;

    // Apply strict BAB progression rules
    if (stats.babProgression === 'Fast') expectedBAB += cls.level;
    else if (stats.babProgression === 'Medium') expectedBAB += Math.floor(cls.level * 0.75);
    else expectedBAB += Math.floor(cls.level * 0.5);
  }

  fixed.bab_claimed = expectedBAB;
  fixed.bab = expectedBAB;

  // 2. Fix CMD (Combat Maneuver Defense)
  // CMD = 10 + BAB + Str + Dex + Size Mod
  const sizeData = SizeConstants[fixed.size] || { ac_attack: 0, special_cmb_cmd: 0 };
  const strMod = Math.floor((fixed.str - 10) / 2);
  const dexMod = Math.floor((fixed.dex - 10) / 2);
  
  // Note: special_cmb_cmd handles the specific size modifiers for maneuvers 
  // (e.g., Large gets +1 to AC/Attack but +1 to CMB/CMD, unlike 3.5e)
  fixed.cmd_claimed = 10 + expectedBAB + strMod + dexMod + sizeData.special_cmb_cmd;
  fixed.cmd = fixed.cmd_claimed;

  // 3. Fix XP based on CR (The "Rules Lawyer" Correction)
  let crKey = fixed.cr as string;
  
  // Overwrite XP with the canonical value from the table
  if (XP_Table[crKey]) {
      fixed.xp = XP_Table[crKey];
  }

  return fixed;
}
