// src/lib/pf1e-formatter.ts

import { PF1eStatBlock } from '../types/PF1eStatBlock';
import { SizeConstants } from '../rules/pf1e-data-tables';

export function formatPF1eStatBlock(block: PF1eStatBlock): string {
  const lines: string[] = [];

    // Helper to format stat (undefined/null/0 -> "—")
    const fmtStat = (val?: number | null) => {
        if (val === undefined || val === null) return '—';
        if (val === 0) return '—';
        return val.toString();
    };

  // --- HEADER ---
  lines.push(`${block.name}`);
  lines.push(`CR ${block.cr}`);
  lines.push(`XP ${block.xp}`);
  
  const classStr = (block.classLevels || [])
    .map(c => `${c.className} ${c.level}`)
    .join(', ');
  
  const subtypeStr = (block.subtypes && block.subtypes.length > 0) ? ` (${block.subtypes.join(', ')})` : '';
  lines.push(`${block.alignment || 'CN'} ${block.size} ${block.type}${subtypeStr} ${classStr}`.trim());
    // INIT: prefer claimed init, else use Dex modifier
    const dexMod = Math.floor(((block.dex ?? 10) - 10) / 2);
    const initVal = block.init_claimed ?? dexMod;
    const initStr = initVal >= 0 ? `+${initVal}` : `${initVal}`;
    const perception = (block.perception_claimed !== undefined) ? `+${block.perception_claimed}` : '+0';
    lines.push(`Init ${initStr}; Perception ${perception}`.trim());

  // --- DEFENSE ---
  lines.push('DEFENSE');
  
  // AC Line
  const acMods = [];
  if (block.touch_ac_claimed || block.touch) acMods.push(`touch ${block.touch_ac_claimed || block.touch}`);
  if (block.flat_footed_ac_claimed || block.flatFooted) acMods.push(`flat-footed ${block.flat_footed_ac_claimed || block.flatFooted}`);
  lines.push(`AC ${block.ac_claimed || block.ac}${acMods.length > 0 ? ', ' + acMods.join(', ') : ''}`);
    lines.push(`hp ${fmtStat(block.hp)} (${block.hd || '—'})`);
  
    // Prints claimed or computed saves; prefix signs
    const fortVal = (block.fort_save_claimed ?? block.fort ?? 0);
    const refVal = (block.ref_save_claimed ?? block.ref ?? 0);
    const willVal = (block.will_save_claimed ?? block.will ?? 0);
    const saves = `Fort ${fortVal >= 0 ? '+' : ''}${fortVal}, Ref ${refVal >= 0 ? '+' : ''}${refVal}, Will ${willVal >= 0 ? '+' : ''}${willVal}`;
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
  
    const babVal = block.bab_claimed ?? block.bab ?? 0;
    const strMod = Math.floor(((block.str ?? 10) - 10) / 2);
    const sizeData = SizeConstants[block.size] || { acAttackMod: 0, cmbCmdMod: 0 };
    const cmbComputed = (block.cmb ?? (babVal + strMod + (sizeData.cmbCmdMod || 0)));
    const cmdVal = block.cmd_claimed ?? block.cmd ?? 10 + babVal + strMod + Math.floor(((block.dex ?? 10)-10)/2) + (sizeData.cmbCmdMod || 0);
    lines.push(`Base Atk ${babVal >= 0 ? `+${babVal}` : babVal}; CMB ${cmbComputed >= 0 ? `+${cmbComputed}` : cmbComputed}; CMD ${cmdVal}`);
  
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
