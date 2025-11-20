import { PF1eStatBlock } from '../types/PF1eStatBlock';
import { ClassStatistics, CreatureTypeRules } from '../rules/pf1e-data-tables';

export function formatPF1eStatBlock(block: PF1eStatBlock): string {
  const { name, cr, xp, size, type } = block;
  
  const getMod = (score: number) => Math.floor((score - 10) / 2);
  const fmtMod = (score: number) => (getMod(score) >= 0 ? `+${getMod(score)}` : `${getMod(score)}`);

  // Smart HD Formula
  let hpFormula = '';
  if (block.classLevels && block.classLevels.length > 0) {
      // Use Class HD (e.g., Sorcerer = d6)
      const cls = block.classLevels[0];
      const stats = ClassStatistics[cls.className];
      const hdType = stats ? stats.hitDieType : 8;
      const totalLevel = block.classLevels.reduce((sum, c) => sum + c.level, 0);
      hpFormula = `${totalLevel}d${hdType}+${getMod(block.con) * totalLevel}`;
  } else {
      // Use Racial HD
      const racialHD = block.racialHD || 1;
      // Lookup HD type by creature type (e.g. Outsider = d10)
      const typeRule = CreatureTypeRules[block.type];
      const hdType = typeRule ? typeRule.hitDieType : 8;
      hpFormula = `${racialHD}d${hdType}+${getMod(block.con) * racialHD}`;
  }

  // Format Class String (e.g. "Male Sorcerer 10")
  const classString = block.classLevels?.map(c => `${c.className} ${c.level}`).join(', ') || '';
  const typeLine = classString ? `${block.alignment || 'N'} ${size} ${type} ${classString}` : `${block.alignment || 'N'} ${size} ${type}`;

  return `
${name}
CR ${cr}
XP ${xp?.toLocaleString() || '0'}
${typeLine}
Init ${fmtMod(block.dex)}; Senses Perception +0
DEFENSE
AC ${block.ac_claimed || block.ac}, touch ${block.touch_ac_claimed || 10}, flat-footed ${block.flat_footed_ac_claimed || 10}
hp ${block.hp_claimed || block.hp} (${hpFormula})
Fort +${block.fort_save_claimed || 0}, Ref +${block.ref_save_claimed || 0}, Will +${block.will_save_claimed || 0}
OFFENSE
Speed 30 ft.
Melee weapon +${block.bab_claimed || 0} (1d8)
STATISTICS
Str ${block.str}, Dex ${block.dex}, Con ${block.con}, Int ${block.int}, Wis ${block.wis}, Cha ${block.cha}
Base Atk +${block.bab_claimed || 0}; CMB +${(block.bab_claimed || 0) + getMod(block.str)}; CMD ${block.cmd_claimed || 10}
Feats ${block.feats?.join(', ') || 'None'}
Treasure ${block.treasureType || 'Standard'}
`.trim();
}
