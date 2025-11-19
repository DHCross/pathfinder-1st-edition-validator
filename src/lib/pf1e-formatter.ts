import { PF1eStatBlock } from '../types/PF1eStatBlock';

export function formatPF1eStatBlock(block: PF1eStatBlock): string {
  const { name, cr, xp, size, type } = block;
  
  const alignment = block.alignment || 'N'; 
  const crVal = cr;
  
  const getMod = (score: number) => Math.floor((score - 10) / 2);
  const fmtMod = (score: number) => {
      const m = getMod(score);
      return m >= 0 ? `+${m}` : `${m}`;
  };

  const racialHD = block.racialHD || 1;
  const hpFormula = `${racialHD}d8+${getMod(block.con)}`;

  return `
${name}
CR ${crVal}
XP ${xp?.toLocaleString() || '0'}
${alignment} ${size} ${type}
Init ${fmtMod(block.dex)}; Senses Perception +0
DEFENSE
AC ${block.ac_claimed || block.ac}, touch ${block.touch_ac_claimed || block.touch || 10}, flat-footed ${block.flat_footed_ac_claimed || block.flatFooted || 10}
hp ${block.hp_claimed || block.hp} (${hpFormula})
Fort +${block.fort_save_claimed || block.fort}, Ref +${block.ref_save_claimed || block.ref}, Will +${block.will_save_claimed || block.will}
OFFENSE
Speed 30 ft.
Melee weapon +${block.bab_claimed || block.bab} (1d8)
STATISTICS
Str ${block.str}, Dex ${block.dex}, Con ${block.con}, Int ${block.int}, Wis ${block.wis}, Cha ${block.cha}
Base Atk +${block.bab_claimed || block.bab}; CMB +${(block.bab_claimed || block.bab) + getMod(block.str)}; CMD ${block.cmd_claimed || block.cmd || 10}
Feats ${block.feats?.join(', ') || 'None'}
Treasure ${block.treasureType || 'Standard'}
`.trim();
}
