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
  
  const genderStr = block.gender ? `${block.gender} ` : '';
  const classStr = (block.classLevels || [])
    .map(c => `${c.className} ${c.level}`)
    .join(', ');
  
  lines.push(`${genderStr}${block.size} ${block.type} ${classStr}`.trim());
  lines.push(`Init ${block.init > 0 ? '+' : ''}${block.init}; Senses ${block.senses || ''}; Perception +${block.perception || 0}`);
  
  if (block.aura) {
      lines.push(`Aura ${block.aura}`);
  }

  // --- DEFENSE ---
  lines.push('DEFENSE');
  
  // AC Line
  const acMods = [];
  if (block.ac_mods) {
      if (block.ac_mods.touch) acMods.push(`touch ${block.ac_mods.touch}`);
      if (block.ac_mods.flat_footed) acMods.push(`flat-footed ${block.ac_mods.flat_footed}`);
  }
  lines.push(`AC ${block.ac}, ${acMods.join(', ')}`);
  lines.push(`hp ${block.hp} (${block.hd})`);
  
  const saves = `Fort +${block.fort}, Ref +${block.ref}, Will +${block.will}`;
  lines.push(saves);
  
  if (block.defensive_abilities) lines.push(`Defensive Abilities ${block.defensive_abilities}`);
  if (block.dr) lines.push(`DR ${block.dr}`);
  if (block.immune) lines.push(`Immune ${block.immune}`);
  if (block.resist) lines.push(`Resist ${block.resist}`);
  if (block.sr) lines.push(`SR ${block.sr}`);

  // --- OFFENSE ---
  lines.push('OFFENSE');
  
  // CRITICAL FIX: Use captured speed line or fallback
  const speedOutput = block.speed_line || 'Speed 30 ft.';
  lines.push(speedOutput);

  if (block.melee) lines.push(`Melee ${block.melee}`);
  if (block.ranged) lines.push(`Ranged ${block.ranged}`);
  if (block.space && block.reach) lines.push(`Space ${block.space} ft.; Reach ${block.reach} ft.`);
  if (block.special_attacks) lines.push(`Special Attacks ${block.special_attacks}`);
  
  // Spells would go here (complex to format, skipping for now)

  // --- STATISTICS ---
  lines.push('STATISTICS');
  lines.push(`Str ${fmtStat(block.str)}, Dex ${fmtStat(block.dex)}, Con ${fmtStat(block.con)}, Int ${fmtStat(block.int)}, Wis ${fmtStat(block.wis)}, Cha ${fmtStat(block.cha)}`);
  
  lines.push(`Base Atk +${block.bab_claimed}; CMB ${block.cmb_claimed}; CMD ${block.cmd_claimed}`);
  
  if (block.feats && block.feats.length > 0) {
      lines.push(`Feats ${block.feats.join(', ')}`);
  }
  
  if (block.skills && block.skills.length > 0) {
      const skillStr = block.skills.map(s => `${s.name} +${s.value}`).join(', ');
      lines.push(`Skills ${skillStr}`);
  }
  
  if (block.languages && block.languages.length > 0) {
      lines.push(`Languages ${block.languages.join(', ')}`);
  }
  
  if (block.sq) {
      lines.push(`SQ ${block.sq}`);
  }

  // --- ECOLOGY ---
  lines.push('ECOLOGY');
  lines.push(`Environment ${block.environment || 'any'}`);
  lines.push(`Organization ${block.organization || 'solitary'}`);
  lines.push(`Treasure ${block.treasure || 'standard'}`);

  // --- SPECIAL ABILITIES ---
  if (block.special_abilities && block.special_abilities.length > 0) {
      lines.push('SPECIAL ABILITIES');
      for (const ability of block.special_abilities) {
          lines.push(`${ability.name} (${ability.type}) ${ability.description}`);
      }
  }

  return lines.join('\n');
}
