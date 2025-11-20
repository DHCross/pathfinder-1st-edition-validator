// src/lib/pf1e-formatter.ts

import { PF1eStatBlock } from '../types/PF1eStatBlock';
import { ClassStatistics, CreatureTypeRules, SizeConstants } from '../rules/pf1e-data-tables';

export function formatPF1eStatBlock(block: PF1eStatBlock): string {
  const { name, cr, xp, size, type } = block;
  
  const alignment = block.alignment || 'N';
  
  const getMod = (score: number) => Math.floor((score - 10) / 2);
  const fmtMod = (score: number) => (getMod(score) >= 0 ? `+${getMod(score)}` : `${getMod(score)}`);

  // Smart HD Formula (Class vs Racial)
  let hpFormula = '';
  const totalClassLevel = block.classLevels?.reduce((sum, c) => sum + c.level, 0) || 0;
  
  if (totalClassLevel > 0 && (block.racialHD || 0) === 0) {
      const cls = block.classLevels![0];
      const stats = ClassStatistics[cls.className];
      const hdType = stats ? stats.hitDieType : 8;
      const totalLevel = block.classLevels!.reduce((sum, c) => sum + c.level, 0);
      hpFormula = `${totalLevel}d${hdType}+${getMod(block.con) * totalLevel}`;
  } else {
      const rHD = block.racialHD || 1;
      const typeRule = CreatureTypeRules[block.type] || { hitDieType: 8 };
      const hdType = typeRule.hitDieType;
      const totalHD = rHD + totalClassLevel;
      hpFormula = `${totalHD}d${hdType}+${getMod(block.con) * totalHD}`;
  }

  const classString = block.classLevels?.map(c => `${c.className} ${c.level}`).join(', ') || '';
  const displayType = block.subtypes && block.subtypes.length > 0 ? block.subtypes.join(', ') : type;
  const typeLine = classString ? `${alignment} ${size} ${displayType} ${classString}` : `${alignment} ${size} ${displayType}`;

  // --- RESTORE PRESERVED SECTIONS ---
  const meleeOutput = block.melee_line || `Melee weapon +${block.bab_claimed || 0} (1d8)`;
  const rangedOutput = block.ranged_line ? `${block.ranged_line}\n` : '';
  const specialAttacks = block.special_attacks_line ? `${block.special_attacks_line}\n` : '';
  const spellsOutput = block.spells_block ? `${block.spells_block}\n` : '';
  const skillsOutput = block.skills_line ? `${block.skills_line}\n` : '';
  const languagesOutput = block.languages_line ? `${block.languages_line}\n` : '';
  const gearOutput = block.equipment_line ? `${block.equipment_line}\n` : '';
  const specialAbilitiesOutput = block.special_abilities_block ? `\n${block.special_abilities_block}` : '';
  const speedOutput = block.speed_line || 'Speed 30 ft.';

  // Calculate Init (Use claimed if available, otherwise Dex mod)
  const initVal = block.init_claimed !== undefined ? (block.init_claimed >= 0 ? `+${block.init_claimed}` : `${block.init_claimed}`) : fmtMod(block.dex);
  
  // Calculate Perception (Use claimed if available, otherwise +0)
  const percVal = block.perception_claimed !== undefined ? (block.perception_claimed >= 0 ? `+${block.perception_claimed}` : `${block.perception_claimed}`) : '+0';

  // CALCULATE CMB WITH SIZE MODIFIER
  const sizeData = SizeConstants[size] || { acAttackMod: 0, cmbCmdMod: 0 };
  const cmbTotal = (block.bab_claimed || 0) + getMod(block.str) + sizeData.cmbCmdMod;
  const cmbString = cmbTotal >= 0 ? `+${cmbTotal}` : `${cmbTotal}`;

  // Helper to format stat (0 -> "—")
  const fmtStat = (val: number) => (val === 0 ? '—' : val.toString());

  return `
${name}
CR ${cr}
XP ${xp?.toLocaleString() || '0'}
${typeLine}
Init ${initVal}; Senses Perception ${percVal}
DEFENSE
AC ${block.ac_claimed || block.ac}, touch ${block.touch_ac_claimed || 10}, flat-footed ${block.flat_footed_ac_claimed || 10}
hp ${block.hp_claimed || block.hp} (${hpFormula})
Fort +${block.fort_save_claimed || 0}, Ref +${block.ref_save_claimed || 0}, Will +${block.will_save_claimed || 0}
OFFENSE
${speedOutput}
${meleeOutput}
${rangedOutput}${specialAttacks}${spellsOutput}STATISTICS
Str ${fmtStat(block.str)}, Dex ${fmtStat(block.dex)}, Con ${fmtStat(block.con)}, Int ${fmtStat(block.int)}, Wis ${fmtStat(block.wis)}, Cha ${fmtStat(block.cha)}
Base Atk +${block.bab_claimed || 0}; CMB ${cmbString}; CMD ${block.cmd_claimed || 10}
Feats ${block.feats?.join(', ') || 'None'}
${skillsOutput}${languagesOutput}${gearOutput}${specialAbilitiesOutput}
`.trim();
}
