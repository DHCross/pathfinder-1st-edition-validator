// src/lib/pf1e-formatter.ts

import { PF1eStatBlock } from '../types/PF1eStatBlock';
import { ClassStatistics, CreatureTypeRules, SizeConstants } from '../rules/pf1e-data-tables';

export function formatPF1eStatBlock(block: PF1eStatBlock): string {
  const lines: string[] = [];

  // Helper to format stat (0 -> "—")
  const fmtStat = (val: number) => (val === 0 ? '—' : val.toString());

  // --- HEADER ---
  lines.push(`${block.name}`);
  lines.push(`CR ${block.cr}`);
  lines.push(`XP ${block.xp}`);
  
  const classStr = (block.classLevels || [])
    .map(c => `${c.className} ${c.level}`)
    .join(', ');
  
  const subtypeStr = (block.subtypes && block.subtypes.length > 0) ? ` (${block.subtypes.join(', ')})` : '';
  lines.push(`${block.alignment || 'CN'} ${block.size} ${block.type}${subtypeStr} ${classStr}`.trim());
  lines.push(`Init undefined; Senses ; Perception +0`);

  // --- DEFENSE ---
  lines.push('DEFENSE');
  
  // AC Line
  const acMods = [];
  if (block.touch_ac_claimed || block.touch) acMods.push(`touch ${block.touch_ac_claimed || block.touch}`);
  if (block.flat_footed_ac_claimed || block.flatFooted) acMods.push(`flat-footed ${block.flat_footed_ac_claimed || block.flatFooted}`);
  lines.push(`AC ${block.ac_claimed || block.ac}${acMods.length > 0 ? ', ' + acMods.join(', ') : ''}`);
  lines.push(`hp ${block.hp} (${block.hd})`);
  
  const saves = `Fort +${block.fort}, Ref +${block.ref}, Will +${block.will}`;
  lines.push(saves);
  
  // Defensive abilities would go here if parsed

  // --- OFFENSE ---
  lines.push('OFFENSE');
  
  // Use preservation fields for offense
  if (block.speed_line) lines.push(block.speed_line);
  if (block.melee_line) lines.push(block.melee_line);
  if (block.ranged_line) lines.push(block.ranged_line);
  if (block.special_attacks_line) lines.push(block.special_attacks_line);
  
  // Spells would go here (complex to format, skipping for now)

  // --- STATISTICS ---
  lines.push('STATISTICS');
  lines.push(`Str ${fmtStat(block.str)}, Dex ${fmtStat(block.dex)}, Con ${fmtStat(block.con)}, Int ${fmtStat(block.int)}, Wis ${fmtStat(block.wis)}, Cha ${fmtStat(block.cha)}`);
  
  lines.push(`Base Atk +${block.bab_claimed}; CMB ${block.cmb_claimed}; CMD ${block.cmd_claimed}`);
  
  if (block.feats && block.feats.length > 0) {
      lines.push(`Feats ${block.feats.join(', ')}`);
  }
  
  if (block.skills_line) {
      lines.push(block.skills_line);
  }
  
  if (block.languages_line) {
      lines.push(block.languages_line);
  }
  
  // Equipment
  if (block.equipment_line) {
      lines.push(block.equipment_line);
  }

  // --- ECOLOGY ---
  lines.push('ECOLOGY');
  lines.push(`Environment ${block.economicTier || 'any'}`);
  lines.push(`Organization solitary`);
  lines.push(`Treasure ${block.treasureType || 'standard'}`);

  // --- SPECIAL ABILITIES ---
  if (block.special_abilities_block) {
      lines.push('SPECIAL ABILITIES');
      lines.push(block.special_abilities_block);
  }

  return lines.join('\n');
}
